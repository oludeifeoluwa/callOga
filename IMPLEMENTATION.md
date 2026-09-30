# Handy Naija implementation

Build against the supplied Stitch screens, using the green Artisan Commerce palette, responsive navigation, accessible motion, and real empty states.

1. Replace demo runtime with authenticated Supabase records. Keep legacy source in place until the replacement is verified; do not import demo storage into the new runtime.
2. Add isolated `hn_` tables so existing project data is not overwritten. Apply only after inspecting the connected database. All mutations go through authenticated server routes with validation and ownership checks; RLS provides read isolation for realtime subscriptions.
3. Implement customer/artisan registration, session restoration, password recovery, profile editing, service and portfolio management, public directory, bookings, job state transitions, messaging, reviews, notifications, reports, and an administrator-only queue.
4. Create Didit hosted sessions on the server, bind each to the authenticated artisan, validate signed webhooks and retrieve authoritative decisions. Never collect identity documents in this app or grant verification from a redirect.
5. Use high-resolution maps with optional satellite view. Job participants alone may access explicitly shared live location. Stop at job end, revoke access on stop, expire stale coordinates. Browser background tracking is not guaranteed.
6. Payments require a selected provider and merchant configuration. Never label a booking funded or escrow-protected without confirmed payment.
7. Verify type checking, production build, permission/transition/signature tests, and desktop/mobile browser flows. Live integration acceptance requires connected Supabase, Didit configuration, and HTTPS hosting.

Project: https://wkdrartjrvrycvykdeeb.supabase.co
Pending: Supabase connection, Didit server credentials/workflow, map provider token, payment scope, deployment destination.
