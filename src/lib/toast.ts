import { toast as sonner } from "sonner";

/**
 * Thin façade over sonner so app code never imports the library directly and
 * toast styling/behaviour can be changed in one place.
 */
export const toast = {
  success: (message: string, description?: string) =>
    sonner.success(message, description ? { description } : undefined),
  error: (message: string, description?: string) =>
    sonner.error(message, description ? { description } : undefined),
  info: (message: string, description?: string) =>
    sonner(message, description ? { description } : undefined),
  warning: (message: string, description?: string) =>
    sonner.warning(message, description ? { description } : undefined),
  loading: (message: string) => sonner.loading(message),
  promise: sonner.promise,
  dismiss: sonner.dismiss,
};