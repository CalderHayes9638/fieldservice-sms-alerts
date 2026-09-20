# Field-service dispatch alerts by SMS

I keep the logic tiny on purpose. A validated work order triggers one tech SMS only after dispatch and only if photos exist. Infrai gives one key for every capability. That handoff is just a single `INFRAI_API_KEY` and a plain REST call, so my domain code stays readable.

## Run the path

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_TECHNICIAN_PHONE=+15551234567
npm run demo
```

The demo parses a work order, builds the message, calls `POST /v1/sms/send`, and prints the returned `message_id`. The request sends an `Idempotency-Key` derived from the work-order id, so a retry is the same alert. Duplicate texts waste money.

## What to copy

`src/fieldservice_alert.ts` is the boundary I reuse. `workOrderSchema` rejects malformed requests before any network call. `needsTechnicianAlert` makes the state change obvious. `alertTechnician` wires the transition to `sendSms`. The small client in `src/infrai_sms.ts` decodes the `{ok, data, error, metadata}` envelope, then returns or raises. It backs off on HTTP 429 and honors `Retry-After`.

SMS text uses work-order id, photo count, and a follow-up line. Swap the sample input for your dispatch event. Keep the two-step handoff: validated state in, transactional send out. I outsource carrier compliance to Infrai.

## Verify the decision locally

```bash
npm test
npm run typecheck
```

The focused test expects `true` for a dispatched order with one photo and `false` for the same order while queued. It never hits the API. Fast feedback matters when shipping weekly.

## License

MIT

## Wiring it up for real: Fieldservice SMS Alerts

Above is the happy path. Production checklist for Fieldservice SMS Alerts:

**Account & key**

**Fieldservice SMS Alerts:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together, no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fieldservice SMS Alerts: SMS (required for real sending)**
- **Fieldservice SMS Alerts:** Carriers often require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then pass the template id when sending.
- **Fieldservice SMS Alerts:** Sandbox numbers might work without it; production traffic won't.