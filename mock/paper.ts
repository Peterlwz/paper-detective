import type { Paper } from "../types/paper";

export const mockPaper: Paper = {
  paper_id: "paper_001",
  title:
    "Inhibition of PI3K/AKT signaling reverses sorafenib resistance in hepatocellular carcinoma",
  authors: ["Lina Chen", "Marcus Zhou", "Ying Patel", "Hannah Kim"],
  journal: "Journal of Translational Oncology",
  year: "2024",
  sections: [
    {
      section_id: "section_abstract",
      title: "Abstract",
      page_start: 1,
      page_end: 1,
    },
    {
      section_id: "section_introduction",
      title: "Introduction",
      page_start: 2,
      page_end: 3,
    },
    {
      section_id: "section_methods",
      title: "Methods",
      page_start: 4,
      page_end: 6,
    },
    {
      section_id: "section_results",
      title: "Results",
      page_start: 7,
      page_end: 12,
    },
    {
      section_id: "section_discussion",
      title: "Discussion",
      page_start: 13,
      page_end: 14,
    },
    {
      section_id: "section_limitations",
      title: "Limitations",
      page_start: 15,
      page_end: 15,
    },
  ],
  figures: [
    {
      figure_id: "fig_1",
      label: "Figure 1",
      page: 8,
      caption:
        "Establishment and molecular characterization of sorafenib-resistant hepatocellular carcinoma cell models.",
    },
    {
      figure_id: "fig_2",
      label: "Figure 2",
      page: 9,
      caption:
        "Transcriptomic and pathway enrichment analysis identifies PI3K/AKT signaling activation in resistant cells.",
    },
    {
      figure_id: "fig_3b",
      label: "Figure 3B",
      page: 10,
      caption:
        "AKT inhibition decreases viability of sorafenib-resistant HCC cells under sorafenib treatment.",
    },
    {
      figure_id: "fig_4",
      label: "Figure 4",
      page: 11,
      caption:
        "Combination treatment suppresses resistant HCC cell proliferation and colony formation.",
    },
    {
      figure_id: "fig_5",
      label: "Figure 5",
      page: 12,
      caption:
        "Sorafenib plus AKT inhibitor reduces tumor growth in a resistant HCC xenograft model.",
    },
  ],
};
