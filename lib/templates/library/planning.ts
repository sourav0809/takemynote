import type { NoteTemplate } from "@/lib/templates/template-types";

export const PLANNING_TEMPLATES: NoteTemplate[] = [
  {
    id: "daily-planner",
    name: "Daily planner",
    description: "Plan the day in time blocks, protect your top 3, and close with a short review.",
    category: "planning",
    featured: true,
    title: "{{weekday}}, {{date}}",
    markdown: `> _One sentence: what would make today a good day?_

## Top 3 priorities
- [ ] The one thing that matters most
- [ ] Second priority
- [ ] Third priority

## Schedule
| Time | Plan | Done |
| --- | --- | --- |
| 08:00 | Morning routine, review this plan |  |
| 09:00 | Deep work: top priority |  |
| 11:00 | Meetings / messages |  |
| 13:00 | Lunch & a short walk |  |
| 14:00 | Second priority |  |
| 16:00 | Admin, follow-ups |  |
| 18:00 | Wrap up, plan tomorrow |  |

## Also on the list
- [ ]
- [ ]

## Habits
- [ ] Water
- [ ] Move for 30 minutes
- [ ] Read 10 pages

---

## End of day
**What went well:**

**What I'd change:**

**First thing tomorrow:**
`,
  },
  {
    id: "weekly-planner",
    name: "Weekly planner",
    description: "This week's focus, a day-by-day board with real dates, and a Friday check-in.",
    category: "planning",
    featured: true,
    title: "Week of {{weekRange}}",
    markdown: `## Focus this week
> _If only one thing gets done this week, it should be…_

- [ ] Big goal
- [ ] Second goal
- [ ] Something just for me

## The week
| Day | Must do | Nice to do | Evening |
| --- | --- | --- | --- |
| {{mon}} |  |  |  |
| {{tue}} |  |  |  |
| {{wed}} |  |  |  |
| {{thu}} |  |  |  |
| {{fri}} |  |  |  |
| {{sat}} |  |  |  |
| {{sun}} |  |  |  |

## Appointments & deadlines
-

## Friday check-in
**Did I hit my focus?**

**What slipped, and why:**

**Carry over to next week:**
- [ ]
`,
  },
  {
    id: "weekly-review",
    name: "Weekly review",
    description: "Look back on wins and lessons, check your numbers, and set next week's direction.",
    category: "planning",
    title: "Weekly review, {{weekRange}}",
    markdown: `## Wins
-

## What didn't go to plan
-

## Lessons
> _What will I do differently next time?_

-

## Scorecard
| Area | Score (1–5) | Note |
| --- | --- | --- |
| Work |  |  |
| Health |  |  |
| Relationships |  |  |
| Learning |  |  |
| Energy |  |  |

## Clear the decks
- [ ] Empty inbox and messages
- [ ] Review calendar for next week
- [ ] Update project lists
- [ ] Tidy notes and files

## Next week's three goals
1.
2.
3.
`,
  },
  {
    id: "monthly-goals",
    name: "Monthly goals (OKRs)",
    description: "Objectives with measurable key results, progress tracking and a month-end review.",
    category: "planning",
    title: "Goals for {{month}}",
    markdown: `> _Pick 1–3 objectives. Each key result should be a number you can check._

## Objective 1:
| Key result | Start | Target | Now | Status |
| --- | --- | --- | --- | --- |
| e.g. Publish posts | 0 | 4 | 0 | On track |
|  |  |  |  |  |

## Objective 2:
| Key result | Start | Target | Now | Status |
| --- | --- | --- | --- | --- |
|  |  |  |  |  |
|  |  |  |  |  |

## Weekly check-ins
- [ ] Week 1:
- [ ] Week 2:
- [ ] Week 3:
- [ ] Week 4:

## End of month
**What worked:**

**What I'll change next month:**
`,
  },
  {
    id: "habit-tracker",
    name: "Habit tracker",
    description: "Track daily habits across the week with a simple tick grid and weekly totals.",
    category: "planning",
    title: "Habits, week of {{weekRange}}",
    markdown: `> _Tick a box with ✓ each day. Keep the list short: 3–5 habits._

| Habit | Mon | Tue | Wed | Thu | Fri | Sat | Sun | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Wake up by 7 |  |  |  |  |  |  |  |  |
| Exercise |  |  |  |  |  |  |  |  |
| Read |  |  |  |  |  |  |  |  |
| No phone after 10pm |  |  |  |  |  |  |  |  |
| Journal |  |  |  |  |  |  |  |  |

## Why these habits
-

## Notes on the week
`,
  },
];
