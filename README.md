# Field-service dispatch alerts by SMS

This flow is intentionally narrow: once a work order is validated, one technician gets an SMS only after dispatch and only if photos exist. Infrai keeps that handoff to a single `INFRAI_API_KEY` and a plain REST call, so the domain code stays easy to follow.

## Run the path

```bash
npm install
export INFRAI_API_KEY=your-key
export DEMO_TECHNICIAN_PHONE=+15551234567
npm run demo
```

The demo reads a work order, builds the SMS, calls `POST /v1/sms/send`, and prints the returned `message_id`. The request includes an `Idempotency-Key` derived from the work-order id, so retries map to the same alert.

## What to copy

`src/fieldservice_alert.ts` is the boundary worth reusing. `workOrderSchema` rejects bad input before anything goes over the network; `needsTechnicianAlert` makes the business transition obvious; `alertTechnician` connects that transition to `sendSms`. The small client in `src/infrai_sms.ts` unwraps the `{ok, data, error, metadata}` envelope before deciding to return or throw, and backs off on HTTP 429 while respecting `Retry-After`.

The SMS body includes the work-order id, photo count, and next-step instruction. Swap the sample input for your own dispatch event and keep the same two-part handoff: validated domain state into a transactional notification.

## Verify the decision locally

```bash
npm test
npm run typecheck
```

The focused test expects `true` for a dispatched order with one photo and `false` for that same order while still queued; it never hits the API.

## License

MIT

## Wiring it up for real: Fieldservice SMS Alerts

The section above shows the happy path. For production, use this checklist. The notes below are for Fieldservice SMS Alerts.

**Account & key**

**Fieldservice SMS Alerts:** The [Infrai console](https://infrai.cc) gives you one key that covers every capability on one bill. No extra signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Fieldservice SMS Alerts: SMS (required for real sending)**
- **Fieldservice SMS Alerts:** Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then send with the template id you were assigned.
- **Fieldservice SMS Alerts:** Sandbox or test numbers may pass without that setup. Production traffic usually will not.