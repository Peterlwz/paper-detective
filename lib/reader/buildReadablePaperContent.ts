import type {
  ReadablePaperContent,
  ReadableSection,
  ReadableSentence,
} from "@/types/reader";

type ExtractedPageText = {
  page: number;
  text: string;
  char_count: number;
};

type BuildReadablePaperContentInput = {
  paperId: string;
  title?: string;
  pages: ExtractedPageText[];
  maxChars?: number;
};

type MutableSection = {
  title: string;
  page_start?: number;
  page_end?: number;
  sentenceTexts: Array<{
    page?: number;
    text: string;
  }>;
};

const DEFAULT_MAX_CHARS = 40000;
const MIN_SENTENCE_CHARS = 20;
const SECTION_TITLES = [
  "Materials and Methods",
  "Abstract",
  "Introduction",
  "Methods",
  "Results",
  "Discussion",
  "Conclusion",
  "Limitations",
  "References",
] as const;

const SECTION_PATTERN = new RegExp(
  `\\b(${SECTION_TITLES.map((title) => title.replace(/\s+/g, "\\s+")).join("|")})\\b`,
  "gi",
);

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function canonicalSectionTitle(title: string): string {
  const normalized = normalizeText(title).toLowerCase();
  const match = SECTION_TITLES.find(
    (sectionTitle) => sectionTitle.toLowerCase() === normalized,
  );

  return match ?? title;
}

function isReferenceSection(title: string): boolean {
  return title.toLowerCase() === "references";
}

function splitIntoSentences(text: string): string[] {
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  return (
    normalized
      .match(/[^.!?。！？]+[.!?。！？]+|[^.!?。！？]+$/g)
      ?.map((sentence) => normalizeText(sentence))
      .filter((sentence) => sentence.length >= MIN_SENTENCE_CHARS) ?? []
  );
}

function truncatePages(
  pages: ExtractedPageText[],
  maxChars: number,
): { pages: ExtractedPageText[]; wasTruncated: boolean } {
  const truncatedPages: ExtractedPageText[] = [];
  let usedChars = 0;
  let wasTruncated = false;

  for (const page of pages) {
    const text = normalizeText(page.text);

    if (!text) {
      continue;
    }

    const remainingChars = maxChars - usedChars;

    if (remainingChars <= 0) {
      wasTruncated = true;
      break;
    }

    if (text.length > remainingChars) {
      truncatedPages.push({
        page: page.page,
        text: text.slice(0, remainingChars),
        char_count: remainingChars,
      });
      usedChars += remainingChars;
      wasTruncated = true;
      break;
    }

    truncatedPages.push({
      page: page.page,
      text,
      char_count: text.length,
    });
    usedChars += text.length;
  }

  return { pages: truncatedPages, wasTruncated };
}

function getOrCreateSection(
  sections: MutableSection[],
  title: string,
  page?: number,
): MutableSection {
  const lastSection = sections[sections.length - 1];

  if (lastSection?.title === title) {
    return lastSection;
  }

  const section: MutableSection = {
    title,
    page_start: page,
    page_end: page,
    sentenceTexts: [],
  };

  sections.push(section);
  return section;
}

function addSentencesToSection(
  section: MutableSection,
  text: string,
  page: number,
) {
  const sentences = splitIntoSentences(text);

  if (sentences.length === 0) {
    return;
  }

  section.page_start = Math.min(section.page_start ?? page, page);
  section.page_end = Math.max(section.page_end ?? page, page);

  for (const sentence of sentences) {
    section.sentenceTexts.push({
      page,
      text: sentence,
    });
  }
}

function addPageTextToSections(
  sections: MutableSection[],
  page: ExtractedPageText,
) {
  const text = normalizeText(page.text);

  if (!text) {
    return;
  }

  const matches = Array.from(text.matchAll(SECTION_PATTERN));

  if (matches.length === 0) {
    const title = sections.length > 0 ? sections[sections.length - 1].title : `Page ${page.page}`;
    const section = getOrCreateSection(sections, title, page.page);
    addSentencesToSection(section, text, page.page);
    return;
  }

  const firstMatch = matches[0];
  const leadingText = text.slice(0, firstMatch.index).trim();

  if (leadingText) {
    const title = sections.length > 0 ? sections[sections.length - 1].title : `Page ${page.page}`;
    const section = getOrCreateSection(sections, title, page.page);
    addSentencesToSection(section, leadingText, page.page);
  }

  matches.forEach((match, index) => {
    const title = canonicalSectionTitle(match[0]);
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? text.length;
    const segmentText = text.slice(start, end).trim();

    if (!segmentText || isReferenceSection(title)) {
      return;
    }

    const section = getOrCreateSection(sections, title, page.page);
    addSentencesToSection(section, segmentText, page.page);
  });
}

function toReadableSections(sections: MutableSection[]): ReadableSection[] {
  return sections
    .filter((section) => section.sentenceTexts.length > 0)
    .map((section, sectionIndex) => {
      const sectionId = `section_${sectionIndex + 1}`;
      const sentences: ReadableSentence[] = section.sentenceTexts.map(
        (sentence, sentenceIndex) => ({
          id: `sent_${sectionIndex + 1}_${sentenceIndex + 1}`,
          section_id: sectionId,
          page: sentence.page,
          text: sentence.text,
          source_label:
            sentence.page !== undefined
              ? `${section.title} · Page ${sentence.page}`
              : section.title,
        }),
      );

      return {
        id: sectionId,
        title: section.title,
        page_start: section.page_start,
        page_end: section.page_end,
        sentences,
      };
    });
}

export function buildReadablePaperContent({
  paperId,
  title,
  pages,
  maxChars = DEFAULT_MAX_CHARS,
}: BuildReadablePaperContentInput): ReadablePaperContent {
  const { pages: truncatedPages, wasTruncated } = truncatePages(
    pages,
    maxChars,
  );
  const mutableSections: MutableSection[] = [];

  for (const page of truncatedPages) {
    addPageTextToSections(mutableSections, page);
  }

  const sections = toReadableSections(mutableSections);
  const sentenceCount = sections.reduce(
    (total, section) => total + section.sentences.length,
    0,
  );
  const charCount = sections.reduce(
    (total, section) =>
      total +
      section.sentences.reduce(
        (sectionTotal, sentence) => sectionTotal + sentence.text.length,
        0,
      ),
    0,
  );

  return {
    paper_id: paperId,
    title,
    sections,
    stats: {
      section_count: sections.length,
      sentence_count: sentenceCount,
      char_count: charCount,
      was_truncated: wasTruncated,
    },
  };
}
