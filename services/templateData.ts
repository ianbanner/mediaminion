



import { SavedTemplate } from '../types.ts';

const today = new Date().toLocaleDateString();

export const initialTemplates: SavedTemplate[] = [
  {
    id: 'template-1',
    title: 'The List of Lessons',
    template: `{{DidThisThingToday}}
{{ShortContext}}
Here are {{X}} lessons I learned in {{X Time}}
1. {{Lesson1}}
2. {{Lesson2}}
3. {{Lesson3}}
4. {{Lesson4}}
5. {{Lesson5}}
Hope that's helpful.`,
    example: `Hit $100k in revenue today.
All organic.
Here are 5 lessons I learned in 10 months:
1. Give 80%, Ask 20%
2. Brevity in courses is your friend
3. Price for access & word of mouth
4. Answer all DMs about your product
5. Timebox, move fast, and start cheap

Hope that's helpful.`,
    instructions: `Vary the use of the time between months and years based on what is appropriate for the topic.`,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-2',
    title: 'The Reverse Narrative',
    template: `[DoAThing] where you can:
• [ReverseNarrative1]
• [ReverseNarrative2]
• [ReverseNarrative3]
• [ReverseNarrative4]
• [ReverseNarrative5]
Forget '[NormalNarrative1]' and '[NormalNarrative2]'.
Go [outcome]!`,
    example: `Build a business where you can:
- Own your story
- Put your family first
- Volunteer on Tuesdays
- Live anywhere you want
- Forget what day & time it is
- Go out to lunch with your spouse
- Take your kids to school every day
Forget 'scale' and 'winning'.

Go live life!`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-3',
    title: 'The Unspoken Reward',
    template: `The most common reward for a [NormallyGoodThing]:
• A lot more [BadThing1]
• A lot more [BadThing2]
• A bit more [GoodThing]
[ThoughtProvokingQuestion]`,
    example: `The most common reward for a promotion?
- A lot more work
- A lot more stress
- A bit more money

What's the point of winning a game with terrible prizes?

Make this the year you bet on yourself.`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-4',
    title: 'Smashing the Myth',
    template: `Had a great Zoom with a [Person].
He smashes the myth of '[Myth]'.
• Year 1: [NotGreat, Money]
• Year 2: [SlightlyBetter, Money]
• Year 3: [SlightlyBetter, Money]
• Year 4: [MuchBetter, Money]
• Year 5: [Incredible, Money]
Awesome.`,
    example: `Had a great Zoom with a solopreneur.

He smashes the myth of 'overnight success'.
- Year 1: Tons of hustle, $12k revenue
- Year 2: Doubled down, $37k revenue
- Year 3: Wanted to quit, $92k revenue
- Year 4: Breakthrough, $312k revenue
- Year 5: Momentum, $846k revenue

Awesome.`,
    instructions: `Vary the use of 'year' based on what works for the topic, it could be Months or even Days.`,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-5',
    title: 'The Daily Checklist',
    template: `Every [Personas] day should have:
• [GoodThing1]
• [GoodThing2]
• [GoodThing3]
• [GoodThing4]
• [GoodThing5]
• [GoodThing6]
• [GoodThing7]
If you do these 7 things each day, you'll be ahead of 95% of the population.`,
    example: `Every agile coach's day should have:
- A workout
- A healthy lunch
- A healthy dinner
- 3 hours of 'genius'
- A few pages of reading
- Time with partner/friends
- Some time outside
- Some time alone

If you do these 7 things each day, you'll be ahead of 95% of the population.`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-6',
    title: 'Hard vs. Harder',
    template: `[GoodHardThing] is hard, but [BadHardThing] is harder.`,
    example: `Working on Agile Transitions is hard, but working on Agile Transitions without the right training is harder.`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-7',
    title: 'The Pro Method',
    template: `Don't [Topic] like an amateur.
Instead, try this:
1. [Advice1]:
• [Sub-Advice1]
• [Sub-Advice2]
• [Sub-Advice3]
2. [Advice2]:
• [Sub-Advice1]
• [Sub-Advice2]
• [Sub-Advice3]
3. [Advice3]:
• [Sub-Advice1]
• [Sub-Advice2]
• [Sub-Advice3]
Most people get this all wrong.
They make it all about [WrongThing].
Wrong.
[Success] is about [ActualSuccessfulFocus]
So go build that [Topic] muscle.`,
    example: `Don't network like an amateur.

Instead, try this:

1. Present yourself clearly:

- Who are you?
- What do you do?
- Why pay attention to you?

2. Use a value-driven approach:

- Solve their problem.
- Send them something useful.
- Support their business/project.

3. Become a connector:

- Facilitate introductions
- Help them level up their network
- Become the go to 'connector'

Most people mess these up.

They make it all about 'Me! Me! Me!'

Wrong.

Building relationships is about THEM.

Then, build that networking muscle.`,
    instructions: `Find other words instead of 'amateur' that are more relevant to the topic.`,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-8',
    title: 'Go For It',
    template: `Try [Thing] this year.
Even if it's just a [SmallerVersion].
The worst outcome?
[HumorousStatementAboutPreviousThing].
Go for it in [Year].`,
    example: `Try entrepreneurship this year.

Even if it's just a side hustle.

The worst outcome?

You fail and go back to work for some big company with too many meetings, poor management, and no career path.

Go for it in 2022.`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-9',
    title: 'The Secret Sauce',
    template: `I [VisceralDescription].
My secret sauce is [FlipNormalScript]
I don't:
• [NormalThingPeopleWant1]
• [NormalThingPeopleWant2]
• [NormalThingPeopleWant3]
• [NormalThingPeopleWant4]
Instead:
• [BetterThingMostPeopleDon'tFocusOn1]
• [BetterThingMostPeopleDon'tFocusOn2]
• [BetterThingMostPeopleDon'tFocusOn3]
• [BetterThingMostPeopleDon'tFocusOn4]
[ShortDescriptionOfWhyItsImportant]
[StrongQuestion1]
[StrongQuestion2]`,
    example: `I escaped the rat race 2.5 years ago.

My secret sauce is less ambition.

I don't:

- want to change the world.
- want to build the next unicorn.
- want to be featured on any lists.
- want to get the highest valuation.

Instead:

- I want to spend my time working on things I enjoy with people I enjoy.
- I want to be able to travel wherever I want to, whenever I want to.
- I want to spend way more time with my friends and family.
- I want to stop doing things I don't like doing.

Thinking about what you actually want in life can force different behavior.

Take you down a different path.

A path towards living more intentionally.

Are you copying someone else's life?

Or designing your own?`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-10',
    title: 'Beginner vs. Pro',
    template: `Beginners: I got [NormalDecentThing]
Amateurs: I got [NormalBetterThing]
Pros: I got [SmallerNumberBiggerImpactThing]
It's about [ThingThatMatters].`,
    example: `Beginners: I got 3,000 views!

Amateurs: I got 3,000 likes!

Pros: I made 3 new meaningful connections.

It's about real connections here.

Not little thumbs and hearts.`,
    instructions: ``,
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-11',
    title: 'The Contrarian Take',
    template: `Everyone thinks [CommonBelief].
They're wrong.

The truth is [YourContrarianTake].

Here's why:
1. [Reason1]
2. [Reason2]
3. [Reason3]

Stop [CommonBadPractice]. Start [YourGoodPractice].`,
    example: `Everyone thinks you need more meetings to align your team.
They're wrong.

The truth is you need fewer, better meetings and more asynchronous communication.

Here's why:
1. Meetings interrupt deep work.
2. Most meeting topics can be an email or a document.
3. Asynchronous allows for more thoughtful responses.

Stop booking back-to-back calls. Start protecting your team's focus time.`,
    instructions: 'Be bold with your contrarian take, but make sure your reasons are logical and well-supported.',
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-12',
    title: 'The Transformation (Before/After)',
    template: `BEFORE: [DescribeThePainfulInitialState]

AFTER: [DescribeTheIdealNewState]

The bridge between them? [YourSolutionOrKeyInsight].

It wasn't about [CommonMisconception].
It was about [TheRealFocus].`,
    example: `BEFORE: My calendar was a nightmare. 8 hours of calls, zero time for actual work. I was burning out fast.

AFTER: I work a 4-hour day, get more done, and my revenue has doubled.

The bridge between them? A ruthless system of delegation and saying "no".

It wasn't about time management hacks.
It was about reclaiming my focus.`,
    instructions: 'Use strong, contrasting descriptions for the before and after states to highlight the transformation.',
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-13',
    title: 'The Actionable Quick Tip',
    template: `Want to get better at [Skill]?

Here's a simple tip you can use today:

[YourActionableTip].

Takes 5 minutes. The impact is huge.

Try it and let me know how it goes.`,
    example: `Want to get better at writing emails?

Here's a simple tip you can use today:

Write your subject line last. After you've written the email, you know exactly what it's about, making the subject line punchy and accurate.

Takes 5 minutes. The impact is huge.

Try it and let me know how it goes.`,
    instructions: 'Keep the tip extremely simple and easy to implement immediately.',
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
  {
    id: 'template-14',
    title: 'Busting a Myth',
    template: `Common misconception about [Topic]:
[TheMisconception].

Reality:
[TheTruth].

Why does this matter?
Because [TheConsequenceOfBelievingTheMyth].

Don't fall for it.`,
    example: `Common misconception about product management:
You need to be the CEO of the product.

Reality:
You are more like a diplomat or an influencer. Your job is to align stakeholders around a shared vision, not to give orders.

Why does this matter?
Because thinking you're the CEO leads to a command-and-control mindset, which alienates your team and leads to poor outcomes.

Don't fall for it.`,
    instructions: 'Clearly state a common myth, then provide a concise and powerful reality check. Explain the negative impact of believing the myth.',
    dateAdded: today,
    usageCount: 0,
    lastUsed: 'Never',
  },
];