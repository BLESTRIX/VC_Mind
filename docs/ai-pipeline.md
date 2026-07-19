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

Every request now has a task-specific `max_completion_tokens` cap. A rolling in-process token limiter accounts conservatively for input, JSON Schema, and maximum output against the configured per-model TPM window. Memo, skeptic, and revision prompts use compact decision DTOs rather than raw database rows, remain valid JSON when reduced to a character budget, and never slice through a JSON document. Provider 429 responses preserve `Retry-After`; rate-limited fast-model requests wait instead of spilling into the strong-model budget.

All system prompts identify documents and web content as untrusted quoted evidence and prohibit following embedded instructions. Search result URLs must originate from Tavily, pass HTTP(S) validation, and be canonicalized before storage. Verification selections must reference an existing source ID and quote text exactly present in its retained snapshot. Missing public evidence remains `unverified`, never `contradicted`.

Claim extraction preserves source pages/excerpts and rejects references that cannot be matched to stored page text. After verification, `validate_evidence` checks ID relationships and normalized excerpts, marks each evidence row valid or invalid, recalculates claims and confidence from valid evidence only, and persists weighted coverage before scoring. Deterministic thesis failures cap thesis fit and cannot be overridden. A contradicted high- or critical-importance claim prevents INVEST and triggers PASS. Official scores and recommendations are calculated in application code. Memo safety rejects unknown claim IDs and numerical tokens absent from structured input; recommendation mismatches are corrected deterministically at finalization rather than retried through the model. The skeptic performs no new research and cannot change scores.

After skeptic review and memo revision, `validate_citations` runs without an AI call. Citations use claim, evidence, and evidence-source IDs as their database identity; URLs are display metadata only. The validator verifies ownership, source existence, prior evidence validity, and NFKC-normalized exact excerpts against retained source content. It appends deduplicated flags, records missing-snapshot fallback warnings, and reconciles the stored memo recommendation to the official deterministic recommendation. It neither invalidates an otherwise sound evidence row because of a bad memo quote nor regenerates the memo.

The selected Llama models use Groq JSON Object Mode rather than constrained `json_schema` mode. The requested JSON Schema is embedded in the system instruction and every result is validated by Zod; invalid 8B output falls back to the 70B model. Other limitations: there is no OCR or content retrieval beyond text returned by Tavily. Prompts need production evaluation before regulated use.
