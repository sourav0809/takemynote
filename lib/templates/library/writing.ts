import type { NoteTemplate } from "@/lib/templates/template-types";

export const WRITING_TEMPLATES: NoteTemplate[] = [
  {
    id: "book-notes",
    name: "Book notes",
    description: "Book details, chapter notes, favourite quotes, key takeaways and a rating.",
    category: "writing",
    title: "Book notes: ",
    markdown: `| Author | Started | Finished | Rating |
| --- | --- | --- | --- |
|  | {{date}} |  | ☆☆☆☆☆ |

## The book in three sentences
1.
2.
3.

## Chapter notes
### Chapter 1
-
### Chapter 2
-

## Favourite quotes
>

## Key takeaways
-

## What I'll try
- [ ]
`,
  },
  {
    id: "blog-post",
    name: "Blog post",
    description: "Audience and angle, an outline, a draft space and a publishing checklist.",
    category: "writing",
    title: "Draft: ",
    markdown: `| Audience | Goal | Target length |
| --- | --- | --- |
|  |  | ~1,200 words |

**The one idea readers should take away:**

## Outline
1. Hook: a moment, a question or a surprising fact
2. The problem
3. What I learned / the solution
4. Example or story
5. What to do next

## Draft
_Write freely here. Edit later._

## Before publishing
- [ ] Clear headline and subtitle
- [ ] Intro gets to the point in 3 lines
- [ ] Read it out loud once
- [ ] Links and images checked
- [ ] Shared with one person for feedback
`,
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    description: "Frame the question, go wide, then score ideas by impact and effort.",
    category: "writing",
    title: "Brainstorm: ",
    markdown: `## The question
> _How might we…?_

## Constraints
-

## All the ideas
_No judging yet. Aim for 15._
-
-
-

## Pick the best
| Idea | Impact (1–5) | Effort (1–5) | Score |
| --- | --- | --- | --- |
|  |  |  |  |
|  |  |  |  |

## Next step
- [ ]
`,
  },
  {
    id: "research-notes",
    name: "Research notes",
    description: "A clear question, a sources table, findings, and what's still unknown.",
    category: "writing",
    title: "Research: ",
    markdown: `## Question
> _What exactly am I trying to find out?_

## Sources
| Source | Type | Key point | Link |
| --- | --- | --- | --- |
|  | Article |  |  |
|  | Paper |  |  |

## Findings
-

## Still unknown
- [ ]

## Summary
`,
  },
];
