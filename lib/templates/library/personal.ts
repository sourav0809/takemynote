import type { NoteTemplate } from "@/lib/templates/template-types";

export const PERSONAL_TEMPLATES: NoteTemplate[] = [
  {
    id: "journal",
    name: "Daily journal",
    description: "Morning intentions and an evening reflection, with a quick mood and energy check.",
    category: "personal",
    featured: true,
    title: "Journal, {{weekday}} {{date}}",
    markdown: `## Morning
**I'm grateful for:**
1.
2.
3.

**Today I want to feel:**

**One thing that would make today great:**

---

## Evening
| Mood (1–5) | Energy (1–5) | Sleep (hours) |
| --- | --- | --- |
|  |  |  |

**Best moment of the day:**

**Something I learned:**

**What's on my mind:**
`,
  },
  {
    id: "trip-planner",
    name: "Trip planner",
    description: "Trip overview, day-by-day itinerary, budget, bookings and a packing checklist.",
    category: "personal",
    title: "Trip to ",
    markdown: `| Dates | Travellers | Stay |
| --- | --- | --- |
|  |  |  |

## Itinerary
| Day | Morning | Afternoon | Evening |
| --- | --- | --- | --- |
| Day 1 | Arrive, check in |  |  |
| Day 2 |  |  |  |
| Day 3 |  |  | Pack, early night |

## Bookings
| What | Confirmation | Time | Done |
| --- | --- | --- | --- |
| Flight / train |  |  |  |
| Hotel |  |  |  |

## Budget
| Item | Planned | Spent |
| --- | --- | --- |
| Travel |  |  |
| Stay |  |  |
| Food |  |  |
| Activities |  |  |

## Packing list
### Essentials
- [ ] Passport / ID
- [ ] Wallet and cards
- [ ] Phone and chargers
### Clothes
- [ ] Tops
- [ ] Bottoms
- [ ] Shoes
### Toiletries
- [ ] Toothbrush and toothpaste
- [ ] Medication

## Places to try
-
`,
  },
  {
    id: "meal-planner",
    name: "Meal planner",
    description: "A week of meals in one table and a grocery list grouped by aisle.",
    category: "personal",
    title: "Meals, week of {{weekRange}}",
    markdown: `| Day | Breakfast | Lunch | Dinner |
| --- | --- | --- | --- |
| {{mon}} |  |  |  |
| {{tue}} |  |  |  |
| {{wed}} |  |  |  |
| {{thu}} |  |  |  |
| {{fri}} |  |  |  |
| {{sat}} |  |  |  |
| {{sun}} |  |  |  |

## Grocery list
### Fruit & veg
- [ ]
### Protein
- [ ]
### Dairy & eggs
- [ ]
### Pantry
- [ ]

## Prep ahead
- [ ]
`,
  },
  {
    id: "budget",
    name: "Monthly budget",
    description: "Income, planned vs actual spending by category, and savings goals.",
    category: "personal",
    title: "Budget, {{month}}",
    markdown: `## Income
| Source | Expected | Received |
| --- | --- | --- |
| Salary |  |  |
| Other |  |  |

## Spending
| Category | Planned | Actual | Difference |
| --- | --- | --- | --- |
| Rent / mortgage |  |  |  |
| Bills & utilities |  |  |  |
| Groceries |  |  |  |
| Transport |  |  |  |
| Eating out |  |  |  |
| Subscriptions |  |  |  |
| Fun |  |  |  |

## Savings goals
| Goal | Target | Saved so far |
| --- | --- | --- |
| Emergency fund |  |  |
|  |  |  |

## Notes
> _Anything unusual this month? Adjust next month's plan here._
`,
  },
  {
    id: "workout-log",
    name: "Workout log",
    description: "Log exercises with sets, reps and weight, plus how the session felt.",
    category: "personal",
    title: "Workout, {{date}}",
    markdown: `**Focus:** Upper body / Lower body / Full body / Cardio

## Warm-up
- [ ] 5 minutes light cardio
- [ ] Mobility

## Exercises
| Exercise | Sets | Reps | Weight | Notes |
| --- | --- | --- | --- | --- |
|  | 3 | 10 |  |  |
|  | 3 | 10 |  |  |
|  | 3 | 10 |  |  |

## Cardio
| Type | Time | Distance |
| --- | --- | --- |
|  |  |  |

## How it felt
**Energy (1–5):**

**Next time:**
`,
  },
  {
    id: "recipe",
    name: "Recipe",
    description: "Ingredients as a checklist, numbered steps, and notes for next time.",
    category: "personal",
    title: "Recipe: ",
    markdown: `| Serves | Prep | Cook | Source |
| --- | --- | --- | --- |
|  |  |  |  |

## Ingredients
- [ ]
- [ ]

## Steps
1.
2.

## Notes for next time
-
`,
  },
];
