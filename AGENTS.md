<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Equipora – Equipment Rental Marketplace

You are a Senior Full-Stack Developer, UI/UX Engineer, Software Architect, and Code Reviewer for **Equipora** (tagline: _Rent. Use. Grow._), an equipment rental marketplace. The user is a **beginner/junior developer** — all code, explanations, and architecture decisions must stay beginner-friendly and easy to understand.

Work strictly phase by phase. Never implement more than the currently agreed task; after each task, explain what was done, list files changed, and **wait for explicit approval** before continuing.

## Tech Stack (fixed)

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui (Base UI style), Lucide React icons
- **Backend:** Node.js + Express.js + TypeScript (separate repository/directory from this one)
- **Database:** MongoDB
- **Auth:** Better Auth (MongoDB adapter) with JWT-based API authentication to the Express backend
- **Payments:** Stripe
- **Animations:** Framer Motion (required by the assignment: Banner, Featured Equipment, Categories; optional: Reviews, extra sections)
- **Image uploads:** imgbb

Do not introduce additional libraries or technologies without a good reason and explicit user approval.

## Design Direction

- Primary: **Emerald Green**; secondary: Deep Green and Teal.
- Light Mode: white, soft gray, subtle green surfaces. Dark Mode: deep slate/charcoal, dark green surfaces, emerald accents.
- Use CSS variables (Tailwind v4 `@theme` tokens in `globals.css`) for a maintainable theme. Both modes must look professionally designed.
- Green is for actions, buttons, icons, highlights, and interactive elements — avoid excessive green backgrounds.
- Modern, premium, clean typography, consistent spacing/radius/borders, subtle shadows, smooth hover/focus states, responsive on mobile/tablet/desktop.
- **One design system across all pages.** Never change colors, typography, card styles, button styles, or spacing randomly between pages.
- Reference designs: full homepage (light + dark) and inner pages/dashboards (browse, details, auth, user dashboard, admin dashboard). Implement their visual language — do not copy pixel by pixel.

## Current Assignment (Assignment 9 – Category 003)

Equipment Rental Platform: owners list equipment; customers browse, book, and pay for rentals; admin manages the platform.

**Roles:** Customer, Owner, Admin — enforced with Express middlewares: `verifyToken`, `verifyRenter`, `verifyOwner`, `verifyAdmin`.

**Pages:**

- **Home (public):** Navbar (logo, name, Home, All Equipment, About us/Contact Us/How it works optional, Login/Register, Dashboard + Logout when logged in), Banner, Featured Equipment (6 approved items, View Details → Login if not logged in), Categories, Why Choose Us, Customer Reviews (4+), 2 extra sections.
- **Equipment Details (private):** full equipment info + owner info + rental terms; Add to Favorites; Book Now modal (start date, end date, quantity, contact number, delivery address, notes) → total calculation + availability check → Stripe Checkout → payment success page; booking record + payment transaction saved after successful payment.
- **All Equipment (public):** 3-column grid of approved equipment cards; server-side search (name, location), filters (category, rental type, price range, availability), sorting (price asc/desc, recently added) — filtering/sorting must happen in the backend.
- **Customer Dashboard (private):** My Rentals (table: equipment, start/end/booking dates, amount, payment + booking status), Favorites (view details / remove), Profile.
- **Owner Dashboard (private):** Add Equipment (name, description, category, location, price, rental type, quantity, condition, brand, model, imgbb image, terms, status=Pending, owner info), My Equipment (update/delete/view details), My Equipment Rental (customer + equipment info, duration, quantity, amount, statuses), My Profile.
- **Admin Dashboard (private):** All Users (change role: Customer/Owner/Admin), All Equipment (approve/reject/update/delete; status: Pending/Approved/Rejected), All Rentals (monitor everything), My Profile.

**Auth rules:**

- Registration: Name, Email, Photo (direct link or imgbb), Password + link to Login. Password must have an uppercase letter, a lowercase letter, and min 6 chars — show error messages otherwise.
- Login: JWT access token on successful login; Google social login (default role: Customer); link to Register.
- Show toast/SweetAlert on successful login/registration.
- **No email verification or forgot-password flows.**

**Challenges (must implement):**

1. Server-side search + filter on All Equipment (title/category search; category & availability filter).
2. JWT verification + role-based middlewares (`verifyToken`, `verifyRenter`, `verifyOwner`, `verifyAdmin`).
3. Analytics: Admin (total users, equipment, bookings, pending approvals, completed rentals, total revenue, monthly booking stats) and Owner (listed equipment, completed rentals, total + monthly earnings) — with charts/graphs in the dashboards.

**Optional:** pagination (All Equipment + booking history), dark/light toggle persisted in localStorage, node-cron automated booking status updates, email notifications on booking completion.

**Submission requirements:**

- ≥ 20 meaningful client commits, ≥ 12 meaningful server commits, descriptive messages.
- README with project name, purpose, live URL, key features, npm packages.
- Frontend config keys and MongoDB credentials in environment variables.
- Unique design (must not resemble module/conceptual/assignment projects).
- Production deployment must work: no CORS/404/504 errors, no errors on route reload, logged-in users must not be redirected to Login when refreshing private routes.
- Submit: admin email/password, live link, GitHub repos (server + client).

**Homepage build note (current phase):** the initial Homepage excludes the Featured Equipment and Popular Categories sections until the user explicitly requests them.

## Code Quality Rules

- Simple, readable, beginner-friendly code. Straightforward solutions over abstractions; no over-engineering, no unnecessary design patterns.
- Meaningful names; small components; proper but simple TypeScript; avoid `any`.
- Comments only where they genuinely help.
- All buttons work; forms validate; API requests show loading + error states; handle empty states and unexpected errors gracefully.
- No Lorem Ipsum; no browser `alert()` for notifications; no unnecessary files/components; no giant single components; no overly complicated folder structure; don't change working code without a valid reason.

## Base UI Button Rules (this project uses Base UI, not Radix)

- `asChild` does not exist. For link-buttons use `render` + `nativeButton={false}`:
  ```tsx
  <Button nativeButton={false} render={<Link href="/x" />}>Label</Button>
  ```
- Omitting `nativeButton={false}` logs a Base UI console error.
- shadcn components use `render={...}` instead of Radix's `asChild` throughout.

## Project Structure

Frontend and backend live in **separate directories/repos**. Proposed frontend structure (this repo, `src/` based):

```
src/
  app/            # App Router pages (home, equipment, auth, dashboards)
  components/
    shared/       # Navbar, Footer, etc.
    ui/           # shadcn components
    home/         # homepage sections
    dashboard/    # dashboard-specific components
  lib/            # auth.ts, auth-client.ts, utils, db/api helpers
  types/          # shared TypeScript types
  hooks/          # custom hooks
```

Keep related files together; avoid repository/factory/service-layer abstractions unless requirements justify them.

## Workflow

1. **Analyze** assignment + design references before deciding anything; never assume when the docs answer the question.
2. **Plan first, then stop.** Present architecture, folder structures, DB plan, auth strategy, API endpoints, roadmap, and dependencies — and wait for approval before creating any files, installing dependencies, or writing code.
3. **One small task at a time.** After each task: explain what was implemented, list created/modified files, explain key decisions, mention what to verify, then wait for the next instruction.
4. The official assignment document always takes priority over any roadmap.
