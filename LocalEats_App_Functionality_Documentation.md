# LocalEats Application Functionality Documentation

## Overview
LocalEats is a robust, mobile-first web application bridging customers with local legendary Kota joints. The system is split across a Client App (customer ordering), a Merchant Dashboard (shop management), and a Rider App (dispatch and delivery), all unified under a real-time tracking engine.

## Core Pillars
1. **Interactive Map Engine**
   - Built on `react-leaflet`.
   - Renders distinct markers: Blue pulsing beacon for customers, Vibrant Orange with verified badges for active stores, Slate Gray for offline stores, and Indigo for active couriers.
   - Enforces a strict `z-index: 2000` on the customer pin to ensure visibility over clustered shops.
2. **Zero-Trust Backend Architecture**
   - The application enforces a strict separation between client inputs and financial reality. All order subtotal, delivery fee, service fee, priority dispatch, and total calculations are executed on a secure backend API (`/api/orders`), ignoring client-asserted totals.
   - Dual-Auth bridging securely validates both legacy Firebase ID tokens and active Supabase JWTs to seamlessly blend guest checkouts and authenticated accounts.
   - Order history queries and status mutations (PATCH) strictly isolate visibility to the authenticated owner (`user_id`).
3. **Resiliency & Fallbacks**
   - Cloud Function deployments failing in constrained environments are mitigated through an automatic client-side fallback pushing to the Express tier `/api/orders`.
   - Schema mismatches dynamically degrade gracefully to an in-memory runtime store on the server, ensuring uninterrupted checkout flows during migration.
4. **Smart Dispatch & Live Tracking**
   - Riders are assigned based on geographic proximity.
   - Order status follows a strict progression: Pending -> Cooking -> Ready -> Rider Approach -> Live Delivery -> Completed.
   - Uses Supabase Realtime subscriptions (`postgres_changes`) for millisecond-latency order status syncing.

## State Management
- **Cart**: Local-first `localStorage` implementation holding pending items until authoritative checkout submission.
- **Identity**: Firebase Anonymous Auth for immediate guest onboarding, upgrading seamlessly to Supabase authenticated rows upon checkout or profile completion.
- **Diagnostics**: Built-in Admin DB Health tooling to constantly monitor Row Level Security (RLS) mismatches and permission health across the dual-database split-brain.
- **Unified Bottom Navigation**: Persistent top-level navigation bar (`BottomNavigation.tsx`) displayed across all primary customer views (`home`, `discover`, `explore`, `order-tracking`, `order-history`, `profile`, `notifications`, `settings`, `store-info`, `contact`). Screen-level redundant navigation bars have been cleanly eliminated, with safe area and bottom padding (`pb-24`, `pb-28`) added to map, tracking, and order history screens to prevent content occlusion.
- **Flush Edge-to-Edge Top Bar & Sliding Category Bar**: Anchored the HomeScreen top bar flush to the top edge (`top-0`, `left-0`, `right-0`, `rounded-none`) replacing floating pill containers. Integrated a unified sliding category filter bar (`[All 🍽️, Favorites ❤️, Nearby 📍, Kota 🍞, Braai 🔥, Open Now, Top Rated, Fastest, Halal]`) that dynamically slides up and tucks away on scroll/swipe down to maximize viewing real estate, and smoothly slides back down when scrolling up.
- **Interactive Cart & Address Switcher (Phase 22)**:
  - **Slide-Over Cart Drawer (`CartDrawer.tsx`)**: Replaced the abrupt jump-to-checkout with a full interactive bottom-sheet drawer displaying store info, items with thumbnail previews, live +/− quantity incrementors, item removal, cart clearing, and price breakdown before advancing to checkout.
  - **Global Floating Cart Trigger (`FloatingCartButton.tsx`)**: Placed an animated floating pill button positioned right above bottom navigation across browsing screens when cart items exist.
  - **Delivery Address Quick-Switcher (`AddressSwitcherModal.tsx`)**: Embedded a 1-tap address selector in the HomeScreen header with automatic GPS detection, quick presets for major South African townships (Soweto Vilakazi, Braamfontein, Tembisa, Mamelodi, Alexandra, Umlazi), and custom address search.
  - **Dead State Pruning**: Removed redundant scroll collapsing listeners and orphaned banner states.
  - **Active Order Live Tracker (`ActiveOrderMiniTracker.tsx`)**: Mounted a floating, minimizable mini-status widget right above the persistent bottom navigation on customer screens, showing live kitchen/delivery phases with direct tap-to-track navigation.
  - **1-Tap "Order Again" & Direct Live Tracking (`OrderHistoryScreen.tsx`)**: Upgraded past order receipts with high-contrast 1-tap reordering directly into cart, plus dynamic "Track Live" badges for ongoing orders and skeleton shimmer loaders.
  - **Shimmer Feed Skeleton (`ShopFeedSkeleton.tsx`)**: Replaced plain loading text with responsive skeleton cards during initial loading and kitchen refreshes.
  - **Closed vs. Open Visual Hierarchy (`ShopCard.tsx`)**: Added grayscale filters and muted opacity to closed storefronts for immediate visual recognition.
  - **Bottom Sheet Interaction Layer (`BottomSheet.tsx`)**: Implemented standardized gesture-friendly modal sheets with drag handles and spring physics.
  - **Spring Micro-Interactions (`BottomNavigation.tsx`)**: Added spring bounce physics to active order count badges.
  - **Quick Search Recovery**: Added 1-tap popular search suggestions (Kota, Braai, Chips, Burger) and clear filter reset triggers when query results are empty.


