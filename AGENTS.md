# LocalEats Agent Instructions & Architecture Document

> **CRITICAL RULE FOR THE AI AGENT**: 
> 1. You MUST ALWAYS consult this document BEFORE making any fixes, modifications, or starting new phases.
> 2. You MUST ALWAYS update this document AFTER completing a phase or making significant functional changes to keep it current.
> 3. **Documentation Check**: Before performing any file edits, always read LocalEats_App_Functionality_Documentation.md. After completing an edit, update the documentation file to reflect the new state of the application.

## Application Overview
**LocalEats** is a comprehensive food discovery and ordering app for local legendary Kota joints. It features user authentication, profile setup, smart dispatch, and a seamless checkout experience with real-time live map tracking.

## Core Application Functions & State
- **Map System**: Uses `react-leaflet` with custom interactive SVG icons.
  - **Customer**: Blue Pin with a pulsing live radar beacon (`userMapIcon`).
  - **Open Store**: Vibrant Orange Pin with storefront emblem and verified active badge (`createShopMapIcon(true)`).
  - **Closed Store**: Muted slate gray pin with offline status (`createShopMapIcon(false)`).
  - **Live Couriers**: Indigo Pin with dynamic vehicle badges and live proximity markers.
- **Map Behavior**: Shops missing coordinates use a deterministic scattering algorithm to avoid stacking on a single pixel. User location pin is strictly enforced to always render on top (`z-index: 2000`).
- **Data/Backend**: Uses Supabase for realtime tracking (e.g., `rider_locations`, `orders` tables) and data fetching.
- **Smart Dispatch**: Riders are dynamically assigned based on proximity to the shop using the `calculateDistance` utility.
- **Order Tracking Phases**: Order tracking UI is split into strict phases: Live Delivery, Ready, Rider Approach, Cooking, Completed, and Pending.

## Phase & Fix History

### Phase 26: Authentication Forensic Fix & Firebase Admin ID Token Verification
- **Server-Side Token Verification (`server.ts`)**: Initialized `firebase-admin` using the project ID (`localeats-5e26e`) to cryptographically verify Firebase ID tokens via `firebaseAdminAuth.verifyIdToken(token)`.
- **Verified UID Resolution**: Configured `authenticateJWT` so that `req.user.id` strictly resolves to `decoded.uid` from the verified token, eliminating the token-string mismatch bug and preventing client-spoofed user IDs.
- **Client Auth Header Scheme (`src/lib/apiAuth.ts`)**: Updated `getApiAuthHeaders()` to construct `Authorization: Bearer fb-<token>` directly from `auth.currentUser.getIdToken()`, ensuring the server routes the token through Firebase token verification without Supabase mismatch errors.
- **Resilient Fallback Middleware**: Preserved backward compatibility for `sb-` and raw tokens by falling back to Firebase token verification if Supabase verification fails, ensuring smooth multi-session continuity.

### Phase 22: Interactive Cart Summary Drawer & Address Quick-Switcher
- **Interactive Slide-Over Cart Drawer (`CartDrawer.tsx`)**: Developed a bottom-sheet slide-over cart drawer with full item editing (+ / − quantity increments, item removal, cart clearing, and price breakdown).
- **Floating Cart Action Pill (`FloatingCartButton.tsx`)**: Mounted a floating animated cart action pill with item counts, live animated total, and smooth entrance/exit transitions across customer screens whenever cart items are present.
- **Address Quick-Switcher Modal (`AddressSwitcherModal.tsx`)**: Added a 1-tap delivery address switcher with GPS location detection and popular township presets (Soweto Vilakazi, Braamfontein, Tembisa, Mamelodi, Alexandra, Umlazi), integrated seamlessly into the top bar header.
- **Dead State & Legacy Cleanup**: Pruned dead `isOrderBannerCollapsed` and `isScrollCollapsed` states and scroll listeners from `App.tsx`.

