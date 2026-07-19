import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as apiRequest, t as Button } from "./button-DLX5oFRp.mjs";
import { _ as formatDate, m as StatusBadge } from "./primitives-D_cbw-Qc.mjs";
import { t as Textarea } from "./textarea-0kXJXAMo.mjs";
import { r as useQueryClient, t as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as Route } from "./diligence._token-C0VoXBYe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/diligence._token-CyGdi0Pf.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var diligenceApi = {
	get: (token) => apiRequest(`/api/diligence/${encodeURIComponent(token)}`),
	upload: (token, requestId, documentType, file) => {
		const body = new FormData();
		body.append("requestId", requestId);
		body.append("documentType", documentType);
		body.append("file", file);
		return apiRequest(`/api/diligence/${encodeURIComponent(token)}/documents`, {
			method: "POST",
			body
		});
	},
	respond: (token, requestId, responseText) => apiRequest(`/api/diligence/${encodeURIComponent(token)}/responses`, {
		method: "POST",
		body: JSON.stringify({
			requestId,
			responseText
		})
	})
};
function FounderDiligencePortal() {
	const { token } = Route.useParams();
	const qc = useQueryClient();
	const portal = useQuery({
		queryKey: ["founder-diligence", token],
		queryFn: () => diligenceApi.get(token),
		refetchInterval: 5e3,
		retry: false
	});
	const [busy, setBusy] = (0, import_react.useState)("");
	const [messages, setMessages] = (0, import_react.useState)({});
	const refresh = () => qc.invalidateQueries({ queryKey: ["founder-diligence", token] });
	if (portal.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading secure diligence requests…"
		})
	});
	if (portal.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md rounded-lg border bg-card p-6 text-center",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-semibold",
				children: "This access link is unavailable"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted-foreground",
				children: "It may be invalid, expired, or revoked. Ask your investor contact for a new link."
			})]
		})
	});
	const data = portal.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-muted/30 px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm font-semibold",
						children: "VC Mind · Secure diligence portal"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-2 text-2xl font-semibold",
						children: ["Information requests for ", data.application.companyName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Upload only the documents requested below. Files are stored privately and reviewed by the assigned investment team."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [data.requests.map((r) => {
					const doc = data.submissions.documents.find((d) => d.information_request_id === r.id);
					const responded = data.submissions.responses.some((x) => x.information_request_id === r.id);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-lg border bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-medium",
									children: r.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: r.description
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: doc?.processing_status ?? (responded ? "submitted" : r.status) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 text-xs text-muted-foreground",
								children: [
									"Required type: ",
									r.requested_document_type?.replaceAll("_", " ") ?? "text response or other document",
									" · Due: ",
									r.due_at ? formatDate(r.due_at) : "No due date"
								]
							}),
							r.requested_document_type && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									"aria-label": `Upload ${r.title}`,
									type: "file",
									accept: ".pdf,.csv,.xlsx",
									disabled: busy === r.id,
									onChange: async (e) => {
										const file = e.target.files?.[0];
										if (!file) return;
										setBusy(r.id);
										setMessages((m) => ({
											...m,
											[r.id]: ""
										}));
										try {
											await diligenceApi.upload(token, r.id, r.requested_document_type, file);
											setMessages((m) => ({
												...m,
												[r.id]: "Upload received and queued for secure processing."
											}));
											await refresh();
										} catch (err) {
											setMessages((m) => ({
												...m,
												[r.id]: err instanceof Error ? err.message : "Upload failed."
											}));
										} finally {
											setBusy("");
										}
									}
								}), doc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2 text-xs",
									children: [
										doc.original_filename,
										" · ",
										doc.processing_status
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
								className: "mt-4 space-y-2",
								onSubmit: async (e) => {
									e.preventDefault();
									const form = new FormData(e.currentTarget);
									const response = String(form.get("response") ?? "");
									setBusy(r.id);
									try {
										await diligenceApi.respond(token, r.id, response);
										setMessages((m) => ({
											...m,
											[r.id]: "Response submitted."
										}));
										await refresh();
									} catch (err) {
										setMessages((m) => ({
											...m,
											[r.id]: err instanceof Error ? err.message : "Submission failed."
										}));
									} finally {
										setBusy("");
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									name: "response",
									maxLength: 1e4,
									placeholder: "Optional text response"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									disabled: busy === r.id,
									children: "Submit response"
								})]
							}),
							messages[r.id] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								role: "status",
								className: "mt-3 text-xs text-primary",
								children: messages[r.id]
							})
						]
					}, r.id);
				}), !data.requests.length && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-lg border bg-card p-6 text-sm text-muted-foreground",
					children: "There are no open information requests."
				})]
			})]
		})
	});
}
//#endregion
export { FounderDiligencePortal as component };
