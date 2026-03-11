# Sprint 1 Review - Core Connection & Auth Logic

**Date**: 2026-03-10
**Goal**: تأسيس الاتصال الموثق وبرمجة منطق الدخول

---

## Completed Features

### 1. Auth Server Actions (`src/actions/auth.ts`)

| Action | Description | Validation |
|--------|-------------|------------|
| `signIn` | Email/password login via Supabase Auth | Zod `loginSchema` |
| `signUp` | New user registration with email verification | Zod `registerSchema` |
| `signInWithGoogle` | Google OAuth 2.0 login | N/A (OAuth flow) |
| `resetPassword` | Send password reset email | Zod `forgotPasswordSchema` |
| `updatePassword` | Set new password after reset | Zod `resetPasswordSchema` |
| `signOut` | Sign out and redirect to home | N/A |

### 2. Auth Pages (App Router)

| Route | Type | Component | FR |
|-------|------|-----------|-----|
| `/auth/login` | Static | `LoginForm` (Client) | FR-C1 |
| `/auth/register` | Static | `RegisterForm` (Client) | FR-V5 |
| `/auth/forgot-password` | Static | `ForgotPasswordForm` (Client) | FR-C10 |
| `/auth/reset-password` | Static | `ResetPasswordForm` (Client) | FR-C10 |
| `/auth/callback` | Dynamic (Route Handler) | OAuth/email code exchange | FR-C1 |
| `/auth/confirm` | Dynamic (Route Handler) | Email verification + recovery OTP | FR-V5 |
| `/dashboard` | Dynamic (Server Component) | User info + role display | FR-C1, FR-P1, FR-A1 |

### 3. Validation Schemas (`src/lib/validations/auth.ts`)

- `loginSchema`: email + password (min 6 chars)
- `registerSchema`: fullName (min 3) + email + password (min 8, uppercase, digit) + confirmPassword + agreeToTerms (GDPR)
- `forgotPasswordSchema`: email
- `resetPasswordSchema`: password + confirmPassword with match check

### 4. Route Protection (`src/lib/supabase/middleware.ts`)

- **Auth routes** (`/auth/login`, `/auth/register`, etc.): Redirect authenticated users to `/dashboard`
- **Protected routes** (`/dashboard`, `/profile`, `/bookings`, `/orders`): Redirect unauthenticated users to `/auth/login`
- **Admin routes** (`/admin/*`): Only `admin` role allowed
- **Photographer routes** (`/photographer/*`): Only `photographer` or `admin` roles allowed
- Role read from `user.app_metadata.user_role` (JWT Claims)

### 5. Shared Components

- `GoogleButton`: Reusable Google OAuth button with SVG icon
- Auth Layout: Centered card layout with Art Photo Studio branding

### 6. UI Components Added (shadcn/ui)

- `input`, `label`, `card`, `separator`, `sonner`

---

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| `useActionState` for forms | Next.js 16 native form state management with Server Actions |
| Zod v4 `.issues` API | Zod v4 replaced `.errors` with `.issues` on `ZodError` |
| Colocation pattern | Each page has `_components/` folder for its client components |
| No `useForm` (react-hook-form) for auth | Native FormData + Server Actions is simpler for auth forms; RHF saved for complex forms later |
| `app_metadata.user_role` for RBAC | O(1) JWT claim check vs O(n) DB query per request |

---

## Errors Encountered & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `z.literal(true, { errorMap })` TS error | Zod v4 removed `errorMap` from `z.literal()` | Changed to `{ message: "..." }` |
| `parsed.error.errors[0]` TS error | Zod v4 renamed `.errors` to `.issues` | Changed to `.issues[0].message` |

---

## Files Created/Modified

### New Files (14)
- `src/lib/validations/auth.ts`
- `src/actions/auth.ts` (rewritten)
- `src/app/auth/layout.tsx`
- `src/app/auth/_components/google-button.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/login/_components/login-form.tsx`
- `src/app/auth/register/page.tsx`
- `src/app/auth/register/_components/register-form.tsx`
- `src/app/auth/forgot-password/page.tsx`
- `src/app/auth/forgot-password/_components/forgot-password-form.tsx`
- `src/app/auth/reset-password/page.tsx`
- `src/app/auth/reset-password/_components/reset-password-form.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/auth/confirm/route.ts`
- `src/app/dashboard/page.tsx`

### Modified Files (1)
- `src/lib/supabase/middleware.ts` (role-based protection)

---

## Build Status

- **TypeScript**: ✅ 0 errors
- **Next.js Build**: ✅ Compiled successfully
- **Routes**: 9 total (4 static, 3 dynamic, 2 route handlers)