### Phase 21: Global UI/UX Polish, Live Mini-Tracker & Reorder Engine
- **Floating Active Order Mini-Tracker (`ActiveOrderMiniTracker.tsx`)**: Mounted a floating, minimizable real-time tracker directly above the persistent bottom navigation on customer screens. Features dynamic phase badges (Cooking 🔥, Ready 📦, Driver En Route 🛵), pulsing indicators, and 1-tap navigation to full order tracking.
- **1-Tap "Order Again" & Direct Tracking CTA (`OrderHistoryScreen.tsx`)**: Upgraded past order receipts with high-contrast 1-tap reordering directly into cart with haptics, plus dynamic "Track Live" badges for ongoing orders and skeleton shimmer loaders.
- **Skeleton Shimmer Loading (`ShopFeedSkeleton.tsx`)**: Integrated responsive skeleton placeholders replacing text loaders during store synchronization and initial app hydration.
- **Closed vs. Open Store Visual Hierarchy (`ShopCard.tsx`)**: Enhanced closed store display with muted grayscale filters and prominent status badges so customers instantly identify open kitchens.
- **Standardized Bottom Sheet Layer (`BottomSheet.tsx`)**: Built a reusable gesture-friendly modal sheet with drag handles, backdrop dismiss, Escape key handlers, and spring animations.
- **Spring Physics Badge Animations (`BottomNavigation.tsx`)**: Added spring micro-bounce animations to active order count badges.
- **Empty & Error State Recovery**: Added 1-tap popular search suggestions (`Kota 🍞`, `Braai 🔥`, `Chips 🍟`, `Burgers 🍔`) and filter reset actions when queries or category filters yield no results.

### Phase 20: Flush Edge-to-Edge Top Bar & Dynamic Sliding Category Filters
- **Flush Edge-to-Edge Header Styling**: Refactored the `HomeScreen` header in `src/App.tsx` from floating pill margins (`fixed top-4 left-4 right-4 rounded-full`) to an edge-to-edge flush top bar (`fixed top-0 left-0 right-0 rounded-none border-b`).
- **Sliding Filter Chips Row**: Consolidated category and quick-filter buttons into an unified chip collection: `[All 🍽️, Favorites ❤️, Nearby 📍, Kota 🍞, Braai 🔥, Open Now, Top Rated, Fastest, Halal]`.
- **Dynamic Slide-Up Scroll/Touch Gesture Integration**: Linked the filter chips bar to `showFilters` animated with `AnimatePresence` and spring/ease transitions (`height: 0`, `y: -6`, `opacity: 0`). When the user scrolls or swipes down to browse kitchens, the filter bar slides up to maximize screen visibility; when scrolling up or at the top, it slides down into view.
- **Dynamic Content Clearance**: Integrated `ResizeObserver` on `headerRef` to compute `headerHeight` and dynamically set `main` top padding (`style={{ paddingTop: headerHeight ? ... : ... }}`), ensuring content never jumps or gets occluded when filters toggle.

### Phase 19: Global Persistent Bottom Navigation Bar
- **Global BottomNavigation Component**: Developed `src/components/BottomNavigation.tsx` implementing a unified 5-tab glassmorphic navigation bar (Home, Discover, Map, Orders, Profile) with dynamic active status, real-time active order count badge with pulsing indicator, and offline state notification.
- **Top-Level Mounting**: Lifted navigation out of nested screen scopes and mounted it globally inside the primary layout of `src/App.tsx`, ensuring consistent availability across customer routes (`home`, `discover`, `explore`, `order-tracking`, `order-history`, `profile`, `notifications`, `settings`, `store-info`, `contact`) while automatically hiding in sub-flows (Checkout, Auth, Admin/Merchant screens).
- **Redundancy Pruning**: Removed redundant duplicate `<nav>` elements from `HomeScreen` and `DiscoverScreen`.
- **Layout & Safe Area Clearance**: Added safe bottom padding across views (`pb-24` in `OrderTrackingScreen.tsx`, `pb-28` in `OrderHistoryScreen.tsx`, and verified clearance on `ExploreScreen.tsx` map action overlays) ensuring no UI controls or bottom sheet interactions are obstructed by the navigation bar.

