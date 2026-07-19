import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, l as Trigger2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as cn, r as buttonVariants, t as Button } from "./button-BH9lIckK.mjs";
import { I as ArrowLeft, a as Square, c as ShieldAlert, d as RefreshCw, j as ChevronDown, p as Play, r as Trash2, s as ShieldCheck, u as RotateCcw, w as ExternalLink } from "../_libs/lucide-react.mjs";
import { a as supabase } from "./AuthProvider-fTIyLLZ0.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TERMINAL_STAGES, r as shouldPoll, t as Route } from "./applications._id-roWeV0WT.mjs";
import { t as applicationsApi } from "./applications-56nLyeCA.mjs";
import { _ as formatDate, a as DefList, b as humanize, c as JsonList, d as Panel, f as ScorePill, g as Unavailable, i as CoverageBar, l as KpiCard, m as StatusBadge, n as AlertDescription, o as EmptyState, r as AlertTitle, s as ErrorState, t as Alert, u as LoadingBlock, v as formatDateShort, x as slaFrom, y as formatNumber } from "./primitives-CRCs1YlY.mjs";
import { t as AppShell } from "./AppShell-B4AjyHBY.mjs";
import { t as Textarea } from "./textarea-cClMqo-Z.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-C5YxrO9c.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as Trigger, n as List, r as Root2$1, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
import { n as CollapsibleTrigger$1, r as Root, t as CollapsibleContent$1 } from "../_libs/radix-ui__react-collapsible.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications._id-ZXZTHVqC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2$1;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
var AlertDialog = Root2;
var AlertDialogTrigger = Trigger2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
var Collapsible = Root;
var CollapsibleTrigger = CollapsibleTrigger$1;
var CollapsibleContent = CollapsibleContent$1;
/** ---------- Pipeline timeline ---------- */
var STAGE_ORDER = [
	"submitted",
	"extracting",
	"claims_ready",
	"screened",
	"diligence_running",
	"evidence_ready",
	"memo_draft",
	"memo_ready"
];
function stageState(stage, currentStage, events) {
	if (events.find((e) => e.stage === stage && e.status === "failed")) return "failed";
	if (currentStage === "failed") {
		if (STAGE_ORDER.indexOf(stage) <= events.filter((e) => e.status === "completed" && STAGE_ORDER.includes(e.stage)).map((e) => STAGE_ORDER.indexOf(e.stage)).reduce((max, x) => Math.max(max, x), -1)) return "completed";
		return "pending";
	}
	const currentIdx = STAGE_ORDER.indexOf(currentStage);
	const stageIdx = STAGE_ORDER.indexOf(stage);
	if (stageIdx < currentIdx) return "completed";
	if (stageIdx === currentIdx) return "active";
	return "pending";
}
function PipelineTimeline({ events, jobs, currentStage, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Pipeline",
		description: "Diligence pipeline stages with attempts, duration, and errors.",
		actions: active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "inline-flex items-center gap-2 text-xs font-medium text-info",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-dot h-1.5 w-1.5 rounded-full bg-info" }), "Running"]
		}) : null,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "relative space-y-3 border-l border-border/70 pl-6",
			children: STAGE_ORDER.map((stage) => {
				const state = stageState(stage, currentStage, events);
				const event = [...events].reverse().find((e) => e.stage === stage);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "relative",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute -left-[29px] top-1 grid h-4 w-4 place-items-center rounded-full ring-4 ring-background", state === "completed" && "bg-success", state === "active" && "bg-info pulse-dot", state === "failed" && "bg-destructive", state === "pending" && "bg-muted") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-sm font-medium capitalize text-foreground",
								children: humanize(stage)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: state })]
						}),
						event && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 grid grid-cols-1 gap-x-6 gap-y-0.5 text-xs text-muted-foreground sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Attempt ", event.attempt_number] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Started ", formatDate(event.started_at)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									"Duration",
									" ",
									event.duration_ms !== null ? `${event.duration_ms.toLocaleString()} ms` : "—"
								] })
							]
						}),
						event?.error_message && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-destructive",
							children: event.error_message
						})
					]
				}, stage);
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
				children: "Processing jobs"
			}), jobs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "No jobs yet",
				description: "Jobs appear here once diligence starts."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-1.5",
				children: jobs.map((job) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-background/50 px-3 py-2 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: job.status }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-foreground",
							children: job.job_type
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["· attempt ", job.attempt_number]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted-foreground",
							children: ["· ", formatDate(job.started_at)]
						}),
						job.error_message && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-destructive",
							children: ["— ", job.error_message]
						})
					]
				}, job.id))
			})]
		})]
	});
}
/** ---------- Claims & Evidence ---------- */
function ClaimsPanel({ claims, evidence }) {
	const [openId, setOpenId] = (0, import_react.useState)(null);
	const evByClaim = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		evidence.forEach((e) => {
			const list = map.get(e.claim_id) ?? [];
			list.push(e);
			map.set(e.claim_id, list);
		});
		return map;
	}, [evidence]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Claims & Evidence",
		description: "Expand a claim to see supporting, contradicting, and neutral evidence.",
		children: claims.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No claims extracted yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "divide-y divide-border/60 rounded-md border border-border/60",
			children: claims.map((claim) => {
				const list = evByClaim.get(claim.id) ?? [];
				const isOpen = openId === claim.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Collapsible, {
					open: isOpen,
					onOpenChange: (v) => setOpenId(v ? claim.id : null),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-0", !isOpen && "-rotate-90") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1 space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm leading-snug text-foreground",
										children: claim.claim_text
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "capitalize",
												children: humanize(claim.category)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: claim.importance }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: claim.verification_status }),
											claim.evidence_confidence !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "tabular",
												children: [
													"Confidence ",
													(claim.evidence_confidence * 100).toFixed(0),
													"%"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [list.length, " evidence"] })
										]
									}),
									claim.evidence_confidence !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverageBar, {
										value: claim.evidence_confidence * 100,
										showLabel: false
									})
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CollapsibleContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 border-t border-border/60 bg-muted/30 px-4 py-3",
						children: [claim.source_excerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded border border-border/60 bg-background p-3 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground",
								children: "Source excerpt"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-foreground/90",
								children: claim.source_excerpt
							})]
						}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "No evidence recorded."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2",
							children: list.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EvidenceCard, { evidence: e }, e.id))
						})]
					}) })]
				}, claim.id);
			})
		})
	});
}
function EvidenceCard({ evidence }) {
	const src = evidence.evidence_sources;
	const rel = (evidence.relationship ?? "").toLowerCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: cn("rounded border border-border/60 border-l-2 bg-background p-3 text-xs", rel === "supports" || rel === "supporting" ? "border-l-success" : rel === "contradicts" || rel === "contradicting" ? "border-l-destructive" : "border-l-muted-foreground/40", evidence.validation_status === "invalid" && "ring-1 ring-destructive/30"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: evidence.relationship }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: evidence.validation_status }),
						src?.founder_controlled ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-md border border-warning/30 bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-[oklch(0.42_0.12_60)] dark:text-warning",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-3 w-3" }), " Founder-controlled"]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground",
							children: "Independent"
						}),
						src?.authoritative_source && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-1 rounded-md border border-success/30 bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Authoritative"]
						})
					]
				}), src?.canonical_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: src.canonical_url,
					target: "_blank",
					rel: "noopener noreferrer",
					className: "inline-flex items-center gap-1 text-primary hover:underline",
					children: [src.source_title ?? src.source_domain ?? "Source", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
				})]
			}),
			src?.source_domain && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-[10px] text-muted-foreground",
				children: src.source_domain
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 leading-relaxed text-foreground/90",
				children: evidence.excerpt
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Quality ", formatNumber(evidence.source_quality)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Entity match ", formatNumber(evidence.entity_match)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Cluster ", src?.independence_cluster ?? "—"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Reason ", src?.cluster_reason ? humanize(src.cluster_reason) : "—"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Similarity ", src?.cluster_similarity == null ? "—" : `${(src.cluster_similarity * 100).toFixed(0)}%`] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Original publisher ", src?.original_publisher ?? "—"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Counts independently ", src?.counts_as_independent ? "Yes" : "No"] })
				]
			}),
			evidence.validation_error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-[11px] text-destructive",
				children: evidence.validation_error
			})
		]
	});
}
/** ---------- Scores ---------- */
function ScoresPanel({ scores, factors = [] }) {
	const current = scores.filter((s) => s.is_current);
	const overall = (0, import_react.useMemo)(() => {
		if (!current.length) return null;
		const totalWeight = current.reduce((s, x) => s + (x.weight ?? 0), 0);
		if (totalWeight <= 0) return null;
		return current.reduce((s, x) => s + (x.weighted_score ?? 0), 0) / totalWeight;
	}, [current]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
		title: "Scoring",
		description: "Current diligence dimensions with weighted contribution.",
		actions: overall !== null ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 text-xs text-muted-foreground",
			children: ["Weighted mean", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePill, { value: overall })]
		}) : null,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
			className: "mb-4 border-warning/40 bg-warning/10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: "Experimental MVP Recommendation"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				"This recommendation uses heuristic thresholds that have not yet been calibrated against historical investment outcomes.",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs",
					children: "MVP v1 — uncalibrated heuristic thresholds"
				})
			] })
		}), current.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No scores yet",
			description: "Scores appear once the pipeline completes scoring."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: current.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-md border border-border/60 p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm font-medium capitalize",
							children: humanize(s.dimension)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Weight ", formatNumber(s.weight)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Weighted ", formatNumber(s.weighted_score)] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [s.evidence_count, " evidence"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePill, { value: s.score })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverageBar, {
							value: s.score / 10 * 100,
							showLabel: false
						})
					}),
					s.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs leading-relaxed text-muted-foreground",
						children: s.explanation
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1 text-[10px] text-muted-foreground",
						children: ["Version ", s.scoring_version]
					}),
					factors.filter((f) => f.is_current && f.dimension === s.dimension).length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Factor" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Assessment" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Points" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Explanation" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Supporting claims / evidence" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Missing" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Rubric" })
						] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: factors.filter((f) => f.is_current && f.dimension === s.dimension).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "font-medium",
								children: f.factor_label
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: f.assessment_level }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
								formatNumber(f.score),
								" / ",
								formatNumber(f.maximum_score)
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								className: "max-w-xs text-xs",
								children: f.explanation
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
								className: "max-w-48 text-[10px]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Claims: ", f.supporting_claim_ids.length ? f.supporting_claim_ids.map((id) => id.slice(0, 8)).join(", ") : "None"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Evidence: ", f.supporting_evidence_ids.length ? f.supporting_evidence_ids.map((id) => id.slice(0, 8)).join(", ") : "None"] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: f.missing_data ? "Yes" : "No" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: f.rubric_version })
						] }, f.id)) })] })
					})
				]
			}, s.id))
		})]
	});
}
/** ---------- Memo ---------- */
function MemoPanel({ memo }) {
	if (!memo) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Investment memo",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No memo yet",
			description: "Memo drafts appear here once ready."
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
				className: "border-warning/40 bg-warning/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold",
						children: "Experimental MVP Recommendation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"This recommendation uses heuristic thresholds that have not yet been calibrated against historical investment outcomes.",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
					"Recommendation policy: MVP v1 — uncalibrated"
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg border border-border/70 bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: ["Investment memo · v", memo.version]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-1 text-lg font-semibold tracking-tight",
								children: "Investment committee brief"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-xs text-muted-foreground",
								children: ["Created ", formatDate(memo.created_at)]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								value: memo.recommendation,
								kind: "recommendation"
							}), memo.confidence !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[10px] uppercase tracking-wide text-muted-foreground",
									children: "Confidence"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-sm font-semibold tabular",
									children: [(memo.confidence * 100).toFixed(0), "%"]
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-1 gap-4 md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border/60 bg-background p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Investment hypothesis"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-[68ch] text-sm leading-relaxed",
								children: memo.investment_hypothesis ?? "—"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-md border border-border/60 bg-background p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
								children: "Thesis alignment"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-[68ch] text-sm leading-relaxed",
								children: memo.thesis_alignment ?? "—"
							})]
						})]
					}),
					memo.strongest_reason_to_pass && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
						variant: "destructive",
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Strongest reason to pass: "
						}), memo.strongest_reason_to_pass] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 md:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Strengths",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.strengths })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Weaknesses & key risks",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.weaknesses })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Opportunities",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.opportunities })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Threats",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.threats })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Verified claims",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.verified_claims })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Unverified / partial",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.unverified_claims })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Contradicted claims",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.contradicted_claims })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Key questions",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.key_questions })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Validation flags",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(JsonList, { value: memo.validation_flags })
				})]
			}),
			memo.recommendation_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Recommendation reasoning",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-[72ch] text-sm leading-relaxed",
					children: memo.recommendation_reason
				})
			})
		]
	});
}
/** ---------- Information requests ---------- */
function InformationRequestsPanel({ requests }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		title: "Information requests",
		description: "Outstanding follow-ups sent to the founding team.",
		children: requests.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No information requests" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Title" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Description" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Document" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Claim" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Due" })
			] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: requests.map((r) => {
				const sla = slaFrom(r.due_at);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-medium",
						children: r.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "max-w-[26rem] text-muted-foreground",
						children: r.description ?? "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: r.requested_document_type ?? "—" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
						className: "font-mono text-xs text-muted-foreground",
						children: r.claim_id ? r.claim_id.slice(0, 8) : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.status }) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: formatDateShort(r.due_at)
						}), r.due_at && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("text-[10px] font-medium", sla.overdue && "text-destructive", sla.urgent && !sla.overdue && "text-warning"),
							children: sla.label
						})]
					}) })
				] }, r.id);
			}) })] })
		})
	});
}
var DECISION_LABEL = {
	approved: "Approve",
	passed: "Pass",
	needs_more_info: "Request more information",
	conditional_approval: "Conditional approval"
};
function DecisionPanel({ decisions, memoId, onSubmit }) {
	const [reason, setReason] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [pending, setPending] = (0, import_react.useState)(null);
	async function record(decision) {
		if (reason.trim().length < 3) {
			setError("A decision reason of at least 3 characters is required.");
			setPending(null);
			return;
		}
		setBusy(true);
		setError("");
		try {
			await onSubmit({
				...memoId ? { memoId } : {},
				decision,
				reason: reason.trim()
			});
			setReason("");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Decision failed.");
		} finally {
			setBusy(false);
			setPending(null);
		}
	}
	function submit(e) {
		e.preventDefault();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Human decision",
				description: "Record the investment-committee outcome. All choices require a reason.",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
					className: "border-warning/40 bg-warning/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Experimental MVP Recommendation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"This recommendation uses heuristic thresholds that have not yet been calibrated against historical investment outcomes."
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							htmlFor: "reason",
							className: "text-xs font-medium uppercase tracking-wide text-muted-foreground",
							children: ["Decision reason ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "*"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							id: "reason",
							value: reason,
							onChange: (e) => setReason(e.target.value),
							required: true,
							minLength: 3,
							rows: 4,
							className: "mt-1.5",
							placeholder: "Summarise the committee's reasoning, key evidence, and any conditions."
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Alert, {
							variant: "destructive",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: error })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "success",
									disabled: busy,
									onClick: () => setPending("approved"),
									children: "Approve"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "default",
									disabled: busy,
									onClick: () => setPending("needs_more_info"),
									children: "Request more information"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "secondary",
									disabled: busy,
									onClick: () => setPending("conditional_approval"),
									children: "Conditional approval"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "destructive",
									disabled: busy,
									onClick: () => setPending("passed"),
									children: "Pass"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Decision history",
				children: decisions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { title: "No decisions recorded yet" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "relative space-y-3 border-l border-border/70 pl-6",
					children: decisions.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "relative",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: d.decision }),
									d.is_current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary",
										children: "Current"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: formatDate(d.created_at)
									})
								]
							}),
							d.decision_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 max-w-[72ch] text-sm text-foreground/90",
								children: d.decision_reason
							})
						]
					}, d.id))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: pending !== null,
				onOpenChange: (v) => {
					if (!v) setPending(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
					"Record decision: ",
					pending ? DECISION_LABEL[pending] : "",
					"?"
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This will be stored as the current decision for this application. You can add follow-up decisions later, but this action is auditable." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
					disabled: busy,
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					disabled: busy,
					onClick: (e) => {
						e.preventDefault();
						if (pending) record(pending);
					},
					children: busy ? "Recording…" : "Confirm"
				})] })] })
			})
		]
	});
}
function PrivateDiligencePanel({ applicationId }) {
	const qc = useQueryClient();
	const [link, setLink] = (0, import_react.useState)("");
	const docs = useQuery({
		queryKey: ["private-documents", applicationId],
		queryFn: () => applicationsApi.privateDocuments(applicationId)
	});
	const recs = useQuery({
		queryKey: ["reconciliations", applicationId],
		queryFn: () => applicationsApi.reconciliations(applicationId)
	});
	const closing = useQuery({
		queryKey: ["closing", applicationId],
		queryFn: () => applicationsApi.closingReadiness(applicationId)
	});
	const refresh = () => qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.includes(applicationId) });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Founder access",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: async () => {
								const r = await applicationsApi.createDiligenceAccess(applicationId);
								setLink(`${location.origin}/diligence/${r.token}`);
							},
							children: "Create secure link"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								await applicationsApi.revokeDiligenceAccess(applicationId);
								setLink("");
							},
							children: "Revoke links"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								await applicationsApi.reconcile(applicationId);
								await refresh();
							},
							children: "Reconcile"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							onClick: async () => {
								await applicationsApi.reunderwrite(applicationId);
								await refresh();
							},
							children: "Re-underwrite"
						})
					]
				}), link && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 rounded border bg-muted p-3 text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Copy this link now. The raw token is not stored and will not be shown again." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						className: "mt-1 block break-all text-primary",
						href: link,
						children: link
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Private documents",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [docs.data?.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between rounded border p-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: d.original_filename ?? d.document_type }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								d.document_type.replaceAll("_", " "),
								" · ",
								formatDate(d.uploaded_at),
								" · extraction ",
								d.document_extractions.find((e) => e.is_current)?.confidence ?? "—"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: d.processing_status }), d.downloadUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "text-xs text-primary",
								href: d.downloadUrl,
								children: "Download"
							})]
						})]
					}, d.id)), !docs.data?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No private documents uploaded."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Claim reconciliations",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [recs.data?.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `rounded border p-3 text-sm ${r.material ? "border-destructive/40" : ""}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: r.claims?.claim_text }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.result })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								r.severity,
								" · ",
								r.explanation
							]
						})]
					}, r.id)), !recs.data?.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No reconciliations yet."
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				title: "Closing readiness",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: closing.data?.state }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: closing.data?.disclaimer
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-2 sm:grid-cols-2",
					children: closing.data?.items.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 rounded border p-2 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: ["completed", "waived"].includes(i.status),
								onChange: async (e) => {
									await applicationsApi.updateClosingItem(applicationId, i.id, { status: e.target.checked ? "completed" : "not_started" });
									await refresh();
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i.check_type.replaceAll("_", " ") }),
							i.blocking && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-destructive",
								children: "blocking"
							})
						]
					}, i.id))
				})]
			})
		]
	});
}
async function timeline(id) {
	if (!supabase) return [];
	const { data, error } = await supabase.from("application_stage_events").select("*").eq("application_id", id).order("created_at");
	if (error) throw new Error(error.message);
	return data ?? [];
}
function ApplicationDetailPage() {
	const { id } = Route.useParams();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const [deleting, setDeleting] = (0, import_react.useState)(false);
	const [deleteError, setDeleteError] = (0, import_react.useState)("");
	const [stopOpen, setStopOpen] = (0, import_react.useState)(false);
	const [stopping, setStopping] = (0, import_react.useState)(false);
	const [stopError, setStopError] = (0, import_react.useState)("");
	const status = useQuery({
		queryKey: ["status", id],
		queryFn: () => applicationsApi.status(id),
		refetchInterval: (q) => shouldPoll(q.state.data?.current_stage) ? 4e3 : false
	});
	const interval = shouldPoll(status.data?.current_stage) ? 4e3 : false;
	const application = useQuery({
		queryKey: ["application", id],
		queryFn: () => applicationsApi.get(id),
		refetchInterval: interval
	});
	const events = useQuery({
		queryKey: ["timeline", id],
		queryFn: () => timeline(id),
		refetchInterval: interval
	});
	const claims = useQuery({
		queryKey: ["claims", id],
		queryFn: () => applicationsApi.claims(id),
		refetchInterval: interval
	});
	const evidence = useQuery({
		queryKey: ["evidence", id],
		queryFn: () => applicationsApi.evidence(id),
		refetchInterval: interval
	});
	const scores = useQuery({
		queryKey: ["scores", id],
		queryFn: () => applicationsApi.scores(id),
		refetchInterval: interval
	});
	const scoreFactors = useQuery({
		queryKey: ["score-factors", id],
		queryFn: () => applicationsApi.scoreFactors(id),
		refetchInterval: interval
	});
	const slaStatus = useQuery({
		queryKey: ["sla", id],
		queryFn: () => applicationsApi.sla(id),
		refetchInterval: interval
	});
	useQuery({
		queryKey: ["model-runs", id],
		queryFn: () => applicationsApi.modelRuns(id),
		enabled: false,
		refetchInterval: interval
	});
	const memos = useQuery({
		queryKey: ["memos", id],
		queryFn: () => applicationsApi.memos(id),
		refetchInterval: interval
	});
	const requests = useQuery({
		queryKey: ["requests", id],
		queryFn: () => applicationsApi.requests(id),
		refetchInterval: interval
	});
	const decisions = useQuery({
		queryKey: ["decisions", id],
		queryFn: () => applicationsApi.decisions(id)
	});
	const active = status.data?.jobs.some((j) => j.status === "pending" || j.status === "running");
	const currentMemo = memos.data?.find((m) => m.is_current) ?? null;
	const refresh = () => queryClient.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey.includes(id) });
	const run = async () => {
		await applicationsApi.run(id);
		await refresh();
	};
	const resume = async () => {
		await applicationsApi.resume(id);
		await refresh();
	};
	const stop = async () => {
		setStopping(true);
		setStopError("");
		try {
			await applicationsApi.cancel(id);
			await refresh();
			setStopOpen(false);
		} catch (error) {
			setStopError(error instanceof Error ? error.message : "Diligence could not be stopped.");
		} finally {
			setStopping(false);
		}
	};
	const remove = async () => {
		setDeleting(true);
		setDeleteError("");
		try {
			await applicationsApi.remove(id);
			await queryClient.invalidateQueries({ queryKey: ["applications"] });
			await navigate({ to: "/" });
		} catch (error) {
			setDeleteError(error instanceof Error ? error.message : "Application deletion failed.");
			setDeleting(false);
		}
	};
	if (application.isLoading || status.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		breadcrumbs: [{
			label: "Deal Flow",
			to: "/"
		}, { label: "Loading…" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingBlock, { label: "Loading application…" })
	});
	if (application.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		breadcrumbs: [{
			label: "Deal Flow",
			to: "/"
		}, { label: "Error" }],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: application.error })
	});
	const app = application.data;
	const sla = slaFrom(app.decision_deadline);
	const stage = status.data?.current_stage ?? app.current_stage;
	const primary = app.application_founders.find((f) => f.is_primary_contact) ?? app.application_founders[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		breadcrumbs: [{
			label: "Deal Flow",
			to: "/"
		}, { label: app.companies.name }],
		pageActions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, {
				open: stopOpen,
				onOpenChange: (open) => {
					setStopOpen(open);
					if (!open) setStopError("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "h-3.5 w-3.5 fill-current" }), " Stop diligence"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Stop diligence for ",
						app.companies.name,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "Pending and running pipeline jobs will be cancelled. You can start diligence again later or delete the application after it stops." })] }),
					stopError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Could not stop diligence" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: stopError })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
						disabled: stopping,
						children: "Keep running"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						disabled: stopping,
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						onClick: (event) => {
							event.preventDefault();
							stop();
						},
						children: stopping ? "Stopping…" : "Stop diligence"
					})] })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialog, {
				open: deleteOpen,
				onOpenChange: (open) => {
					setDeleteOpen(open);
					if (!open) setDeleteError("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
						"Delete ",
						app.companies.name,
						"?"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription, { children: "This permanently deletes the application, its pitch deck, diligence jobs, claims, evidence, scores, memos, and decisions. This action cannot be undone." })] }),
					deleteError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Deletion failed" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: deleteError })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
						disabled: deleting,
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
						disabled: deleting,
						className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
						onClick: (event) => {
							event.preventDefault();
							remove();
						},
						children: deleting ? "Deleting…" : "Delete application"
					})] })
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "ghost",
				size: "sm",
				onClick: () => void refresh(),
				disabled: application.isFetching,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("h-3.5 w-3.5", application.isFetching && "animate-spin") }), "Refresh"]
			}),
			!TERMINAL_STAGES.has(app.current_stage) && app.current_stage !== "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: () => void run(),
				disabled: active,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-3.5 w-3.5" }), active ? "Diligence running" : "Start diligence"]
			}),
			app.current_stage === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "destructive",
				onClick: () => void resume(),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }), " Resume failed stage"]
			})
		] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "rounded-lg border border-border/70 bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3 w-3" }), " Deal Flow"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-start justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "truncate text-xl font-semibold tracking-tight sm:text-2xl",
										children: app.companies.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: stage }),
									active && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1.5 rounded-md border border-info/30 bg-info/10 px-2 py-0.5 text-xs font-medium text-info",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "pulse-dot h-1.5 w-1.5 rounded-full bg-info" }), "Diligence running"]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
								children: [
									app.companies.stage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "capitalize",
										children: app.companies.stage
									}),
									app.companies.sector && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", app.companies.sector] }),
									app.companies.geography && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", app.companies.geography] }),
									app.companies.website_url && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: app.companies.website_url,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "inline-flex items-center gap-1 text-primary hover:underline",
										children: [new URL(app.companies.website_url).hostname, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-3 w-3" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "text-[10px]",
										title: app.id,
										children: app.id
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								value: app.recommendation,
								kind: "recommendation"
							})
						})]
					}),
					app.failure_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						variant: "destructive",
						className: "mt-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Pipeline failure" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDescription, { children: app.failure_reason })]
					}),
					app.recommendation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Alert, {
						className: "mt-4 border-warning/40 bg-warning/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertTitle, { children: "Experimental MVP Recommendation" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDescription, { children: [
							"This recommendation uses heuristic thresholds that have not yet been calibrated against historical investment outcomes.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs",
								children: "MVP v1 — uncalibrated heuristic thresholds"
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "Recommendation",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									value: app.recommendation,
									kind: "recommendation",
									className: "text-sm"
								}),
								hint: `Stage · ${(stage ?? "").replaceAll("_", " ")}`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "Investment score",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePill, {
									value: app.investment_score,
									className: "text-lg"
								}),
								hint: "0–10 weighted score"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "Evidence coverage",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular",
									children: app.evidence_coverage !== null ? `${Number(app.evidence_coverage).toFixed(0)}%` : "—"
								}),
								hint: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverageBar, {
									value: app.evidence_coverage ?? 0,
									showLabel: false
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
								label: "SLA",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn(sla.overdue && "text-destructive", sla.urgent && !sla.overdue && "text-warning"),
									children: sla.label
								}),
								hint: `Deadline ${formatDateShort(app.decision_deadline)}`,
								tone: sla.overdue ? "destructive" : sla.urgent ? "warning" : "muted"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "overview",
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sticky top-12 z-20 -mx-2 border-b border-border/70 bg-background/85 px-2 backdrop-blur supports-[backdrop-filter]:bg-background/70",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
							className: "h-auto w-full justify-start gap-0 rounded-none bg-transparent p-0",
							children: [
								{
									v: "overview",
									l: "Overview"
								},
								{
									v: "pipeline",
									l: "Pipeline"
								},
								{
									v: "claims",
									l: "Claims & Evidence"
								},
								{
									v: "scoring",
									l: "Scoring"
								},
								{
									v: "memo",
									l: "Memo"
								},
								{
									v: "requests",
									l: "Information requests"
								},
								{
									v: "private",
									l: "Private diligence"
								},
								{
									v: "decision",
									l: "Decision"
								}
							].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: t.v,
								className: "rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-xs font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none",
								children: t.l
							}, t.v))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								title: "Company & application",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefList, { items: [
									{
										label: "Company",
										value: app.companies.name
									},
									{
										label: "Sector",
										value: app.companies.sector ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, {})
									},
									{
										label: "Stage",
										value: app.companies.stage ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, {})
									},
									{
										label: "Geography",
										value: app.companies.geography ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, {})
									},
									{
										label: "Website",
										value: app.companies.website_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: app.companies.website_url,
											target: "_blank",
											rel: "noopener noreferrer",
											className: "text-primary hover:underline",
											children: new URL(app.companies.website_url).hostname
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, {})
									},
									{
										label: "Submitted",
										value: formatDate(app.submitted_at)
									},
									{
										label: "Deadline",
										value: formatDate(app.decision_deadline)
									},
									{
										label: "Application ID",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
											className: "text-xs",
											children: app.id
										})
									},
									{
										label: "Primary contact",
										value: primary?.founders?.full_name ?? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, {})
									}
								] }), app.companies.product_description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-5 rounded-md border border-border/60 bg-background p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
										children: "Product description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "max-w-[72ch] text-sm leading-relaxed",
										children: app.companies.product_description
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Founders",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "grid grid-cols-1 gap-3 sm:grid-cols-2",
									children: app.application_founders.map((f, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-md border border-border/60 bg-background p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "truncate text-sm font-medium",
													children: f.founders.full_name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs text-muted-foreground",
													children: f.role_at_submission ?? "—"
												})]
											}), f.is_primary_contact && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary",
												children: "Primary"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex flex-wrap gap-3 text-xs",
											children: [
												f.founders.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: `mailto:${f.founders.email}`,
													className: "text-primary hover:underline",
													children: f.founders.email
												}),
												f.founders.linkedin_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: f.founders.linkedin_url,
													target: "_blank",
													rel: "noopener noreferrer",
													className: "text-primary hover:underline",
													children: "LinkedIn"
												}),
												f.founders.github_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
													href: f.founders.github_url,
													target: "_blank",
													rel: "noopener noreferrer",
													className: "text-primary hover:underline",
													children: "GitHub"
												})
											]
										})]
									}, i))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Diligence signals",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefList, { items: [
									{
										label: "Current stage",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: stage })
									},
									{
										label: "Recommendation",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: app.recommendation,
											kind: "recommendation"
										})
									},
									{
										label: "Investment score",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePill, { value: app.investment_score })
									},
									{
										label: "Evidence coverage",
										value: formatNumber(app.evidence_coverage, 1) + "%"
									},
									{
										label: "Critical contradiction",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, { children: "Not exposed by API" })
									},
									{
										label: "Triggered rules",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, { children: "Not exposed by API" })
									},
									{
										label: "Blocking issues",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Unavailable, { children: "Not exposed by API" })
									}
								] })
							}),
							status.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: status.error })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "pipeline",
						children: [
							slaStatus.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "24-hour SLA",
								description: "Operational deadline protection and stage budgets.",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DefList, { items: [
									{
										label: "24-hour deadline",
										value: formatDate(slaStatus.data.deadline)
									},
									{
										label: "Overall SLA state",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: slaStatus.data.status })
									},
									{
										label: "Time remaining",
										value: `${Math.floor(slaStatus.data.totalRemainingSeconds / 3600)}h ${Math.floor(slaStatus.data.totalRemainingSeconds % 3600 / 60)}m`
									},
									{
										label: "Current-stage budget",
										value: `${slaStatus.data.currentStageBudgetSeconds}s`
									},
									{
										label: "Stage budget consumed",
										value: `${slaStatus.data.currentStageBudgetUsedPercentage.toFixed(1)}%`
									},
									{
										label: "Blocking item",
										value: slaStatus.data.blockingReasons.join(" · ") || "None"
									},
									{
										label: "Fallback actions taken",
										value: slaStatus.data.fallbackActions.join(" · ") || "None"
									}
								] })
							}),
							false,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PipelineTimeline, {
								events: events.data ?? [],
								jobs: status.data?.jobs ?? [],
								currentStage: stage,
								active: Boolean(active)
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "claims",
						children: claims.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: claims.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClaimsPanel, {
							claims: claims.data ?? [],
							evidence: evidence.data ?? []
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "scoring",
						children: scores.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: scores.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoresPanel, {
							scores: scores.data ?? [],
							factors: scoreFactors.data ?? []
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "memo",
						children: memos.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: memos.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MemoPanel, { memo: currentMemo })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "requests",
						children: requests.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: requests.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InformationRequestsPanel, { requests: requests.data ?? [] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "decision",
						children: decisions.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: decisions.error }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecisionPanel, {
							decisions: decisions.data ?? [],
							...currentMemo ? { memoId: currentMemo.id } : {},
							onSubmit: async (payload) => {
								await applicationsApi.decide(id, payload);
								await refresh();
							}
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "private",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivateDiligencePanel, { applicationId: id })
					})
				]
			})]
		})
	});
}
//#endregion
export { ApplicationDetailPage as component };
