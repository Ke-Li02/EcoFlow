# Strategy Pattern - Route Guarding in EcoFlow

## Problem

The app needs two redirect guard behaviors:

1. Unauthenticated user trying to open protected user pages.
2. Authenticated non-admin user trying to open admin-only pages.

Without a strategy-based design, guard logic can be repeated across routes/pages, which increases the risk of using the wrong guard and reduces maintainability.

## Solution

We implemented the **Strategy pattern** for routing guards.

- A common guard interface defines guard behavior.
- Each access rule is implemented as a strategy.
- A single `RouteGuard` component selects and executes the appropriate strategy.

## Pattern roles in our implementation

- **Strategy interface**
  - `frontend/src/guards/GuardStrategy.ts`
  - `GuardStrategy` (`canActivate`, `getRedirectPath`)
- **Concrete strategies**
  - `frontend/src/guards/strategies.ts`
  - `RequireAuthStrategy`
  - `RequireAdminStrategy`
- **Context**
  - `frontend/src/guards/RouteGuard.tsx`
  - Accepts `guardType` and delegates decision to selected strategy.
- **Client**
  - `frontend/src/App.tsx`
  - Declares per-route guard intent:
    - `guardType="auth"` for `/home`, `/provide`
    - `guardType="admin"` for `/analytics`

## Before vs After

### Before

- Guard check was hardcoded in `App.tsx` with one inline `ProtectedRoute`.
- Extending to more guard types would require more custom route wrappers.

```text
Route -> inline protected check -> redirect
```

### After

- Routes declare guard type only.
- Strategy classes contain rule logic and redirect targets.

```text
Route -> RouteGuard (context) -> selected strategy -> allow or redirect
```

## Redirect behavior

- `auth` strategy:
  - Not logged in -> redirect to `/login`
- `admin` strategy:
  - Not logged in -> redirect to `/login`
  - Logged in but not admin -> redirect to `/home`

## Why this improves maintainability

- Guard logic is defined once per rule, not repeated per page.
- New access rules can be added by implementing another strategy.
- Routes remain declarative and less error-prone.
- Reduces risk of mismatched guard usage on future pages.

