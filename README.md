# Stonly QA Playwright Wireframe

This is a small Playwright TypeScript scaffold for the Stonly Senior QA Automation Engineer take-home task.

The goal of this first version is architectural: tests use one root `{ ui }` fixture and compose page/component access from there. Scenario-specific fixtures are extended locally in the spec that needs them.

The assignment write-up is in [TAKE_HOME_PLAN.md](TAKE_HOME_PLAN.md).

## Setup

```bash
npm install
npx playwright install chromium
```

Reviewer credentials are committed in `config/review.json` for convenience, using Base64 obfuscation rather than plain text. This is not secret management; it only avoids exposing the credentials as directly searchable strings.

Additional targets can be added as JSON files under `config/`, then selected with `STONLY_CONFIG`.

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

## Run

```bash
npm test
```

The default run executes the hybrid mocked Headline suite, which avoids mutating the shared review account. It still uses real auth and the live app shell, then mocks the Headline-related API behavior with Playwright routes.

Explicit targets:

```bash
npm run test:mock
npm run test:live
npm run test:visual
npm run test:all
```

Run subsets by tag with Playwright `--grep`:

```bash
npm run test:mock -- --grep @negative
npm run test:live -- --grep @happypath
npm run test:visual -- --grep @visual
```

Local and CI worker/retry counts can be overridden:

```bash
PW_WORKERS=4 npm test
PW_RETRIES=2 npm run test:mock
```

CI defaults to one worker and one retry. Local runs use Playwright's default worker count and no retries unless overridden.

The first run creates `.auth/review-user.json` through the setup project. Live tests restore the Headline to `QA Review Headline` before and after each test.
Visual tests use Playwright snapshots against the mocked Profile page. Update baselines intentionally with:

```bash
npm run test:visual -- --update-snapshots
```

## Architecture

- `src/fixtures/test.ts` exports the only shared `test` object used by specs.
- The shared test exposes one custom root fixture: `{ ui }`.
- Scenario-specific fixtures, such as a navigated `{ userSettingsPage }`, are defined locally in the spec that needs them.
- Page objects own distinct URLs and navigation.
- Components and modals are composed under pages and lazy-loaded.
- The default Headline suite uses Playwright route mocks. Live add/edit/delete coverage is opt-in with `npm run test:live`.
- Mock and visual suites intentionally rely on real Stonly auth/app shell for this take-home, then mock only the Headline API contract.
- Visual regression coverage uses Playwright's built-in `toHaveScreenshot` snapshots and runs post-merge on `main`.

Specs should not destructure raw `{ page }`, `{ context }`, or `{ browser }` in test bodies. Those raw fixtures are allowed inside fixture definitions when constructing `Ui` or installing route mocks.
