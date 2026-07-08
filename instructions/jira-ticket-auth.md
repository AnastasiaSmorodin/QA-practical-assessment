# RWA-118 · Sign in with username and password

**Type:** Story  **Epic:** Authentication & Access  **Priority:** High  **Story Points:** 3
**Components:** Web App, Auth API  **Labels:** auth, login, security

## Story

**As a** registered user
**I want** to sign in with my username and password
**So that** I can securely access my account, transactions, and notifications.

## Description

An unauthenticated user lands on the Sign In screen and authenticates with their username and password. On success they are redirected to the home screen and their session is established. On failure they see a clear error and remain on the Sign In screen. Protected pages are not accessible without a valid session. This story covers the local (username/password) sign-in path; account creation (Sign Up) and third-party providers (Auth0, Okta, Cognito, Google) are tracked separately.

## Preconditions

- A registered user account exists.
- The user is signed out (no active session).

## Acceptance Criteria

### AC1 — Happy path: successful sign in

```gherkin
Given I am on the Sign In screen
When I enter a valid username and password
And I click "Sign In"
Then I am redirected to the home screen
And I see my account and transaction feed
And a session is established for subsequent requests
```

### AC2 — Invalid credentials

```gherkin
Given I am on the Sign In screen
When I enter a username/password combination that does not match an account
And I click "Sign In"
Then I remain on the Sign In screen
And I see an error message indicating the credentials are invalid
And no session is established
```

### AC3 — Field validation

```gherkin
Given I am on the Sign In screen
When I leave the username empty
Then I see "Username is required"
And the "Sign In" button is disabled

When I enter a password shorter than 4 characters
Then I see "Password must contain at least 4 characters"
And the "Sign In" button is disabled
```

### AC4 — Remember me / session persistence

```gherkin
Given I am on the Sign In screen
When I check "Remember me"
And I sign in successfully
Then my session persists after closing and reopening the browser

Given I sign in without checking "Remember me"
Then my session ends when the browser session ends
```

### AC5 — Protected routes require authentication

```gherkin
Given I am not signed in
When I navigate directly to a protected route (e.g. /personal, /bankaccounts)
Then I am redirected to the Sign In screen
```

### AC6 — Navigate to Sign Up

```gherkin
Given I am on the Sign In screen
When I click "Don't have an account? Sign Up"
Then I am taken to the Sign Up screen
```

### AC7 — Sign out

```gherkin
Given I am signed in
When I sign out
Then my session is cleared
And I am returned to the Sign In screen
And navigating back to a protected route redirects me to Sign In
```

## Out of scope

- Account creation / Sign Up (RWA-119)
- Third-party / SSO sign-in: Auth0, Okta, Cognito, Google (RWA-12x)
- Forgot password / password reset
- Multi-factor authentication

## Definition of Done

- [ ] Code merged and deployed to staging
- [ ] AC1–AC7 verified
- [ ] Automated coverage added (UI: valid login, invalid login, validation, logout; API contract for `POST /login` and `POST /logout`)
- [ ] Security: passwords never logged or returned in API responses; session cookie is HttpOnly
- [ ] No regression in the authenticated app shell (feeds, notifications, nav)
- [ ] Accessibility: form fields and the Sign In button are labeled and keyboard-navigable
