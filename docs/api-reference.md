# API reference

All endpoints except health require `Authorization: Bearer <Supabase access token>`. Worker execution instead requires `X-Worker-Token`. Errors use the standard VC Brain error object and appropriate 4xx/5xx status codes.

| Method | Endpoint | Role/purpose |
|---|---|---|
| GET | `/api/health` | Public, secret-free liveness |
| POST | `/api/applications` | Manager/admin; create company, founders, application |
| GET | `/api/applications/:id` | Authorized organization read |
| GET | `/api/applications/:id/summary` | Authorized summary view |
| POST | `/api/applications/:id/pitch-deck` | Staff multipart PDF upload |
| POST | `/api/applications/:id/run-diligence` | Staff; enqueue first stage |
| POST | `/api/applications/:id/resume` | Staff; resume/retry failed pipeline |
| GET | `/api/applications/:id/status` | Application and job status |
| GET | `/api/applications/:id/{claims,evidence,scores,memos,information-requests}` | Diligence read models |
| POST/GET | `/api/applications/:id/decisions` | Manager insert / authorized read |
| GET | `/api/jobs/:id` | Authorized job status |
| POST | `/api/jobs/:id/retry` | Retry a failed job |
| POST | `/api/jobs/run-next` | Internal worker token only |
| GET/POST | `/api/thesis` | Read/create thesis |
| GET/PATCH | `/api/thesis/:id` | Read/create a new thesis version |

Example application request:

```json
{
  "company": { "name": "Fictional Labs", "websiteUrl": "https://fictional.example" },
  "founders": [{ "fullName": "Avery Example", "role": "CEO", "isPrimaryContact": true }],
  "thesisConfigId": "20000000-0000-4000-8000-000000000001",
  "fundingAskUsd": 500000
}
```

Upload uses `multipart/form-data` with one file field. Decision body is `{ "memoId"?: uuid, "decision": "approved" | "passed" | "needs_more_info" | "conditional_approval", "reason": string }`.

Example error:

```json
{"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","requestId":"..."}}
```
