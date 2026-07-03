import { type FormEvent, useState } from "react";
import { z } from "zod";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
import { createLead, getApiErrorMessage } from "../api/client";
import type { CreateLeadPayload } from "../types/lead";

const leadSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(/^[+]?[\d\s().-]{7,20}$/, "Enter a valid phone number"),
  company: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  companySize: z.string().trim().optional(),
  budget: z.string().trim().optional(),
  projectDescription: z.string().trim().min(10, "Project description must be at least 10 characters")
});

const initialValues: CreateLeadPayload = {
  name: "",
  email: "",
  phone: "",
  company: "",
  industry: "",
  companySize: "",
  budget: "",
  projectDescription: ""
};

const industries = ["SaaS", "Healthcare", "Finance", "Education", "Retail", "Manufacturing", "Real Estate", "Other"];
const companySizes = ["1-10", "11-50", "51-200", "201-500", "501-1000", "Enterprise 1000+"];

export default function LeadForm() {
  const [values, setValues] = useState<CreateLeadPayload>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (field: keyof CreateLeadPayload, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = leadSchema.safeParse(values);

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        fieldErrors[String(issue.path[0])] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await createLead(parsed.data);
      toast.success("Lead captured, qualified, and acknowledged.");
      setValues(initialValues);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not submit the lead."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" className="field mt-1" value={values.name} onChange={(event) => updateValue("name", event.target.value)} />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input id="email" className="field mt-1" value={values.email} onChange={(event) => updateValue("email", event.target.value)} />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone
          </label>
          <input id="phone" className="field mt-1" value={values.phone} onChange={(event) => updateValue("phone", event.target.value)} />
          {errors.phone && <p className="error-text">{errors.phone}</p>}
        </div>
        <div>
          <label className="label" htmlFor="company">
            Company
          </label>
          <input id="company" className="field mt-1" value={values.company} onChange={(event) => updateValue("company", event.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="industry">
            Industry
          </label>
          <select id="industry" className="field mt-1" value={values.industry} onChange={(event) => updateValue("industry", event.target.value)}>
            <option value="">Select industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="companySize">
            Company Size
          </label>
          <select
            id="companySize"
            className="field mt-1"
            value={values.companySize}
            onChange={(event) => updateValue("companySize", event.target.value)}
          >
            <option value="">Select size</option>
            {companySizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="budget">
          Estimated Budget
        </label>
        <input id="budget" className="field mt-1" value={values.budget} onChange={(event) => updateValue("budget", event.target.value)} />
      </div>
      <div>
        <label className="label" htmlFor="projectDescription">
          Project Description
        </label>
        <textarea
          id="projectDescription"
          className="field mt-1 min-h-32 resize-y"
          value={values.projectDescription}
          onChange={(event) => updateValue("projectDescription", event.target.value)}
        />
        {errors.projectDescription && <p className="error-text">{errors.projectDescription}</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send size={17} />
        {isSubmitting ? "Qualifying lead..." : "Submit lead"}
      </button>
    </form>
  );
}
