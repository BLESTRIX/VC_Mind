import { useState, type FormEvent, type ChangeEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileUp, Star, Trash2, UserPlus, X } from "lucide-react";
import { applicationsApi } from "@/api/applications";
import type { CreateApplicationPayload } from "@/api/types";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorState, LoadingBlock, Panel } from "@/components/vc/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/applications/new")({
  head: () => ({
    meta: [
      { title: "New application — VC Mind" },
      {
        name: "description",
        content: "Submit a new startup application for AI-assisted VC diligence.",
      },
    ],
  }),
  component: NewApplicationPage,
});

type Founder = {
  fullName: string;
  email: string;
  linkedinUrl: string;
  githubUrl: string;
  role: string;
  isPrimaryContact: boolean;
};

const blankFounder = (): Founder => ({
  fullName: "",
  email: "",
  linkedinUrl: "",
  githubUrl: "",
  role: "",
  isPrimaryContact: false,
});

const optional = (v: string) => (v.trim() ? v.trim() : undefined);
const money = (v: string) => (v ? Number(v) : undefined);

const STEPS = [
  { id: 1, label: "Company" },
  { id: 2, label: "Founders" },
  { id: 3, label: "Investment & deck" },
] as const;

function NewApplicationPage() {
  const navigate = useNavigate();
  const theses = useQuery({ queryKey: ["theses"], queryFn: applicationsApi.theses });

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [company, setCompany] = useState({
    name: "",
    websiteUrl: "",
    sector: "",
    stage: "",
    geography: "",
    productDescription: "",
  });
  const [founders, setFounders] = useState<Founder[]>([{ ...blankFounder(), isPrimaryContact: true }]);
  const [thesisConfigId, setThesis] = useState("");
  const [fundingAsk, setFundingAsk] = useState("");
  const [valuationCap, setValuationCap] = useState("");
  const [preMoney, setPreMoney] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string>("");

  function updateFounder(index: number, key: keyof Founder, value: string | boolean) {
    setFounders((items) =>
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }
  function removeFounder(index: number) {
    setFounders((items) => {
      if (items.length <= 1) return items;
      const next = items.filter((_, i) => i !== index);
      if (!next.some((f) => f.isPrimaryContact) && next[0]) next[0].isPrimaryContact = true;
      return [...next];
    });
  }
  function setPrimary(index: number) {
    setFounders((items) => items.map((item, i) => ({ ...item, isPrimaryContact: i === index })));
  }

  function pickFile(f: File | null) {
    if (!f) return setFile(null);
    if (f.type !== "application/pdf") {
      setError(new Error("Pitch deck must be a PDF."));
      return;
    }
    setError(null);
    setFile(f);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!file || file.type !== "application/pdf") {
      setError(new Error("Pitch deck must be a PDF."));
      setStep(3);
      return;
    }
    if (!thesisConfigId) {
      setError(new Error("Select a thesis configuration."));
      setStep(3);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload: CreateApplicationPayload = {
        company: {
          name: company.name,
          ...(optional(company.websiteUrl) ? { websiteUrl: optional(company.websiteUrl) } : {}),
          ...(optional(company.sector) ? { sector: optional(company.sector) } : {}),
          ...(optional(company.stage) ? { stage: optional(company.stage) } : {}),
          ...(optional(company.geography) ? { geography: optional(company.geography) } : {}),
          ...(optional(company.productDescription)
            ? { productDescription: optional(company.productDescription) }
            : {}),
        },
        founders: founders.map((f) => ({
          fullName: f.fullName,
          ...(optional(f.email) ? { email: optional(f.email) } : {}),
          ...(optional(f.linkedinUrl) ? { linkedinUrl: optional(f.linkedinUrl) } : {}),
          ...(optional(f.githubUrl) ? { githubUrl: optional(f.githubUrl) } : {}),
          ...(optional(f.role) ? { role: optional(f.role) } : {}),
          isPrimaryContact: f.isPrimaryContact,
        })),
        thesisConfigId,
        ...(money(fundingAsk) !== undefined ? { fundingAskUsd: money(fundingAsk) } : {}),
        ...(money(valuationCap) !== undefined ? { valuationCapUsd: money(valuationCap) } : {}),
        ...(money(preMoney) !== undefined ? { preMoneyValuationUsd: money(preMoney) } : {}),
      };
      setProgress("Creating application…");
      const created = await applicationsApi.create(payload);
      setProgress("Uploading pitch deck…");
      await applicationsApi.uploadDeck(created.applicationId, file);
      navigate({ to: "/applications/$id", params: { id: created.applicationId } });
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("Application creation failed."));
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  return (
    <AppShell
      breadcrumbs={[
        { label: "Deal Flow", to: "/" },
        { label: "New application" },
      ]}
      pageActions={
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-3.5 w-3.5" /> Deal Flow
          </Link>
        </Button>
      }
    >
      <div className="mx-auto max-w-4xl space-y-6 pb-24">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">New application</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit company details, founders, and a pitch deck. Diligence starts once the deck uploads.
          </p>
        </div>

        <ol className="grid grid-cols-3 gap-3">
          {STEPS.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => setStep(s.id as 1 | 2 | 3)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors",
                  step === s.id
                    ? "border-primary/40 bg-primary/5"
                    : "border-border/70 bg-card hover:bg-accent/40",
                )}
                aria-current={step === s.id ? "step" : undefined}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular",
                    step === s.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : step > s.id
                        ? "border-success bg-success text-success-foreground"
                        : "border-border bg-background text-muted-foreground",
                  )}
                >
                  {s.id}
                </span>
                <span className={cn("text-sm font-medium", step === s.id && "text-primary")}>
                  {s.label}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {theses.isLoading ? (
          <LoadingBlock label="Loading thesis catalog…" />
        ) : theses.error ? (
          <ErrorState error={theses.error} />
        ) : (
          <form onSubmit={submit} className="space-y-5">
            {step === 1 && (
              <Panel title="Company" description="Basic company details.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Company name" required>
                    <Input
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      required
                      placeholder="Acme Inc."
                    />
                  </Field>
                  <Field label="Website URL" hint="Optional">
                    <Input
                      type="url"
                      value={company.websiteUrl}
                      onChange={(e) => setCompany({ ...company, websiteUrl: e.target.value })}
                      placeholder="https://acme.com"
                    />
                  </Field>
                  <Field label="Sector" hint="Optional">
                    <Input
                      value={company.sector}
                      onChange={(e) => setCompany({ ...company, sector: e.target.value })}
                      placeholder="Fintech, developer tools, healthcare…"
                    />
                  </Field>
                  <Field label="Stage" hint="Optional">
                    <Input
                      value={company.stage}
                      onChange={(e) => setCompany({ ...company, stage: e.target.value })}
                      placeholder="Pre-seed, seed, series A…"
                    />
                  </Field>
                  <Field label="Geography" hint="Optional">
                    <Input
                      value={company.geography}
                      onChange={(e) => setCompany({ ...company, geography: e.target.value })}
                      placeholder="San Francisco, USA"
                    />
                  </Field>
                  <Field label="Product description" hint="Optional" className="sm:col-span-2">
                    <Textarea
                      rows={4}
                      value={company.productDescription}
                      onChange={(e) =>
                        setCompany({ ...company, productDescription: e.target.value })
                      }
                      placeholder="Two or three sentences on what the product does and for whom."
                    />
                  </Field>
                </div>
              </Panel>
            )}

            {step === 2 && (
              <Panel
                title="Founders"
                description="Add every founder. Mark one as the primary contact."
                actions={
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setFounders([...founders, blankFounder()])}
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Add founder
                  </Button>
                }
              >
                <div className="space-y-4">
                  {founders.map((founder, index) => (
                    <div
                      key={index}
                      className="rounded-md border border-border/70 bg-background/60 p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          Founder {index + 1}
                          {founder.isPrimaryContact && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                              <Star className="h-3 w-3" /> Primary contact
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!founder.isPrimaryContact && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => setPrimary(index)}
                            >
                              <Star className="h-3.5 w-3.5" /> Make primary
                            </Button>
                          )}
                          {founders.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFounder(index)}
                              aria-label={`Remove founder ${index + 1}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Full name" required>
                          <Input
                            value={founder.fullName}
                            onChange={(e) => updateFounder(index, "fullName", e.target.value)}
                            required
                            placeholder="Jane Doe"
                          />
                        </Field>
                        <Field label="Email" hint="Optional">
                          <Input
                            type="email"
                            value={founder.email}
                            onChange={(e) => updateFounder(index, "email", e.target.value)}
                            placeholder="jane@acme.com"
                          />
                        </Field>
                        <Field label="LinkedIn URL" hint="Optional">
                          <Input
                            type="url"
                            value={founder.linkedinUrl}
                            onChange={(e) => updateFounder(index, "linkedinUrl", e.target.value)}
                            placeholder="https://linkedin.com/in/…"
                          />
                        </Field>
                        <Field label="GitHub URL" hint="Optional">
                          <Input
                            type="url"
                            value={founder.githubUrl}
                            onChange={(e) => updateFounder(index, "githubUrl", e.target.value)}
                            placeholder="https://github.com/…"
                          />
                        </Field>
                        <Field label="Role" hint="Optional" className="sm:col-span-2">
                          <Input
                            value={founder.role}
                            onChange={(e) => updateFounder(index, "role", e.target.value)}
                            placeholder="CEO, CTO, Head of Product…"
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {step === 3 && (
              <>
                <Panel title="Investment" description="Thesis fit and deal economics.">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Thesis configuration" required className="sm:col-span-2">
                      <Select value={thesisConfigId} onValueChange={setThesis}>
                        <SelectTrigger><SelectValue placeholder="Select thesis" /></SelectTrigger>
                        <SelectContent>
                          {theses.data
                            ?.filter((t) => t.is_active)
                            .map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.name} v{t.version}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <UsdField label="Funding ask" value={fundingAsk} onChange={setFundingAsk} />
                    <UsdField label="Valuation cap" value={valuationCap} onChange={setValuationCap} />
                    <UsdField label="Pre-money valuation" value={preMoney} onChange={setPreMoney} />
                  </div>
                </Panel>

                <Panel title="Pitch deck" description="PDF only, up to a single file.">
                  <label
                    htmlFor="pitch-deck"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      pickFile(e.dataTransfer.files?.[0] ?? null);
                    }}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-center transition-colors",
                      dragOver
                        ? "border-primary/60 bg-primary/5"
                        : "border-border/70 bg-background hover:bg-accent/30",
                    )}
                  >
                    <FileUp className="h-6 w-6 text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-foreground">Click to upload</span>{" "}
                      <span className="text-muted-foreground">or drag and drop</span>
                    </div>
                    <p className="text-xs text-muted-foreground">PDF, max ~25MB</p>
                    <input
                      id="pitch-deck"
                      type="file"
                      accept="application/pdf,.pdf"
                      className="sr-only"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        pickFile(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                  {file && (
                    <div className="mt-3 flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · application/pdf
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setFile(null)}
                        aria-label="Remove pitch deck"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </Panel>
              </>
            )}

            {error && <ErrorState error={error} />}

            {/* Sticky footer */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur">
              <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="text-xs text-muted-foreground">
                  {busy && progress ? progress : `Step ${step} of ${STEPS.length}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={step === 1 || busy}
                    onClick={() => setStep((s) => (Math.max(1, s - 1) as 1 | 2 | 3))}
                  >
                    Back
                  </Button>
                  {step < 3 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setStep((s) => (Math.min(3, s + 1) as 1 | 2 | 3))}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button type="submit" size="sm" disabled={busy}>
                      {busy ? "Submitting…" : "Create application"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}

function Field({
  label,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const id = label.toLowerCase().replaceAll(/\s+/g, "-");
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {hint && <span className="text-[10px] text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function UsdField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-medium">{label}</Label>
        <span className="text-[10px] text-muted-foreground">USD · Optional</span>
      </div>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          $
        </span>
        <Input
          type="number"
          min={0}
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="pl-7 tabular"
        />
      </div>
    </div>
  );
}

// Silence unused import warning: Checkbox not currently used but exported for future field variants.
void Checkbox;
