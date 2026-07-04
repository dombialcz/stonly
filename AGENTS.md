# Agent Notes

This repo is a Playwright TypeScript wireframe for the Stonly QA take-home task. Keep changes small, explicit, and aligned with the fixture-first UI model.

## Project Commands

- Install: `npm install`
- Install browser: `npx playwright install chromium`
- Typecheck: `npm run typecheck`
- Default test run: `npm test`
- Review config run: `npm run test:review`
- Headed review run: `npm run test:review:headed`

## Config

- Config is JSON-based, selected with `STONLY_CONFIG`.
- The default/review target is `config/review.json`.
- Add future targets as `config/<name>.json` and a matching package script.
- Reviewer credentials are Base64-obfuscated in JSON. This is not secret management; it only avoids plain-text credentials in the repo.
- Local private configs should use `config/local*.json`, which is gitignored.

## Fixture Rules

- Specs must import `test` and `expect` from `src/fixtures/test.ts`.
- Specs must not use Playwright's raw `{ page }`, `{ context }`, or `{ browser }` fixtures.
- Specs must not use a public `{ ui }` fixture.
- The root `_ui` fixture is internal plumbing only.
- Public fixtures should expose ready-to-use pages/components, for example `{ userSettingsPage }`.
- Add new scenario fixtures in `src/fixtures/test.ts` rather than constructing UI objects in specs.

## UI Model Rules

- Page objects own distinct URLs and navigation.
- Components/modals are composed under pages or parent components.
- Use lazy wrappers for nested pages/components when the object may not be needed by every test.
- UI objects should expose locators and user actions only.
- Do not put assertions such as `expectVisible`, `expectLoaded`, or `toHave...` methods in models.
- Do not add generic readiness checks to fixtures. If readiness matters, assert it in the test that depends on it.
- Prefer Playwright role/label locators. Use CSS only inside wrappers and only when accessible selectors are insufficient.

## Test Style

- Tests should express behavior through extended fixtures and composed UI objects.
- Assertions belong in specs or future dedicated assertion helpers, not in UI models.
- Use Playwright's native auto-waiting through `expect(locator)` in specs.
- Keep the current smoke test read-only unless the task explicitly moves to add/edit/delete coverage.
- If a flow changes, update the specific fixture/test path that needs it instead of adding broad waits.

## Current Known App Behavior

- Login URL is `https://stonly.com/authentication`.
- User Settings Profile URL path is `/app/general/userSettings/Profile`.
- The profile Headline is a read-only row before clicking `Add`; it is not a textbox in the closed state.
- The Stonly login page can reset fields if filled before hydration completes, so `tests/auth.setup.ts` waits for login-page stability before filling credentials.
