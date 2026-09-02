---
name: coding-conventions
description: Guidelines and best practices for writing clean, consistent, and maintainable React/TypeScript code. Enforces component size limits, import ordering, async/await patterns, TypeScript types, and styling consistency.
---

# Coding Conventions for Ocean Friends Web

This skill outlines the strict coding standards, architectural rules, and design best practices that must be followed when modifying or adding code to this project. Always refer to and follow these rules during planning and execution phases.

## Component Structure & Size

1. **Size Limit**: A single component should ideally not exceed **200–250 lines of code**.
   - If a component exceeds this range, refactor it by breaking it down into smaller, focused sub-components or moving logic into helper/utility functions.
2. **Naming Consistency**: Keep component names clean, concise, and consistent. Avoid extremely long or cryptic names. Maintain consistent casing across files (prefer PascalCase for component files and component function names).
3. **UI Component Reuse**: Use already defined UI components (from `src/components/ui/` or similar folders) instead of introducing new custom components from scratch.

## Consistent Directory & File Organization

1. **Feature Directory Structure**: Organize files logically by feature module:
   - Page/feature level components should live in their own subdirectory (e.g., `src/pages/FeatureName/`).
   - Local sub-components that are only used within a single page/feature must live in a `components/` subfolder inside that page/feature folder (e.g., `src/pages/FeatureName/components/LocalComponent.tsx`).
   - Globally shared components must live under `src/components/ui/` or `src/components/common/`.
2. **File Casing**:
   - Component files must use `PascalCase` (e.g., `BehaviourGoalInfo.tsx`).
   - Helper, hook, utility, and non-component files must use `camelCase` (e.g., `saveAbaGoal.ts`, `useGoalData.ts`).

## Component File Anatomy (Internal Structure)

Write all React components with a predictable, consistent vertical layout:

1. **Imports**: Ordered logically (external libraries -> absolute project imports -> relative component/style imports).
2. **Types & Interfaces**: Define typescript interfaces and component prop types immediately above the component definition.
3. **Component Signature**: Use arrow function definitions with explicitly typed prop arguments.
4. **Hooks**: Standard React hooks (`useTheme`, `useMediaQuery`), followed by global state/routing hooks (`useDispatch`, `useSelector`), followed by form hooks (`useForm`, `useFormContext`).
5. **State & Refs**: Component-level `useState` and `useRef` calls.
6. **Effects**: `useEffect` hooks with clearly defined and complete dependency arrays.
7. **Handlers & Callbacks**: Inner helper functions and event handlers (e.g., `onSubmitHandler`, `handleClose`).
8. **Render/JSX**: Semantic HTML5 markup, avoiding inline complex computations.
9. **Export**: Export statement at the very bottom of the file (e.g., `export default MyComponent;`).

## Code Quality & Best Practices

1. **DRY & KISS Principles**: Follow the "Don't Repeat Yourself" and "Keep It Simple, Stupid" principles. Avoid code duplication.
2. **TypeScript Types**: Do not use `any` in TypeScript. Always define proper types, interfaces, or enums for all variables, props, and function signatures.
3. **No Magic Values**: Avoid hardcoded strings, numbers, status codes, or colors directly in the code (e.g. `user.points === 5`).
   - If a value is reused or represents configuration, create/use a constant or enum.
   - If the constant/enum does not exist, create it in a proper configuration or constants file (e.g. `src/utils/constants.ts` or local constant files) and import it.
4. **Prop Drilling**: Avoid passing props through more than 2–3 levels of components. If a state needs to be accessed deeper, use React Context or the global state management library (Redux).
5. **Icon Consistency**: Reuse existing icon sets and components consistently across the app (e.g. use the exact same Edit or Delete icons everywhere).

## Asynchronous Code & API Calls

1. **Async/Await Syntax**: Always use modern `async/await` syntax for handling promises. Do not use `.then()` and `.catch()` chains.
2. **Parallel Operations**: When invoking multiple APIs or independent promises, use `Promise.all()` to execute them concurrently instead of executing them sequentially one-by-one.

## Imports & Ordering

1. **Sorted Imports**: Keep imports organized and sorted consistently (e.g. external library imports first, followed by absolute project imports, and relative imports last).

## Styling & Theme Consistency

1. **Utility Styling**: Use Tailwind CSS utility classes as much as possible for layout and styling.
2. **No Hardcoded Styles**: Avoid inline hardcoded CSS styles or arbitrary colors/fonts.
3. **Design System Adherence**: Follow the existing design system and theme. Do not invent new colors, spacing, or fonts; stick to the established palette and typography.

## Workflow & Verification

1. **Understand Before Modifying**: Before writing any code, thoroughly analyze the existing codebase flow and the precise requirements of the task.
2. **Regression Testing & Double-checking**: Always double-check modifications to ensure no existing functionality is broken. Ensure absolute confidence in code correctness and compatibility before finishing.
