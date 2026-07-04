# Stonly QA Take-Home Plan

## Goal

Build a small, production-minded Playwright suite for one editable area in Stonly User Settings, then explain the design decisions clearly enough to defend them in the technical interview.

The assignment rewards depth of reasoning over breadth, so the plan is to automate one feature well instead of covering every settings field shallowly.

## Broad Questions To Answer First

### 1. Which feature should we automate?

Preferred target: **headline add / edit / delete**.

Why:

- It is likely a normal form workflow, so it exercises useful QA concerns: validation, persistence, repeated runs, and cleanup.
- It avoids extra complexity from image upload handling, browser file chooser behavior, asset processing, and possible CDN delays.
- It should be easier to make deterministic and fast.

Fallback target: **profile picture add / edit / delete**, only if headline is unavailable, blocked, or too trivial in the actual UI.

Decision to confirm during exploration:

- Is headline present in User Settings?
- Does it support create, update, and delete/clear?
- Does the value persist after reload/logout?
- Are there validation rules or character limits worth testing?

### 2. What should the test suite prove?

Target test set: **3-5 meaningful tests**.

Likely tests for headline:

1. User can add a headline and see it persisted after saving/reloading.
2. User can edit an existing headline and see the updated value persisted.
3. User can clear/delete the headline and return to an empty state.
4. Negative or edge case: empty headline, overlong headline, whitespace-only value, or invalid input behavior depending on what the product allows.
5. Optional smoke: settings page loads authenticated and exposes expected profile controls.

Key principle: each test should leave the account in a known state, either by cleaning up after itself or by using unique test data that can be overwritten safely.

### 3. How should the project be structured?

Use TypeScript Playwright with a small but scalable layout:

```text
.
├── README.md
├── playwright.config.ts
├── package.json
├── tests/
│   └── user-settings-headline.spec.ts
├── pages/
│   ├── login.page.ts
│   └── user-settings.page.ts
├── fixtures/
│   └── auth.fixture.ts
└── utils/
    └── test-data.ts
```

Initial architecture choices:

- **Page objects** for login and settings interactions, because they keep selectors and UI workflows out of test intent.
- **Fixtures** for authenticated context and shared setup.
- **Storage state auth reuse** to avoid logging in through the UI for every test.
- **Small helper for unique test data**, so repeated local and CI runs do not collide.
- **README-first run instructions**, because this is part of the graded deliverable.

If the suite grew to hundreds of tests:

- Split tests by product area and ownership.
- Add API-level setup/cleanup if the product exposes safe internal or public APIs.
- Move shared flows into fixtures only when reuse is real.
- Tag tests by type, e.g. `@smoke`, `@regression`, `@settings`.
- Run smoke tests on every PR and broader suites on merge/nightly.

### 4. How should credentials and config work?

Use named JSON config files rather than hard-coded test settings:

```text
config/review.json
config/local.json
```

For this take-home submission, reviewer convenience is more important than strict secret hygiene, so we can commit a clearly labeled review config using a dedicated disposable account. Credentials should be Base64-obfuscated so they are not directly searchable as plain text:

```json
{
  "name": "review",
  "app": {
    "baseUrl": "https://app.stonly.com",
    "loginUrl": "https://stonly.com/authentication",
    "userSettingsPath": "/app/general/userSettings/Profile"
  },
  "auth": {
    "emailBase64": "...",
    "passwordBase64": "...",
    "storageState": ".auth/review-user.json"
  },
  "testData": {}
}
```

This is acceptable only because the account is purpose-built for the assignment. The README should explicitly say these credentials are for the review account only, are obfuscated rather than secure, and should not be reused anywhere else.

Package scripts should select the config explicitly, e.g. `STONLY_CONFIG=review playwright test`, so future scripts can run against different environments or test data sets.

Possible auth approaches:

- Best: `globalSetup` logs in once and writes Playwright `storageState`.
- Alternative: a setup project such as `tests/auth.setup.ts`.
- Fallback: login in `beforeEach` if auth state is unstable, accepting the speed cost.

Questions to confirm:

- Does signup require email verification every time?
- Can we create one dedicated test account and reuse it?
- Does the app expire sessions aggressively?
- Is MFA, captcha, or email magic-link auth involved?

### 4a. Should signup/user creation be automated?

Default recommendation: **do not automate new user signup as part of the main suite**. Use a dedicated test account supplied through environment variables, then reuse authenticated storage state.

Reasoning:

- The assignment allows creating a free account up front; it does not require signup testing.
- Signup introduces external dependencies: disposable inbox reliability, email delivery timing, anti-abuse checks, captcha, and possible domain blocking.
- Mailinator is useful for manual/public inbox signup, but its official API is primarily positioned around subscriber/private-domain workflows. Public inbox automation usually means driving the Mailinator UI or relying on unofficial scraping/websocket libraries, which is a poor dependency for a take-home CI suite.
- Automating signup also creates account sprawl unless there is a supported cleanup path.

Acceptable alternatives if fresh users are required:

