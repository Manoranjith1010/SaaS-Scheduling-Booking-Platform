/**
 * Resolves the public client URL.
 *
 * Accepts either a full origin (CLIENT_URL, e.g. http://localhost:5173) or a
 * bare host (CLIENT_HOST, e.g. bookflow-client.onrender.com — this is what
 * Render's `fromService` blueprint reference provides). A bare host is assumed
 * to be https.
 */
function resolveClientUrl() {
  const explicit = process.env.CLIENT_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const host = process.env.CLIENT_HOST;
  if (host) return `https://${host.replace(/\/$/, "")}`;

  return "http://localhost:5173";
}

export const CLIENT_URL = resolveClientUrl();
