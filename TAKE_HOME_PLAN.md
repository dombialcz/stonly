# Stonly QA Automation Strategy

## Decomposition

I focused on the Profile Headline feature and treated it as a small but complete product workflow. That gave me enough surface area to cover useful automation concerns - read state, update state, clear state, setup, cleanup, selectors, API contracts, negative behavior, and visual regression - without spreading the suite across many unrelated settings fields.

I started with the highest-value behavior: the user can read the current Headline, save a new one, and clear it back to the empty state. From there I added layered Playwright coverage:

- Live UI tests for the real Headline workflow against Stonly.
- Hybrid mock tests that keep the real authenticated app shell but mock Headline API responses with Playwright routes.
- A visual snapshot test for the mocked Profile card.

The hybrid mock layer is a pragmatic take-home compromise. In a production repository, I would prefer a controlled app shell or mock server where the whole backend boundary is owned and explicit. Here, I do not own the application under test, so route interception is a practical way to demonstrate contract-style testing and backend failure handling without pretending I have a complete offline test environment.

## Architecture

The project uses a fixture-first UI model with one shared root fixture: `{ ui }`. That root fixture owns the Playwright `Page` and exposes top-level product pages such as `ui.loginPage` and `ui.userSettingsPage`.

From there, UI access is composed through the product hierarchy:

```ts
ui.userSettingsPage.profileForm.headline
```

Page objects represent distinct physical pages. Components represent meaningful parts of those pages. For example, `UserSettingsPage` owns `profileForm`, and `ProfileFormComponent` owns `headline`.

I intentionally keep scenario setup out of the UI model. A concept like `headlineProfile` is not product UI; it is test setup state. That setup belongs in local test fixtures, not page objects. In the live suite, the spec extends the base test with a local `userSettingsPage` fixture that navigates to Profile, restores the Headline baseline before the test, yields the page to the test, and restores the baseline again in `finally`.

That keeps the dependency chain clear:

- Shared fixture: create `ui`.
- Local fixture: prepare the page or scenario for this spec.
- UI objects: expose locators and user actions.
- Specs: perform assertions and explain intent with `test.step`.

If the suite grew, I would keep this model but split by product area. I would add folders per feature, local fixture modules where reuse is real, stronger test data management, API-based setup/cleanup, and clearer CI tiers for smoke, regression, visual, and live suites.

## Selector Strategy

My selector priority is:

1. `getByRole`
2. `getByLabel`
3. `getByTestId`
4. CSS only as a last resort inside wrappers

The goal is to select the UI the way a user or accessibility tree understands it. For example, the Profile heading is selected by role, and the Headline editor input is selected by label.

For stable test hooks, Stonly exposes some `data-cy` attributes. I configured Playwright to treat those as test ids:

```ts
use: {
  testIdAttribute: 'data-cy',
}
```

That lets the suite use:

```ts
page.getByTestId('headlineDialog')
page.getByTestId('userHeadline')
```

instead of raw attribute selectors. I still scope repeated actions carefully. Several rows expose the same `editButton` hook, so the Headline edit action is found under the Headline row rather than globally.

If I could ask the dev team for improvements, I would ask for unique row/action test ids, accessible labels on all fields, named dialogs, and proper alert/toast semantics for failed saves.

## Reliability And Speed

Authentication is handled once per Playwright run by the setup project. It logs in through the UI, writes storage state to `.auth/review-user.json`, and the main Chromium project starts tests from that saved state. This avoids logging in before every test while keeping the setup easy for a reviewer to run.

Config is JSON-based and selected with `STONLY_CONFIG`, so future environments and datasets can be added without changing test code.

The live tests mutate one shared review account, so they run serially. The reason is not auth; it is shared mutable product state. If two tests update the same Headline in parallel, one test can overwrite the state while another is asserting it. The fixture restores the baseline before and after every live test, and `finally` ensures cleanup still runs after a failure.

Mock and visual tests do not mutate the review account and can run in parallel. The Playwright config is CI-aware: local runs use the default worker count, CI uses one worker and one retry, screenshots are captured on failure, traces are retained for failures/retries, and videos are retained on CI failure.

Retries are not a fix for flakiness. A retry pass is a signal to investigate, especially because the hybrid suites still rely on real auth and the live app shell.

