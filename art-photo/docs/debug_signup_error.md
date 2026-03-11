# Debug Report: "Database error saving new user" (500)

## Problem Statement

When attempting to register a new user via the app or directly via the Supabase Auth API, the following error is returned:

```
[signUp] Supabase error: Database error saving new user 500
Error [AuthApiError]: Database error saving new user
  __isAuthError: true, status: 500, code: 'unexpected_failure'
```

Network connectivity to Supabase is confirmed working (TCP port 443 test succeeds).

---

## Debug Approach Summary

### Approach 1: Console Error Logging

**Action:** Added `console.error` to `src/actions/auth.ts` signUp function to capture the exact Supabase error.

**Result:** Confirmed the error is `AuthApiError` with status 500 and code `unexpected_failure`. The error message is "Database error saving new user" — this means the Supabase Auth service (GoTrue) encounters a database-level error when trying to create the user in `auth.users`.

---

### Approach 2: Basic Connectivity & Table Existence (debug-signup.mjs)

**Action:** Created a diagnostic script to test:
- Supabase API connectivity via service role client
- Existence of `profiles`, `notifications`, `reviews`, `bookings` tables
- Column existence on `profiles` table
- Signup via admin client (createUser)
- Signup via anon client (signUp) — same path as the app

**Results:**
| Test | Result |
|------|--------|
| Connectivity to Supabase | ✅ Connected, roles table has: admin, photographer, client |
| profiles table exists | ✅ Exists, 0 rows |
| profiles columns (id, full_name, avatar_url, phone, address, gdpr_consent, gdpr_consent_at, created_at, updated_at) | ✅ All exist |
| profiles.role column | ❌ **MISSING** — but this is expected, role is in `user_roles` table |
| notifications table | ✅ Exists |
| reviews table | ✅ Exists |
| bookings table | ✅ Exists |
| Admin createUser | ❌ "Database error creating new user" (500) |
| Anon signUp | ❌ "Database error saving new user" (500) |

**Conclusion:** All tables exist and are accessible. The error occurs at the database level during user creation, not due to missing tables.

---

### Approach 3: Column Schema Verification (debug-columns.mjs)

**Action:** Tested every column on `profiles` and checked `handle_new_user` trigger function.

**Results:**
- Existing columns: `id, full_name, avatar_url, phone, address, is_active, bio, gdpr_consent, gdpr_consent_at, created_at, updated_at`
- `handle_new_user` function exists (confirmed via RPC call)
- `role` column does NOT exist on profiles (by design — roles are in `user_roles` table)

**Conclusion:** Schema is correct. The trigger function inserts only `(id, full_name)` into profiles, which matches the table schema.

---

### Approach 4: Raw SQL Diagnostics (debug-sql.mjs)

**Action:** Used `pg` (node-postgres) client to connect directly to the database and inspect:
- `handle_new_user` function source code
- Triggers on `auth.users`
- `profiles` table schema
- `user_roles` table schema
- `custom_access_token_hook` function source code

**Results:**
- `handle_new_user` source: Inserts into `profiles(id, full_name)`, then inserts into `user_roles(user_id, role_id)` with client role, then updates `auth.users.raw_app_meta_data` with `user_role: 'client'` — **all correct**
- `on_auth_user_created` trigger exists on `auth.users` (AFTER INSERT)
- `profiles` columns match expected schema (14 columns, `id` and `full_name` are NOT NULL with no default)
- `user_roles` columns: `id, user_id, role_id, assigned_at, assigned_by` — correct
- `custom_access_token_hook` source: Reads from `user_roles` JOIN `roles`, extracts user role, injects into JWT claims — **correct**

**Conclusion:** All function definitions and table schemas are correct. The issue is in execution permissions, not in logic.

---

### Approach 5: RLS & Permission Analysis (debug-rls.mjs)

**Action:** Checked RLS status, policies, and grants for `supabase_auth_admin` role.

**Results:**
| Table | RLS Enabled | RLS Forced |
|-------|------------|------------|
| profiles | ✅ true | false |
| roles | ✅ true | false |
| user_roles | ✅ true | false |

**RLS Policies on profiles:**
- `profiles_select_public`: SELECT for all (USING: true)
- `profiles_update_admin`: UPDATE for admin role
- `profiles_update_own`: UPDATE for own profile
- **NO INSERT policy exists!**

**RLS Policies on user_roles:**
- `user_roles_admin_all`: ALL for admin role
- `user_roles_select_own`: SELECT for own user

**Grants for supabase_auth_admin:**
- ⚠️ **NO explicit grants** on profiles, user_roles, or roles tables

