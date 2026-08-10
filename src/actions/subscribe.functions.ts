/**
 * Write-side server actions. Kept separate from read services so mutations
 * always carry explicit validation and a uniform Result envelope.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import type { Result } from "@/types";

const subscribeSchema = z.object({
  email: z.string().email().max(160),
  citySlug: z.string().min(1).max(80),
});

export const subscribeToCityAlerts = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }): Promise<Result<{ email: string }>> => {
    // Persistence is wired once the Cloud backend is enabled.
    return { ok: true, data: { email: data.email } };
  });