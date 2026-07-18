# AI pipeline

The reasoning layer uses one provider: OpenAI Responses API. `AI_MODEL_FAST` handles extraction, screening, diligence, verification, and information requests; `AI_MODEL_STRONG` handles memo synthesis, skeptic review, and revision. Current example values are `gpt-5.6-luna` and `gpt-5.6-sol`, but deployment configuration controls both.

Every call uses strict JSON-schema output plus a second Zod validation pass. `model_runs` stores provider/model, prompt version, hashes, token/latency metadata, completion status, and failures. Prompts are source-controlled in `src/ai/prompt-registry.ts`:

- `claim-extraction:v1`
- `thesis-screening:v1`
- `founder-diligence:v1`
- `market-diligence:v1`
- `traction-diligence:v1`
- `product-diligence:v1`
- `claim-verification:v1`
- `memo-generation:v1`
- `skeptic-review:v1`
- `memo-revision:v1`
- `information-requests:v1`

All system prompts identify documents and web content as untrusted quoted evidence and prohibit following embedded instructions. Search result URLs must originate from Brave, pass HTTP(S) validation, and be canonicalized before storage. Verification selections must reference an existing source ID and quote text exactly present in its retained snapshot. Missing public evidence remains `unverified`, never `contradicted`.

Claim extraction preserves source pages/excerpts and rejects references that cannot be matched to stored page text. Deterministic thesis failures cap thesis fit and cannot be overridden. Official scores and recommendations are calculated in application code. Memo safety rejects recommendation drift, unknown claim IDs, and numerical tokens absent from structured input. The skeptic performs no new research and cannot change scores.

Limitations: there is no OCR, semantic URL fetcher beyond content returned by Brave, or secondary provider fallback. Prompts need production evaluation and snapshot pinning before regulated use.
