export interface Paper {
  paper_id: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  sections: PaperSection[];
  figures: PaperFigure[];
}

export interface PaperSection {
  section_id: string;
  title: string;
  page_start: number;
  page_end: number;
}

export interface PaperFigure {
  figure_id: string;
  label: string;
  page: number;
  caption: string;
}
