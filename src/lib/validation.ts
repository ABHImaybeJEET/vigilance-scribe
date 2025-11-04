import { z } from "zod";

// Form validation schema
export const reportFormSchema = z.object({
  details: z
    .string()
    .trim()
    .min(20, { message: "Incident details must be at least 20 characters" })
    .max(5000, { message: "Incident details must be less than 5000 characters" })
    .refine((val) => val.length > 0, { message: "Incident details cannot be empty" }),
  email: z
    .string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
  category: z.string().refine(
    (val) => ["phishing", "ransomware", "identity_theft", "data_breach", "malware", "social_engineering"].includes(val),
    { message: "Please select a valid incident category" }
  )
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
