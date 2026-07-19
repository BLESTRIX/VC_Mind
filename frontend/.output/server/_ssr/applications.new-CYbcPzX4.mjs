import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as cn, t as Button } from "./button-BH9lIckK.mjs";
import { I as ArrowLeft, i as Star, n as UserPlus, r as Trash2, t as X, y as FileUp } from "../_libs/lucide-react.mjs";
import { n as Input, r as Label } from "./AuthProvider-fTIyLLZ0.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as applicationsApi } from "./applications-56nLyeCA.mjs";
import { d as Panel, s as ErrorState, u as LoadingBlock } from "./primitives-CRCs1YlY.mjs";
import { t as AppShell } from "./AppShell-B4AjyHBY.mjs";
import { t as Textarea } from "./textarea-cClMqo-Z.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-DjD1j13s.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications.new-CYbcPzX4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var blankFounder = () => ({
	fullName: "",
	email: "",
	linkedinUrl: "",
	githubUrl: "",
	role: "",
	isPrimaryContact: false
});
var optional = (v) => v.trim() ? v.trim() : void 0;
var money = (v) => v ? Number(v) : void 0;
var normalizeUrl = (value) => {
	const trimmed = value.trim();
	if (!trimmed) return void 0;
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};
function isHttpUrl(value) {
	try {
		const url = new URL(value);
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}
function validateMoney(value, label) {
	if (!value.trim()) return null;
	const amount = Number(value);
	return Number.isSafeInteger(amount) && amount >= 0 ? null : `${label} must be a whole, non-negative USD amount.`;
}
var STEPS = [
	{
		id: 1,
		label: "Company"
	},
	{
		id: 2,
		label: "Founders"
	},
	{
		id: 3,
		label: "Investment & deck"
	}
];
function NewApplicationPage() {
	const navigate = useNavigate();
	const theses = useQuery({
		queryKey: ["theses"],
		queryFn: applicationsApi.theses
	});
	const [step, setStep] = (0, import_react.useState)(1);
	const [company, setCompany] = (0, import_react.useState)({
		name: "",
		websiteUrl: "",
		sector: "",
		stage: "",
		geography: "",
		productDescription: ""
	});
	const [founders, setFounders] = (0, import_react.useState)([{
		...blankFounder(),
		isPrimaryContact: true
	}]);
	const [thesisConfigId, setThesis] = (0, import_react.useState)("");
	const [fundingAsk, setFundingAsk] = (0, import_react.useState)("");
	const [valuationCap, setValuationCap] = (0, import_react.useState)("");
	const [preMoney, setPreMoney] = (0, import_react.useState)("");
	const [file, setFile] = (0, import_react.useState)(null);
	const [dragOver, setDragOver] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)("");
	function updateFounder(index, key, value) {
		setFounders((items) => items.map((item, i) => i === index ? {
			...item,
			[key]: value
		} : item));
	}
	function removeFounder(index) {
		setFounders((items) => {
			if (items.length <= 1) return items;
			const next = items.filter((_, i) => i !== index);
			if (!next.some((f) => f.isPrimaryContact) && next[0]) next[0].isPrimaryContact = true;
			return [...next];
		});
	}
	function setPrimary(index) {
		setFounders((items) => items.map((item, i) => ({
			...item,
			isPrimaryContact: i === index
		})));
	}
	function pickFile(f) {
		if (!f) return setFile(null);
		if (f.type !== "application/pdf") {
			setError(/* @__PURE__ */ new Error("Pitch deck must be a PDF."));
			return;
		}
		setError(null);
		setFile(f);
	}
	function validateStep(targetStep) {
		if (targetStep === 1) {
			if (company.name.trim().length < 2) return "Company name must contain at least 2 characters.";
			const website = normalizeUrl(company.websiteUrl);
			if (website && !isHttpUrl(website)) return "Enter a valid company website URL.";
		}
		if (targetStep === 2) {
			for (const [index, founder] of founders.entries()) {
				const prefix = `Founder ${index + 1}`;
				if (founder.fullName.trim().length < 2) return `${prefix} name must contain at least 2 characters.`;
				if (founder.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(founder.email.trim())) return `${prefix} email address is invalid.`;
				for (const [label, value] of [["LinkedIn", founder.linkedinUrl], ["GitHub", founder.githubUrl]]) {
					const url = normalizeUrl(value);
					if (url && !isHttpUrl(url)) return `${prefix} ${label} URL is invalid.`;
				}
			}
			if (founders.filter((founder) => founder.isPrimaryContact).length !== 1) return "Select exactly one founder as the primary contact.";
		}
		if (targetStep === 3) {
			if (!thesisConfigId) return "Select a thesis configuration.";
			const amountError = validateMoney(fundingAsk, "Funding ask") ?? validateMoney(valuationCap, "Valuation cap") ?? validateMoney(preMoney, "Pre-money valuation");
			if (amountError) return amountError;
			if (!file || file.type !== "application/pdf") return "Pitch deck must be a PDF.";
		}
		return null;
	}
	function continueToNextStep() {
		const message = validateStep(step);
		if (message) {
			setError(new Error(message));
			return;
		}
		setError(null);
		setStep((current) => Math.min(3, current + 1));
	}
	async function submit(event) {
		event.preventDefault();
		if (busy) return;
		for (const targetStep of [
			1,
			2,
			3
		]) {
			const message = validateStep(targetStep);
			if (message) {
				setError(new Error(message));
				setStep(targetStep);
				return;
			}
		}
		const pitchDeck = file;
		if (!pitchDeck) return;
		setBusy(true);
		setError(null);
		try {
			const payload = {
				company: {
					name: company.name.trim(),
					...normalizeUrl(company.websiteUrl) ? { websiteUrl: normalizeUrl(company.websiteUrl) } : {},
					...optional(company.sector) ? { sector: optional(company.sector) } : {},
					...optional(company.stage) ? { stage: optional(company.stage) } : {},
					...optional(company.geography) ? { geography: optional(company.geography) } : {},
					...optional(company.productDescription) ? { productDescription: optional(company.productDescription) } : {}
				},
				founders: founders.map((f) => ({
					fullName: f.fullName.trim(),
					...optional(f.email) ? { email: optional(f.email)?.toLowerCase() } : {},
					...normalizeUrl(f.linkedinUrl) ? { linkedinUrl: normalizeUrl(f.linkedinUrl) } : {},
					...normalizeUrl(f.githubUrl) ? { githubUrl: normalizeUrl(f.githubUrl) } : {},
					...optional(f.role) ? { role: optional(f.role) } : {},
					isPrimaryContact: f.isPrimaryContact
				})),
				thesisConfigId,
				...money(fundingAsk) !== void 0 ? { fundingAskUsd: money(fundingAsk) } : {},
				...money(valuationCap) !== void 0 ? { valuationCapUsd: money(valuationCap) } : {},
				...money(preMoney) !== void 0 ? { preMoneyValuationUsd: money(preMoney) } : {}
			};
			setProgress("Creating application…");
			const created = await applicationsApi.create(payload);
			setProgress("Uploading pitch deck…");
			await applicationsApi.uploadDeck(created.applicationId, pitchDeck);
			setProgress("Starting diligence…");
			await applicationsApi.run(created.applicationId);
			navigate({
				to: "/applications/$id",
				params: { id: created.applicationId }
			});
		} catch (caught) {
			setError(caught instanceof Error ? caught : /* @__PURE__ */ new Error("Application creation failed."));
		} finally {
			setBusy(false);
			setProgress("");
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		breadcrumbs: [{
			label: "Deal Flow",
			to: "/"
		}, { label: "New application" }],
		pageActions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Deal Flow"]
			})
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-4xl space-y-6 pb-24",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "New application"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Submit company details, founders, and a pitch deck. Diligence starts once the deck uploads."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "grid grid-cols-3 gap-3",
					children: STEPS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setStep(s.id),
						className: cn("flex w-full items-center gap-2.5 rounded-md border px-3 py-2.5 text-left transition-colors", step === s.id ? "border-primary/40 bg-primary/5" : "border-border/70 bg-card hover:bg-accent/40"),
						"aria-current": step === s.id ? "step" : void 0,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs font-semibold tabular", step === s.id ? "border-primary bg-primary text-primary-foreground" : step > s.id ? "border-success bg-success text-success-foreground" : "border-border bg-background text-muted-foreground"),
							children: s.id
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-sm font-medium", step === s.id && "text-primary"),
							children: s.label
						})]
					}) }, s.id))
				}),
				theses.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBlock, { label: "Loading thesis catalog…" }) : theses.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: theses.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "space-y-5",
					children: [
						step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Company",
							description: "Basic company details.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Company name",
										required: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: company.name,
											onChange: (e) => setCompany({
												...company,
												name: e.target.value
											}),
											required: true,
											placeholder: "Acme Inc."
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Website URL",
										hint: "Optional",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "url",
											value: company.websiteUrl,
											onChange: (e) => setCompany({
												...company,
												websiteUrl: e.target.value
											}),
											placeholder: "https://acme.com"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Sector",
										hint: "Optional",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: company.sector,
											onChange: (e) => setCompany({
												...company,
												sector: e.target.value
											}),
											placeholder: "Fintech, developer tools, healthcare…"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Stage",
										hint: "Optional",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: company.stage,
											onChange: (e) => setCompany({
												...company,
												stage: e.target.value
											}),
											placeholder: "Pre-seed, seed, series A…"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Geography",
										hint: "Optional",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: company.geography,
											onChange: (e) => setCompany({
												...company,
												geography: e.target.value
											}),
											placeholder: "San Francisco, USA"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Product description",
										hint: "Optional",
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 4,
											value: company.productDescription,
											onChange: (e) => setCompany({
												...company,
												productDescription: e.target.value
											}),
											placeholder: "Two or three sentences on what the product does and for whom."
										})
									})
								]
							})
						}),
						step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Founders",
							description: "Add every founder. Mark one as the primary contact.",
							actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								size: "sm",
								variant: "outline",
								onClick: () => setFounders([...founders, blankFounder()]),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " Add founder"]
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-4",
								children: founders.map((founder, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-md border border-border/70 bg-background/60 p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3 flex flex-wrap items-center justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-sm font-medium",
											children: [
												"Founder ",
												index + 1,
												founder.isPrimaryContact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" }), " Primary contact"]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [!founder.isPrimaryContact && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												size: "sm",
												variant: "ghost",
												onClick: () => setPrimary(index),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5" }), " Make primary"]
											}), founders.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												size: "sm",
												variant: "ghost",
												onClick: () => removeFounder(index),
												"aria-label": `Remove founder ${index + 1}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Full name",
												required: true,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: founder.fullName,
													onChange: (e) => updateFounder(index, "fullName", e.target.value),
													required: true,
													placeholder: "Jane Doe"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Email",
												hint: "Optional",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "email",
													value: founder.email,
													onChange: (e) => updateFounder(index, "email", e.target.value),
													placeholder: "jane@acme.com"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "LinkedIn URL",
												hint: "Optional",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "url",
													value: founder.linkedinUrl,
													onChange: (e) => updateFounder(index, "linkedinUrl", e.target.value),
													placeholder: "https://linkedin.com/in/…"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "GitHub URL",
												hint: "Optional",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "url",
													value: founder.githubUrl,
													onChange: (e) => updateFounder(index, "githubUrl", e.target.value),
													placeholder: "https://github.com/…"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Role",
												hint: "Optional",
												className: "sm:col-span-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: founder.role,
													onChange: (e) => updateFounder(index, "role", e.target.value),
													placeholder: "CEO, CTO, Head of Product…"
												})
											})
										]
									})]
								}, index))
							})
						}),
						step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Investment",
							description: "Thesis fit and deal economics.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-1 gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Thesis configuration",
										required: true,
										className: "sm:col-span-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: thesisConfigId,
											onValueChange: setThesis,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select thesis" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: theses.data?.filter((t) => t.is_active).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: t.id,
												children: [
													t.name,
													" v",
													t.version
												]
											}, t.id)) })]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsdField, {
										label: "Funding ask",
										value: fundingAsk,
										onChange: setFundingAsk
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsdField, {
										label: "Valuation cap",
										value: valuationCap,
										onChange: setValuationCap
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UsdField, {
										label: "Pre-money valuation",
										value: preMoney,
										onChange: setPreMoney
									})
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							title: "Pitch deck",
							description: "PDF only, up to a single file.",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "pitch-deck",
								onDragOver: (e) => {
									e.preventDefault();
									setDragOver(true);
								},
								onDragLeave: () => setDragOver(false),
								onDrop: (e) => {
									e.preventDefault();
									setDragOver(false);
									pickFile(e.dataTransfer.files?.[0] ?? null);
								},
								className: cn("flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-10 text-center transition-colors", dragOver ? "border-primary/60 bg-primary/5" : "border-border/70 bg-background hover:bg-accent/30"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-6 w-6 text-muted-foreground" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: "Click to upload"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "or drag and drop"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "PDF, max ~25MB"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										id: "pitch-deck",
										type: "file",
										accept: "application/pdf,.pdf",
										className: "sr-only",
										onChange: (e) => pickFile(e.target.files?.[0] ?? null)
									})
								]
							}), file && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background px-3 py-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "truncate font-medium",
										children: file.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [(file.size / 1024 / 1024).toFixed(2), " MB · application/pdf"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									size: "sm",
									variant: "ghost",
									onClick: () => setFile(null),
									"aria-label": "Remove pitch deck",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
								})]
							})]
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/95 backdrop-blur",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xs text-muted-foreground",
									children: busy && progress ? progress : `Step ${step} of ${STEPS.length}`
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										disabled: step === 1 || busy,
										onClick: () => setStep((s) => Math.max(1, s - 1)),
										children: "Back"
									}), step < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "button",
										size: "sm",
										onClick: continueToNextStep,
										children: "Continue"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										type: "submit",
										size: "sm",
										disabled: busy,
										children: busy ? "Submitting…" : "Create application"
									})]
								})]
							})
						})
					]
				})
			]
		})
	});
}
function Field({ label, hint, required, className, children }) {
	const id = label.toLowerCase().replaceAll(/\s+/g, "-");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("space-y-1.5", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
				htmlFor: id,
				className: "text-xs font-medium",
				children: [
					label,
					" ",
					required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-destructive",
						children: "*"
					})
				]
			}), hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-muted-foreground",
				children: hint
			})]
		}), children]
	});
}
function UsdField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
				className: "text-xs font-medium",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-[10px] text-muted-foreground",
				children: "USD · Optional"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground",
				children: "$"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				type: "number",
				min: 0,
				step: 1,
				inputMode: "numeric",
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder: "0",
				className: "pl-7 tabular"
			})]
		})]
	});
}
//#endregion
export { NewApplicationPage as component };
