export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export async function searchWeb(query: string, limit = 6): Promise<SearchResult[]> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY is not configured.");

  const res = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ query, limit }),
  });

  const data = await res.json();
  if (!res.ok || data.success === false) {
    const message = data?.error || `Firecrawl search failed (${res.status})`;
    throw new Error(message);
  }

  return (data.data ?? []).map((r: { title?: string; url?: string; description?: string }) => ({
    title: r.title ?? "",
    url: r.url ?? "",
    description: r.description ?? "",
  }));
}
