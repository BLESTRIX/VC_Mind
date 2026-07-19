import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { a as getDebugEntry, s as subscribeDebug, t as Button } from "./button-DLX5oFRp.mjs";
import { t as AuthProvider } from "./AuthProvider-D43Xmik3.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as Route$3 } from "./applications._id-DZHBioPo.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as Route$4 } from "./diligence._token-C0VoXBYe.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CBzCD_-2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-bI-nCkqp.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	window.__lovableReportRuntimeError?.({
		message,
		stack: error instanceof Error ? error.stack : void 0,
		filename: window.location.pathname
	});
}
function DebugPanel() {
	(0, import_react.useSyncExternalStore)(subscribeDebug, getDebugEntry, () => null);
	return null;
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-semibold",
						children: "V"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-5xl font-semibold tracking-tight text-foreground tabular",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-3 text-lg font-medium text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							children: "Go to deal flow"
						})
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-dvh items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-lg font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. Try refreshing or return to deal flow."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							href: "/",
							children: "Deal flow"
						})
					})]
				})
			]
		})
	});
}
var Route$2 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "VC Mind — Venture diligence workspace" },
			{
				name: "description",
				content: "VC Mind is a venture-capital diligence workspace for reviewing applications, running AI-assisted diligence, validating claims, scoring deals, and recording investment decisions."
			},
			{
				name: "author",
				content: "VC Mind"
			},
			{
				property: "og:title",
				content: "VC Mind — Venture diligence workspace"
			},
			{
				property: "og:description",
				content: "AI-assisted VC diligence: review applications, validate claims against evidence, score deals, and record investment committee decisions."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "stylesheet",
				href: "https://rsms.me/inter/inter.css"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$2.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebugPanel, {})] })
	});
}
var $$splitComponentImporter$1 = () => import("./routes-DzvF29x_.mjs");
var Route$1 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Deal Flow — VC Mind" }, {
		name: "description",
		content: "Deal flow dashboard for venture-capital applications: active diligence, memo-ready deals, and approaching decision deadlines."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./applications.new-DL-fvcsV.mjs");
var Route = createFileRoute("/applications/new")({
	head: () => ({ meta: [{ title: "New application — VC Mind" }, {
		name: "description",
		content: "Submit a new startup application for AI-assisted VC diligence."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var rootRouteChildren = {
	IndexRoute: Route$1.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$2
	}),
	ApplicationsIdRoute: Route$3.update({
		id: "/applications/$id",
		path: "/applications/$id",
		getParentRoute: () => Route$2
	}),
	ApplicationsNewRoute: Route.update({
		id: "/applications/new",
		path: "/applications/new",
		getParentRoute: () => Route$2
	}),
	DiligenceTokenRoute: Route$4.update({
		id: "/diligence/$token",
		path: "/diligence/$token",
		getParentRoute: () => Route$2
	})
};
var routeTree = Route$2._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
