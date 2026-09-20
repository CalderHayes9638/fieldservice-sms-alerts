import { alertTechnician } from "./fieldservice_alert.js";

const phone = process.env.DEMO_TECHNICIAN_PHONE;
if (!phone) throw new Error("DEMO_TECHNICIAN_PHONE is required");
const result = await alertTechnician({ id: "WO-1042", technicianPhone: phone, dispatchStatus: "dispatched", photoCount: 2, followUp: "Confirm the replacement part before arrival." });
console.log(result);
