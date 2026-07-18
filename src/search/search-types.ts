export type SearchInput = { query: string; maxResults: number; includeDomains?: string[]; excludeDomains?: string[]; timeoutMs?: number };
export type SearchResult = { title: string; url: string; domain: string; snippet?: string; content?: string; publishedAt?: string; rank: number };
export type SearchResponse = { results: SearchResult[] };
export interface SearchProvider { search(input: SearchInput): Promise<SearchResponse> }
