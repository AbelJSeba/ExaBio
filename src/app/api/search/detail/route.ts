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

const categoryConfigs: Record<
  string,
  { queryPrefix: string; type: string; category?: string; includeDomains?: string[] }
> = {
  research: {
    queryPrefix: "academic research papers about",
    type: "auto",
    category: "research paper",
  },
  news: {
    queryPrefix: "biotech pharma news clinical trials funding",
    type: "auto",
    category: "news",
  },
  patents: {
    queryPrefix: "patent:",
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
    queryPrefix: "biotech pharmaceutical company working on",
    type: "auto",
    category: "company",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const category = searchParams.get("category");

  if (!query || !category || !categoryConfigs[category]) {
    return NextResponse.json(
      { error: "Valid query and category are required" },
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

  const config = categoryConfigs[category];

  const body: Record<string, unknown> = {
    query: `${config.queryPrefix} ${query}`,
    numResults: 10,
    type: config.type,
    contents: {
      text: { maxCharacters: 1500 },
      highlights: { numSentences: 1 },
      summary: {
        query: `Summarize this source in 2-3 sentences related to: ${query}. Include one key takeaway.`,
      },
    },
  };

  if (config.category) {
    body.category = config.category;
  }

  if (config.includeDomains) {
    body.includeDomains = config.includeDomains;
  }

  try {
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
      return NextResponse.json(
        { error: "Search failed" },
        { status: 502 }
      );
    }

    const data: ExaResponse = await res.json();
    return NextResponse.json({ results: data.results });
  } catch (error) {
    console.error("Detail search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