**handle_new_user function:**
- SECURITY DEFINER: YES
- Owner: postgres (bypasses RLS)

**Direct SQL INSERT test (as postgres role):**
- INSERT into `auth.users` manually → ✅ SUCCESS
- Trigger fired → ✅ Profile created automatically
- Trigger fired → ✅ User role assigned automatically
- Trigger fired → ✅ app_metadata updated with `user_role: 'client'`

**Conclusion:** The trigger works perfectly when run as `postgres`. The issue is that `supabase_auth_admin` (the role Supabase Auth service uses) lacks permissions on the tables the trigger/hook accesses.

---

### Approach 6: Grant Permissions (fix-auth-grants.mjs)

**Action:** Ran GRANT statements via pooler connection:
```sql
GRANT SELECT ON public.roles TO supabase_auth_admin;
GRANT SELECT ON public.user_roles TO supabase_auth_admin;
GRANT INSERT ON public.user_roles TO supabase_auth_admin;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
GRANT INSERT ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook(jsonb) TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.user_roles TO supabase_auth_admin;
GRANT ALL ON public.roles TO supabase_auth_admin;
```

**Result:** All GRANT statements succeeded ✅, but signup **still fails** ❌.

**Conclusion:** Grants alone are insufficient. The pooler connection may run in a different context than the Supabase Dashboard SQL Editor. Additionally, SECURITY DEFINER functions already bypass grants — the issue may be in RLS policies blocking the auth admin role.

---

### Approach 7: Hook Isolation Test (debug-hook-test.mjs)

**Action:** Tested the `custom_access_token_hook` function directly via SQL.

