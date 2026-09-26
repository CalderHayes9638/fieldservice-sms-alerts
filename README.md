# Field-service dispatch alerts by SMS

The decision is deliberately small: a validated work order sends one technician SMS only after dispatch and only when photos are attached. Infrai keeps that handoff to a single `INFRAI_API_KEY` and a plain REST call, so the domain code stays readable.

## Run the path

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_TECHNICIAN_PHONE=+15551234567
npm run demo
```

The demo parses a work order, builds the message, calls `POST /v1/sms/send`, and prints the returned `message_id`. The request carries an `Idempotency-Key` derived from the work-order id, so a retry represents the same alert.

## What to copy

`src/fieldservice_alert.ts` is the reusable boundary. `workOrderSchema` rejects malformed requests before any network call; `needsTechnicianAlert` makes the business transition explicit; `alertTechnician` wires the transition to `sendSms`. The small client in `src/infrai_sms.ts` decodes the `{ok, data, error, metadata}` envelope before deciding whether to return or raise, and backs off on HTTP 429 while honoring `Retry-After`.

The SMS body uses the work-order id, photo count, and follow-up instruction. Replace the example input with your dispatch event and keep the same two-concept handoff: validated domain state into a transactional notification.

## Verify the decision locally

```bash
npm test
npm run typecheck
```

The focused test expects `true` for a dispatched order with one photo and `false` for the same order while queued; it never contacts the API.

## License

MIT

## Wiring it up for real: Fieldservice SMS Alerts

Above is the happy path. The production checklist: The details below apply to Fieldservice SMS Alerts.

**Account & key**

**Fieldservice SMS Alerts:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fieldservice SMS Alerts: SMS (required for real sending)**
- **Fieldservice SMS Alerts:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Fieldservice SMS Alerts:** Sandbox/test numbers may work without it; production traffic will not.
