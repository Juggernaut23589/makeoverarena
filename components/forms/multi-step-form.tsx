"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema,
  type Step1Data, type Step2Data, type Step3Data, type Step4Data, type Step5Data,
  type FullInquiryData,
  COUNTRIES, INTAKE_PERIODS, BUDGET_RANGES, TEST_OPTIONS, REFERRAL_SOURCES, EDUCATION_LEVELS,
} from "@/lib/validations/inquiry-schema";

const STORAGE_KEY = "makeoverarena_application_draft";
const TOTAL_STEPS = 5;

function trackEvent(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== "undefined" && "gtag" in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).gtag("event", eventName, params);
  }
}

const serviceOptions = [
  {
    value: "undergraduate",
    label: "Undergraduate Admission",
    description: "Bachelor's degree at international universities",
    icon: "🎓",
  },
  {
    value: "graduate",
    label: "Graduate / Masters",
    description: "Postgraduate and Masters programmes",
    icon: "📚",
  },
  {
    value: "phd",
    label: "PhD",
    description: "Doctoral research programmes",
    icon: "🔬",
  },
  {
    value: "scholarship",
    label: "Scholarship Assistance",
    description: "Identify and apply for funding",
    icon: "🏅",
  },
  {
    value: "visa",
    label: "Visa Support",
    description: "Student visa guidance and documentation",
    icon: "🌍",
  },
  {
    value: "unsure",
    label: "Not Sure Yet",
    description: "I need guidance on where to start",
    icon: "💡",
  },
];

type FormData = Partial<FullInquiryData>;

