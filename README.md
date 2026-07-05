# Stonly QA Playwright Suite

Small Playwright TypeScript suite for the Stonly Senior QA Automation Engineer take-home task.

The important parts are:

- One focused feature: Profile Headline.
- Live UI tests for read/write/clear.
- Hybrid mock tests for Headline API contracts and failed update behavior.
- One mocked visual snapshot test.
- Fixture-first UI model with a single root `{ ui }` fixture.

The strategy write-up is in [TAKE_HOME_PLAN.md](TAKE_HOME_PLAN.md).

## Quick Start

```bash
npm install
npx playwright install chromium
npm test
```

`npm test` runs the default hybrid mocked Headline suite. It logs in through the real Stonly app shell, then mocks Headline-related API behavior with Playwright routes. This is the safest reviewer run because it does not mutate the shared review account.

To run the live Headline UI suite:

```bash
npm run test:live
```

Live tests read, update, and clear the real Profile Headline, then restore it to `QA Review Headline`.

## Available Commands

```bash
npm test
npm run test:mock
npm run test:live
npm run test:visual
npm run test:all
npm run typecheck
```

Useful filtered runs:

```bash
npm run test:mock -- --grep @negative
npm run test:live -- --grep @happypath
npm run test:visual -- --grep @visual
```

Visual snapshots can be verified locally with Docker:

```bash
npm run test:visual:docker
```

Update visual baselines intentionally with:

```bash
npm run test:visual:update
```

## Configuration

Reviewer credentials are committed in `config/review.json` using Base64 obfuscation. This is not secret management; it only avoids exposing the credentials as directly searchable strings.

Config is JSON-based and selected with `STONLY_CONFIG`. Additional targets can be added as `config/<name>.json`.

Example local config shape:

```json
{
  "name": "local",
  "app": {
    "baseUrl": "https://app.stonly.com",
    "loginUrl": "https://stonly.com/authentication",
    "userSettingsPath": "/app/general/userSettings/Profile"
  },
  "auth": {
    "email": "review@example.com",
    "password": "password",
    "storageState": ".auth/local-user.json"
  },
  "testData": {}
}
```

The first run creates `.auth/review-user.json` through the setup project. Playwright then reuses that storage state for the actual test project.

## CI And Runtime Controls

GitHub Actions sets `CI=true`, and `playwright.config.ts` uses that to default CI runs to:

- one worker;
- one retry;
- `forbidOnly: true`;
- traces on first retry;
- videos retained on failure.

Local and CI values can be overridden:

```bash
PW_WORKERS=4 npm test
PW_RETRIES=2 npm run test:mock
```

## Architecture

- `src/fixtures/test.ts` exports the shared `test` and `expect`.
- The shared test exposes one custom root fixture: `{ ui }`.
- Specs define local scenario/page fixtures, for example a navigated `{ userSettingsPage }`.
- UI access is composed through the product hierarchy, such as `ui.userSettingsPage.profileForm.headline`.
- Page objects and components expose locators and user actions only.
- Assertions stay in specs, with intent explained through `test.step`.
- API contract helpers live in purpose-named files under `tests/assertions/`.

Selector priority:

1. `getByRole`
2. `getByLabel`
3. `getByTestId`
4. CSS only as a last resort inside wrappers

Stonly uses `data-cy`, configured as Playwright's `testIdAttribute`, so UI wrappers use `getByTestId(...)` for those hooks.

Specs should not destructure raw `{ page }`, `{ context }`, or `{ browser }` in test bodies. Raw Playwright fixtures are allowed inside fixture definitions when constructing `Ui` or installing route mocks.
