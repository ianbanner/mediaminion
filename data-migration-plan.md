# Data Schema Migration Plan: LocalStorage to Firestore

## Overview
This document outlines the architectural shift from a client-side `localStorage` model to a cloud-based **Google Firestore** database.

**Core Architecture Principle: User ID as Root**
The data structure is strictly hierarchical and scoped to the user. 
1.  **Level 1 (Root):** The **User ID** (`uid`) provided by Firebase Auth.
2.  **Level 2 (Data):** All application data (Personas, Templates, Posts, Settings) exists *only* as children of this User ID.

There is no shared global state for content. All backend work and data structures are encapsulated within the specific user's node.

---

## 1. Current State: LocalStorage (Monolithic)

Currently, the app persists data in a single JSON blob stored in the browser's LocalStorage under the key `minion_data_{email}`.

**Structure:**
```json
{
  "userEmail": "dave@example.com",
  
  // -- Active Session State (Flat Fields) --
  "userRole": "Agile Coach",
  "targetAudience": "CTOs",
  "referenceWorldContent": "...",
  "activePersonaId": "uuid-123",
  
  // -- Settings --
  "settings": { "ayrshareApiKey": "..." },
  "adminSettings": { ... },

  // -- Large Arrays (The Scalability Bottleneck) --
  "savedPersonas": [ { "id": "1", "name": "Dave", ... }, ... ],
  "savedTemplates": [ { "id": "t1", "title": "...", ... }, ... ],
  "savedArticleTemplates": [ { "id": "at1", ... }, ... ],
  "ayrshareQueue": [ { "id": "p1", "status": "scheduled", ... }, ... ],
  "ayrshareLog": [ { "id": "p2", "status": "sent", ... }, ... ],
  "generatedArticleHistory": [ ... ],
  "archivedPodcastPlans": [ ... ],
  "archivedAudioScripts": [ ... ]
}
```

**Limitations:**
1.  **Size Limit:** LocalStorage is limited to ~5MB. Arrays like `ayrshareLog` or `generatedArticleHistory` will eventually crash the app.
2.  **Device Sync:** Data does not sync between mobile and desktop.
3.  **Security:** Admin settings are stored in plain text on the client.

---

## 2. Target State: Firestore Schema (Document-Oriented)

In Firestore, we will break the monolithic JSON into **Documents** (for profile/settings) and **Subcollections** (for lists of data).

**Root Collection:** `users`
**Document ID:** `{userId}` (from Firebase Auth)

### A. Main User Document
**Path:** `users/{userId}`

This document contains lightweight configuration, active session state, and global settings.

```json
{
  "email": "dave@example.com",
  "createdAt": "Timestamp",
  "lastLogin": "Timestamp",
  
  // -- Active Persona State --
  // We store the *currently active* context here for quick loading
  "activePersonaId": "persona-uuid-1", 
  "currentRole": "Agile Coach", // Cached from active persona
  "currentTargetAudience": "CTOs", // Cached from active persona
  
  // -- App Configuration --
  "settings": {
    "ayrshareApiKey": "AYR-KEY-..." 
  },
  
  // -- Admin Flags --
  "isAdmin": true,
  "permissions": {
    "canViewPosts": true,
    "canViewBiblicalCheck": false
  },

  // -- Onboarding --
  "checklistProgress": [
    { "id": "1", "isCompleted": true }
  ]
}
```

---

### B. Subcollections (Data Buckets)

To ensure scalability, lists are moved to subcollections. This allows us to query "Post Templates" without downloading "Podcast History".

#### 1. Personas
**Path:** `users/{userId}/personas/{personaId}`

Stores the library of personas.
```json
{
  "id": "persona-uuid-1",
  "name": "Dave the Coach",
  "role": "Agile Coach",
  "targetAudience": "CTOs",
  "referenceWorldContent": "Large text block...",
  "writingStyle": "Large text block...",
  "lastModified": "Timestamp"
}
```

#### 2. Post Templates
**Path:** `users/{userId}/postTemplates/{templateId}`

```json
{
  "id": "template-1",
  "title": "The Contrarian Take",
  "template": "...",
  "example": "...",
  "instructions": "...",
  "usageCount": 12,
  "lastUsed": "Timestamp",
  "isSystemDefault": false // Differentiates user templates from system ones
}
```

#### 3. Article Templates
**Path:** `users/{userId}/articleTemplates/{templateId}`

```json
{
  "id": "art-temp-1",
  "title": "Hero's Journey",
  "structure": "...",
  "description": "..."
}
```

#### 4. Social Posts (Queue & History)
**Path:** `users/{userId}/posts/{postId}`

We combine `ayrshareQueue` and `ayrshareLog` into one collection, differentiated by a `status` field.

```json
{
  "id": "post-123",
  "content": "...",
  "platforms": ["linkedin", "twitter"],
  "status": "draft" | "queued" | "scheduled" | "posted",
  "scheduledTime": "Timestamp",
  "sentAt": "Timestamp",
  "score": 85,
  "assessment": "..."
}
```

#### 5. Articles
**Path:** `users/{userId}/articles/{articleId}`

```json
{
  "id": "article-xyz",
  "title": "Why Agile Fails",
  "currentContent": "Markdown content...",
  "status": "draft" | "polished",
  "score": 92,
  "destination": "LinkedIn",
  "iterations": [ 
    // We can store the history array here, or if it gets too big, 
    // move iterations to a sub-subcollection `users/{uid}/articles/{aid}/history/{versionId}`
    { "version": 1, "content": "..." } 
  ],
  "createdAt": "Timestamp",
  "updatedAt": "Timestamp"
}
```

#### 6. Audio & Podcasts
**Path:** `users/{userId}/podcasts/{planId}`
**Path:** `users/{userId}/audioScripts/{scriptId}`

Standard documents containing the generated plans and scripts.

---

## 3. Migration Strategy

To move from the current app to the new system, we will implement a "Lazy Migration" or "One-Time Import" button.

1.  **Auth Implementation:** First, implement Firebase Auth to get the `userId`.
2.  **Detection:** When a user signs in, check if `users/{userId}` exists in Firestore.
3.  **Migration Logic:**
    *   If Firestore is empty BUT `localStorage` has data:
    *   Read `localStorage` blob.
    *   **Batch Write 1:** Create `users/{userId}` with settings and active state.
    *   **Batch Write 2:** Loop through `savedPersonas` and create documents in `users/{userId}/personas`.
    *   **Batch Write 3:** Loop through `savedTemplates` -> `users/{userId}/postTemplates`.
    *   **Batch Write 4:** Loop through queues/logs -> `users/{userId}/posts`.
4.  **Cleanup:** Once confirmed successful, clear `localStorage` (or keep as backup/offline cache).

## 4. Admin Data

The global `AdminSettings` (authorized users list) currently stored in the generic blob should be moved to a protected top-level collection that only Super Admins can read/write.

**Collection:** `system`
**Document:** `accessControl`

```json
{
  "authorizedUsers": [
    { "email": "dave@bigagility.com", "permissions": { "canViewPosts": true, ... } },
    { "email": "client@company.com", "permissions": { ... } }
  ]
}
```