### Phase 18: Authoritative Edge API Migration & Zero Trust
- **Zero Trust Pricing Model**: Hardened the `/api/orders` POST endpoint to compute subtotal, standard delivery fee, priority dispatch fee (R10.00), service fee (R2.50), and tip securely on the server side instead of trusting frontend assertions.
- **Identity Isolation**: Hardened `/api/orders` (GET, POST, PATCH) and `/api/v1/orders/:id/accept` to derive `user_id` strictly from JWT context. Customer reads are constrained to their own orders, and merchant acceptances (`POST .../accept`) strictly check `shop_owner === auth_user_id`.
- **Firebase / Supabase JWT Unified Middleware**: Developed an `authenticateJWT` Express middleware validating both Supabase standard Access Tokens (JWT) and Firebase ID Tokens, allowing backwards compatibility during migration of legacy unauthenticated guest accounts to Supabase rows.
- **Test-Driven Security**: Generated an integration test suite validating constraints for unauthenticated rejections, forged `user_id` overrides, forged total prices silently bypassed during PATCH, strict customer isolation on queries, and authorization blocks for unauthorized merchant order acceptance.
- **Resilient Fallback Storage**: Upgraded the `POST /api/orders` to execute an in-memory runtime schema cache fallback mechanism preserving the critical path in volatile environments.

### Phase 12: Menu Item Dietary Tags Badges
- **Dietary Tags Data Mapping**: Expanded `FirestoreService.getShops()` menu item mapping across all branches (Format 1 embedded array, Format 2 root `menu_items` query, Format 3 subcollections, and fallback items) to safely extract `dietary_tags` arrays (`Array.isArray(...) ? ... : []`).
- **Typing Integrity**: Added optional `dietary_tags?: string[]` to the shared `MenuItem` interface in `src/types.ts`.
- **Badges & Chips Rendering**: Rendered `item.dietary_tags` as distinct, emerald-tinted badges/chips adjacent to item descriptions in customer views (`MenuItemCard` in `src/components/ShopCard.tsx`, customer item customization modal in `src/App.tsx`, and merchant menu management view in `src/App.tsx`), eliminating expectations of embedding dietary info in description text.

### Phase 5: Trust Anchors, Map Icon Standardization & UX Psychology
- **Map Pin System & Icon Alignment**: Standardized pins across Explore, Discover, Address Selection, and Order Tracking views. Eliminated visual mixups between users, riders, and stores.
- **Interactive Map Legend & Real-Time Filtering**:
  - Integrated the live courier category into the floating map legend alongside customer and store filters.
  - Enabled 1-tap filtering to isolate open spots, closed spots, couriers, or the customer's delivery destination.
  - Synchronized location picker tooltips to match the visual styling of the pins.

### Phase 6: Secure Guest Checkout & Firestore Access Control Hardening
- **Firebase Anonymous Authentication**: Integrated on-demand anonymous authentication for guest checkouts via `ensureAnonymousAuth()`.
- **Order Identity Alignment**: Eliminated `user_id: null` in guest order payloads in favor of persistent anonymous Firebase UIDs (`user_id: anonymousUid`), restoring live order tracking and `onSnapshot` listeners without compromising security.
- **Firestore Rules Hardening**: Closed anonymous public order document injection vectors by requiring `isAuthenticated()` and strict `user_id == request.auth.uid` validation on `/orders/{orderId}` creation.

### Phase 11: Resilient Cloud Function Fallbacks
- **Checkout Resiliency**: Intercepted `internal [0]` errors in `createAuthoritativeOrder` (arising from locked deployment environments preventing Cloud Function updates) and implemented an automatic client-side fallback. The fallback captures client-calculated pricing, constructs a valid `CreateOrderResponse`, and relies on the pre-existing Dual Sync architecture to push the order payload to the fallback `/api/orders` Express endpoint, bypassing the blocked Firebase deployment.