## Scope Judgment

For the Headline feature, I automated the core lifecycle: read the current value, save a new value, clear it, and verify that the UI reflects the result. I also covered the main update/clear API contract through route mocks and added one failed-save case where the attempted value must not appear as saved.

I did not add special-character, max-length, whitespace-only, API-injection, or race-condition tests yet because the product contract is not explicit. Without knowing the intended rules, those tests would either encode guesses or lock in accidental current behavior. For example, if the field accepts emoji, HTML-like text, or 500 characters today, that does not prove the product is supposed to allow it.

Those tests are still valuable, but I would add them after clarifying the rules:

- Allowed characters and trimming behavior.
- Minimum and maximum length.
- Empty-value semantics.
- Server-side validation expectations.
- Error messaging.
- Concurrent update behavior.

I would test user-facing validation in the UI layer, server rules in API/contract tests, and latency or failure behavior with controlled route mocks. Race-condition tests need controllable timing and clear expected conflict behavior; otherwise they become flaky demonstrations rather than reliable regression coverage.

Manual testing still makes sense for exploratory settings behavior, visual polish, accessibility review, upload UX, and ambiguous product decisions.

## Bugs And Rough Edges

### Failed Headline Save Has No Visible Error

Area: User Settings / Profile Headline

Steps:

1. Open Profile settings.
2. Edit Headline.
3. Save while the `PUT /api/v1/user` request fails.

Expected: The user sees a clear error and can retry or cancel without losing context.

Actual: In the observed mocked failure path, the dialog closes and the previous Headline remains visible. No visible error was detected.

Impact: Users may believe the change was saved or may not understand why their update disappeared.

### Repeated Generic Edit Hooks Require Careful Scoping

Area: User Settings rows

Several rows expose the same `data-cy="editButton"` hook. Tests can handle this by scoping to a row, but unique row/action hooks would make the UI easier and safer to automate.

### Hybrid Mock Tests Still Depend On Real Auth

Area: Test environment

The mock and visual suites intentionally use real auth and the live app shell, then mock only Headline API behavior. This is acceptable for this take-home, but a production-grade suite would benefit from a better app-shell contract, API fixtures, or a lower-level way to bootstrap authenticated state.

### Review Credentials Are Obfuscated, Not Secret

Area: Test configuration

The review credentials are Base64-obfuscated in `config/review.json` for reviewer convenience. This is not secret management. In a real delivery setup, credentials should come from CI secrets or a managed test identity system.

## Fitting Into Delivery

For a team shipping many times a day, I would keep PR feedback small and fast:

- Run typecheck and the mock contract suite on every pull request.
- Upload Playwright reports, screenshots, traces, and videos on failure.
- Use tags such as `@negative`, `@happypath`, and `@visual` for focused runs.
- Run visual snapshots after merges to `main` in the pinned Playwright Docker image.
- Run live mutation tests as opt-in, scheduled, or pre-release checks because they touch shared account state.

Stable live smoke tests can be a useful release signal, but I would be careful about making broad live UI suites hard deployment gates. If the team needs a stronger pre-production gate, I would run live smoke/regression against a staging or demo environment first, then promote only after those checks pass.

The main delivery goal is actionable feedback. A failure should tell a developer which workflow regressed, what evidence was captured, and whether the problem is product behavior, API contract mismatch, or test infrastructure instability.

## Optional Bonus - Testing Non-Deterministic AI Output

For AI-generated features, I would avoid asserting exact wording. Deterministic checks should focus on the contract around the output: the request succeeds, the response has the expected schema, required fields are present, the UI renders the result without layout issues, loading and error states behave correctly, and unsafe raw HTML or broken formatting is not injected into the page.

The content itself needs layered confidence rather than brittle exact assertions. I would use mocked model responses for stable UI regression tests, a small set of live AI smoke tests with broad assertions such as non-empty answer, required citation/source structure, or selected language, and an offline evaluation set for quality checks. Rubric-based evaluation or semantic similarity can help, but I would treat those as quality signals, not ordinary UI assertions. The reliable safety net is deterministic contract coverage around the integration, stable mocked UI rendering tests, and monitored evaluation over representative prompts.
