import type { NoteTemplate } from "@/lib/templates/template-types";

export const WORK_TEMPLATES: NoteTemplate[] = [
  {
    id: "meeting-notes",
    name: "Meeting notes",
    description: "Details, a timed agenda, decisions, and action items with owners and due dates.",
    category: "work",
    featured: true,
    title: "Meeting notes, {{date}}",
    markdown: `| Date | Time | Where | Facilitator |
| --- | --- | --- | --- |
| {{date}} |  |  |  |

**Attendees:**

**Goal of this meeting:**

## Agenda
| Topic | Owner | Minutes |
| --- | --- | --- |
| Updates since last time |  | 5 |
|  |  | 15 |
| Decisions needed |  | 10 |

## Notes
-

## Decisions
| Decision | Why | Decided by |
| --- | --- | --- |
|  |  |  |

## Action items
- [ ] @name: task (due date)
- [ ] @name: task (due date)

## Parking lot
-
`,
  },
  {
    id: "project-plan",
    name: "Project plan",
    description: "Problem, goals and non-goals, success metrics, milestones, tasks and risks on one page.",
    category: "work",
    featured: true,
    title: "Project: ",
    markdown: `| Owner | Status | Start | Target date |
| --- | --- | --- | --- |
|  | Planning | {{date}} |  |

## The problem
> _Who has this problem, and how do we know it's worth solving?_

## Goals
-

## Non-goals
-

## Success metrics
| Metric | Today | Target |
| --- | --- | --- |
|  |  |  |

## Milestones
| Milestone | Owner | Due | Status |
| --- | --- | --- | --- |
| Kickoff |  |  | Done |
| First version |  |  | Not started |
| Launch |  |  | Not started |

## Tasks
### Now
- [ ]
### Next
- [ ]
### Later
- [ ]

## Risks
| Risk | Likelihood | Impact | Plan |
| --- | --- | --- | --- |
|  | Medium | High |  |

## Stakeholders
-
`,
  },
  {
    id: "one-on-one",
    name: "1:1 meeting",
    description: "A shared agenda for regular 1:1s: wins, blockers, feedback, growth and follow-ups.",
    category: "work",
    title: "1:1, {{date}}",
    markdown: `**With:**

## Follow-ups from last time
- [ ]

## Their topics
-

## My topics
-

## Wins since last time
-

## Blockers
-

## Feedback
**What's going well:**

**One thing to improve:**

## Growth
> _Where do you want to be in 6 months? What would help?_

## Action items
- [ ] @name:
`,
  },
  {
    id: "product-spec",
    name: "Product spec",
    description: "Problem, users, user stories, prioritised requirements and open questions.",
    category: "work",
    title: "Spec: ",
    markdown: `| Author | Status | Last updated |
| --- | --- | --- |
|  | Draft | {{date}} |

## Summary
> _In two sentences: what are we building and why now?_

## Users and their problem
-

## User stories
- As a ___, I want to ___ so that ___.
-

## Requirements
| Requirement | Priority | Notes |
| --- | --- | --- |
|  | Must have |  |
|  | Should have |  |
|  | Nice to have |  |

## Out of scope
-

## Design & links
-

## Open questions
- [ ]
`,
  },
  {
    id: "standup",
    name: "Daily standup",
    description: "Yesterday, today and blockers, plus a quick team status table.",
    category: "work",
    title: "Standup, {{date}}",
    markdown: `## Yesterday
-

## Today
-

## Blockers
- None

## Team status
| Person | Working on | Blocked? |
| --- | --- | --- |
|  |  | No |
|  |  | No |
`,
  },
  {
    id: "interview-notes",
    name: "Interview notes",
    description: "Structured questions, a scorecard and a clear hire / no-hire summary.",
    category: "work",
    title: "Interview: ",
    markdown: `| Candidate | Role | Date | Interviewer |
| --- | --- | --- | --- |
|  |  | {{date}} |  |

## Questions
1. Tell me about a project you're proud of.
2. A time you disagreed with a teammate: what happened?
3. Role-specific question:

## Notes
-

## Scorecard
| Skill | 1–4 | Evidence |
| --- | --- | --- |
| Problem solving |  |  |
| Communication |  |  |
| Role skills |  |  |
| Team fit |  |  |

## Summary
**Recommendation:** Hire / No hire

**Strengths:**

**Concerns:**
`,
  },
];
