globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/assets/applications-Dple7UAY.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8ae-UnWi8i0sptZ3JiYIa0Ucx8oBh6M\"",
		"mtime": "2026-07-19T13:46:50.521Z",
		"size": 2222,
		"path": "../public/assets/applications-Dple7UAY.js"
	},
	"/assets/applications.new-D9DlkI8a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"384f-UiHq1s0ZTmdDPwCkVSmsZjnktJ4\"",
		"mtime": "2026-07-19T13:46:50.538Z",
		"size": 14415,
		"path": "../public/assets/applications.new-D9DlkI8a.js"
	},
	"/assets/applications._id-Ds-OBWqi.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c890-5JZKkqqAyQa3rgFdxYmtotVoC0U\"",
		"mtime": "2026-07-19T13:46:50.521Z",
		"size": 51344,
		"path": "../public/assets/applications._id-Ds-OBWqi.js"
	},
	"/assets/diligence._token-p8jkDtL9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"113f-Sp4ry8v6SDMYLARWu2DSmdqf6t0\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 4415,
		"path": "../public/assets/diligence._token-p8jkDtL9.js"
	},
	"/assets/button-D91xwDLw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"15200-OV6FMOWfNKlYMZoJ+dDjNO31YRU\"",
		"mtime": "2026-07-19T13:46:50.538Z",
		"size": 86528,
		"path": "../public/assets/button-D91xwDLw.js"
	},
	"/assets/diligence._token-BktGeY_V.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"237-b8pmrz2aDDu3s66QNCA+fO1Tdvo\"",
		"mtime": "2026-07-19T13:46:50.538Z",
		"size": 567,
		"path": "../public/assets/diligence._token-BktGeY_V.js"
	},
	"/assets/lazyRouteComponent-BoXPzrqX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"117d-gWhNt/mECjtAYUFdomstHZFL/vE\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 4477,
		"path": "../public/assets/lazyRouteComponent-BoXPzrqX.js"
	},
	"/assets/applications._id-DJxO0_VE.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3b4-5ZjO/RforPS6lRJOYJy970nMZhE\"",
		"mtime": "2026-07-19T13:46:50.521Z",
		"size": 948,
		"path": "../public/assets/applications._id-DJxO0_VE.js"
	},
	"/assets/primitives-fscQ-GKh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"45c7-hYPxprVQs4DJigoVcCLdWydeYzA\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 17863,
		"path": "../public/assets/primitives-fscQ-GKh.js"
	},
	"/assets/AuthProvider-GoH4ov0n.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34e09-hrdfff9jyEaMedAbi2DmCYnnzOI\"",
		"mtime": "2026-07-19T13:46:50.521Z",
		"size": 216585,
		"path": "../public/assets/AuthProvider-GoH4ov0n.js"
	},
	"/assets/index-DDvRQEmB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"46eda-qbgHcxhlcpxpcWwzvfk1IXXZ8/4\"",
		"mtime": "2026-07-19T13:46:50.521Z",
		"size": 290522,
		"path": "../public/assets/index-DDvRQEmB.js"
	},
	"/assets/dist-COspZG33.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1548e-ETkGkVIs/ndQ1vtmdQ4FuKZs3jY\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 87182,
		"path": "../public/assets/dist-COspZG33.js"
	},
	"/assets/select-Cgy3KxnZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5606-wHkW77Dtm2NAxUyGLt8uplzModw\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 22022,
		"path": "../public/assets/select-Cgy3KxnZ.js"
	},
	"/assets/routes-BTaXyOHN.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2095-51jN404G23fGjpMlNc4au8OUldo\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 8341,
		"path": "../public/assets/routes-BTaXyOHN.js"
	},
	"/assets/table-CU_Stj8z.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"757-gYp+nZSwnKgD+XOwn41IvkHAp/M\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 1879,
		"path": "../public/assets/table-CU_Stj8z.js"
	},
	"/assets/styles-bI-nCkqp.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"16e0e-eMRLdM/gNAArKrMUyH1VTJ3wCuY\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 93710,
		"path": "../public/assets/styles-bI-nCkqp.css"
	},
	"/assets/textarea-CpBFttq0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1df-8PzdUypu+SFfjXkvmHhO69RL4qk\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 479,
		"path": "../public/assets/textarea-CpBFttq0.js"
	},
	"/assets/useNavigate-D8t6yA_4.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"bc-UFi8hE5rECwADeDkiGOEr4Gpi8w\"",
		"mtime": "2026-07-19T13:46:50.539Z",
		"size": 188,
		"path": "../public/assets/useNavigate-D8t6yA_4.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_l262D3 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_l262D3
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
