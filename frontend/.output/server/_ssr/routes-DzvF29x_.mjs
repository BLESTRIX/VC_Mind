import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as cn, t as Button } from "./button-DLX5oFRp.mjs";
import { F as ArrowUpRight, P as Briefcase, T as Clock, b as FileText, d as RefreshCw, f as Plus, l as Search, o as Sparkles } from "../_libs/lucide-react.mjs";
import { a as supabase, n as Input, o as useAuth } from "./AuthProvider-D43Xmik3.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Panel, f as ScorePill, h as TableSkeleton, i as CoverageBar, l as KpiCard, m as StatusBadge, o as EmptyState, s as ErrorState, v as formatDateShort, x as slaFrom } from "./primitives-D_cbw-Qc.mjs";
import { t as AppShell } from "./AppShell-DH0Q_t2L.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-IKAUB8MS.mjs";
import { t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-CH9eM5Qp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DzvF29x_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function listApplications() {
	if (!supabase) return [];
	const { data, error } = await supabase.from("application_summary_view").select("*").order("submitted_at", { ascending: false });
	if (error) throw new Error(error.message);
	return data ?? [];
}
var ACTIVE_STAGES = /* @__PURE__ */ new Set([
	"extracting",
	"claims_ready",
	"screened",
	"diligence_running",
	"evidence_ready",
	"memo_draft"
]);
function ApplicationsPage() {
	const { session } = useAuth();
	const query = useQuery({
		queryKey: ["applications", session?.user.id],
		queryFn: listApplications
	});
	const [search, setSearch] = (0, import_react.useState)("");
	const [stage, setStage] = (0, import_react.useState)("all");
	const [rec, setRec] = (0, import_react.useState)("all");
	const [sla, setSla] = (0, import_react.useState)("all");
	const rows = query.data ?? [];
	const kpis = (0, import_react.useMemo)(() => {
		return {
			total: rows.length,
			active: rows.filter((r) => ACTIVE_STAGES.has(r.current_stage)).length,
			memoReady: rows.filter((r) => r.current_stage === "memo_ready").length,
			approaching: rows.filter((r) => {
				const s = slaFrom(r.decision_deadline);
				return s.urgent || s.overdue;
			}).length
		};
	}, [rows]);
	const stages = (0, import_react.useMemo)(() => Array.from(new Set(rows.map((r) => r.current_stage))).sort(), [rows]);
	const filtered = (0, import_react.useMemo)(() => {
		const q = search.trim().toLowerCase();
		return rows.filter((r) => {
			if (q && !r.company_name.toLowerCase().includes(q) && !r.application_id.toLowerCase().includes(q)) return false;
			if (stage !== "all" && r.current_stage !== stage) return false;
			if (rec !== "all" && (r.recommendation ?? "") !== rec) return false;
			if (sla !== "all") {
				const s = slaFrom(r.decision_deadline);
				if (sla === "overdue" && !s.overdue) return false;
				if (sla === "urgent" && !(s.urgent && !s.overdue)) return false;
				if (sla === "ontrack" && (s.urgent || s.overdue)) return false;
			}
			return true;
		});
	}, [
		rows,
		search,
		stage,
		rec,
		sla
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		breadcrumbs: [{ label: "Deal Flow" }],
		pageActions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "outline",
			size: "sm",
			onClick: () => void query.refetch(),
			disabled: query.isFetching,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: cn("h-3.5 w-3.5", query.isFetching && "animate-spin") }), "Refresh"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			size: "sm",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/applications/new",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), "New application"]
			})
		})] }),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: "Deal Flow"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Review incoming applications, monitor diligence, and act on committee-ready deals."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Total applications",
							value: kpis.total,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-4 w-4" }),
							tone: "primary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Active diligence",
							value: kpis.active,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }),
							tone: "info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Memo ready",
							value: kpis.memoReady,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }),
							tone: "success"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KpiCard, {
							label: "Approaching deadline",
							value: kpis.approaching,
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" }),
							tone: "warning"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					title: "Applications",
					description: "All applications from the authenticated summary view.",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px_180px_180px]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: search,
									onChange: (e) => setSearch(e.target.value),
									placeholder: "Search company or application ID…",
									className: "pl-8",
									"aria-label": "Search applications"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: stage,
								onValueChange: setStage,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Filter by stage",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Stage" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All stages"
								}), stages.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: s,
									className: "capitalize",
									children: s.replaceAll("_", " ")
								}, s))] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: rec,
								onValueChange: setRec,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Filter by recommendation",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Recommendation" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "All recommendations"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "invest",
										children: "Invest"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "needs_more_info",
										children: "Needs more info"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "pass",
										children: "Pass"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: sla,
								onValueChange: setSla,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"aria-label": "Filter by SLA",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "SLA state" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: "All SLA states"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "overdue",
										children: "Overdue"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "urgent",
										children: "Approaching"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "ontrack",
										children: "On track"
									})
								] })]
							})
						]
					}), query.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, { rows: 6 }) : query.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { error: query.error }) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No applications yet",
						description: "New applications will appear here.",
						action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/applications/new",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New application"]
							})
						})
					}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						title: "No matches",
						description: "Try clearing filters or search."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "-mx-5 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
							className: "text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Company" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stage" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Recommendation" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "text-right",
									children: "Score"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
									className: "w-[180px]",
									children: "Evidence coverage"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Submitted" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Deadline" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "SLA" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filtered.map((r) => {
							const sla = slaFrom(r.decision_deadline);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "group",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "min-w-[220px]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: "/applications/$id",
											params: { id: r.application_id },
											className: "block",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium text-foreground group-hover:text-primary",
												children: r.company_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", {
												className: "text-[10px] text-muted-foreground/80",
												title: r.application_id,
												children: [r.application_id.slice(0, 8), "…"]
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: r.current_stage }) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										value: r.recommendation,
										kind: "recommendation"
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScorePill, { value: r.investment_score })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "min-w-[180px]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoverageBar, { value: r.calculated_evidence_coverage })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "whitespace-nowrap text-xs text-muted-foreground tabular",
										children: formatDateShort(r.submitted_at)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "whitespace-nowrap text-xs text-muted-foreground tabular",
										children: formatDateShort(r.decision_deadline)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("text-xs font-medium tabular", sla.overdue && "text-destructive", sla.urgent && !sla.overdue && "text-warning", !sla.urgent && !sla.overdue && "text-muted-foreground"),
										children: sla.label
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "sm",
											asChild: true,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/applications/$id",
												params: { id: r.application_id },
												children: ["Open ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5" })]
											})
										})
									})
								]
							}, r.application_id);
						}) })] })
					})]
				})
			]
		})
	});
}
//#endregion
export { ApplicationsPage as component };
