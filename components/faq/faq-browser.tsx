"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { FAQ_CATEGORIES, FAQ_COUNT } from "@/lib/faq-data";

/**
 * Category nav plus client-side search over the whole corpus.
 *
 * At five questions an FAQ is a list. At twenty-plus it is a reference
 * document, and a reference document that can only be read top to bottom
 * wastes most of its value — somebody arriving from a search for "fractional
 * property TDS" needs to land on that answer, not scroll for it.
 *
 * Search is client-side and case-insensitive across both question and answer
 * text: the corpus is a few kilobytes, so a round trip would be slower than
 * matching in place.
 */
export function FaqBrowser() {
  const [query, setQuery] = useState("");
  const trimmed = query.trim().toLowerCase();

  const categories = useMemo(() => {
    if (!trimmed) return FAQ_CATEGORIES;

    return FAQ_CATEGORIES.map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.question.toLowerCase().includes(trimmed) ||
          item.answer.toLowerCase().includes(trimmed)
      ),
    })).filter((category) => category.questions.length > 0);
  }, [trimmed]);

  const matchCount = categories.reduce(
    (total, category) => total + category.questions.length,
    0
  );

  return (
    <>
      <div className="mt-8">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          {/* Two placeholders: the long one was clipped mid-word on a phone,
              which reads as a rendering fault rather than a hint. */}
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${FAQ_COUNT} questions`}
            aria-label="Search frequently asked questions"
            className="h-12 pr-10 pl-10 sm:hidden"
          />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${FAQ_COUNT} questions — try "fees", "TDS", "exit"`}
            aria-label="Search frequently asked questions"
            className="hidden h-12 pr-10 pl-10 sm:block"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-navy"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {trimmed && (
          <p
            role="status"
            className="mt-3 text-sm text-muted-foreground"
          >
            {matchCount === 0
              ? "No questions match that. Try a different word, or ask us directly below."
              : `${matchCount} ${matchCount === 1 ? "question" : "questions"} matching “${query.trim()}”`}
          </p>
        )}
      </div>

      {/* Category jump links — hidden while searching, when they'd point at
          sections that may no longer be on the page. */}
      {!trimmed && (
        <nav aria-label="FAQ categories" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {FAQ_CATEGORIES.map((category) => (
              <li key={category.id}>
                <a
                  href={`#${category.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-brand-green hover:text-navy"
                >
                  {category.title}
                  <span className="text-xs text-muted-foreground">
                    {category.questions.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-12 space-y-12">
        {categories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-24"
            aria-labelledby={`${category.id}-heading`}
          >
            <h2
              id={`${category.id}-heading`}
              className="font-serif text-2xl font-semibold text-navy"
            >
              {category.title}
            </h2>
            <p className="mt-1 text-muted-foreground">{category.blurb}</p>

            <Accordion className="mt-5 divide-y divide-border rounded-2xl border border-border bg-card">
              {category.questions.map((item) => (
                <AccordionItem
                  key={item.question}
                  value={item.question}
                  className="px-5"
                >
                  <AccordionTrigger className="py-4 text-left text-base font-medium text-navy">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 leading-relaxed text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>
    </>
  );
}
