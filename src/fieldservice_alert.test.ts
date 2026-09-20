import assert from "node:assert/strict";
import { needsTechnicianAlert, workOrderSchema } from "./fieldservice_alert.js";

const dispatched = workOrderSchema.parse({ id: "WO-1", technicianPhone: "+15551234567", dispatchStatus: "dispatched", photoCount: 1, followUp: "Call customer" });
const queued = { ...dispatched, dispatchStatus: "queued" as const };
assert.equal(needsTechnicianAlert(dispatched), true);
assert.equal(needsTechnicianAlert(queued), false);
console.log("alert decision test passed");
