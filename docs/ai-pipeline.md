# AI pipeline

The reasoning layer uses Groq Chat Completions. `llama-3.1-8b-instant` handles extraction, screening, diligence, verification, and information requests; `llama-3.3-70b-versatile` handles memo synthesis and acts as fallback when the 8B request or validation fails.

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

All system prompts identify documents and web content as untrusted quoted evidence and prohibit following embedded instructions. Search result URLs must originate from Tavily, pass HTTP(S) validation, and be canonicalized before storage. Verification selections must reference an existing source ID and quote text exactly present in its retained snapshot. Missing public evidence remains `unverified`, never `contradicted`.

Claim extraction preserves source pages/excerpts and rejects references that cannot be matched to stored page text. Weighted evidence coverage is persisted after verification and before scoring. Deterministic thesis failures cap thesis fit and cannot be overridden. A contradicted high-importance claim prevents INVEST and triggers PASS. Official scores and recommendations are calculated in application code. Memo safety rejects recommendation drift, unknown claim IDs, and numerical tokens absent from structured input. The skeptic performs no new research and cannot change scores.

After skeptic review and memo revision, `validate_citations` runs without an AI call. For each evaluated claim referenced by the current memo, it verifies that stored evidence belongs to the claim, resolves to a retained HTTP(S) source, and contains an excerpt present in the retrieved snapshot after lowercase/whitespace normalization. Invalid claims are downgraded to `unverified`, coverage is recomputed, and deduplicated findings are appended to `memos.validation_flags`. The memo is not regenerated.

The selected Llama models use Groq JSON Object Mode rather than constrained `json_schema` mode. The requested JSON Schema is embedded in the system instruction and every result is validated by Zod; invalid 8B output falls back to the 70B model. Other limitations: there is no OCR or content retrieval beyond text returned by Tavily. Prompts need production evaluation before regulated use.
