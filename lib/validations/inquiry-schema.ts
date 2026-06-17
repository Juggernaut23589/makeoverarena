import { z } from "zod";

export const step1Schema = z.object({
  service_type: z.enum(
    ["undergraduate", "graduate", "phd", "scholarship", "visa", "unsure"],
    "Please select a service type"
  ),
});

export const step2Schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Please enter a valid phone number")
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Invalid phone number format"),
  whatsapp: z.string().optional(),
  city: z.string().min(2, "Please enter your city"),
  country: z.string().min(2, "Please enter your country"),
});

export const step3Schema = z.object({
  education_level: z.enum(
    ["high_school", "bachelors", "masters", "other"],
    "Please select your education level"
  ),
  field_of_study: z.string().optional(),
  is_pass_fail: z.boolean().optional(),
  gpa_scale: z.enum(["4.0", "5.0"]).optional().nullable(),
  gpa: z.number().min(0).max(5).optional().nullable(),
  graduation_year: z
    .number()
    .int()
    .min(1990)
    .max(2030)
    .optional()
    .nullable(),
});

export const step4Schema = z.object({
  preferred_countries: z
    .array(z.string())
    .min(1, "Please select at least one country"),
  intake_period: z.string().min(1, "Please select an intake period"),
  budget_range: z.string().min(1, "Please select a budget range"),
  tests_taken: z.array(z.string()).optional(),
  test_scores: z.record(z.string(), z.number().optional()).optional(),
});

export const step5Schema = z.object({
  referral_source: z.string().min(1, "Please tell us how you heard about us"),
  referrer_name: z.string().optional(),
  additional_notes: z.string().max(1000).optional(),
  opted_in_emails: z.boolean(),
});

export const fullInquirySchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type FullInquiryData = z.infer<typeof fullInquirySchema>;

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Ireland",
  "Sweden",
  "Norway",
  "Denmark",
  "New Zealand",
  "Other",
];

export const INTAKE_PERIODS = [
  "Fall 2025",
  "Spring 2026",
  "Fall 2026",
  "Spring 2027",
  "Fall 2027",
  "Not decided yet",
];

export const BUDGET_RANGES = [
  "Under $10,000",
  "$10,000 – $20,000",
  "$20,000 – $30,000",
  "$30,000 – $50,000",
  "Over $50,000",
  "Scholarship dependent",
  "Prefer not to say",
];

export const TEST_OPTIONS = [
  { id: "ielts", label: "IELTS" },
  { id: "toefl", label: "TOEFL" },
  { id: "gre", label: "GRE" },
  { id: "gmat", label: "GMAT" },
  { id: "sat", label: "SAT" },
  { id: "act", label: "ACT" },
  { id: "none", label: "None yet" },
];

export const REFERRAL_SOURCES = [
  "Instagram",
  "Google Search",
  "Referral from a friend",
  "Facebook",
  "LinkedIn",
  "WhatsApp",
  "TikTok",
  "YouTube",
  "Other",
];

export const EDUCATION_LEVELS = [
  { value: "high_school", label: "High School / Secondary School" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
  { value: "other", label: "Other" },
];
