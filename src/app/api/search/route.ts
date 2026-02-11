import { NextRequest, NextResponse } from "next/server";

interface ExaResult {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
}

interface ExaResponse {
  results: ExaResult[];
}

async function searchExa(
  query: string,
  category: string,
  searchType: string = "auto"
): Promise<ExaResponse> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) {
    throw new Error("EXA_API_KEY is not set");
  }

  const categoryConfigs: Record<
    string,
    { query: string; numResults: number; type: string; category?: string; includeDomains?: string[] }
  > = {
    research: {
      query: `academic research papers about ${query}`,
      numResults: 6,
      type: "auto",
      category: "research paper",
    },
    news: {
      query: `biotech pharma news clinical trials funding ${query}`,
      numResults: 6,
      type: "auto",
      category: "news",
    },
    patents: {
      query: `patent: ${query}`,
      numResults: 6,
      type: "auto",
      includeDomains: [
        "patents.google.com",
        "patentscope.wipo.int",
        "worldwide.espacenet.com",
        "ppubs.uspto.gov",
        "patents.justia.com",
        "freepatentsonline.com",
      ],
    },
    companies: {
      query: `biotech pharmaceutical company working on ${query}`,
      numResults: 6,
      type: "auto",
      category: "company",
    },
  };

  const config = categoryConfigs[category];

  const body: Record<string, unknown> = {
    query: config.query,
    numResults: config.numResults,
    type: searchType,
    contents: {
      text: { maxCharacters: 300 },
      highlights: { numSentences: 1 },
    },
  };

  if (config.category) {
    body.category = config.category;
  }

  if (config.includeDomains) {
    body.includeDomains = config.includeDomains;
  }

  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`Exa API error for ${category}:`, errorText);
    return { results: [] };
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const { query, deep } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const searchType = deep ? "deep" : "auto";

    const [research, news, patents, companies] = await Promise.all([
      searchExa(query, "research", searchType),
      searchExa(query, "news", searchType),
      searchExa(query, "patents", searchType),
      searchExa(query, "companies", searchType),
    ]);

    return NextResponse.json({
      research: research.results,
      news: news.results,
      patents: patents.results,
      companies: companies.results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed. Check your EXA_API_KEY." },
      { status: 500 }
    );
  }
}
