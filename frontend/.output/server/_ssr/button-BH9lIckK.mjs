import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime, M as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-BH9lIckK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ApiError = class extends Error {
	status;
	code;
	requestId;
	details;
	constructor(message, status, code, requestId, details) {
		super(message);
		this.status = status;
		this.code = code;
		this.requestId = requestId;
		this.details = details;
	}
};
var accessToken;
var lastDebug = null;
var listeners = /* @__PURE__ */ new Set();
var setApiAccessToken = (token) => {
	accessToken = token;
};
var getDebugEntry = () => lastDebug;
var subscribeDebug = (listener) => {
	listeners.add(listener);
	return () => listeners.delete(listener);
};
var publish = (entry) => {
	lastDebug = entry;
	listeners.forEach((listener) => listener());
};
async function apiRequest(path, options = {}) {
	const base = "".replace(/\/$/, "");
	const headers = new Headers(options.headers);
	if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
	if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
	const method = options.method ?? "GET";
	let response;
	try {
		response = await fetch(`${base}${path}`, {
			...options,
			headers
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "Network request failed";
		publish({
			method,
			path,
			status: 0,
			message,
			response: { message }
		});
		throw new ApiError(message, 0);
	}
	const text = await response.text();
	let body = null;
	try {
		body = text ? JSON.parse(text) : null;
	} catch {
		body = text;
	}
	const errorBody = body ?? {};
	publish({
		method,
		path,
		status: response.status,
		...errorBody.error?.code ? { errorCode: errorBody.error.code } : {},
		...errorBody.error?.message ? { message: errorBody.error.message } : {},
		...errorBody.error?.requestId ? { requestId: errorBody.error.requestId } : {},
		response: body
	});
	if (!response.ok) throw new ApiError(errorBody.error?.message ?? `Request failed with HTTP ${response.status}`, response.status, errorBody.error?.code, errorBody.error?.requestId, errorBody.error?.details);
	return body;
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			success: "bg-success text-success-foreground shadow-sm hover:bg-success/90"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
//#endregion
export { getDebugEntry as a, cn as i, apiRequest as n, setApiAccessToken as o, buttonVariants as r, subscribeDebug as s, Button as t };
