
# Social Media Minion - Project Context & Summary

## Instructions for AI Assistant

This document provides the complete business context, feature set, and technical overview for the "Social Media Minion" application. Use this as the source of truth to re-establish the project's state if this session is restarted.

---

## 1. Business Context & Core Goal

The user is a leadership and transformation coach targeting C-level executives and senior leaders in non-technical roles.

**The primary business objective is to create a powerful, AI-driven content marketing engine.** This engine will produce high-quality, thought-leadership content for platforms like LinkedIn, Medium, and Substack. The content's purpose is to:
1.  Establish the user as an expert in leadership and digital transformation.
2.  Attract and engage the target audience.
3.  Drive traffic to the user's podcast, newsletter, and paid coaching services.

The user has a distinct writing style, described as "Marty Cagan-esque": direct, no-nonsense, experience-based, and highly actionable. All generated content must adhere to this style.

## 2. Application Feature Overview

The application is a single-page React application built with TypeScript and Tailwind CSS. It uses the Gemini API for all AI-powered functionality. All user data is persisted in the browser's local storage and can be backed up to a `.json` file.

The user interface is organized into three main sections: **Posts**, **Articles**, and **Admin**.

### Posts Section

This section is dedicated to creating and managing short-form social media content.

-   **Generate Posts**: Takes a source article (URL or text) and uses a library of user-defined templates to generate multiple social media posts. The AI then evaluates each post against custom criteria and ranks them.
-   **Posts Queue**: A staging area for generated posts that are ready to be published.
-   **Posts Log**: A history of all posts that have been successfully published.
-   **Post Scheduler**: Automates the publishing of content from the "Posts Queue" at user-defined times using the **Ayrshare API**.
-   **Posts Template Library**: A library of reusable templates for short-form content. Users can edit existing templates or create new ones.
-   **Post Researcher**: An AI-powered tool that uses Google Search to find and analyze high-performing posts on a given topic, providing inspiration and insight.

### Articles Section

This section provides a complete, professional workflow for creating long-form articles.

-   **Generate Headlines**: A two-step creative process:
    1.  **Idea Generation**: The user provides a source article, and the AI generates 10 new, related article ideas based on the user's defined persona.
    2.  **Headline Brainstorming**: After the user selects an idea, the AI generates 20 headlines. It then evaluates each headline against custom criteria, providing a score and a rationale. The user can edit headlines and have them re-evaluated.
-   **Generate Articles**: This is the core long-form content creator.
    -   It takes a winning headline and source content to generate an article of a specified length (1000, 2000, or 3000 words).
    -   It features an **iterative enhancement loop**:
        -   The AI generates the first draft.
        -   The AI evaluates its own work against custom criteria, providing a score and a checklist of suggested improvements (e.g., improve clarity, add analogy).
        -   The user can select which suggestions to apply.
        -   The AI rewrites ("enhances") the article based on the selected feedback.
    -   It maintains an **Iteration History**, allowing the user to view and revert to any previous version of the article.
    -   The final output is rendered in a Substack-friendly format.
-   **Article Template Library**: A library for long-form article structures.
    -   It comes pre-loaded with 10 detailed, professional templates provided by the user.
    -   It features a "Create from Article" tool where the user can paste any article's text, and the AI will reverse-engineer its structure into a new, reusable template.

### Admin Section

This section contains the core configuration and settings for the application.

-   **Persona**: This is the central hub for defining the AI's identity and knowledge base. It contains:
    -   **My Professional Role**: Defines the user's professional identity for the AI.
    -   **My Target Audience**: Defines who the content is for.
    -   **Reference World**: A core knowledge base where the user can paste foundational concepts, principles, or book excerpts to ground the AI's knowledge.
    -   **This is how I write articles**: A space for the user to provide examples of their writing style for the AI to emulate.
-   **Backup / Restore**: Allows the user to download all application data (from local storage) into a single `.json` file for safekeeping or migration, and to restore it later.
-   **Settings**: Primarily used to configure the **Ayrshare API Key**.
-   **Admin Panel**: For managing authorized users. The login screen is currently bypassed for development, with the user automatically logged in.

## 3. Technical Details & APIs

-   **Frontend**: React, TypeScript, Tailwind CSS.
-   **AI Engine**: Google Gemini API (various models, primarily `gemini-2.5-pro` for complex tasks and `gemini-2.5-flash` for faster operations). The app makes heavy use of JSON schema for structured output.
-   **Social Media Posting**: Ayrshare API.
-   **Data Persistence**: All application state is stored in the browser's **local storage**. There is no backend database.
-   **Authentication**: A simple email/password system is implemented but currently bypassed for development convenience.