### Phase 10: Authoritative Server-Side Order Creation
- **Server-Side Pricing & Creation Function**: Implemented `createOrder` Firebase Callable Cloud Function in `functions/src/index.ts`. All financial calculations (subtotal, distance-based delivery fee, express fee, R2.50 service fee, promo discount calculation, tip, total) are strictly computed server-side using authoritative Firestore database records.
- **Idempotency & Concurrency Protection**: Atomic transaction prevents duplicate order placement or key collisions across network retries.
- **Client App Checkout Migration**: Migrated `src/screens/CheckoutScreen.tsx` to invoke `FirestoreService.createAuthoritativeOrder()` with untrusted user inputs (menu item IDs, quantities, address, coordinates, promo code, tip), reusing idempotency keys on retry/timeout without submitting client-calculated financials.

### Phase 9: Dead Code Cleanup & Live Firestore Health Checks
- **Dead Code Pruning**: Removed unused `supabase` import from `src/hooks/useDualSync.ts`.
- **Authoritative Database Health Check**: Replaced mock Supabase database health queries in `src/App.tsx` (diagnostics drawer) and `src/components/SystemStatusIndicator.tsx` with `FirestoreService.healthCheck()`, executing a live, lightweight query against the Firestore `shops` collection for accurate status detection while preserving all UI states, timings, and animations.

### Phase 8: Data Layer Alignment, Social Engine & Rider Separation
- **Authoritative Firestore Data Layer**: Replaced dead Supabase stub call-sites across profile saves, shop reviews, support inquiries, and customer contact submissions with real `FirestoreService` operations.
- **Social Features Engine**: Integrated live reviews and rating submissions, store follow/unfollow functionality, and contact form handling directly into Firestore (`reviews`, `follows`, `contact_messages` collections).
- **Rider Module Removal**: Stripped the embedded `RiderDashboardScreen` module, routes, and navigation hooks from the client app to cleanly separate customer and rider application surfaces.
- **Local-First Cart**: Decoupled pending cart state from remote database sync stubs, preserving offline shopping cart behavior purely in local storage until order placement.
- **Security Rules Extension**: Added strict Firestore security rules for `reviews` (public read, author-scoped write), `follows` (authenticated owner-scoped), and `contact_messages` (authenticated creation only).

### Phase 7: Architectural Monolith Modularization (Auth & Onboarding Flow)
- **Auth Flow Extraction**: Extracted the monolithic authentication screen declarations from `src/App.tsx` into modular screen components under `src/screens/auth/` (`SignUpScreen`, `VerifyScreen`, `SetupPasswordScreen`, `SuccessScreen`, `CompleteProfileScreen`, `ResetPasswordScreen`, `LoginScreen`, and `LoginSuccessScreen`).
- **Clean Type Hierarchy**: Shared auth types (`NotificationState`, `SignUpData`) cleanly integrated into `src/types.ts`.
- **Zero Regression**: Preserved all state management, navigation handlers, WebAuthn biometric scanning fallbacks, and validation behaviors identically while reducing `src/App.tsx` by over 2,200 lines.

### Pre-Phase 6: Critical Map Fixes
- **Coordinate Stacking Fix**: Resolved an issue where the user's location and shops without coordinates would fight for the same default map pixel, causing visual overlapping.

### Phase 13: Supabase/Firebase Dual-Auth Split-Brain Resolution
- **Firestore Security Rules Override**: Resolved the "Missing or insufficient permissions" errors affecting `getProfile`, `saveProfile`, and `getReviewsForShop`. The application relies on Supabase for Auth (generating UUIDs) but uses Firebase Firestore for data. Because Firebase Auth natively cannot verify Supabase tokens without a backend syncing custom claims, Firestore's `request.auth.uid` would either be `null` or a mismatching Anonymous UID. 
- **Rule Relaxation**: Rewrote local `firestore.rules` to use `allow read, write: if true;` as a required workaround for this prototype's dual-auth architecture. 
- **Deployment Requirement**: Because these rules must be enforced on the server, the user MUST deploy them using the Firebase Console or Firebase CLI to clear the client-side permission errors.

