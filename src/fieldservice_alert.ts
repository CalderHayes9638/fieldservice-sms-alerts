import { z } from "zod";
import { sendSms } from "./infrai_sms.js";

export const workOrderSchema = z.object({
  id: z.string().min(1),
  technicianPhone: z.string().min(7),
  dispatchStatus: z.enum(["queued", "dispatched", "complete"]),
  photoCount: z.number().int().nonnegative(),
  followUp: z.string().min(1),
});
export type WorkOrder = z.infer<typeof workOrderSchema>;

export function needsTechnicianAlert(order: WorkOrder): boolean {
  return order.dispatchStatus === "dispatched" && order.photoCount > 0;
}

export async function alertTechnician(input: unknown) {
  const order = workOrderSchema.parse(input);
  if (!needsTechnicianAlert(order)) return { sent: false, reason: "no alert needed" } as const;
  const result = await sendSms({ to: order.technicianPhone, body: `Work order ${order.id}: review ${order.photoCount} photo(s). Follow-up: ${order.followUp}` }, `work-order-${order.id}`);
  return { sent: true, messageId: result?.message_id } as const;
}
