import { apiRequest } from "./client";
import type {
  Application,
  ApplicationStatus,
  Claim,
  CreateApplicationPayload,
  Decision,
  Evidence,
  InformationRequest,
  Memo,
  Score,
  ScoreFactor, ApplicationSLA, AIModelRun,
  Thesis,
  PrivateDocument, Reconciliation, ClosingReadiness, ClosingItem,
} from "./types";

export const applicationsApi = {
  get: (id: string) => apiRequest<Application>(`/api/applications/${id}`),
  status: (id: string) => apiRequest<ApplicationStatus>(`/api/applications/${id}/status`),
  create: (payload: CreateApplicationPayload) =>
    apiRequest<{ applicationId: string }>("/api/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) => apiRequest<void>(`/api/applications/${id}`, { method: "DELETE" }),
  uploadDeck: (id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiRequest(`/api/applications/${id}/pitch-deck`, { method: "POST", body });
  },
  run: (id: string) => apiRequest(`/api/applications/${id}/run-diligence`, { method: "POST" }),
  cancel: (id: string) => apiRequest<{ applicationId: string; status: "cancelled"; cancelledJobs: number }>(`/api/applications/${id}/cancel-diligence`, { method: "POST" }),
  resume: (id: string) => apiRequest(`/api/applications/${id}/resume`, { method: "POST" }),
  claims: (id: string) => apiRequest<Claim[]>(`/api/applications/${id}/claims`),
  evidence: (id: string) => apiRequest<Evidence[]>(`/api/applications/${id}/evidence`),
  scores: (id: string) => apiRequest<Score[]>(`/api/applications/${id}/scores`),
  scoreFactors:(id:string)=>apiRequest<ScoreFactor[]>(`/api/applications/${id}/score-factors`),
  sla:(id:string)=>apiRequest<ApplicationSLA>(`/api/applications/${id}/sla`),
  modelRuns:(id:string)=>apiRequest<AIModelRun[]>(`/api/applications/${id}/model-runs`),
  memos: (id: string) => apiRequest<Memo[]>(`/api/applications/${id}/memos`),
  requests: (id: string) =>
    apiRequest<InformationRequest[]>(`/api/applications/${id}/information-requests`),
  decisions: (id: string) => apiRequest<Decision[]>(`/api/applications/${id}/decisions`),
  decide: (id: string, payload: { memoId?: string; decision: string; reason: string }) =>
    apiRequest<Decision>(`/api/applications/${id}/decisions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  theses: () => apiRequest<Thesis[]>("/api/thesis"),
  privateDocuments:(id:string)=>apiRequest<PrivateDocument[]>(`/api/applications/${id}/private-documents`),
  reconciliations:(id:string)=>apiRequest<Reconciliation[]>(`/api/applications/${id}/reconciliations`),
  closingReadiness:(id:string)=>apiRequest<ClosingReadiness>(`/api/applications/${id}/closing-readiness`),
  createDiligenceAccess:(id:string,expiresInHours=168)=>apiRequest<{token:string;expiresAt:string}>(`/api/applications/${id}/diligence-access`,{method:'POST',body:JSON.stringify({expiresInHours})}),
  revokeDiligenceAccess:(id:string)=>apiRequest<{revoked:number}>(`/api/applications/${id}/diligence-access/revoke`,{method:'POST'}),
  reconcile:(id:string)=>apiRequest(`/api/applications/${id}/reconcile`,{method:'POST'}),
  reunderwrite:(id:string)=>apiRequest(`/api/applications/${id}/reunderwrite`,{method:'POST'}),
  updateClosingItem:(id:string,itemId:string,payload:Partial<ClosingItem>)=>apiRequest(`/api/applications/${id}/closing-checklist/${itemId}`,{method:'PATCH',body:JSON.stringify(payload)}),
};
