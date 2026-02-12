import { NextRequest, NextResponse } from "next/server";

interface ExaResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
}

interface ExaResponse {
  results: ExaResult[];
}

const categoryConfigs: Record<string, { includeDomains?: string[] }> = {
  research: {},
  news: {},
  patents: {
    includeDomains: [
      "patents.google.com",
      "patentscope.wipo.int",
      "worldwide.espacenet.com",
      "ppubs.uspto.gov",
      "patents.justia.com",
      "freepatentsonline.com",
    ],
  },
  companies: {},
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sourceUrl = searchParams.get("url");
  const category = searchParams.get("category") || "";
  const deepParam = searchParams.get("deep");
  const contextQuery = searchParams.get("q");
  const useDeepSearch = deepParam === "1";

  if (!sourceUrl) {
    return NextResponse.json(
      { error: "Source URL is required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "EXA_API_KEY is not set" },
      { status: 500 }
    );
  }

  const categoryConfig = categoryConfigs[category] ?? {};

  const body: Record<string, unknown> = {
    url: sourceUrl,
    numResults: 8,
    type: useDeepSearch ? "deep" : "auto",
    contents: {
      text: { maxCharacters: 1200 },
      highlights: { numSentences: 1 },
      summary: {
        query: contextQuery
          ? `Summarize this source in 2-3 sentences in context of: ${contextQuery}. Include one key takeaway.`
          : "Summarize this source in 2-3 sentences and include one key takeaway.",
      },
    },
  };

  if (categoryConfig.includeDomains) {
    body.includeDomains = categoryConfig.includeDomains;
  }

  try {
    const res = await fetch("https://api.exa.ai/findSimilar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Exa findSimilar error:", errorText);
      return NextResponse.json(
        { error: "Similar source search failed" },
        { status: 502 }
      );
    }

    const data: ExaResponse = await res.json();
    const filtered = data.results.filter((r) => r.url !== sourceUrl);
    return NextResponse.json({ results: filtered });
  } catch (error) {
    console.error("Similar source error:", error);
    return NextResponse.json(
      { error: "Similar source search failed" },
      { status: 500 }
    );
  }
}
