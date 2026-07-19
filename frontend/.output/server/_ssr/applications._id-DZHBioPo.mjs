import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications._id-DZHBioPo.js
var $$splitComponentImporter = () => import("./applications._id-BzrICi9i.mjs");
var Route = createFileRoute("/applications/$id")({
	head: ({ params }) => ({ meta: [{ title: `Application ${params.id.slice(0, 8)} — VC Mind` }, {
		name: "description",
		content: "Diligence workspace: pipeline, claims and evidence, scoring, memo, information requests, and decision."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var TERMINAL_STAGES = /* @__PURE__ */ new Set([
	"memo_ready",
	"approved",
	"passed",
	"needs_more_info",
	"failed"
]);
var shouldPoll = (stage) => Boolean(stage && !TERMINAL_STAGES.has(stage));
//#endregion
export { TERMINAL_STAGES as n, shouldPoll as r, Route as t };
