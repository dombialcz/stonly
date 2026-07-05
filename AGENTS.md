# Agent Notes

This repo is a Playwright TypeScript wireframe for the Stonly QA take-home task. Keep changes small, explicit, and aligned with the fixture-first UI model.

## Agent Workflow

- Start by checking `git status --short --branch`; preserve any existing user or agent changes unless explicitly told to revert them.
- Keep implementation changes scoped to the current testing architecture. Do not reintroduce a global fixture bag for convenience.
- Before pushing code changes, run the smallest relevant verification plus `git diff --check`; for fixture/spec changes, run `npm run typecheck` and the affected Playwright script.
- Commit intentionally with a concise message that describes the testing architecture or behavior change.

## Project Commands

- Install: `npm install`
- Install browser: `npx playwright install chromium`
- Typecheck: `npm run typecheck`
- Default test run: `npm test`
- Mock contract run: `npm run test:mock`
- Live mutation run: `npm run test:live`
- Visual snapshot run: `npm run test:visual`
- Full run: `npm run test:all`
- Headed mock run: `npm run test:review:headed`

## Config

- Config is JSON-based, selected with `STONLY_CONFIG`.
- The default/review target is `config/review.json`.
- Add future targets as `config/<name>.json` and a matching package script.
- Reviewer credentials are Base64-obfuscated in JSON. This is not secret management; it only avoids plain-text credentials in the repo.
- Local private configs should use `config/local*.json`, which is gitignored.

## Fixture Rules

- Specs must import `test` and `expect` from `src/fixtures/test.ts`.
- The shared `test` exposes exactly one custom root fixture: `{ ui }`.
- `src/fixtures/test.ts` should stay minimal: construct `new Ui(page)` and export `expect`.
- Specs must not use Playwright's raw `{ page }`, `{ context }`, or `{ browser }` fixtures in test bodies.
- Raw Playwright fixtures may be used inside fixture definitions to construct `Ui` or install route mocks.
- Access UI objects by composition from `ui`, for example `ui.userSettingsPage.profileForm.headline`.
- Define scenario/page fixtures locally in the spec that needs them, for example a navigated `{ userSettingsPage }`.
- Do not add global scenario fixtures such as `{ headlineProfile }` or `{ mockedHeadlineProfile }` to `src/fixtures/test.ts`.
- Do not add scenario concepts to UI classes. `headlineProfile` is setup/teardown state, not product UI.
- Default tests should not mutate the review account; use `npm run test:live` for live mutation coverage.
- Visual tests should use mocked data and committed Playwright snapshots, not the live mutable profile state.
- Mock and visual suites intentionally use real auth/app shell in this take-home; route mocks should cover only the Headline API behavior under test.
- Live tests are UI behavior tests only: do not assert HTTP status codes, request payloads, response payloads, or expose API recorder objects from live fixtures.
- API contract assertions and backend failure-mode coverage belong in mocked route-based suites.

## UI Model Rules

- Page objects own distinct URLs and navigation.
- Components/modals are composed under pages or parent components.
- Use lazy wrappers for nested pages/components when the object may not be needed by every test.
- UI objects should expose locators and user actions only.
- Do not put assertions such as `expectVisible`, `expectLoaded`, or `toHave...` methods in models.
- Do not add generic readiness checks to fixtures. If readiness matters, assert it in the test that depends on it.
- Prefer Playwright role/label locators.
- Stonly's `data-cy` is configured as Playwright's `testIdAttribute`; use `getByTestId(...)` for those hooks.
- Use CSS only inside wrappers and only when role/label/test-id selectors are insufficient.

## Test Style

- Tests should read as behavior specs: arrange through an extended fixture, act through a composed UI object, and assert the user-observable outcome directly.
- Use `test.step` labels to explain why a phase or assertion matters; do not hide simple UI expectations behind one-line helper names just to make intent visible.
- Keep UI locator assertions in the spec when they are one or two direct Playwright expectations, for example `await expect(headline.value).toHaveText(...)`.
- Use assertion helpers only for API contracts or genuinely reusable multi-assertion domain states; never put assertion helpers in UI models.
- Put API contract helpers in purpose-named files under `tests/assertions/`, for example `headline.api.assertions.ts`.
- Keep API assertions separate from UI assertions. Mock specs may combine both, but helpers should make the boundary obvious.
- Put static expected payloads, endpoint fragments, and repeated literal values in `tests/data/`.
- Do not put assertion logic in `tests/data/`, and do not put mutable setup/cleanup in assertion helpers.
- Use sparse behavior tags only when they describe real coverage, such as `@happypath`, `@negative`, and `@visual`; reserve `@permission` for actual role/permission scenarios.
- Prefer assertion helpers over custom `expect` matchers until repetition clearly justifies extending Playwright's assertion API.
- Use Playwright's native auto-waiting through `expect(locator)` in specs.
- Keep mocked API behavior deterministic and live mutations opt-in.
- Live mutation specs that share the review account should opt out of file-level parallelism.
- Use route mocks for negative backend scenarios such as failed saves; keep live tests focused on user-observable UI behavior.
- Update visual baselines intentionally with `npm run test:visual -- --update-snapshots`.
- If a flow changes, update the specific fixture/test path that needs it instead of adding broad waits.

## Current Known App Behavior

- Login URL is `https://stonly.com/authentication`.
- User Settings Profile URL path is `/app/general/userSettings/Profile`.
- The profile Headline is a read-only row before clicking `Add`; it is not a textbox in the closed state.
- Headline writes and clears use `PUT https://app.stonly.com/api/v1/user`.
- Clearing the Headline is implemented by saving an empty string.
- Live Headline tests restore the account to `QA Review Headline`.
- The Stonly login page can reset fields if filled before hydration completes, so `tests/auth.setup.ts` waits for login-page stability before filling credentials.
