# Content Review & Publishing Console

An internal admin dashboard for reviewing, editing, and publishing content posts.  
Built for the **JS Frontend Assessment** — focusing on clean feature structure, business rules, form validation, local persistence, and public API integration.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
http://localhost:3000
```

**Linting & type-checking:**

```bash
npm run lint
npx tsc --noEmit
```

---

## Tech Stack

| Purpose        | Tool              | Reason                                                        |
| -------------- | ----------------- | ------------------------------------------------------------- |
| Framework      | Next.js 15 (App Router) | Route-based pages, layouts, and modern React 19 structure. |
| Language       | TypeScript        | Strongly typed models, form data, and store actions.          |
| Styling        | Tailwind CSS      | Fast, consistent utility-based dashboard styling.             |
| Forms          | react-hook-form   | Efficient form state with minimal rerenders.                  |
| Validation     | Zod               | Reusable schema-based validation for create/edit forms.       |
| State          | Zustand           | Lightweight global store shared across all post pages.        |
| Notifications  | Sonner            | Theme-aware toast notifications via a custom `AppToaster`.    |
| Dates          | Day.js            | Timestamp formatting and date-range filtering.                |
| Icons          | lucide-react      | Consistent, lightweight dashboard iconography.                |

---

## Features at a Glance

- **Posts CRUD** — Create, read, update, and delete posts with full form validation.
- **Publishing Workflow** — Move posts through `Draft → In Review → Published / Rejected` with guard rules.
- **Activity Logs** — Every status change and edit is automatically logged with timestamps.
- **Async Save** — Write operations wait for the simulated request to succeed before updating the UI.
- **Search, Filter & Sort** — Keyword search, status filter, date-range filter, and pagination.
- **Dual View Modes** — Toggle between table and grid layouts; preference persists in `localStorage`.
- **Reader Preview** — Toggle between Admin View and a clean, reader-facing preview on the detail page.
- **Dark Mode** — Full dark theme support with a theme toggle; toasts sync to the active theme.
- **Countries Page** — Live data from the REST Countries API with search, pagination, and error handling.
- **Responsive Layout** — Collapsible sidebar, mobile-friendly breakpoints.

---

## Folder Structure

```
src/
├── app/
│   ├── posts/
│   │   ├── page.tsx                # Posts listing (table/grid, search, filters, pagination)
│   │   ├── create/page.tsx         # Create post form
│   │   └── [id]/
│   │       ├── page.tsx            # Post detail, workflow actions, activity logs
│   │       └── edit/page.tsx       # Edit post form
│   ├── public-api/page.tsx         # Countries reference page
│   ├── layout.tsx                  # Root layout and dashboard shell
│   ├── page.tsx                    # Dashboard overview with status counts
│   └── globals.css                 # Tailwind base and global form colors
│
├── components/
│   ├── layout/
│   │   ├── DashboardLayout.tsx     # Main shell with sidebar + content area
│   │   ├── Navbar.tsx              # Top navigation bar with theme toggle
│   │   └── Sidebar.tsx             # Collapsible sidebar navigation
│   └── shared/
│       ├── AppToaster.tsx          # Theme-aware toast wrapper (Sonner + next-themes)
│       ├── ConfirmDialog.tsx       # Reusable confirmation modal (e.g. delete)
│       ├── PromptDialog.tsx        # Reusable prompt modal (e.g. rejection reason)
│       ├── ThemeToggle.tsx         # Dark/light mode toggle button
│       ├── EmptyState.tsx          # Empty state placeholder
│       ├── ErrorState.tsx          # Error state with retry button
│       └── LoadingState.tsx        # Loading spinner placeholder
│
├── features/posts/
│   ├── components/
│   │   ├── ActivityLogList.tsx     # Chronological activity log timeline
│   │   ├── PostCard.tsx            # Grid-view card for a single post
│   │   ├── PostForm.tsx            # Shared create/edit form (react-hook-form + Zod)
│   │   ├── PostsTable.tsx          # Table-view with ID, media preview, actions
│   │   └── PostStatusBadge.tsx     # Colored status pill
│   ├── store/post.store.ts         # Zustand store (CRUD, workflow, async save)
│   ├── types/post.types.ts         # Post, PostStatus, MediaType, ActivityLog
│   ├── utils/
│   │   ├── post-rules.ts          # Workflow transitions, duplicate check, read-only guard
│   │   └── media.utils.ts         # Video URL parsing and embed helpers
│   └── validators/post.schema.ts   # Zod schema for post forms
│
├── lib/storage/posts.storage.ts    # localStorage read/write with seed fallback
└── mocks/seed-posts.ts             # 15 pre-seeded posts across all statuses
```

---

## Application Flow

1. The dashboard home page shows summary counts grouped by post status.
2. The posts listing hydrates from `localStorage` via Zustand on mount.
3. Users search, filter by status, filter by date range, and paginate.
4. Creating a post validates with Zod and saves a new `Draft`.
5. Editing is blocked for `Published` and `In Review` posts.
6. The detail page shows media preview, metadata, workflow action buttons, and activity logs.
7. Workflow actions update the status and auto-generate an activity log entry.
8. The Countries page fetches live data from REST Countries and displays it with full loading, error, retry, empty, search, and pagination states.

---

## Post Model

Defined in `features/posts/types/post.types.ts`:

| Type           | Values                                         |
| -------------- | ---------------------------------------------- |
| `PostStatus`   | `Draft`, `In Review`, `Published`, `Rejected`  |
| `MediaType`    | `Image`, `Video`                               |
| `ActivityLog`  | `id`, `timestamp`, `action`, `summary`, `rejectionReason?` |
| `Post`         | Full content item with metadata and logs        |

> Dates are stored as ISO strings because `localStorage` serializes everything as JSON.

---

## Workflow Rules

Defined in `features/posts/utils/post-rules.ts`:

| From        | Allowed transitions         |
| ----------- | --------------------------- |
| Draft       | → In Review                 |
| In Review   | → Published · Rejected      |
| Rejected    | → Draft                     |
| Published   | → Draft (unpublish)         |

**Additional rules:**
- `Published` and `In Review` posts are read-only in the edit form.
- Rejecting a post requires a written reason (stored in the activity log).

---

## Validation

Defined in `features/posts/validators/post.schema.ts`:

| Field        | Rule                          |
| ------------ | ----------------------------- |
| Title        | 5 – 80 characters             |
| Description  | 20 – 500 characters           |
| Media type   | `Image` or `Video`            |
| Media URL    | Valid URL format               |
| Author name  | Required                      |
| Author email | Valid email format             |

**Composite uniqueness:** `title + authorEmail` must be unique (case-insensitive, trimmed). Enforced at the store level in `isDuplicatePost()`.

---

## Save Behaviour

Every write operation (create, update, delete, status change) is handled by `optimisticSave()` in `post.store.ts`:

1. Set `loading: true` in the store (UI shows a loading indicator).
2. Simulate a network delay via `fakeApiDelay()`.
3. If the request fails → set the error message; the UI remains unchanged since it was never updated prematurely.
4. If it succeeds → persist to `localStorage` and update the store with the new posts.

> The simulated failure rate (`shouldFail()`) is currently disabled (`return false`). To re-enable the 20% random failure for testing, uncomment `return Math.random() < 0.2` in `post.store.ts`.

---

## Public API Integration

The Countries page (`/public-api`) fetches live data from:

```
https://restcountries.com/v3.1/all?fields=name,capital,flags,population,region,cca3
```

Displays flag, country name, capital, region, and population. Includes loading state, error state with retry, empty search state, client-side search, and pagination.

---

## UI & UX Highlights

| Feature                       | Detail                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Reader Preview                | Segmented toggle on the detail page between Admin View and a clean reader-facing layout.  |
| Dedicated ID Column           | Monospace column showing the first 8 characters of the post ID (e.g. `#a7c1b3f9`).       |
| Layout Persistence            | Table/Grid preference saved to `localStorage` and restored on return.                    |
| Date Range Filter             | Dropdown filter (All time, Today, Last 7 days, Last 30 days) alongside status filter.    |
| Theme-Aware Toasts            | Custom `AppToaster` syncs Sonner's theme with the active dark/light mode.                 |
| Collapsible Sidebar           | Icon-only collapsed mode to save horizontal space.                                        |
| Confirmation Modals           | Custom `ConfirmDialog` for destructive actions instead of native browser prompts.          |
| Dark Mode                     | Full dark theme with consistent Slate color palette across all components.                 |
| Global Form Styling           | Explicit colors on all inputs, selects, and textareas to prevent low-contrast text.       |

