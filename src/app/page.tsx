"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─── Types ──────────────────────────────────────────────────── */
interface Result {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  summary?: string;
}

interface SearchResults {
  research: Result[];
  news: Result[];
  patents: Result[];
  companies: Result[];
}

type Category = keyof SearchResults;

/* ─── Placeholder cycling ────────────────────────────────────── */
const PLACEHOLDERS = [
  "AI-powered autonomous vehicle navigation",
  "Sustainable lithium battery recycling methods",
  "Quantum error correction algorithms",
  "Natural language processing for legal contracts",
  "Carbon capture and direct air filtration",
];

function useCyclingPlaceholder() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  return PLACEHOLDERS[index];
}

/* ─── Icons (inline SVG to avoid extra deps) ─────────────────── */
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ExternalLinkIcon() {
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
      className="shrink-0 text-muted-foreground"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function BookOpenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function NewspaperIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
    </svg>
  );
}

function CrosshairIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="22" y1="12" x2="18" y2="12" />
      <line x1="6" y1="12" x2="2" y2="12" />
      <line x1="12" y1="6" x2="12" y2="2" />
      <line x1="12" y1="22" x2="12" y2="18" />
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

const CATEGORY_META: Record<Category, { label: string; icon: React.ReactNode }> = {
  research: { label: "Research", icon: <BookOpenIcon /> },
  news: { label: "Pipeline & News", icon: <NewspaperIcon /> },
  patents: { label: "Patents", icon: <ShieldIcon /> },
  companies: { label: "Companies", icon: <BuildingIcon /> },
};

/* ─── Skeleton loader ────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="px-5 py-4 border-b border-border">
      <div className="skeleton h-4 w-4/5 mb-3" />
      <div className="skeleton h-3 w-2/5 mb-2" />
      <div className="skeleton h-3 w-full" />
    </div>
  );
}

function SkeletonPanel({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-none overflow-hidden flex flex-col shadow-sm shadow-black/5">
      <div className="flex items-center gap-2.5 px-5 h-[52px] border-b border-border">
        <span className="text-primary">{icon}</span>
        <span className="text-[15px] font-semibold font-mono">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Result cards ───────────────────────────────────────────── */
function ResearchCard({ r }: { r: Result }) {
  const highlight = r.highlights?.[0] || r.text?.slice(0, 150);
  const date = r.publishedDate
    ? new Date(r.publishedDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-5 py-4 border-b border-border hover:bg-secondary/50 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug line-clamp-2">
          {r.title}
        </p>
        <ExternalLinkIcon />
      </div>
      {(r.author || date) && (
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {r.author && <>{r.author} · </>}
          {date}
        </p>
      )}
      {highlight && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {highlight}
        </p>
      )}
    </a>
  );
}

function NewsCard({ r }: { r: Result }) {
  const source = r.url ? new URL(r.url).hostname.replace("www.", "") : "";
  const date = r.publishedDate
    ? new Date(r.publishedDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";
  const summary = r.highlights?.[0] || r.text?.slice(0, 150);
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-5 py-4 border-b border-border hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium leading-snug line-clamp-2">
          {r.title}
        </p>
        <ExternalLinkIcon />
      </div>
      <p className="text-[11px] text-muted-foreground mt-1.5">
        {source}
        {date && <> · {date}</>}
      </p>
      {summary && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {summary}
        </p>
      )}
    </a>
  );
}

function isDateString(s: string) {
  return /^\d{4}[-/]/.test(s) || /^\w+ \d{1,2},? \d{4}/.test(s) || !isNaN(Date.parse(s)) && /\d{4}/.test(s) && !/[a-zA-Z]{3,}/.test(s.replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi, ''));
}

function getPatentOwner(author?: string): string {
  if (!author) return "";
  const trimmed = author.trim();
  if (!trimmed) return "";
  if (isDateString(trimmed)) return "";
  return trimmed;
}

