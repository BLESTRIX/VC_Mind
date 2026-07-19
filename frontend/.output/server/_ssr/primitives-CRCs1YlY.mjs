import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as cn } from "./button-BH9lIckK.mjs";
import { O as CircleAlert, _ as LoaderCircle, v as Inbox } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/primitives-CRCs1YlY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-primary/10", className),
		...props
	});
}
var alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
	variants: { variant: {
		default: "bg-background text-foreground",
		destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive"
	} },
	defaultVariants: { variant: "default" }
});
var Alert = import_react.forwardRef(({ className, variant, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	role: "alert",
	className: cn(alertVariants({ variant }), className),
	...props
}));
Alert.displayName = "Alert";
var AlertTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
	ref,
	className: cn("mb-1 font-medium leading-none tracking-tight", className),
	...props
}));
AlertTitle.displayName = "AlertTitle";
var AlertDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm [&_p]:leading-relaxed", className),
	...props
}));
AlertDescription.displayName = "AlertDescription";
/** ---------- Formatting helpers ---------- */
var formatDate = (value) => value ? new Date(value).toLocaleString() : "—";
var formatDateShort = (value) => value ? new Date(value).toLocaleDateString(void 0, {
	year: "numeric",
	month: "short",
	day: "numeric"
}) : "—";
var formatNumber = (value, digits = 2) => value === null || value === void 0 ? "—" : Number(value).toLocaleString(void 0, { maximumFractionDigits: digits });
var humanize = (value) => (value ?? "unknown").replaceAll("_", " ");
/** Deadline helpers */
function slaFrom(deadline) {
	if (!deadline) return {
		label: "—",
		tone: "muted",
		overdue: false,
		urgent: false
	};
	const ms = new Date(deadline).getTime() - Date.now();
	if (ms <= 0) return {
		label: "Overdue",
		tone: "destructive",
		overdue: true,
		urgent: true
	};
	const hours = Math.ceil(ms / 36e5);
	if (hours < 24) return {
		label: `${hours}h left`,
		tone: "warning",
		overdue: false,
		urgent: true
	};
	const days = Math.ceil(hours / 24);
	if (days <= 3) return {
		label: `${days}d left`,
		tone: "warning",
		overdue: false,
		urgent: true
	};
	return {
		label: `${days}d left`,
		tone: "muted",
		overdue: false,
		urgent: false
	};
}
var toneClasses = {
	muted: "bg-muted text-muted-foreground border border-border/60",
	info: "bg-info/10 text-info border border-info/30",
	success: "bg-success/10 text-success border border-success/30",
	warning: "bg-warning/15 text-[oklch(0.42_0.12_60)] dark:text-warning border border-warning/40",
	destructive: "bg-destructive/10 text-destructive border border-destructive/30",
	primary: "bg-primary/10 text-primary border border-primary/30"
};
var RECOMMENDATION_TONE = {
	invest: "success",
	pass: "destructive",
	needs_more_info: "warning"
};
var STATUS_TONE = {
	submitted: "muted",
	extracting: "info",
	claims_ready: "info",
	screened: "info",
	diligence_running: "info",
	evidence_ready: "info",
	memo_draft: "info",
	memo_ready: "primary",
	approved: "success",
	passed: "destructive",
	needs_more_info: "warning",
	failed: "destructive",
	running: "info",
	pending: "muted",
	completed: "success",
	cancelled: "muted",
	valid: "success",
	invalid: "destructive",
	supports: "success",
	contradicts: "destructive",
	neutral: "muted",
	verified: "success",
	unverified: "warning",
	contradicted: "destructive",
	partial: "warning",
	low: "muted",
	medium: "info",
	high: "warning",
	critical: "destructive",
	conditional_approval: "warning"
};
function pickTone(value, kind) {
	const key = (value ?? "").toLowerCase();
	if (kind === "recommendation") return RECOMMENDATION_TONE[key] ?? "muted";
	return STATUS_TONE[key] ?? "muted";
}
function StatusBadge({ value, kind = "status", className }) {
	const tone = pickTone(value, kind);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize tracking-tight", toneClasses[tone], className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", tone === "success" && "bg-success", tone === "warning" && "bg-warning", tone === "destructive" && "bg-destructive", tone === "info" && "bg-info", tone === "primary" && "bg-primary", tone === "muted" && "bg-muted-foreground/50") }), humanize(value)]
	});
}
/** ---------- Score dot ---------- */
function ScorePill({ value, className }) {
	if (value === null || value === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("text-muted-foreground tabular", className),
		children: "—"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex min-w-[3rem] items-center justify-center rounded-md px-1.5 py-0.5 text-sm font-semibold tabular", toneClasses[value >= 7 ? "success" : value >= 5 ? "warning" : "destructive"], className),
		children: value.toFixed(1)
	});
}
/** ---------- Coverage / confidence bar ---------- */
function CoverageBar({ value, className, showLabel = true }) {
	const v = Math.max(0, Math.min(100, Number(value ?? 0)));
	const tone = v >= 70 ? "bg-success" : v >= 40 ? "bg-warning" : "bg-destructive";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-2", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-1.5 flex-1 overflow-hidden rounded-full bg-muted",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("h-full rounded-full transition-all", tone),
				style: { width: `${v}%` }
			})
		}), showLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-[2.5rem] text-right text-xs font-medium text-muted-foreground tabular",
			children: [v.toFixed(0), "%"]
		})]
	});
}
/** ---------- KPI card ---------- */
function KpiCard({ label, value, hint, icon, tone = "muted" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rounded-lg border border-border/70 bg-card p-4 shadow-[0_1px_0_0_oklch(0_0_0/0.02)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
						children: label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1.5 text-2xl font-semibold tracking-tight tabular",
						children: value
					}),
					hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: hint
					})
				]
			}), icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("grid h-8 w-8 place-items-center rounded-md", tone === "success" && "bg-success/10 text-success", tone === "warning" && "bg-warning/15 text-[oklch(0.42_0.12_60)] dark:text-warning", tone === "destructive" && "bg-destructive/10 text-destructive", tone === "info" && "bg-info/10 text-info", tone === "primary" && "bg-primary/10 text-primary", tone === "muted" && "bg-muted text-muted-foreground"),
				children: icon
			})]
		})
	});
}
/** ---------- Section / panel ---------- */
function Panel({ title, description, actions, children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("rounded-lg border border-border/70 bg-card shadow-[0_1px_0_0_oklch(0_0_0/0.02)]", className),
		children: [(title || actions) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between gap-3 border-b border-border/60 px-5 py-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold tracking-tight text-foreground",
					children: title
				}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs text-muted-foreground",
					children: description
				})]
			}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 items-center gap-2",
				children: actions
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-5",
			children
		})]
	});
}
/** ---------- Def list / summary ---------- */
function DefList({ items, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
		className: cn("grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3", className),
		children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
				children: item.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-1 truncate text-sm text-foreground",
				children: item.value
			})]
		}, i))
	});
}
function Unavailable({ children = "Not available" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground/70 italic",
		children
	});
}
/** ---------- States ---------- */
function LoadingBlock({ label = "Loading…" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }), label]
	});
}
function TableSkeleton({ rows = 5 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-9 w-full" }, i))
	});
}
function EmptyState({ title = "Nothing here yet", description, icon, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center gap-3 py-10 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground",
				children: icon ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-5 w-5" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-foreground",
					children: title
				}), description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: description
				})]
			}),
			action
		]
	});
}
function ErrorState({ error }) {
	const message = error instanceof Error ? error.message : "Unable to load data.";
	const details = error && typeof error === "object" && "details" in error ? error.details : void 0;
	const issues = details && typeof details === "object" && "issues" in details ? details.issues : void 0;
	const validationIssues = Array.isArray(issues) ? issues.filter((issue) => Boolean(issue && typeof issue === "object" && "message" in issue && typeof issue.message === "string")) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
		variant: "destructive",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "h-4 w-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: validationIssues.length ? "Check the submitted information" : "Something went wrong" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: message }), validationIssues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-2 list-disc space-y-1 pl-5",
				children: validationIssues.map((issue, index) => {
					const path = Array.isArray(issue.path) ? issue.path.map(String).join(" → ") : "";
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [path ? `${path}: ` : "", issue.message] }, `${path}-${index}`);
				})
			})] })
		]
	});
}
/** ---------- JSON list (for memo bullet lists) ---------- */
function JsonList({ value }) {
	if (!Array.isArray(value) || value.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "None reported."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-2 text-sm",
		children: value.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/60" }), typeof item === "string" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-foreground/90 leading-relaxed",
				children: item
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "min-w-0 flex-1 overflow-x-auto rounded bg-muted/60 p-2 text-xs",
				children: JSON.stringify(item, null, 2)
			})]
		}, index))
	});
}
//#endregion
export { formatDate as _, DefList as a, humanize as b, JsonList as c, Panel as d, ScorePill as f, Unavailable as g, TableSkeleton as h, CoverageBar as i, KpiCard as l, StatusBadge as m, AlertDescription as n, EmptyState as o, Skeleton as p, AlertTitle as r, ErrorState as s, Alert as t, LoadingBlock as u, formatDateShort as v, slaFrom as x, formatNumber as y };
