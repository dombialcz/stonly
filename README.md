# Stonly QA Playwright Wireframe

This is a small Playwright TypeScript scaffold for the Stonly Senior QA Automation Engineer take-home task.

The goal of this first version is architectural: tests consume extended fixtures such as `userSettingsPage`, not raw Playwright `{ page }` or a public `{ ui }` fixture.

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

Explicit review target:

```bash
npm run test:review
```

The first run creates `.auth/review-user.json` through the setup project, then runs the read-only User Settings smoke test.

## Architecture

- `src/fixtures/test.ts` exports the only `test` object used by specs.
- The root `_ui` fixture is internal to the fixture module.
- Public fixtures derive from `_ui` and expose ready-to-use pages/components.
- Page objects own distinct URLs and navigation.
- Components and modals are composed under pages and lazy-loaded.

Specs should not destructure `{ page }`, `{ context }`, `{ browser }`, `{ ui }`, or `{ _ui }`. New scenario fixtures should be added in `src/fixtures/test.ts`.