export function MultiStepForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Load draft from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { data, step } = JSON.parse(saved);
        setFormData(data);
        setCurrentStep(step || 1);
      } catch {
        // ignore
      }
    }
    // Track form_start on first visit
    trackEvent("form_start", { form_name: "inquiry" });
  }, []);

  // Save to localStorage on change
  const saveDraft = (data: FormData, step: number) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, step }));
  };

  const handleStepComplete = (stepData: Partial<FullInquiryData>) => {
    const updated = { ...formData, ...stepData };
    setFormData(updated);
    trackEvent("form_step_complete", { form_name: "inquiry", step: currentStep });
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveDraft(updated, nextStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleFinalSubmit = async (step5Data: Step5Data) => {
    const finalData = { ...formData, ...step5Data } as FullInquiryData;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });
      const json = await res.json() as { id?: string; error?: string };
      if (!res.ok) {
        toast.error(json.error ?? "Submission failed. Please try again.");
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      trackEvent("form_submit", {
        form_name: "inquiry",
        service_type: finalData.service_type ?? "",
      });
      const params = new URLSearchParams({
        email: finalData.email ?? "",
        name: finalData.full_name ?? "",
        applied: "1",
      });
      router.push(`/signup?${params.toString()}`);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SuccessScreen name={formData.full_name || "there"} email={formData.email || ""} />;
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-navy-600 font-medium">Step {currentStep} of {TOTAL_STEPS}</span>
          <span className="text-sm text-navy-400">{Math.round((currentStep / TOTAL_STEPS) * 100)}% complete</span>
        </div>
        <div className="h-1.5 bg-navy-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          {["Service", "Personal", "Academic", "Preferences", "Final"].map((label, i) => (
            <span
              key={label}
              className={cn(
                "text-xs",
                i + 1 <= currentStep ? "text-gold-600 font-medium" : "text-navy-400"
              )}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
        {currentStep === 1 && (
          <Step1
            defaultValues={{ service_type: formData.service_type }}
            onNext={handleStepComplete}
          />
        )}
        {currentStep === 2 && (
          <Step2
            defaultValues={{
              full_name: formData.full_name,
              email: formData.email,
              phone: formData.phone,
              whatsapp: formData.whatsapp,
              city: formData.city,
              country: formData.country,
            }}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 3 && (
          <Step3
            defaultValues={{
              education_level: formData.education_level,
              field_of_study: formData.field_of_study,
              is_pass_fail: formData.is_pass_fail ?? false,
              gpa_scale: formData.gpa_scale ?? "4.0",
              gpa: formData.gpa ?? undefined,
              graduation_year: formData.graduation_year ?? undefined,
            }}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 4 && (
          <Step4
            defaultValues={{
              preferred_countries: formData.preferred_countries,
              intake_period: formData.intake_period,
              budget_range: formData.budget_range,
              tests_taken: formData.tests_taken,
            }}
            onNext={handleStepComplete}
            onBack={handleBack}
          />
        )}
        {currentStep === 5 && (
          <Step5
            defaultValues={{
              referral_source: formData.referral_source,
              referrer_name: formData.referrer_name,
              additional_notes: formData.additional_notes,
              opted_in_emails: formData.opted_in_emails ?? true,
            }}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}

// ─── STEP 1 ──────────────────────────────────────────────────────────────────
function Step1({
  defaultValues,
  onNext,
}: {
  defaultValues: Partial<Step1Data>;
  onNext: (data: Step1Data) => void;
}) {
  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  });

  const selected = watch("service_type");

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h2 className="font-display text-2xl text-navy-900 mb-2">What can we help you with?</h2>
      <p className="text-navy-500 text-sm mb-6">Choose the service that best matches your goals. You can always change this later.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {serviceOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setValue("service_type", opt.value as Step1Data["service_type"], { shouldValidate: true })}
            className={cn(
              "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150",
              selected === opt.value
                ? "border-gold-400 bg-gold-50"
                : "border-border hover:border-navy-200 bg-white"
            )}
          >
            <span className="text-2xl shrink-0 mt-0.5">{opt.icon}</span>
            <div>
              <div className={cn("font-semibold text-sm", selected === opt.value ? "text-navy-900" : "text-navy-800")}>
                {opt.label}
              </div>
              <div className="text-navy-500 text-xs mt-0.5">{opt.description}</div>
            </div>
            {selected === opt.value && (
              <div className="ml-auto shrink-0 w-5 h-5 bg-gold-400 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      {errors.service_type && (
        <p className="text-red-500 text-xs mb-4">{errors.service_type.message}</p>
      )}

      <Button type="submit" variant="gold" size="lg" className="w-full">
        Continue — Personal Info →
      </Button>
    </form>
  );
}

// ─── STEP 2 ──────────────────────────────────────────────────────────────────
function Step2({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step2Data>;
  onNext: (data: Step2Data) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h2 className="font-display text-2xl text-navy-900 mb-2">About you</h2>
      <p className="text-navy-500 text-sm mb-6">Your contact details so we can follow up personally.</p>

      <div className="space-y-4">
        <Input
          label="Full Name"
          placeholder="e.g. Adaeze Okonkwo"
          required
          {...register("full_name")}
          error={errors.full_name?.message}
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          required
          {...register("email")}
          error={errors.email?.message}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+234 800 000 0000"
            required
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Input
            label="WhatsApp Number"
            type="tel"
            placeholder="Same as phone (optional)"
            {...register("whatsapp")}
            hint="Leave blank if same as phone"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Current City"
            placeholder="e.g. Lagos"
            required
            {...register("city")}
            error={errors.city?.message}
          />
          <Input
            label="Country"
            placeholder="e.g. Nigeria"
            required
            {...register("country")}
            error={errors.country?.message}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto px-6">
          ← Back
        </Button>
        <Button type="submit" variant="gold" size="lg" className="flex-1">
          Continue — Academic Profile →
        </Button>
      </div>
    </form>
  );
}

// ─── STEP 3 ──────────────────────────────────────────────────────────────────
function Step3({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step3Data>;
  onNext: (data: Step3Data) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { is_pass_fail: false, gpa_scale: "4.0", ...defaultValues },
  });

  const isPassFail = watch("is_pass_fail");
  const gpaScale = watch("gpa_scale");
  const educationLevel = watch("education_level");
  const showPassFail = educationLevel === "bachelors";

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h2 className="font-display text-2xl text-navy-900 mb-2">Your academic background</h2>
      <p className="text-navy-500 text-sm mb-6">This helps us match you to the right universities and programmes.</p>

      <div className="space-y-4">
        <Select
          label="Current / Highest Education Level"
          required
          options={EDUCATION_LEVELS}
          placeholder="Select education level"
          {...register("education_level")}
          error={errors.education_level?.message}
        />
        <Input
          label="Field of Study / Intended Major"
          placeholder="e.g. Computer Science, Medicine, Finance"
          {...register("field_of_study")}
        />

        {/* Pass/Fail — only for bachelor's graduates (medical/pharmacy) */}
        {showPassFail && (
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register("is_pass_fail")}
              className="w-4 h-4 rounded border-navy-300 text-gold-500 focus:ring-gold-400"
            />
            <span className="text-sm text-navy-700">My course uses Pass/Fail grading (e.g. Medicine, Pharmacy)</span>
          </label>
        )}

        {/* GPA fields — hidden when pass/fail */}
        {!isPassFail && (
          <div className="space-y-3">
            {/* GPA scale toggle */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">GPA Scale</label>
              <div className="flex gap-2">
                {(["4.0", "5.0"] as const).map((scale) => (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => setValue("gpa_scale", scale)}
                    className={`px-5 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                      gpaScale === scale
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-white text-navy-600 border-navy-200 hover:border-navy-400"
                    }`}
                  >
                    {scale} Scale
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={`Current GPA (out of ${gpaScale ?? "4.0"})`}
                type="number"
                placeholder={gpaScale === "5.0" ? "e.g. 4.2" : "e.g. 3.8"}
                step="0.01"
                min="0"
                max={gpaScale === "5.0" ? "5" : "4"}
                {...register("gpa", { valueAsNumber: true })}
                error={errors.gpa?.message}
              />
              <Input
                label="Graduation Year"
                type="number"
                placeholder="e.g. 2025"
                min="1990"
                max="2030"
                {...register("graduation_year", { valueAsNumber: true })}
                error={errors.graduation_year?.message}
              />
            </div>
          </div>
        )}

        {isPassFail && (
          <Input
            label="Graduation Year"
            type="number"
            placeholder="e.g. 2025"
            min="1990"
            max="2030"
            {...register("graduation_year", { valueAsNumber: true })}
            error={errors.graduation_year?.message}
          />
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto px-6">
          ← Back
        </Button>
        <Button type="submit" variant="gold" size="lg" className="flex-1">
          Continue — Preferences →
        </Button>
      </div>
    </form>
  );
}

// ─── STEP 4 ──────────────────────────────────────────────────────────────────
function Step4({
  defaultValues,
  onNext,
  onBack,
}: {
  defaultValues: Partial<Step4Data>;
  onNext: (data: Step4Data) => void;
  onBack: () => void;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      preferred_countries: defaultValues.preferred_countries || [],
      tests_taken: defaultValues.tests_taken || [],
      ...defaultValues,
    },
  });

  const selectedCountries = watch("preferred_countries") || [];
  const selectedTests = watch("tests_taken") || [];

  const toggleCountry = (country: string) => {
    if (selectedCountries.includes(country)) {
      setValue("preferred_countries", selectedCountries.filter((c) => c !== country), { shouldValidate: true });
    } else {
      setValue("preferred_countries", [...selectedCountries, country], { shouldValidate: true });
    }
  };

  const toggleTest = (test: string) => {
    if (selectedTests.includes(test)) {
      setValue("tests_taken", selectedTests.filter((t) => t !== test));
    } else {
      setValue("tests_taken", [...selectedTests, test]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onNext)}>
      <h2 className="font-display text-2xl text-navy-900 mb-2">Your study preferences</h2>
      <p className="text-navy-500 text-sm mb-6">Tell us where you want to study and when.</p>

      <div className="space-y-6">
        {/* Countries */}
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-2">
            Preferred Countries <span className="text-gold-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCountry(c)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm border transition-all",
                  selectedCountries.includes(c)
                    ? "bg-navy-900 text-white border-navy-900"
                    : "border-border text-navy-700 hover:border-navy-400"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          {errors.preferred_countries && (
            <p className="text-red-500 text-xs mt-1.5">{errors.preferred_countries.message}</p>
          )}
        </div>

        {/* Intake + Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Preferred Intake Period"
            required
            options={INTAKE_PERIODS.map((p) => ({ value: p, label: p }))}
            placeholder="Select intake"
            {...register("intake_period")}
            error={errors.intake_period?.message}
          />
          <Select
            label="Budget Range (per year)"
            required
            options={BUDGET_RANGES.map((b) => ({ value: b, label: b }))}
            placeholder="Select budget"
            {...register("budget_range")}
            error={errors.budget_range?.message}
          />
        </div>

        {/* Tests */}
        <div>
          <label className="block text-sm font-medium text-navy-800 mb-2">
            Standardised Tests Taken
          </label>
          <div className="flex flex-wrap gap-2">
            {TEST_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTest(t.id)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-sm border transition-all",
                  selectedTests.includes(t.id)
                    ? "bg-navy-900 text-white border-navy-900"
                    : "border-border text-navy-700 hover:border-navy-400"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto px-6">
          ← Back
        </Button>
        <Button type="submit" variant="gold" size="lg" className="flex-1">
          Continue — Final Step →
        </Button>
      </div>
    </form>
  );
}

// ─── STEP 5 ──────────────────────────────────────────────────────────────────
function Step5({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting,
}: {
  defaultValues: Partial<Step5Data>;
  onSubmit: (data: Step5Data) => void;
  onBack: () => void;
  isSubmitting: boolean;
}) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: { opted_in_emails: true, ...defaultValues },
  });

  const referralSource = watch("referral_source");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="font-display text-2xl text-navy-900 mb-2">Almost done!</h2>
      <p className="text-navy-500 text-sm mb-6">Just a couple of final questions.</p>

      <div className="space-y-4">
        <Select
          label="How did you hear about us?"
          required
          options={REFERRAL_SOURCES.map((r) => ({ value: r, label: r }))}
          placeholder="Select a source"
          {...register("referral_source")}
          error={errors.referral_source?.message}
        />

        {referralSource === "Referral from a friend" && (
          <Input
            label="Referrer's Name"
            placeholder="Who referred you?"
            {...register("referrer_name")}
          />
        )}

        <Textarea
          label="Anything else you'd like us to know?"
          placeholder="Questions, special circumstances, specific universities in mind..."
          {...register("additional_notes")}
          hint="Optional — but the more detail, the better we can help you."
        />

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-border text-gold-500 focus:ring-gold-400"
            {...register("opted_in_emails")}
          />
          <span className="text-sm text-navy-600">
            I agree to receive email updates, consultation reminders, and helpful resources from MakeoverArena. You can unsubscribe at any time.
          </span>
        </label>
      </div>

      <div className="flex gap-3 mt-8">
        <Button type="button" variant="outline" size="lg" onClick={onBack} className="w-full sm:w-auto px-6" disabled={isSubmitting}>
          ← Back
        </Button>
        <Button type="submit" variant="gold" size="lg" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Application ✓"
          )}
        </Button>
      </div>
    </form>
  );
}

