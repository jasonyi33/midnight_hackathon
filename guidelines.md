# guidelines.md

this document defines how we build, test, and ship our frontend react experience with typescript, eslint, prettier, tailwind css, and vitest. follow every section when collaborating with github copilot.

## core mindset

- prefer simple, incremental solutions (kiss) and avoid speculative work (yagni).
- ship small vertical slices with clear responsibilities and measurable outcomes.
- fail fast by validating data at boundaries and surfacing errors early in the ui.
- treat accessibility, performance, and security as first-class constraints.

## working with github copilot

- give copilot precise prompts referencing this guide and the files you expect it to touch.
- review and understand every suggestion before accepting; iterate on prompts when results are unclear.
- when copilot generates logic, ensure matching updates exist for tests, types, and styles.
- document non-obvious decisions with inline comments or updates to this file.

## stack overview

- react 18 with the modern jsx runtime and function components only.
- typescript in strict mode using vite as the build tool.
- eslint for linting, prettier for formatting, and tailwind css for styling.
- vitest plus testing library and msw for unit and integration testing.
- pnpm as the package manager; lockfile is authoritative.

## project structure blueprint

```
src/
  app/
    index.tsx
    routes.tsx
    providers/
      theme-provider.tsx
      query-client-provider.tsx
    components/
      button/
        button.tsx
        button.types.ts
        button.test.tsx
        button.stories.tsx
        index.ts
    pages/
      dashboard/
        dashboard-page.tsx
        dashboard-page.test.tsx
        index.ts
    hooks/
      use-auth.ts
  assets/
  lib/
  styles/
    globals.css
    tailwind.css
  tests/
    setup-tests.ts
  types/
    api.ts
```

- keep files under 300 lines and functions under 50 lines; split when responsibilities diverge.
- colocate tests, stories, sample data, and styles with the component or page they support.
- expose public symbols through feature-level barrels (`index.ts`) to control dependencies.
- favor feature-first folders instead of layer-based monoliths.

## environment setup

```
corepack enable
pnpm install
pnpm dev
```

- run `pnpm install` after any branch switch to sync dependencies.
- configure editor integrations for eslint, prettier, and tailwind intellisense.
- avoid global npm installs; rely on `pnpm dlx` for scaffolding tools.

## package scripts

```
pnpm dev            # start vite dev server with react fast refresh
pnpm build          # create production bundle
pnpm preview        # preview production build
pnpm lint           # run eslint with type-aware rules
pnpm format         # run prettier across the repo
pnpm typecheck      # run tsc without emitting files for static analysis
pnpm test           # run vitest in watch mode with jsdom
pnpm test:ci        # run vitest with coverage thresholds
pnpm storybook      # launch storybook if configured
```

- never invoke binaries directly; always use the package scripts.
- ensure `pnpm lint`, `pnpm typecheck`, `pnpm format`, and `pnpm test:ci` pass before pushing.

## typescript conventions

