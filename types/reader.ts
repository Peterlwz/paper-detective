export interface ReadableSentence {
  id: string;
  section_id: string;
  page?: number;
  text: string;
  source_label?: string;
}

export interface ReadableSection {
  id: string;
  title: string;
  page_start?: number;
  page_end?: number;
  sentences: ReadableSentence[];
}

export interface ReadablePaperContent {
  paper_id: string;
  title?: string;
  sections: ReadableSection[];
  stats: {
    section_count: number;
    sentence_count: number;
    char_count: number;
    was_truncated: boolean;
  };
}