// ─── SUCCESS SCREEN ───────────────────────────────────────────────────────────
function SuccessScreen({ name, email }: { name: string; email: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8 sm:p-12 text-center">
      <div className="w-20 h-20 bg-gold-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="font-display text-3xl text-navy-900 mb-3">
        Application Received! 🎉
      </h2>
      <p className="text-navy-600 mb-2 max-w-sm mx-auto">
        Thank you, <strong>{name}</strong>! We&apos;ve received your application and sent a confirmation to <strong>{email}</strong>.
      </p>
      <p className="text-navy-500 text-sm mb-8 max-w-xs mx-auto">
        Our advisor will review your profile and reach out within 24 hours to schedule your free consultation.
      </p>

      <div className="bg-gold-50 border border-gold-200 rounded-xl p-5 text-left mb-8 max-w-sm mx-auto">
        <p className="text-sm font-semibold text-navy-800 mb-3">What happens next:</p>
        <ul className="space-y-2 text-sm text-navy-600">
          {[
            "Your profile is reviewed by our expert advisor",
            "You receive a personalised email within 24 hours",
            "We schedule your free 30-min consultation",
            "We create your custom university strategy",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-gold-200 text-gold-700 text-xs flex items-center justify-center shrink-0 mt-0.5 font-semibold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/book"
          className="inline-flex items-center justify-center px-6 py-3 bg-gold-500 text-navy-900 rounded-xl text-sm font-semibold hover:bg-gold-400 transition-colors"
        >
          Book Free Consultation →
        </a>
        <a
          href={`/signup?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          Create Your Account
        </a>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 border border-border text-navy-700 rounded-xl text-sm font-medium hover:bg-navy-50 transition-colors"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
