# BookFlow — Stripe Payments (Hosted Checkout)

React (Vite) + Node/Express + MongoDB, fully Dockerised. Payment via Stripe
Checkout hosted-page redirect.

## Layout

```
docker-compose.yml             # mongo + server + client (+ optional stripe-cli)
.env.example                   # STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, CLIENT_URL

server/
  Dockerfile
  src/
    app.js                     # webhook mounted before express.json(); CORS
    lib/stripe.js              # Stripe SDK singleton (secret key, server only)
    lib/jwt.js                 # sign / verify bearer tokens (JWT_SECRET)
    lib/config.js              # resolves CLIENT_URL (or CLIENT_HOST on Render)
    middleware/auth.js         # verifies Authorization: Bearer <jwt>
    models/User.js             # email + bcrypt passwordHash
    models/Booking.js          # trusted price source (server-side catalog)
    models/Order.js            # pending | paid | failed | cancelled
    routes/auth.js             # POST /register, /login ; GET /me
    routes/bookings.js         # catalog + create booking
    routes/checkout.js         # POST /api/checkout/session
    routes/orders.js           # GET  /api/orders/:id  (status polling)
    routes/stripeWebhook.js    # POST /api/webhooks/stripe  (only place "paid" is set)

client/
  Dockerfile                   # vite build -> nginx
  nginx.conf                   # serves SPA + proxies /api -> server:4000
  src/
    App.jsx                    # pick a service -> Pay Now
    pages/CheckoutSuccess.jsx  # polls order status after redirect
    pages/CheckoutCancel.jsx
    api/checkout.js
    styles.css
```

## Run with Docker (recommended)

```bash
cp .env.example .env          # fill in STRIPE_SECRET_KEY (test mode)

# 1. get a webhook signing secret from the Stripe CLI
docker compose run --rm stripe-cli listen --print-secret
#   -> copy the whsec_... into .env as STRIPE_WEBHOOK_SECRET

# 2. start everything, including live webhook forwarding
docker compose --profile webhooks up --build
```

Open **http://localhost:8080**. Pick a service, click **Pay Now**, pay with test
card `4242 4242 4242 4242` (any future expiry / any CVC / any ZIP). You'll be
redirected back and the page confirms once the webhook lands.

Without the `--profile webhooks` flag the app still runs, but payments stay
`pending` because nothing confirms them.

Services:
- client (nginx): http://localhost:8080
- server (Express API): http://localhost:4000
- mongo: localhost:27017

## Run without Docker

```bash
# server
cd server && npm install && cp .env.example .env   # set MONGO_URI + Stripe keys
npm run dev

# webhook forwarding (separate terminal)
stripe login
stripe listen --forward-to localhost:4000/api/webhooks/stripe
# copy printed whsec_... into server/.env, restart server

# client (separate terminal)
cd client && npm install && npm run dev            # http://localhost:5173
```

## Payment flow

1. **Pay Now** → `POST /api/bookings` creates a Booking priced from the
   server-side catalog → `POST /api/checkout/session`.
2. Server creates `Order(pending)` + a Stripe Checkout Session, returns
   `session.url`. Amount comes from the DB, never the request body.
3. Browser redirects to Stripe's hosted page.
4. On success Stripe redirects to `/checkout/success` (UX only) **and** POSTs
   `checkout.session.completed` to the webhook.
5. Webhook verifies the signature, checks `payment_status` + `amount_total`,
   sets `Order.status = paid`, flips `Booking.paid = true`. Idempotent against
   retries/replays.
6. Success page polls `GET /api/orders/:id` until it reads `paid`.

## Security checklist

| Concern | Handling |
|---|---|
| Secret key exposure | `STRIPE_SECRET_KEY` server-only, via `.env` (gitignored) |
| Price tampering | amount derived from server-side catalog / DB Booking |
| Fake "success" redirect | order marked `paid` only by the signed webhook |
| Duplicate / replayed webhooks | idempotent: `if (order.status === "paid") return` |
| Amount mismatch | webhook asserts `session.amount_total === order.amount` |
| Raw body for signature | webhook mounted before `express.json()` |
| Auth | `requireAuth` on booking/checkout; bookings scoped to the user |

Auth: email + password, bcrypt-hashed (cost 12), JWT bearer tokens signed with
`JWT_SECRET` (7-day expiry). `requireAuth` verifies the token and sets
`req.user`. Bookings, checkout and orders are all scoped to `req.user.id`. See
the production checklist in [DEPLOY.md](DEPLOY.md) for hardening still to do
(email verification, rate limiting, httpOnly-cookie sessions).
