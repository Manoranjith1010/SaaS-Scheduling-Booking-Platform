# Deploy — Render + MongoDB Atlas

Live setup: React static site + Express API on [Render](https://render.com),
database on [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0).

```
Browser ──▶ bookflow-client (Render static)
              │  /api/*  rewrite
              ▼
           bookflow-server (Render web, Docker) ──▶ MongoDB Atlas
              ▲
              └── Stripe webhook  (checkout.session.completed)
```

## 1. MongoDB Atlas

1. Create a free **M0** cluster.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add `0.0.0.0/0` (Render IPs are dynamic on free plan).
4. **Connect → Drivers** → copy the SRV string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/booking?retryWrites=true&w=majority`
   (add the `/booking` database name before the `?`).

## 2. Render Blueprint

1. Push this branch to GitHub (already done) and open a PR / merge to `main`.
2. Render Dashboard → **New → Blueprint** → pick this repo → it reads
   [`render.yaml`](render.yaml) and creates **bookflow-server** + **bookflow-client**.
3. When prompted, set the server's secret env vars:
   | key | value |
   |---|---|
   | `MONGO_URI` | the Atlas SRV string from step 1 |
   | `STRIPE_SECRET_KEY` | `sk_test_...` (or `sk_live_...`) |
   | `STRIPE_WEBHOOK_SECRET` | fill in step 3, redeploy after |
4. First deploy runs. `bookflow-server` passes health check at `/health`;
   `bookflow-client` publishes `client/dist`.

> If you rename the server service, update the `/api/*` rewrite host in
> `render.yaml` to match (`https://<server-name>.onrender.com`).

## 3. Stripe webhook

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. Endpoint URL: `https://bookflow-server.onrender.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `checkout.session.expired`,
   `payment_intent.payment_failed`.
4. Copy the **Signing secret** (`whsec_...`) → Render → `bookflow-server` →
   Environment → set `STRIPE_WEBHOOK_SECRET` → **Manual Deploy / Save** (restarts).

## 4. Verify

1. Open `https://bookflow-client.onrender.com`.
2. Pick a service → **Pay** → Stripe Checkout → test card
   `4242 4242 4242 4242`.
3. Redirected back to `/checkout/success`; it polls and shows **Payment
   confirmed** once the webhook marks the order paid.
4. Check **Render → bookflow-server → Logs** and **Stripe → Webhooks** for a
   `200` on the delivered event.

## Going to production

- Swap Stripe keys to **live** mode; recreate the webhook with the live signing
  secret.
- Replace `server/src/middleware/auth.js` (dev stub) with real auth — the
  current build trusts an `x-user-id` header.
- Upgrade the Render server off `free` (free instances sleep after 15 min idle,
  which delays the first request and can slow webhook retries).
- Restrict Atlas Network Access to Render's static outbound IPs (paid plan).
