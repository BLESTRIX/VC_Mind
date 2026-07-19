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
  Thesis,
} from "./types";

export const applicationsApi = {
  get: (id: string) => apiRequest<Application>(`/api/applications/${id}`),
  status: (id: string) => apiRequest<ApplicationStatus>(`/api/applications/${id}/status`),
  create: (payload: CreateApplicationPayload) =>
    apiRequest<{ applicationId: string }>("/api/applications", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  uploadDeck: (id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return apiRequest(`/api/applications/${id}/pitch-deck`, { method: "POST", body });
  },
  run: (id: string) => apiRequest(`/api/applications/${id}/run-diligence`, { method: "POST" }),
  resume: (id: string) => apiRequest(`/api/applications/${id}/resume`, { method: "POST" }),
  claims: (id: string) => apiRequest<Claim[]>(`/api/applications/${id}/claims`),
  evidence: (id: string) => apiRequest<Evidence[]>(`/api/applications/${id}/evidence`),
  scores: (id: string) => apiRequest<Score[]>(`/api/applications/${id}/scores`),
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
};