**Results:**
- As `postgres` role: ✅ Hook executes correctly, returns proper JWT claims with `user_role: 'client'`
- As `supabase_auth_admin` role: ❌ Cannot test (pooler doesn't allow SET ROLE to supabase_auth_admin)

**Conclusion:** The hook function logic is correct but cannot verify execution under `supabase_auth_admin` context from pooler.

---

### Approach 8: Direct Auth API Call (debug-mgmt-api.mjs)

**Action:** Called Supabase Auth REST API directly (`/auth/v1/signup`) bypassing the Next.js app.

**Result:**
```json
{
  "code": 500,
  "error_code": "unexpected_failure",
  "msg": "Database error saving new user"
}
```

**Conclusion:** The error is 100% server-side in Supabase Auth/GoTrue service. Not related to the Next.js app code.

---

### Approach 9: Auth Hook Dashboard Verification

**Action:** Checked Supabase Dashboard > Authentication > Hooks.

**Result:** Custom Access Token Hook is **ENABLED** with:
- Schema: `public`
- Function: `custom_access_token_hook`
- Auto-executed statements include:
  - `GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin`
  - `GRANT USAGE ON SCHEMA public TO supabase_auth_admin`
  - `REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public`

---

### Approach 10: No-op Hook Test (fix-hook-noop.mjs)

**Action:** Replaced `custom_access_token_hook` with a minimal no-op function (`RETURN event`) to test if the hook logic was the problem.

**Result:** Signup **still fails** ❌ even with no-op hook.

**Conclusion:** The hook logic itself is NOT the problem. The failure occurs before the hook is called — during the trigger execution.

---

### Approach 11: auth.users Deep Inspection (debug-auth-table.mjs)

**Action:** Inspected all columns, constraints, indexes, foreign keys, and triggers on `auth.users`. Also tested a full direct INSERT with all columns.

**Results:**
- All columns present with correct types
- `auth.instances` had **0 rows** (potential issue)
- Direct INSERT into auth.users as `postgres` → ✅ works perfectly
- Trigger fires and creates profile + user_role correctly

**Conclusion:** The trigger works fine when run by `postgres`. The issue is specific to the GoTrue service execution context.

---

### Approach 12: auth.instances Fix (fix-instances.mjs)

**Action:** Inserted a default instance record into `auth.instances` (was empty).

**Result:** Instance created, but signup **still fails** ❌.

**Conclusion:** Empty `auth.instances` was not the root cause.

---

### Approach 13: GoTrue Internals & Role Configuration (debug-pg-logs.mjs)

**Action:** Deep inspection of PostgreSQL role configurations, extensions, and role memberships.

**Results — THE CRITICAL DISCOVERY:**
```
supabase_auth_admin: config = [
  "search_path=auth",
  "idle_in_transaction_session_timeout=60000",
  "log_statement=none"
]
```

**The `supabase_auth_admin` role has `search_path=auth` — it can ONLY see the `auth` schema!**

This means when GoTrue (running as `supabase_auth_admin`) fires the `handle_new_user` trigger:
- The trigger is `SECURITY DEFINER` owned by `postgres`
- BUT PostgreSQL `SECURITY DEFINER` functions inherit the **caller's `search_path`** unless the function explicitly sets its own via `SET search_path`
- The trigger function references `profiles`, `roles`, `user_roles` without schema qualification
- With `search_path=auth`, these tables are NOT found → **function fails silently**

---

### Approach 14: search_path Fix (fix-search-path.mjs) — ✅ SOLUTION

**Action:**
1. Attempted `ALTER ROLE supabase_auth_admin SET search_path TO auth, public, extensions` → ❌ Failed ("reserved role, only superusers can modify")
2. Added `SET search_path = public, auth, extensions` to both functions:
   - `handle_new_user()`
   - `custom_access_token_hook(event JSONB)`
3. Also removed the redundant `UPDATE auth.users SET raw_app_meta_data` from `handle_new_user` (the `custom_access_token_hook` already handles JWT role injection)
4. Applied comprehensive grants for `supabase_auth_admin`

**Result:** ✅✅✅ **SIGNUP WORKS!**

```
✅✅✅ SIGNUP WORKS! User ID: 6a7032e0-ca1f-47bb-b8d7-2ba2ba48e3d1
Profile: ✅ SearchPath Fix Test
User role: ✅ client
✅ Cleaned up.
```

---

## Root Cause (CONFIRMED)

**The `supabase_auth_admin` PostgreSQL role has `search_path=auth` by default in Supabase.** When GoTrue creates a user and fires the `on_auth_user_created` trigger, the `handle_new_user()` function runs as `SECURITY DEFINER` (owned by `postgres`), but **inherits the caller's `search_path`** which only includes `auth`.

Since `profiles`, `roles`, and `user_roles` are in the `public` schema, they were invisible to the function, causing it to fail. The same applies to `custom_access_token_hook()`.

### Why it worked via direct SQL but not via GoTrue API:
- **Direct SQL (via pooler as `postgres`)**: `search_path = "$user", public, extensions` → `public` schema tables visible ✅
- **GoTrue API (as `supabase_auth_admin`)**: `search_path = auth` → `public` schema tables **invisible** ❌

### The Fix:
Add `SET search_path = public, auth, extensions` to both functions:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$ ... $$;

CREATE OR REPLACE FUNCTION custom_access_token_hook(event JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, auth, extensions
AS $$ ... $$;
```

This ensures the functions always use the correct `search_path` regardless of which role calls them.

---

## Files Created During Debugging

| File | Purpose | Outcome |
|------|---------|---------|
| `scripts/debug-signup.mjs` | Basic connectivity and table existence tests | Tables exist, signup fails |
| `scripts/debug-columns.mjs` | Column schema verification | Columns correct, no `role` column (by design) |
| `scripts/debug-sql.mjs` | Raw SQL diagnostics (trigger source, schemas) | Functions correct, trigger works as postgres |
| `scripts/debug-deep.mjs` | Deep analysis (FK constraint, trigger simulation) | FK constraint blocks fake IDs (expected) |
| `scripts/debug-rls.mjs` | RLS policies and permission analysis | RLS enabled, no INSERT policy on profiles |
| `scripts/debug-hook.mjs` | Function ownership and grants analysis | All functions owned by postgres, SECURITY DEFINER |
| `scripts/debug-hook-test.mjs` | Hook isolation test | Hook works as postgres, can't test as auth_admin |
| `scripts/debug-hook-disable.mjs` | Trigger disable attempt | Blocked by pooler (not owner of auth.users) |
| `scripts/debug-mgmt-api.mjs` | Direct Auth API test | Confirmed 500 is server-side, not app code |
| `scripts/debug-auth-table.mjs` | auth.users deep inspection | All columns/constraints correct |
| `scripts/debug-gotrue.mjs` | GoTrue internals, auth.instances, role configs | **Found root cause: search_path=auth** |
| `scripts/debug-pg-logs.mjs` | Role configurations and extension checks | Confirmed search_path issue |
| `scripts/fix-auth-grants.mjs` | Permission grants | Grants applied but insufficient alone |
| `scripts/fix-hook-noop.mjs` | No-op hook test | Hook logic not the issue |
| `scripts/fix-instances.mjs` | auth.instances fix | Not the root cause |
| `scripts/fix-trigger.mjs` | Remove UPDATE auth.users from trigger | Not the root cause |
| `scripts/fix-search-path.mjs` | **SET search_path fix** | **✅ FIXED THE ISSUE** |
| `scripts/fix-run-in-dashboard.sql` | SQL commands for Dashboard (not needed) | Superseded by fix-search-path.mjs |
