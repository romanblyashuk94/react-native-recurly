<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Recurly React Native (Expo) app. The following changes were made:

- **`lib/posthog.ts`** — New PostHog client singleton, configured via `expo-constants` reading from `app.config.js` extras. Supports graceful disable when token is not configured.
- **`app.config.js`** — New Expo config file that reads `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` from `.env` and exposes them to the app via `Constants.expoConfig.extra`.
- **`.env`** — PostHog project token and host added (covered by `.gitignore`).
- **`app/_layout.tsx`** — `PostHogProvider` added wrapping the `Stack`. Manual screen tracking implemented using `usePathname` and `useGlobalSearchParams` with `posthog.screen()`.
- **`app/(auth)/sign-in.tsx`** — Tracks `sign_in_succeeded` (with `posthog.identify()`) and `sign_in_failed` (with failure reason).
- **`app/(auth)/sign-up.tsx`** — Tracks `sign_up_submitted`, `sign_up_email_verified` (with `posthog.identify()`), and `sign_up_failed`.
- **`app/(tabs)/settings.tsx`** — Tracks `signed_out` and calls `posthog.reset()` to clear the local identity.
- **`app/(tabs)/index.tsx`** — Tracks `subscription_expanded` and `subscription_collapsed` with subscription name and ID.
- **`app/subscriptions/[id].tsx`** — Tracks `subscription_details_viewed` on mount.
- **`app/onboarding.tsx`** — Tracks `onboarding_viewed` on mount (top of conversion funnel).

## Events

| Event | Description | File |
|---|---|---|
| `sign_in_succeeded` | User successfully signed in with email and password | `app/(auth)/sign-in.tsx` |
| `sign_in_failed` | User attempted to sign in but authentication failed | `app/(auth)/sign-in.tsx` |
| `sign_up_submitted` | User submitted the sign-up form with email and password | `app/(auth)/sign-up.tsx` |
| `sign_up_email_verified` | User successfully verified their email with the 6-digit code after sign-up | `app/(auth)/sign-up.tsx` |
| `sign_up_failed` | User attempted to create an account but the registration failed | `app/(auth)/sign-up.tsx` |
| `signed_out` | User confirmed sign-out from the settings screen | `app/(tabs)/settings.tsx` |
| `subscription_expanded` | User tapped a subscription card to expand its details on the home screen | `app/(tabs)/index.tsx` |
| `subscription_collapsed` | User tapped an expanded subscription card to collapse it | `app/(tabs)/index.tsx` |
| `subscription_details_viewed` | User opened the detail screen for a specific subscription | `app/subscriptions/[id].tsx` |
| `onboarding_viewed` | User landed on the onboarding screen — top of the conversion funnel | `app/onboarding.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- [Analytics basics dashboard](/dashboard/1630757)
- [Sign-up conversion funnel](/insights/MBwNPBjc) — conversion from form submission to email verification
- [Sign-in success vs failure](/insights/n8pfKwi8) — daily auth health trend
- [Daily active users (sign-ins)](/insights/kqanR0f9) — unique users signing in per day
- [Subscription engagement](/insights/uUGQcMkG) — how often users explore subscription details
- [User churn (sign-outs)](/insights/FSSEhyOU) — sign-out volume as an early churn signal

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
