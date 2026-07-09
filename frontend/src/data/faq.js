/**
 * Shared FAQ data — the single source of truth for:
 *   • the visible accordion on the landing page (LandingPage.jsx)
 *   • the FAQPage structured data (LandingPage.jsx)
 *   • the static prerendered homepage content (prerender.js)
 *
 * Keep this as plain ESM (no JSX / Vite-only imports) so the Node
 * prerender script can import it directly.
 */
export const FAQ_ITEMS = [
  {
    q: "How does todo. keep my tasks in sync?",
    a: "todo. automatically syncs your tasks across all your devices in real-time. Any changes you make are saved instantly, so you can access your up-to-date checklist on any device.",
  },
  {
    q: "Is this application free to use?",
    a: "Yes, todo. is completely free to use. Create an account, manage your lists, and enjoy all task management features with zero subscriptions.",
  },
  {
    q: "Can I access my tasks offline?",
    a: "Your active session is stored securely in your browser so you can view tasks on the go. An active connection is needed to save new tasks and sync updates to your other devices.",
  },
  {
    q: "How do I request complete erasure of my data?",
    a: "We take privacy seriously. You can navigate to settings or the dedicated data removal request page (/legal/delete-my-data) to permanently erase your profile, credentials, and all tasks from our servers.",
  },
];