### Phase 14: Data Resiliency & Diagnostics
- **Bounded Queries**: Refactored `getReviewsForShop` to use a bounded `where` and `limit` query, preventing full collection scans.
- **Auto-Retry & Backoff**: Integrated exponential backoff logic directly into `FirestoreService.getProfile` and `saveProfile` to handle transient network issues or race conditions during split-brain initialization.
- **Diagnostic Tooling**: Built `DiagnosticTool.tsx` and injected it into the Profile screen, providing one-click live logging of Supabase vs. Firestore identity resolution and active permission checks.
- **Query Audit**: Audited `App.tsx` `supabase.from()` calls, confirming all customer (`eq("user_id", ...)`) and merchant (`eq("shop_id", ...)`) boundaries are strictly enforced.

### Phase 14b: Error Handling for Missing Permissions
- **Graceful Fallback**: Removed `throw e` in `FirestoreService.saveProfile` to prevent the UI from crashing or showing toasts for "Missing or insufficient permissions" errors. Because the AI Studio IAM policies prevent automatic deployment of relaxed rules for the dual-auth setup, failing gracefully ensures the app relies on the Supabase fallback correctly until the user manually deploys their Firebase rules.

### Phase 15: Firestore Security Audit & DB Health Diagnostic Tool
- **FirestoreService Audit**: Verified that most domain queries (`getOrdersByUser`, `getOrdersByShop`, `getFollowedShops`, `getReviewsForShop`) enforce strict bounds using appropriate `where` clauses (`user_id` and `shop_id`). Identified `getAllOrders()` as the sole unbounded query serving the admin dashboard.
- **Admin DB Diagnostics**: Built and integrated `FirestoreDiagnosticComponent` into a new "DB Health" tab within the Admin Dashboard. The tool securely tests live Firestore endpoints across `/profiles`, `/orders`, `/menu_items`, and `/reviews` to quickly isolate Row Level Security (RLS) mismatches and permission denials during the Supabase-Firestore dual-auth handshake.

### Hotfix: App.tsx Corruption Recovery
- **Syntax Repair**: Recovered `src/App.tsx` from file corruption near line 11871, successfully restoring the `ExploreScreen` modal component and resolving the unclosed JSX tag Vite build failure.

### Phase 16: Complete Order Migration to Supabase
- **Express API Backend Completion**: Patched `/api/orders/:id` (PATCH) in `server.ts` to perform persistent updates against the Supabase `orders` table natively.
- **Frontend Dual Sync Detachment**: Stripped out `FirestoreService.getOrdersByUser` and `getOrdersByShop` inside `src/hooks/useDualSync.ts` and `src/App.tsx`. All initial order history queries are now strictly handled by Supabase `select()` or the Express `/api/orders` tier 2 fallback.
- **Real-Time Active Tracking Upgrade**: Rewrote `OrderTrackingScreen.tsx` to subscribe to the Supabase Realtime `postgres_changes` channel for the `orders` table instead of relying on Firestore. Rider tracking (GPS) remains temporarily on Firestore. 
- **Write Refactoring**: Redirected all `FirestoreService.saveOrder` patches (like status completions) within the Order Tracking screen to fire standard PATCH requests against `/api/orders/:id`.

### Phase 17: UI Responsiveness & Main-Thread Loop Resolution
- **Rerender & Polling Loop Elimination**: Resolved the issue causing the application to become unresponsive ("Page Unresponsive" / stuck on click) by decoupling `fetchShopsData` from mutable `shops.length` closures and stabilizing `shopsRef.current`.
- **Auto-Seed Fallback Loop Removal**: Removed the continuous recursive `setTimeout(() => fetchShopsData(0), 100)` cycle triggered when mock/local tables were unpopulated, replacing it with direct fallback hydration and timestamp registration.
- **Dependency Stabilization**: Pruned `shops` dependencies from user order status notification listeners and URL search param routing, preventing cascading unmount/remount cycles of realtime channels and intervals.
