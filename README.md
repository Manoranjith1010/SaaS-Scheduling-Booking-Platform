# SaaS Scheduling & Booking Platform

React + Node/Express + MongoDB with Stripe hosted checkout, fully Dockerised.

## Quick start

```bash
cp .env.example .env                                   # add your Stripe test key
docker compose run --rm stripe-cli listen --print-secret   # -> STRIPE_WEBHOOK_SECRET in .env
docker compose --profile webhooks up --build
```

Open http://localhost:8080 and pay with test card `4242 4242 4242 4242`.

See [PAYMENTS.md](PAYMENTS.md) for architecture, the payment flow, running
without Docker, and the security checklist.

## Deploy live

[DEPLOY.md](DEPLOY.md) — one-click Render Blueprint ([render.yaml](render.yaml))
for the API + static client, with MongoDB Atlas and the Stripe webhook.