### Phase 23: Profile Save Resolution & Supabase Native Synchronization
- **Firestore Hang Resolution**: Fixed an issue where offline/disconnected Firestore instances (in dual-auth split-brain) could block UI threads indefinitely inside `handleUpdateProfile` by introducing a `Promise.race` 2-second fallback timeout strictly isolating `setDoc`.
- **Fail Fast Security Bypass**: Skipped artificial exponential backoff delays across all `FirestoreService.saveProfile` calls immediately upon catching "Missing or insufficient permissions" from mismatched JWT tokens, allowing 0-delay Supabase fallback routing.
- **Authoritative Supabase Upsert**: Extended `syncProfileDirect` in `profileService.ts` to execute a native dual-write against the authoritative Supabase `profiles` table seamlessly inside the primary sync flow.

### Phase 24: Supabase Profile Authorization & API Hardening
- **Native Express API Route Replacement**: Stripped the memory-only `serverProfiles` cache inside `/api/profiles` and `/api/profiles/:id` (in `server.ts`) and replaced it with authoritative calls directly targeting `supabaseAdmin.from('profiles')`.
- **JWT Authorization Enforcement**: Bound both endpoints to the strict `authenticateJWT` Express middleware. It asserts `req.user.id` against the payload's `user_id`, guaranteeing cross-tenant isolation and preventing unauthorized profile overrides.
- **Client Fetch Migration**: Removed legacy mocked `supabase.from("profiles")` offline client calls across the `App.tsx` fetch loop and `upsertProfileWithRPC`. They now fetch dynamically from the authenticated Express endpoints, routing profile data completely natively into Supabase.

### Phase 25: Auth Metadata Synchronization
- **Metadata Alignment**: Updated `handleUpdateProfile` in `src/App.tsx` to automatically invoke `supabase.auth.updateUser` alongside database writes, natively syncing `user_metadata` directly into the Supabase Identity platform so the auth state never desyncs from the database layer.

### Phase 26: Authentication Forensic Fix & Firebase Admin ID Token Verification
- **Authoritative Server-Side Token Verification**: Initialized `firebase-admin` in `server.ts` with the project ID (`localeats-5e26e`) to cryptographically verify Firebase ID tokens using `firebaseAdminAuth.verifyIdToken(token)`.
- **Verified UID Resolution**: Replaced the bug where `req.user.id` was set to the raw token string or unverified client assertions. `req.user.id` now strictly resolves to `decodedToken.uid`.
- **Client Auth Header Alignment (`src/lib/apiAuth.ts`)**: Updated `getApiAuthHeaders()` to retrieve the Firebase ID token from `auth.currentUser` or session and format it with the `Bearer fb-<token>` scheme.
- **Multi-Scheme Fallback Compatibility**: Configured `authenticateJWT` to cleanly accept `fb-` tokens, `sb-` tokens (checking Supabase Admin first, then falling back to Firebase token verification for legacy clients), and raw Bearer tokens without dropping sessions.

### Phase 27: Profile Schema Conformance & PGRST204 Resolution
- **Removed Nonexistent `id` Column Injection (`server.ts`)**: Stripped the erroneous `id: userId` field injected during Supabase upserts in `POST /api/profiles`, resolving the `PGRST204 Could not find the 'id' column of 'profiles' in the schema cache` error.
- **Strict Schema Whitelisting**: Sanitized `POST /api/profiles` payload to only map and send valid `public.profiles` columns (`user_id`, `fullName`, `email`, `phone`, `city`, `address`, `country`, `role`, `photo_url`, `language`, `latitude`, `longitude`, `favorites`, `updated_at`) with `{ onConflict: 'user_id' }`.
- **Primary Key Query Standardization (`GET /api/profiles/:id`)**: Removed the fallback `.eq('id', id)` query in `server.ts` so lookups strictly query the valid primary identity column `.eq('user_id', id)`.