---

## Requirement Checklist

| Requirement                         | Status | Location                            |
| ----------------------------------- | :----: | ----------------------------------- |
| Next.js App Router                  |   ✅   | `src/app/`                          |
| TypeScript                          |   ✅   | Whole project                       |
| Tailwind CSS                        |   ✅   | All components and pages            |
| react-hook-form                     |   ✅   | `PostForm.tsx`                      |
| Zod validation                      |   ✅   | `post.schema.ts`                    |
| Zustand state management            |   ✅   | `post.store.ts`                     |
| CRUD operations                     |   ✅   | Store and post routes               |
| Workflow rules                      |   ✅   | `post-rules.ts`, detail/edit pages  |
| Read-only published/in-review posts |   ✅   | `edit/page.tsx`, store              |
| Activity logs                       |   ✅   | Store + `ActivityLogList.tsx`       |
| Composite uniqueness                |   ✅   | `isDuplicatePost()`                 |
| localStorage persistence            |   ✅   | `posts.storage.ts`                  |
| Async save with error handling      |   ✅   | `optimisticSave()`                  |
| Listing search/filter/sort/pagination |  ✅  | `posts/page.tsx`                    |
| Reusable create/edit form           |   ✅   | `PostForm.tsx`                      |
| Post detail page                    |   ✅   | `posts/[id]/page.tsx`               |
| Public API integration              |   ✅   | `public-api/page.tsx`               |
| Loading / error / empty states      |   ✅   | Shared components and pages         |
| Responsive dashboard layout         |   ✅   | Layout components + Tailwind        |

---

## Technical Gotchas Solved

| Issue | Root Cause | Solution |
| ----- | ---------- | -------- |
| **React Compiler vs uncontrolled refs** | Next.js 15 ships the React 19 Compiler, which aggressively memoizes and breaks `react-hook-form`'s real-time ref reads. | Added `'use no memo'` directive to `PostForm.tsx`. |
| **Hydration crash on dynamic routes** | `params` is briefly `null` during SSR prerender of `[id]` routes, causing `getPostById(params.id)` to throw. | Guarded with optional chaining (`params?.id ? ... : undefined`). |
| **Zod v4 + native validation conflict** | Browser HTML5 validation fires before Zod, blocking Zod error messages. | Added `noValidate` to all forms; rely on Zod exclusively. |

---

## Trade-offs & Known Limitations

- Data lives only in browser `localStorage` — not shared across devices or browsers.
- The Countries page route is `/public-api` while the sidebar label reads "Countries" for clarity.
- The simulated failure is disabled by default; re-enable it in `shouldFail()` to test error handling.

---

## AI Usage Declaration

AI assistance was used to help plan the architecture, generate boilerplate components, explain implementation order, add comments, and prepare this README. The project was reviewed with linting and TypeScript checks after implementation.
