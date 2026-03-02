

# Authentication Setup

Since this is a single-user internal tool, the setup will be simple: email/password auth with no profiles table needed.

## Implementation

### 1. Auth Context (`src/contexts/AuthContext.tsx`)
- Create an `AuthProvider` wrapping the app with `onAuthStateChange` listener (set up before `getSession()`)
- Expose `user`, `session`, `signIn`, `signUp`, `signOut`, and `loading` state

### 2. Login Page (`src/pages/Auth.tsx`)
- Single page with email/password sign-in form
- Include a sign-up tab for initial account creation
- Include forgot password flow with `resetPasswordForEmail`
- Styled to match the dark theme

### 3. Reset Password Page (`src/pages/ResetPassword.tsx`)
- Public route at `/reset-password`
- Detects `type=recovery` from URL hash
- Form to set new password via `supabase.auth.updateUser()`

### 4. Protected Routes (`src/components/ProtectedRoute.tsx`)
- Wrapper component that redirects to `/auth` if not authenticated
- Shows loading state while session is being resolved

### 5. App.tsx Updates
- Wrap app in `AuthProvider`
- `/auth` and `/reset-password` are public routes
- All other routes wrapped in `ProtectedRoute`
- Add sign-out button to the Layout header

### 6. Layout Update
- Replace "System Online" indicator with user email and a sign-out button

No database migration needed — all existing tables already reference `auth.users(id)` via `user_id` columns and RLS policies use `auth.uid()`.

