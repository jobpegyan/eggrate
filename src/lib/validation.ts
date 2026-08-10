import { z } from "zod";

/** Shared, reusable validation schemas. Used by client forms and server functions. */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .max(255, "Email must be under 255 characters");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be under 72 characters");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type SignInValues = z.infer<typeof signInSchema>;

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type SignUpValues = z.infer<typeof signUpSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password: passwordSchema, confirmPassword: z.string() })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const appRoleSchema = z.enum(["guest", "user", "editor", "admin", "super_admin"]);
export const userStatusSchema = z.enum(["active", "suspended", "pending"]);

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter a full name").max(120),
  phone: z
    .string()
    .trim()
    .max(20, "Phone must be under 20 characters")
    .regex(/^[+0-9 ()-]*$/, "Phone can only contain digits and + ( ) -")
    .optional()
    .or(z.literal("")),
  language: z.string().trim().min(2).max(10),
  timezone: z.string().trim().min(2).max(64),
  avatarUrl: z.string().trim().url("Enter a valid URL").max(500).optional().or(z.literal("")),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const createUserSchema = z.object({
  fullName: z.string().trim().min(2, "Enter a full name").max(120),
  email: emailSchema,
  password: passwordSchema,
  role: appRoleSchema,
  status: userStatusSchema,
});
export type CreateUserValues = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  language: z.string().trim().min(2).max(10),
  timezone: z.string().trim().min(2).max(64),
  status: userStatusSchema,
  role: appRoleSchema,
});
export type UpdateUserValues = z.infer<typeof updateUserSchema>;

export const announcementSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(160),
  message: z.string().trim().min(2, "Message is required").max(2000),
  type: z.enum(["success", "warning", "error", "info"]),
  isActive: z.boolean(),
});
export type AnnouncementValues = z.infer<typeof announcementSchema>;

export const roleSchema = z.object({
  key: appRoleSchema,
  name: z.string().trim().min(2, "Name is required").max(60),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  level: z.coerce.number().int().min(0).max(100),
});
export type RoleValues = z.infer<typeof roleSchema>;

export const adSlotSchema = z.object({
  position: z.string().trim().min(2, "Position key is required").max(60),
  name: z.string().trim().min(2, "Name is required").max(100),
  description: z.string().trim().max(400).optional().or(z.literal("")),
  isEnabled: z.boolean(),
  code: z.string().trim().optional().or(z.literal("")),
});
export type AdSlotValues = z.infer<typeof adSlotSchema>;