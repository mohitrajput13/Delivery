import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const createAdminSchema = z.object({
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const updateAdminSchema = z.object({
  admin_id: z.string().min(1, "Admin ID required"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email("Valid email required").optional(),
});

const changeAdminPasswordSchema = z.object({
  admin_id: z.string().min(1, "Admin ID required"),
  old_password: z.string().min(6, "Old password required"),
  new_password: z.string().min(6, "New password must be at least 6 characters"),
});

const adminForgotPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
});

const adminVerifyOtpSchema = z.object({
  email: z.string().email("Valid email required"),
  otp: z.string().min(6, "OTP must be 6 digits"),
});

const adminResetPasswordSchema = z.object({
  email: z.string().email("Valid email required"),
  new_password: z.string().min(6, "Password must be at least 6 characters"),
});

export const validateAuthAdmin = (type) => (req, res, next) => {
  try {
    let schema;
    switch (type) {
      case "login":
        schema = adminLoginSchema;
        break;

      case "register":
        schema = createAdminSchema;
        break;

      case "forgot-password":
        schema = adminForgotPasswordSchema;
        break;

      case "verify-forgot-otp":
        schema = adminVerifyOtpSchema;
        break;

      case "reset-password":
        schema = adminResetPasswordSchema;
        break;

      case "change-password":
        schema = changeAdminPasswordSchema;
        break;

      case "update-admin":
        schema = updateAdminSchema;
        break;

      default:
        throw new Error("Invalid validation type");
    }

    const validated = schema.parse(req.body);
    req.body = validated;
    next();
  } catch (error) {
    return res.status(400).json({
      status: "error",
      message: error.errors?.[0]?.message || "Validation error",
    });
  }
};
