import { n as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { i as cn, o as setApiAccessToken, t as Button } from "./button-BH9lIckK.mjs";
import { C as EyeOff, D as CircleCheck, N as ChartColumn, O as CircleAlert, S as Eye, _ as LoaderCircle, g as LockKeyhole, s as ShieldCheck, x as FileSearch } from "../_libs/lucide-react.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as Root } from "../_libs/radix-ui__react-label.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AuthProvider-fTIyLLZ0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var url = "https://ebguudnizlhvetqmrvfk.supabase.co";
var anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViZ3V1ZG5pemxodmV0cW1ydmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTc5OTQsImV4cCI6MjA5OTk3Mzk5NH0.9Mo3Vbb0icg2hIGGpNNFxEmwSDGtC7t3rJDOW5eG8tI";
var hasSupabaseConfig = Boolean(anonKey);
var supabase = hasSupabaseConfig ? createClient(url, anonKey, { auth: {
	persistSession: true,
	autoRefreshToken: true
} }) : null;
var Input = import_react.forwardRef(({ className, type, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
		ref,
		...props
	});
});
Input.displayName = "Input";
var labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
var Label = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(labelVariants(), className),
	...props
}));
Label.displayName = Root.displayName;
var AuthContext = (0, import_react.createContext)({
	session: null,
	loading: true,
	signOut: async () => {}
});
var useAuth = () => (0, import_react.useContext)(AuthContext);
function AuthProvider({ children }) {
	const [session, setSession] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		if (!supabase) {
			setLoading(false);
			return;
		}
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setApiAccessToken(data.session?.access_token);
			setLoading(false);
		});
		const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
			setSession(nextSession);
			setApiAccessToken(nextSession?.access_token);
		});
		return () => data.subscription.unsubscribe();
	}, []);
	const value = (0, import_react.useMemo)(() => ({
		session,
		loading,
		signOut: async () => {
			await supabase?.auth.signOut();
		}
	}), [session, loading]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
var trustPoints = [
	{
		icon: FileSearch,
		title: "Evidence-led diligence",
		description: "Trace every investment claim back to its source."
	},
	{
		icon: ChartColumn,
		title: "Consistent scoring",
		description: "Evaluate opportunities against your investment thesis."
	},
	{
		icon: ShieldCheck,
		title: "Decision integrity",
		description: "Keep review history, memos, and decisions in one place."
	}
];
function SignIn() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [showPassword, setShowPassword] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		if (!supabase || busy) return;
		setBusy(true);
		setError("");
		try {
			const { error: authError } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password
			});
			if (authError) setError(authError.message);
		} catch {
			setError("We could not reach the sign-in service. Check your connection and try again.");
		} finally {
			setBusy(false);
		}
	}
	if (!hasSupabaseConfig) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfigurationRequired, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "grid min-h-dvh bg-background lg:grid-cols-[1.08fr_0.92fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandPanel, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative flex min-h-dvh items-center justify-center px-5 py-10 sm:px-10 lg:px-14",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent lg:hidden" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "w-full max-w-[420px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-9 flex items-center gap-3 lg:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold tracking-tight text-foreground",
							children: "VC Mind"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-[10px] uppercase tracking-[0.16em] text-muted-foreground",
							children: "Diligence workspace"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-7",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockKeyhole, { className: "h-3 w-3 text-primary" }), "Authorized access only"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]",
								children: "Welcome back"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-muted-foreground",
								children: "Sign in to continue to your investment workspace."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "space-y-5",
						onSubmit: submit,
						noValidate: false,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "email",
									children: "Work email"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "email",
									name: "email",
									type: "email",
									autoComplete: "email",
									inputMode: "email",
									placeholder: "you@firm.com",
									value: email,
									onChange: (event) => setEmail(event.target.value),
									disabled: busy,
									required: true,
									autoFocus: true,
									className: "h-11 bg-card px-3.5",
									"aria-describedby": error ? "sign-in-error" : void 0
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "password",
									children: "Password"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password",
										name: "password",
										type: showPassword ? "text" : "password",
										autoComplete: "current-password",
										placeholder: "Enter your password",
										value: password,
										onChange: (event) => setPassword(event.target.value),
										disabled: busy,
										required: true,
										className: "h-11 bg-card px-3.5 pr-11",
										"aria-describedby": error ? "sign-in-error" : void 0
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setShowPassword((visible) => !visible),
										disabled: busy,
										className: "absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none",
										"aria-label": showPassword ? "Hide password" : "Show password",
										children: showPassword ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
									})]
								})]
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								id: "sign-in-error",
								role: "alert",
								"aria-live": "polite",
								className: "flex gap-2.5 rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm text-destructive",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mt-0.5 h-4 w-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: error })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								size: "lg",
								className: "h-11 w-full",
								disabled: busy,
								children: busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "animate-spin" }), "Signing in…"] }) : "Sign in"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex items-center justify-center gap-2 border-t border-border pt-6 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-success" }), "Secure access for your investment team"]
					})
				]
			})]
		})]
	});
}
function BrandPanel() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "relative hidden min-h-dvh overflow-hidden bg-[oklch(0.2_0.055_265)] px-12 py-10 text-white lg:flex lg:flex-col xl:px-16 xl:py-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,oklch(0.48_0.15_265/0.34),transparent_37%),radial-gradient(circle_at_82%_86%,oklch(0.56_0.11_170/0.16),transparent_34%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 opacity-[0.055] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:40px_40px]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, { inverse: true }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-sm font-semibold tracking-tight",
					children: "VC Mind"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-[10px] uppercase tracking-[0.16em] text-white/55",
					children: "Diligence workspace"
				})] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 my-auto max-w-xl py-14",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-5 h-px w-10 bg-white/35" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "max-w-lg text-4xl font-semibold leading-[1.13] tracking-[-0.035em] xl:text-[44px]",
						children: "Investment decisions, grounded in evidence."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 max-w-lg text-[15px] leading-7 text-white/65",
						children: "A focused workspace for reviewing opportunities, validating claims, and reaching confident investment decisions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-11 grid max-w-lg gap-5",
						children: trustPoints.map(({ icon: Icon, title, description }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/12 bg-white/[0.07]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-white/80" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium text-white/95",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-0.5 text-xs leading-5 text-white/50",
								children: description
							})] })]
						}, title))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative z-10 flex items-center gap-2 text-[11px] text-white/40",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), "Built for disciplined venture diligence"]
			})
		]
	});
}
function BrandMark({ inverse = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: inverse ? "grid h-8 w-8 place-items-center rounded-md border border-white/15 bg-white/10 text-white shadow-sm" : "grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm",
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-sm font-semibold",
			children: "V"
		})
	});
}
function ConfigurationRequired() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-xl border border-border bg-card p-7 text-center shadow-sm sm:p-9",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto mb-5 w-fit",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandMark, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "Connect authentication"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm leading-6 text-muted-foreground",
					children: "VC Mind needs Supabase credentials before team members can sign in."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-left text-xs leading-5 text-warning-foreground",
					children: [
						"Configure ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "VITE_SUPABASE_URL" }),
						" and ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "VITE_SUPABASE_ANON_KEY" }),
						", then restart the frontend."
					]
				})
			]
		})
	});
}
//#endregion
export { supabase as a, SignIn as i, Input as n, useAuth as o, Label as r, AuthProvider as t };