- Use an official email testing provider with API support, such as Mailinator paid/private domain, MailSlurp, Mailosaur, or a company-provided test mailbox service.
- Encapsulate email polling behind an `EmailClient` helper so the test suite is not coupled to one provider.
- Make signup a separate setup script or tagged test, not part of the default settings regression run.

If implemented, the flow should:

1. Generate a unique email address.
2. Submit signup.
3. Poll the inbox API for the confirmation email.
4. Extract and open the confirmation link.
5. Complete onboarding.
6. Persist `storageState`.
7. Record or clean up the account if the product supports it.

### 5. What selector strategy should we use?

Selector priority:

1. User-facing roles and accessible names: `getByRole`, `getByLabel`, `getByText` where stable.
2. Stable form labels for fields.
3. Purpose-built test ids only where semantic selectors are weak.
4. CSS selectors only as a last resort, and only scoped inside a page object.

What to ask the dev team for:

- Accessible labels for editable settings fields.
- Stable button names for save/delete actions.
- `data-testid` or equivalent for dynamic controls that lack clear roles/names.
- Clear success/error messages with accessible roles, e.g. `role="alert"` or toast semantics.

Avoid:

- Selectors based on generated classes.
- Deep DOM paths.
- Text that is likely marketing copy rather than product contract.

### 6. How do we keep tests reliable and fast?

Reliability choices:

- Reuse authenticated storage state.
- Start each test from an explicit known state.
- Prefer web assertions that auto-wait, such as `expect(locator).toHaveValue(...)`.
- Avoid arbitrary sleeps.
- Keep tests independent and parallel-safe where possible.
- Generate unique values with a timestamp or random suffix.
- Use retries only in CI, and treat retry success as a signal to investigate flakiness.

Speed choices:

- Keep UI tests focused on high-value workflows.
- Avoid repeated login.
- Run Chromium by default unless cross-browser behavior is explicitly in scope.
- Parallelize independent tests only after test data isolation is solid.

### 7. What should we deliberately not automate?

Likely out of scope for the 2-4 hour assignment:

- Exhaustive settings coverage.
- Full cross-browser matrix.
- Visual regression.
- Profile picture upload edge cases, unless that becomes the selected feature.
- Account signup automation, unless necessary for auth setup.
- Deep backend verification without an API contract.

Manual testing is still appropriate for:

- Visual polish and layout judgment.
- Exploratory testing around newly changed settings UI.
- Browser/device combinations not justified for the small suite.
- Accessibility review beyond the basic signals Playwright can check quickly.

### 8. How would this run in CI?

Recommended CI shape:

- Install dependencies with `npm ci`.
- Install Playwright browsers with `npx playwright install --with-deps chromium`.
- Provide credentials through CI secrets.
- Run a small settings smoke/regression suite on pull requests.
- Publish Playwright HTML report, screenshots, traces, and videos on failure.
- Block merges only on stable, high-signal tests.
- Track flaky tests explicitly instead of letting retries hide failures.

For a team shipping many times per day:

- Keep PR feedback under a few minutes.
- Run deeper suites after merge or on a schedule.
- Make failures actionable by grouping tests around user workflows and clear page object methods.

### 9. How should bugs and rough edges be captured?

Use a short, product-team-friendly format:

```text
Title:
Area:
Environment:
Steps:
Expected:
Actual:
Impact:
Evidence:
Workaround:
```

During implementation, record:

- Product bugs.
- Testability gaps.
- Ambiguous behavior.
- Any workaround added to the suite.

### 10. How would we test AI / non-deterministic output?

For AI-generated features, avoid asserting exact wording. Assert deterministic contracts around the output:

- Request succeeds and returns within an acceptable time.
- Output is non-empty and structurally valid.
- Required entities, citations, links, or sections are present.
- Unsafe or forbidden content is absent.
- The source material is reflected with acceptable semantic similarity.
- The model call stores expected metadata, status, and audit trail.

Use layered coverage:

- Unit tests for prompt builders and parsers.
- Contract tests with mocked model responses.
- A small number of live AI smoke tests with broad assertions.
- Golden datasets evaluated by rubric or semantic checks, reviewed over time.
- Monitoring in production for latency, error rate, empty output, and user feedback.

## Initial Implementation Plan

1. Explore signup/login and User Settings manually.
2. Select the final feature, ideally headline.
3. Create the Playwright TypeScript project skeleton.
4. Implement login/auth reuse.
5. Build page objects for login and User Settings.
6. Write 3-5 focused tests.
7. Run locally and remove flakiness.
8. Write README with install, config, and run instructions.
9. Write the final design strategy document from the decisions above.
10. Package or push the repo.

## Open Risks

- Stonly may use auth flows that are difficult to automate, such as captcha, email-only login, or short-lived sessions.
- User Settings field labels may not be accessible, requiring less ideal selectors or a note asking developers for test hooks.
- The account may not have deterministic cleanup APIs, so tests need to overwrite state carefully.
- Public disposable inbox signup may be slower or flaky; a dedicated test account is preferable if allowed.

## Current Recommendation

Start with headline automation and keep the suite intentionally small. The submission should feel like the seed of a real suite: clear config, deliberate selectors, repeatable data handling, and honest notes about what was not automated.
