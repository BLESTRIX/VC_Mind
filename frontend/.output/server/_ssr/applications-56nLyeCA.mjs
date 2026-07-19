import { n as apiRequest } from "./button-BH9lIckK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/applications-56nLyeCA.js
var applicationsApi = {
	get: (id) => apiRequest(`/api/applications/${id}`),
	status: (id) => apiRequest(`/api/applications/${id}/status`),
	create: (payload) => apiRequest("/api/applications", {
		method: "POST",
		body: JSON.stringify(payload)
	}),
	remove: (id) => apiRequest(`/api/applications/${id}`, { method: "DELETE" }),
	uploadDeck: (id, file) => {
		const body = new FormData();
		body.append("file", file);
		return apiRequest(`/api/applications/${id}/pitch-deck`, {
			method: "POST",
			body
		});
	},
	run: (id) => apiRequest(`/api/applications/${id}/run-diligence`, { method: "POST" }),
	cancel: (id) => apiRequest(`/api/applications/${id}/cancel-diligence`, { method: "POST" }),
	resume: (id) => apiRequest(`/api/applications/${id}/resume`, { method: "POST" }),
	claims: (id) => apiRequest(`/api/applications/${id}/claims`),
	evidence: (id) => apiRequest(`/api/applications/${id}/evidence`),
	scores: (id) => apiRequest(`/api/applications/${id}/scores`),
	scoreFactors: (id) => apiRequest(`/api/applications/${id}/score-factors`),
	sla: (id) => apiRequest(`/api/applications/${id}/sla`),
	modelRuns: (id) => apiRequest(`/api/applications/${id}/model-runs`),
	memos: (id) => apiRequest(`/api/applications/${id}/memos`),
	requests: (id) => apiRequest(`/api/applications/${id}/information-requests`),
	decisions: (id) => apiRequest(`/api/applications/${id}/decisions`),
	decide: (id, payload) => apiRequest(`/api/applications/${id}/decisions`, {
		method: "POST",
		body: JSON.stringify(payload)
	}),
	theses: () => apiRequest("/api/thesis"),
	privateDocuments: (id) => apiRequest(`/api/applications/${id}/private-documents`),
	reconciliations: (id) => apiRequest(`/api/applications/${id}/reconciliations`),
	closingReadiness: (id) => apiRequest(`/api/applications/${id}/closing-readiness`),
	createDiligenceAccess: (id, expiresInHours = 168) => apiRequest(`/api/applications/${id}/diligence-access`, {
		method: "POST",
		body: JSON.stringify({ expiresInHours })
	}),
	revokeDiligenceAccess: (id) => apiRequest(`/api/applications/${id}/diligence-access/revoke`, { method: "POST" }),
	reconcile: (id) => apiRequest(`/api/applications/${id}/reconcile`, { method: "POST" }),
	reunderwrite: (id) => apiRequest(`/api/applications/${id}/reunderwrite`, { method: "POST" }),
	updateClosingItem: (id, itemId, payload) => apiRequest(`/api/applications/${id}/closing-checklist/${itemId}`, {
		method: "PATCH",
		body: JSON.stringify(payload)
	})
};
//#endregion
export { applicationsApi as t };
