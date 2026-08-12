/**
 * Admin server function to trigger the India data seed.
 * Only accessible to authenticated admin users.
 */
import { createServerFn } from "@tanstack/react-start";

export const seedIndiaData = createServerFn({ method: "POST" })
  .handler(async () => {
    const { seedAllIndiaData } = await import("@/services/seed.server");
    return await seedAllIndiaData();
  });