function PatentCard({ r }: { r: Result }) {
  const assignee = getPatentOwner(r.author);
  const summary = r.highlights?.[0] || r.text?.slice(0, 150);
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-5 py-4 border-b border-border hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-semibold font-mono leading-snug line-clamp-1">
          {r.title}
        </p>
        <ExternalLinkIcon />
      </div>
      {assignee && (
        <p className="text-xs text-primary font-medium mt-1.5">Owner: {assignee}</p>
      )}
      {summary && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {summary}
        </p>
      )}
    </a>
  );
}

function CompanyCard({ r }: { r: Result }) {
  const summary = r.highlights?.[0] || r.text?.slice(0, 150);
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block px-5 py-4 border-b border-border hover:bg-secondary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold font-mono">{r.title}</p>
        <ExternalLinkIcon />
      </div>
      {summary && (
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
          {summary}
        </p>
      )}
    </a>
  );
}

function DetailSkeletonCard() {
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

function getSourceDomain(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function DetailCard({ r, category }: { r: Result; category: Category }) {
  const source = getSourceDomain(r.url);
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
  const takeaway = r.highlights?.[0];

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

      {takeaway && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-muted-foreground mb-2">
            Takeaway
          </h3>
          <p className="text-sm leading-relaxed text-foreground/90">
            {takeaway}
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Result panel ───────────────────────────────────────────── */
function ResultPanel({
  title,
  icon,
  results,
  CardComponent,
  onOpenDetail,
}: {
  title: string;
  icon: React.ReactNode;
  results: Result[];
  CardComponent: React.ComponentType<{ r: Result }>;
  onOpenDetail?: () => void;
}) {
  return (
    <div className="bg-card border border-border rounded-none overflow-hidden flex flex-col shadow-sm shadow-black/5">
      <div className="flex items-center gap-2.5 px-5 h-[52px] border-b border-border shrink-0">
        <span className="text-primary">{icon}</span>
        {onOpenDetail ? (
          <button
            type="button"
            onClick={onOpenDetail}
            className="text-[15px] font-semibold font-mono hover:text-primary transition-colors"
          >
            {title} &rarr;
          </button>
        ) : (
          <span className="text-[15px] font-semibold font-mono">{title}</span>
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {results.length} results
        </span>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">
            No results found.
          </p>
        ) : (
          results.map((r, i) => <CardComponent key={i} r={r} />)
        )}
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────── */
export default function Home() {
  const [query, setQuery] = useState("");
  const [lastSearchedQuery, setLastSearchedQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deepSearch, setDeepSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [detailResults, setDetailResults] = useState<Result[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholder = useCyclingPlaceholder();

  const search = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResults(null);
    setLastSearchedQuery(q);
    setActiveCategory(null);
    setDetailResults([]);
    setDetailError("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, deep: deepSearch }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }
      const data: SearchResults = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, [query, deepSearch]);

  const openDetail = useCallback(
    async (category: Category) => {
      if (!lastSearchedQuery) return;

      setActiveCategory(category);
      setDetailLoading(true);
      setDetailError("");
      setDetailResults([]);

      try {
        const res = await fetch(
          `/api/search/detail?q=${encodeURIComponent(lastSearchedQuery)}&category=${encodeURIComponent(category)}`
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Search failed");
        }
        const data: { results: Result[] } = await res.json();
        setDetailResults(data.results);
      } catch (err) {
        setDetailError(err instanceof Error ? err.message : "Search failed");
      } finally {
        setDetailLoading(false);
      }
    },
    [lastSearchedQuery]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") search();
    if (e.key === "Tab" && !query.trim()) {
      e.preventDefault();
      setQuery(placeholder);
    }
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showResults = results || loading;
  const activeMeta = activeCategory ? CATEGORY_META[activeCategory] : null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-primary">
            <CrosshairIcon />
          </span>
          <span className="text-xl font-semibold font-mono">
            Snipper
          </span>
        </div>
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-secondary text-xs text-muted-foreground font-medium">
          Powered by Exa
        </span>
      </header>

      {/* Hero + Search */}
      <section
        className={`flex flex-col items-center transition-all duration-500 ${
          showResults ? "py-8" : "py-16 md:py-24"
        } px-6`}
      >
        {!showResults && (
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold font-mono leading-tight text-balance">
              All relevant IP, in context, one search.
            </h1>
          </div>
        )}

        <div className="flex w-full max-w-2xl gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full h-12 pl-11 pr-4 bg-background border border-border rounded-full text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors placeholder:text-muted-foreground"
            />
          </div>
          <button
            onClick={search}
            disabled={loading || !query.trim()}
            className="h-12 px-6 bg-primary text-primary-foreground font-semibold font-mono text-sm rounded-full hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
          >
            <SearchIcon className="w-4 h-4" />
            Search
          </button>
        </div>

        <label className="flex items-center gap-2 mt-4 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={deepSearch}
            onClick={() => setDeepSearch((d) => !d)}
            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors ${
              deepSearch ? "bg-primary" : "bg-secondary"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm transition-transform ${
                deepSearch ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-xs text-muted-foreground font-medium font-mono">
            Deep search
          </span>
        </label>

        {error && (
          <p className="mt-4 text-sm text-red-400">{error}</p>
        )}
      </section>

      {/* Results */}
      {showResults && (
        <section className="flex-1 px-6 md:px-12 pb-12">
          {activeCategory && activeMeta ? (
            <div>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
              >
                <ArrowLeftIcon />
                Back to overview
              </button>

              <div className="mb-1 flex items-center gap-2.5">
                <span className="text-primary">{activeMeta.icon}</span>
                <h2 className="text-2xl font-bold font-mono">{activeMeta.label}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Results for <span className="font-medium text-foreground">&ldquo;{lastSearchedQuery}&rdquo;</span>
                {!detailLoading && <> &middot; {detailResults.length} sources</>}
              </p>

              {detailError && (
                <p className="text-sm text-red-400 mb-6">{detailError}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {detailLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <DetailSkeletonCard key={i} />
                    ))
                  : detailResults.map((r, i) => (
                      <DetailCard key={i} r={r} category={activeCategory} />
                    ))}
                {!detailLoading && detailResults.length === 0 && !detailError && (
                  <p className="text-muted-foreground text-sm py-8 text-center">
                    No results found.
                  </p>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
              <SkeletonPanel title="Research" icon={<BookOpenIcon />} />
              <SkeletonPanel title="Pipeline & News" icon={<NewspaperIcon />} />
              <SkeletonPanel title="Patents" icon={<ShieldIcon />} />
              <SkeletonPanel title="Companies" icon={<BuildingIcon />} />
            </div>
          ) : (
            results && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)]">
                <ResultPanel
                  title="Research"
                  icon={<BookOpenIcon />}
                  results={results.research}
                  CardComponent={ResearchCard}
                  onOpenDetail={() => openDetail("research")}
                />
                <ResultPanel
                  title="Pipeline & News"
                  icon={<NewspaperIcon />}
                  results={results.news}
                  CardComponent={NewsCard}
                  onOpenDetail={() => openDetail("news")}
                />
                <ResultPanel
                  title="Patents"
                  icon={<ShieldIcon />}
                  results={results.patents}
                  CardComponent={PatentCard}
                  onOpenDetail={() => openDetail("patents")}
                />
                <ResultPanel
                  title="Companies"
                  icon={<BuildingIcon />}
                  results={results.companies}
                  CardComponent={CompanyCard}
                  onOpenDetail={() => openDetail("companies")}
                />
              </div>
            )
          )}
        </section>
      )}

      {/* Footer */}
      <footer className="flex items-center justify-center h-12 border-t border-border mt-auto shrink-0">
        <p className="text-xs text-muted-foreground">
          Your private intellectual property researcher, available 24/7
        </p>
      </footer>
    </div>
  );
}