- enable `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and `noImplicitOverride` in `tsconfig.json`.
- model domain data with discriminated unions and branded primitives instead of `string` or `number` placeholders.
- avoid `any` and `unknown`; when narrowing is needed, create utility type guards.
- prefer readonly properties and `as const` for literal objects.
- share cross-feature types via `src/types`, not through deep relative imports.

## react component practices

- export function components via named exports; avoid default exports for better tree shaking.
- describe props using dedicated `type component-props = { ... }` definitions and destructure at the component boundary.
- keep presentational components pure; move side effects and data fetching into hooks or providers.
- memoize expensive calculations with `usememo` and wrap event handlers in `usecallback` when necessary.
- split large components into smaller primitives or compose them via slot props.

## hooks and state management

- prefix custom hooks with `use` and keep them pure; store them next to the feature consuming them.
- share server state through react query; colocate query keys, fetchers, and cache configuration.
- use lightweight client state tools (zustand, jotai, or context) when prop drilling becomes excessive.
- document dependencies in hooks and include exhaustive dependency arrays for effects.

## data fetching and side effects

- centralize api clients under `src/lib/api`; wrap fetch or axios with consistent error handling.
- surface loading, error, and empty states explicitly in the ui.
- prefetch critical data on navigation using react query or router loaders.
- prefer suspense-friendly patterns where possible, falling back to skeletons for perceived performance.

## forms and validation

- use `react-hook-form` with zod schemas for validation and type inference.
- provide accessible labels, descriptions, and error feedback for every field.
- debounce expensive validations and avoid uncontrolled side effects inside validators.

## routing guidelines

- maintain route definitions in `routes.tsx`; lazy load page modules with `react.lazy` and wrap them in `suspense`.
- group nested routes by feature; use route-level layouts for shared chrome.
- redirect unauthenticated users through guard components or loaders.

## styling with tailwind css

- keep `@tailwind base`, `@tailwind components`, and `@tailwind utilities` in `styles/tailwind.css`.
- declare semantic tokens in `tailwind.config.ts` (e.g., `color-surface-primary`, `spacing-layout-md`).
- compose utilities with `clsx` or `class-variance-authority`; avoid deeply nested `@apply` directives.
- prefer mobile-first responsive classes and include `focus-visible`, `aria-*`, and dark mode variants.

## accessibility standards

- use semantic html and native elements (`button`, `nav`, `header`) before divs.
- ensure keyboard navigation works for every interactive element; support `enter` and `space` keys where appropriate.
- provide aria labels only when semantic context is insufficient; avoid redundant roles.
- run automated checks with `@axe-core/react` in development and include accessibility assertions in tests.

## linting and formatting

- extend `eslint:recommended`, `plugin:@typescript-eslint/recommended-type-checked`, `plugin:react-hooks/recommended`, `plugin:tailwindcss/recommended`, `plugin:testing-library/react`, and `plugin:jest-dom/recommended`.
- enable rules that disallow default exports, enforce import ordering, and require exhaustive switch statements.
- treat all eslint warnings as errors; fix them immediately.
- rely on prettier for code style and let eslint handle correctness.

## testing strategy

- colocate unit tests with the components they cover using the `.test.tsx` suffix.
- configure vitest with jsdom and testing library helpers in `tests/setup-tests.ts`.
- mock network requests with msw and clean handlers between tests.
- aim for coverage thresholds of statements 90, branches 85, functions 90, lines 90.
- prefer user-focused queries (`getByRole`, `getByLabelText`) before falling back to `data-testid`.
- write regression tests for bugs before fixing them to prevent recurrences.

## performance considerations

- code-split at route and component boundaries; use dynamic import with suspense for heavy chunks.
- debounce or throttle expensive handlers (scroll, resize, search) to avoid blocking the main thread.
- virtualize long lists with `react-window` or `react-virtualized` when rendering more than 100 items.
- preconnect and preload critical assets via vite config when beneficial.
- monitor bundle size using `pnpm analyze` (configure `rollup-plugin-visualizer`).

## security practices

- never commit secrets; rely on environment variables exposed via `import.meta.env`.
- sanitize any html passed to `dangerouslysetinnerhtml` and avoid it when possible.
- enforce https-only requests and secure cookies (`sameSite=strict`, `secure` flag) for auth flows.
- validate server responses before rendering to prevent xss or injection attacks.

## documentation expectations

- maintain `readme.md` with installation steps, scripts, and deployment details.
- document complex flows or architecture decisions under `docs/` using adr format when helpful.
- annotate non-trivial components with jsdoc-style block comments covering props, return values, and examples.
- update storybook docs pages with usage examples, controls, and accessibility notes.

## git workflow

- branch naming: `feature/<description>`, `fix/<issue>`, `chore/<task>`, `docs/<topic>`, `test/<area>`.
- follow conventional commits (`feat(ui-button): add loading indicator`).
- run lint, format, typecheck, and tests locally before pushing.
- open pull requests with screenshots or recordings for visual changes and link related issues.

## code review checklist

- types: are all new exports precise and free of `any`? are unions exhaustive?
- tests: do new features include happy-path, edge, and accessibility coverage?
- styles: are tailwind utilities readable, responsive, and aligned with design tokens?
- accessibility: do components expose semantics, focus management, and keyboard support?
- performance: does the change avoid unnecessary re-renders and heavy dependencies?
- documentation: were readme, stories, or docs updated when behavior changed?

## ci and deployment

- ci must run `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm test:ci`, and `pnpm build`.
- treat any failure as blocking; fix or revert before merging.
- preview deployments (e.g., vercel, netlify) must be reviewed for visual regressions.
- monitor lighthouse scores for performance, accessibility, best practices, and seo.

## troubleshooting

- lint failures: run `pnpm lint --fix`, then rerun tests to confirm stability.
- type errors: inspect path aliases, package typings, and ensure generics are satisfied.
- tailwind class issues: confirm new folders are included in the `content` array.
- vitest dom failures: verify `tests/setup-tests.ts` registers `@testing-library/jest-dom` and resets msw handlers.
- vite build errors: clear `node_modules/.vite`, restart `pnpm dev`, and check for mismatched dependency versions.

## continuous improvement

- review this guide quarterly; log deviations before updating processes.
- celebrate shared learnings in team syncs and document reusable patterns in `src/lib`.
- favor small refactors with tests over sweeping rewrites.
- keep automation scripts up to date to reduce manual steps.