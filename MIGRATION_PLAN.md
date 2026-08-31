# LocalEats Migration Plan

This document outlines the phased migration strategy for moving LocalEats from a mixed Firebase/Supabase architecture to a clean, authoritative API-driven architecture.

## 🟢 Target Architecture

```text
                 LOCAL EATS
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   CUSTOMER       MERCHANT        RIDER
     APP          DASHBOARD        APP
       │             │             │
       └─────────────┼─────────────┘
                     ↓
                 LOCAL EATS API (Express/Node.js)
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   SUPABASE       CLOUDINARY       FCM
   Database        Images       Notifications
```

*   **Supabase:** Core database for all data models (Users, Orders, Shops, Menu Items).
*   **Cloudinary:** Image hosting and transformation (Avatars, Menu Items, Shop Banners).
*   **Firebase Cloud Messaging (FCM):** Push notification delivery.

## 🔒 Security Posture
**Rule:** Frontends (Customer, Merchant, Rider) **never** directly manipulate the database for sensitive operations. 
All interactions (auth, orders, rider assignment, messaging, payments) must route through the **LocalEats API**.

## 🚦 Phased Approach

### Phase 1: Understand and Freeze
*   Document current working flows.
*   Preserve existing Firebase Cloud Functions (e.g., authoritative `createOrder`) as conceptual templates for the new API.
*   Make no unnecessary changes to existing working React flows.

### Phase 2: Establish the New Backend (Focusing on ONE Journey)
We will migrate one cohesive vertical slice at a time. 

**First Journey: Restaurant Notification → Order Acceptance**
This is the most critical path. If the restaurant misses the order, the chain fails.

```text
CUSTOMER
   │
   │ Place order
   ↓
LOCAL EATS API
   │
   ├── validate (auth, menu items)
   ├── calculate (subtotal, delivery fee, service fee, promo, total)
   ├── save (atomic transaction)
   │
   ↓
SUPABASE (Insert Order)
   │
   ↓
FCM (Push Notification to Merchant)
   │
   ↓
RESTAURANT
   │
   │ Accept Order
   ↓
LOCAL EATS API
   │
   ↓
SUPABASE (Update Order Status)
```

### Phase 3: Firebase Scope Reduction
Firebase transitions from being the "entire backend" to purely the **notification infrastructure (FCM)**.

### Phase 4: Image System Normalization
Cloudinary remains the sole image system.
*   Uploads pass through the LocalEats API to Cloudinary.
*   Cloudinary returns secure image URLs.
*   Supabase stores only the image URLs.

### Phase 5: Next Journeys
Once the Order Acceptance flow is rock solid, we will move to:
1.  Rider discovery
2.  Rider assignment
3.  Pickup & GPS tracking
4.  Delivery & Messages
