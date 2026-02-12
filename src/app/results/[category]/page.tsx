"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

interface Result {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
}

function BookOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function NewspaperIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode }> = {
  research: { label: "Research", icon: <BookOpenIcon /> },
  news: { label: "Pipeline & News", icon: <NewspaperIcon /> },
  patents: { label: "Patents", icon: <ShieldIcon /> },
  companies: { label: "Companies", icon: <BuildingIcon /> },
};

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "shrink-0"}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded hover:bg-secondary/50 transition-colors"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SkeletonDetailCard() {
  return (
    <div className="border border-border rounded-none p-6">
      <div className="skeleton h-5 w-3/4 mb-3" />
      <div className="skeleton h-3 w-1/3 mb-4" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="skeleton h-4 w-1/4 mb-2" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-5/6" />
    </div>
  );
}

function isDateString(s: string) {
  return /^\d{4}[-/]/.test(s) || /^\w+ \d{1,2},? \d{4}/.test(s) || !isNaN(Date.parse(s)) && /\d{4}/.test(s) && !/[a-zA-Z]{3,}/.test(s.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi, ''));
}

function getPatentOwner(author?: string): string {
  if (!author) return "";
  const trimmed = author.trim();
  if (!trimmed || isDateString(trimmed)) return "";
  return trimmed;
}

function DetailCard({ r, category }: { r: Result; category: string }) {
  const source = r.url ? new URL(r.url).hostname.replace("www.", "") : "";
  const date = r.publishedDate
    ? new Date(r.publishedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
  const isPatent = category === "patents";
  const patentOwner = isPatent ? getPatentOwner(r.author) : "";
  const summaryText = r.summary || r.text;

  return (
    <div className="border border-border rounded-none p-6 hover:bg-secondary/30 transition-colors">
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[15px] font-semibold font-mono leading-snug hover:text-primary transition-colors block mb-2"
      >
        {r.title}
      </a>

      <p className="text-xs text-muted-foreground mb-2">
        {source}
        {date && <> &middot; {date}</>}
      </p>

      {isPatent && patentOwner && (
        <p className="text-xs font-medium text-primary mb-3">
          Owner: {patentOwner}
        </p>
      )}
      {!isPatent && r.author && (
        <p className="text-xs text-muted-foreground mb-3">
          {r.author}
        </p>
      )}

      {summaryText && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Summary
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            {summaryText}
          </p>
        </div>
      )}

      {r.highlights && r.highlights.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Key Takeaway
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            {r.highlights[0]}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <CopyButton text={[r.title, summaryText, r.highlights?.[0]].filter(Boolean).join("\n\n")} />
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded hover:bg-secondary/50 transition-colors"
        >
          <ExternalLinkIcon />
          Open source
        </a>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const category = params.category as string;
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const meta = CATEGORY_META[category];

  useEffect(() => {
    if (!query || !meta) return;

    async function fetchDetail() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/search/detail?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Search failed");
        }
        const data = await res.json();
        setResults(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [query, category, meta]);

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Unknown category.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-border shrink-0">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="text-xl font-semibold font-mono">Snipper</span>
        </a>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium">
          Powered by Exa
        </span>
      </header>

      <section className="px-6 md:px-12 py-8">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeftIcon />
          Back to results
        </button>
        <div className="mb-1 flex items-center gap-2.5">
          <span className="text-primary">{meta.icon}</span>
          <h1 className="text-2xl font-bold font-mono">{meta.label}</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Results for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          {!loading && <> &middot; {results.length} sources</>}
        </p>

        {error && (
          <p className="text-sm text-red-400 mb-6">{error}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <SkeletonDetailCard key={i} />
              ))
            : results.map((r, i) => <DetailCard key={i} r={r} category={category} />)}
          {!loading && results.length === 0 && !error && (
            <p className="text-muted-foreground text-sm py-8 text-center">
              No results found.
            </p>
          )}
        </div>
      </section>

      <footer className="flex items-center justify-center h-12 border-t border-border mt-auto shrink-0">
        <p className="text-xs text-muted-foreground">
          Your private intellectual property researcher, available 24/7
        </p>
      </footer>
    </div>
  );
}
