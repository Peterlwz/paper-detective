"use client";

import { useEffect, useState } from "react";
import type { ClickEvent } from "@/types/click";
import type { EvidenceBBox, EvidenceItem } from "@/types/evidence";
import type { Paper, PaperFigure } from "@/types/paper";
import { getEvidenceTypeLabel } from "@/utils/evidenceLabels";

interface FakePaperViewerProps {
  paper: Paper;
  caseId: string;
  evidenceList: EvidenceItem[];
  foundEvidenceIds: string[];
  selectedEvidenceId: string | null;
  focusTick?: number;
  hintFocusEvidenceId?: string | null;
  hintFocusTick?: number;
  onPaperClick?: (event: ClickEvent) => void;
}

function getFigure(paper: Paper, label: string): PaperFigure | undefined {
  return paper.figures.find((figure) => figure.label === label);
}

type ClickableTextItem = {
  text: string;
  page: number;
  sourceLabel: string;
};

const clickableTexts = {
  abstractResistance: {
    text: "Sorafenib resistance limits durable responses in hepatocellular carcinoma.",
    page: 1,
    sourceLabel: "Abstract",
  },
  abstractInvestigation: {
    text: "This mock paper investigates whether PI3K/AKT pathway activation is associated with acquired resistance and whether AKT inhibition can restore drug sensitivity in resistant HCC models.",
    page: 1,
    sourceLabel: "Abstract",
  },
  backgroundTreatment: {
    text: "Sorafenib is a standard treatment for advanced hepatocellular carcinoma.",
    page: 2,
    sourceLabel: "Introduction paragraph 1",
  },
  adaptiveSurvivalSignaling: {
    text: "Targeted therapy for advanced HCC is frequently constrained by adaptive survival signaling.",
    page: 2,
    sourceLabel: "Introduction paragraph 1",
  },
  backgroundPathway: {
    text: "The PI3K/AKT pathway is frequently activated in cancer.",
    page: 2,
    sourceLabel: "Introduction paragraph 2",
  },
  priorPathwayRewiring: {
    text: "Prior studies have implicated RAF, MAPK, and PI3K/AKT pathway rewiring in treatment escape.",
    page: 2,
    sourceLabel: "Introduction paragraph 2",
  },
  backgroundResistance: {
    text: "Drug resistance remains a major challenge in liver cancer treatment.",
    page: 3,
    sourceLabel: "Introduction paragraph 3",
  },
  incompleteEvidenceChain: {
    text: "The evidence chain connecting pathway activation to functional resistance remains incomplete.",
    page: 3,
    sourceLabel: "Introduction paragraph 3",
  },
  resistantViabilityModel: {
    text: "Resistant HCC cells retained higher viability after sorafenib exposure than parental controls, confirming the resistant phenotype used throughout the study.",
    page: 7,
    sourceLabel: "Results paragraph 1",
  },
  plateReaderMethod: {
    text: "Assays were read on the same plate reader across batches.",
    page: 7,
    sourceLabel: "Results paragraph 1",
  },
  aktPhosphorylation: {
    text: "AKT phosphorylation was significantly increased in sorafenib-resistant HCC cells.",
    page: 7,
    sourceLabel: "Results paragraph 2",
  },
  downstreamSurvivalSignal: {
    text: "Resistant cells showed elevated phosphorylation of GSK3β and reduced cleaved PARP after sorafenib exposure.",
    page: 8,
    sourceLabel: "Results paragraph 3",
  },
  survivalAssociation: {
    text: "High p-AKT expression was associated with poor overall survival in HCC patients.",
    page: 9,
    sourceLabel: "Results paragraph 5",
  },
  archivedSpecimens: {
    text: "This association was evaluated in archived patient specimens and requires further prospective confirmation.",
    page: 9,
    sourceLabel: "Results paragraph 5",
  },
  clinicalPAktAssociation: {
    text: "High tumoral p-AKT staining was associated with shorter progression-free survival in sorafenib-treated HCC patients.",
    page: 9,
    sourceLabel: "Results paragraph 5",
  },
  clinicalPattern: {
    text: "This clinical pattern strengthened the link between pathway activity and treatment outcome.",
    page: 9,
    sourceLabel: "Results paragraph 5",
  },
  aktInhibitorViability: {
    text: "AKT inhibitor significantly reduced cell viability in resistant HCC cells.",
    page: 10,
    sourceLabel: "Results paragraph 6",
  },
  aktInhibitorPAkt: {
    text: "Treatment with the AKT inhibitor markedly reduced p-AKT levels without changing total AKT abundance.",
    page: 10,
    sourceLabel: "Results paragraph 6",
  },
  aktKnockdownSensitivity: {
    text: "AKT knockdown restored sorafenib sensitivity in resistant cells.",
    page: 10,
    sourceLabel: "Results paragraph 7",
  },
  geneticPerturbationContext: {
    text: "These genetic perturbation data complemented the pharmacological AKT inhibition experiments.",
    page: 10,
    sourceLabel: "Results paragraph 7",
  },
  restoredApoptosis: {
    text: "MK-2206 restored sorafenib-induced apoptosis in resistant HCC cells, as indicated by increased cleaved caspase-3 and Annexin V positivity.",
    page: 10,
    sourceLabel: "Results paragraph 7",
  },
  apoptosisReadoutContext: {
    text: "The apoptosis readout connected pathway inhibition to functional drug response.",
    page: 10,
    sourceLabel: "Results paragraph 7",
  },
  combinationTumorGrowth: {
    text: "Combination therapy suppressed tumor growth in xenograft models.",
    page: 12,
    sourceLabel: "Results paragraph 9",
  },
  combinationGreaterInhibition: {
    text: "The combination of sorafenib and MK-2206 produced greater tumor growth inhibition than either agent alone.",
    page: 12,
    sourceLabel: "Results paragraph 9",
  },
  verticalTargeting: {
    text: "These findings support vertical targeting of RAF and PI3K/AKT signaling as a candidate strategy for patients who develop acquired resistance to sorafenib.",
    page: 13,
    sourceLabel: "Discussion paragraph 2",
  },
  evidenceModelInterpretation: {
    text: "The data suggest that pathway inhibition should be interpreted through expression, function, and model-level evidence rather than a single assay.",
    page: 13,
    sourceLabel: "Discussion paragraph 2",
  },
  therapeuticWindow: {
    text: "The therapeutic window of AKT inhibition requires further optimization to minimize toxicity in non-malignant hepatocytes.",
    page: 14,
    sourceLabel: "Discussion paragraph 4",
  },
  translationBoundary: {
    text: "This boundary matters when considering translation beyond resistant cell systems.",
    page: 14,
    sourceLabel: "Discussion paragraph 4",
  },
  additionalResistanceMechanisms: {
    text: "Additional resistance mechanisms, including MAPK reactivation and altered drug transport, may coexist with PI3K/AKT activation.",
    page: 15,
    sourceLabel: "Limitations paragraph 1",
  },
  noClinicalTrial: {
    text: "No prospective clinical trial was performed to validate this therapeutic strategy.",
    page: 15,
    sourceLabel: "Limitations paragraph 2",
  },
  orthotopicModels: {
    text: "Future studies should evaluate the combination in orthotopic and immune-competent HCC models before clinical translation.",
    page: 15,
    sourceLabel: "Limitations paragraph 2",
  },
} satisfies Record<string, ClickableTextItem>;

const figureBboxes: Record<string, EvidenceBBox> = {
  "Figure 1": {
    x: 0.16,
    y: 0.28,
    width: 0.31,
    height: 0.22,
  },
  "Figure 2": {
    x: 0.52,
    y: 0.18,
    width: 0.34,
    height: 0.29,
  },
  "Figure 3B": {
    x: 0.32,
    y: 0.41,
    width: 0.25,
    height: 0.18,
  },
  "Figure 4": {
    x: 0.12,
    y: 0.22,
    width: 0.38,
    height: 0.31,
  },
  "Figure 5": {
    x: 0.14,
    y: 0.2,
    width: 0.36,
    height: 0.27,
  },
};

const figureBackgroundBboxes: Record<string, EvidenceBBox> = {
  "Figure 1": {
    x: 0.02,
    y: 0.02,
    width: 0.06,
    height: 0.06,
  },
  "Figure 2": {
    x: 0.02,
    y: 0.02,
    width: 0.06,
    height: 0.06,
  },
  "Figure 3B": {
    x: 0.02,
    y: 0.02,
    width: 0.06,
    height: 0.06,
  },
  "Figure 4": {
    x: 0.02,
    y: 0.02,
    width: 0.06,
    height: 0.06,
  },
  "Figure 5": {
    x: 0.02,
    y: 0.02,
    width: 0.06,
    height: 0.06,
  },
};

function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function isTextEvidenceForSentence(
  sentenceText: string,
  evidence: EvidenceItem,
): boolean {
  if (evidence.source_type !== "text" || !evidence.text_anchor) {
    return false;
  }

  const sentence = normalize(sentenceText);
  const textAnchor = normalize(evidence.text_anchor);

  return sentence.includes(textAnchor) || textAnchor.includes(sentence);
}

function EvidenceAnchorTags({ evidences }: { evidences: EvidenceItem[] }) {
  if (evidences.length === 0) {
    return null;
  }

  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
      {evidences.map((evidence) => (
        <span
          key={evidence.id}
          className="inline-flex items-center border border-[#1d352f] bg-[#1d352f] px-2 py-0.5 text-[11px] font-semibold leading-4 text-white"
        >
          {evidence.id} · {getEvidenceTypeLabel(evidence.type)}
        </span>
      ))}
    </span>
  );
}

function ClickableSentence({
  item,
  targetEvidences,
  foundEvidences,
  isFlashing,
  isHintFlashing,
  onClick,
}: {
  item: ClickableTextItem;
  targetEvidences: EvidenceItem[];
  foundEvidences: EvidenceItem[];
  isFlashing: boolean;
  isHintFlashing: boolean;
  onClick: (item: ClickableTextItem) => void;
}) {
  const isFound = foundEvidences.length > 0;
  const anchorIds = targetEvidences.map((evidence) => evidence.id).join(" ");
  const baseClass =
    "-mx-1 cursor-pointer rounded-sm px-1 text-left align-baseline transition focus:outline-none focus:ring-2 focus:ring-[#8ea39a]";
  const stateClass = isFound
    ? "bg-[#fff2bd] text-[#14211d] ring-1 ring-[#d4b85a] hover:bg-[#ffe799]"
    : "text-[#24342f] underline decoration-[#9aa69f] decoration-dotted underline-offset-4 hover:bg-[#e7eee9] hover:text-[#14211d]";
  const flashClass = isFlashing
    ? "animate-pulse bg-[#f5d76e] ring-2 ring-[#1d352f]"
    : "";
  const hintFlashClass = isHintFlashing
    ? "animate-pulse bg-[#dceff3] ring-2 ring-[#3d7780]"
    : "";

  return (
    <button
      id={targetEvidences[0] ? `evidence-anchor-${targetEvidences[0].id}` : undefined}
      data-evidence-anchor={anchorIds || undefined}
      type="button"
      onClick={() => onClick(item)}
      className={`${baseClass} ${stateClass} ${flashClass} ${hintFlashClass}`}
    >
      {item.text}
      <EvidenceAnchorTags evidences={foundEvidences} />
    </button>
  );
}

function getEvidenceRegionBBox(evidence: EvidenceItem): EvidenceBBox {
  return (
    evidence.bbox ?? {
      x: 0.12,
      y: 0.18,
      width: 0.76,
      height: 0.64,
    }
  );
}

function FigurePlaceholder({
  figure,
  label,
  targetEvidences,
  foundEvidences,
  isFlashing,
  isHintFlashing,
  flashingEvidenceId,
  hintFlashingEvidenceId,
  onFigureClick,
}: {
  figure?: PaperFigure;
  label: string;
  targetEvidences: EvidenceItem[];
  foundEvidences: EvidenceItem[];
  isFlashing: boolean;
  isHintFlashing: boolean;
  flashingEvidenceId: string | null;
  hintFlashingEvidenceId: string | null;
  onFigureClick: (label: string, page: number, bbox: EvidenceBBox) => void;
}) {
  const isFound = foundEvidences.length > 0;
  const fallbackBBox =
    figureBackgroundBboxes[label] ??
    figureBboxes[label] ?? {
      x: 0.02,
      y: 0.02,
      width: 0.06,
      height: 0.06,
    };
  const basePanelClass =
    "relative mt-4 min-h-64 w-full overflow-hidden border border-dashed px-5 text-center transition";
  const statePanelClass = isFound
    ? "border-[#1d352f] bg-[#edf2ef] shadow-[0_10px_28px_rgba(25,35,31,0.10)]"
    : "border-[#bcc7c0] bg-[#eef2ec]";
  const flashFigureClass = isFlashing
    ? "animate-pulse ring-4 ring-[#d4b85a]"
    : "";
  const hintFlashFigureClass = isHintFlashing
    ? "animate-pulse ring-4 ring-[#6da8b0]"
    : "";

  return (
    <section className="border border-[#cfd7cc] bg-[#fbfcfa] p-4">
      <div className="flex flex-col gap-1 border-b border-[#d9dfd5] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-[#14211d]">
          {label} 占位
        </h3>
        <span className="text-xs font-semibold tracking-[0.14em] text-[#6d7a75] uppercase">
          Page {figure?.page ?? "--"}
        </span>
      </div>
      <div
        className={`${basePanelClass} ${statePanelClass} ${flashFigureClass} ${hintFlashFigureClass}`}
      >
        <button
          type="button"
          onClick={() => onFigureClick(label, figure?.page ?? 1, fallbackBBox)}
          className="absolute inset-0 z-0 cursor-pointer transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#8ea39a]"
          aria-label={`${label} background`}
        />
        <div className="pointer-events-none relative z-10 grid min-h-64 place-items-center py-14">
          <div className="text-sm font-semibold tracking-[0.16em] text-[#52635d] uppercase">
            Figure Panel
          </div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#52635d]">
            {figure?.caption ?? "Mock figure placeholder."}
          </p>
        </div>
        {targetEvidences.map((evidence) => {
          const evidenceBBox = getEvidenceRegionBBox(evidence);
          const isEvidenceFound = foundEvidences.some(
            (foundEvidence) => foundEvidence.id === evidence.id,
          );
          const isEvidenceFlashing = flashingEvidenceId === evidence.id;
          const isEvidenceHintFlashing = hintFlashingEvidenceId === evidence.id;

          return (
            <button
              key={evidence.id}
              id={`evidence-anchor-${evidence.id}`}
              data-evidence-anchor={evidence.id}
              type="button"
              onClick={() =>
                onFigureClick(label, figure?.page ?? evidence.page, evidenceBBox)
              }
              className={`absolute z-20 flex min-h-12 min-w-24 cursor-pointer items-center justify-center border px-2 text-center text-xs font-semibold leading-5 transition focus:outline-none focus:ring-2 focus:ring-[#8ea39a] ${
                isEvidenceFound
                  ? "border-[#1d352f] bg-[#fff2bd] text-[#14211d] shadow-[0_8px_22px_rgba(25,35,31,0.16)] hover:bg-[#ffe799]"
                  : "border-[#8aa79a] bg-white/55 text-[#52635d] hover:border-[#1d352f] hover:bg-white/80 hover:text-[#1d352f]"
              } ${
                isEvidenceFlashing ? "animate-pulse ring-4 ring-[#d4b85a]" : ""
              } ${
                isEvidenceHintFlashing
                  ? "animate-pulse ring-4 ring-[#6da8b0]"
                  : ""
              }`}
              style={{
                left: `${evidenceBBox.x * 100}%`,
                top: `${evidenceBBox.y * 100}%`,
                width: `${evidenceBBox.width * 100}%`,
                height: `${evidenceBBox.height * 100}%`,
              }}
            >
              {isEvidenceFound ? (
                <EvidenceAnchorTags evidences={[evidence]} />
              ) : (
                <span>图表数据区</span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function FakePaperViewer({
  paper,
  caseId,
  evidenceList,
  foundEvidenceIds,
  selectedEvidenceId,
  focusTick = 0,
  hintFocusEvidenceId = null,
  hintFocusTick = 0,
  onPaperClick,
}: FakePaperViewerProps) {
  const [flashingEvidenceId, setFlashingEvidenceId] = useState<string | null>(
    null,
  );
  const [hintFlashingEvidenceId, setHintFlashingEvidenceId] = useState<
    string | null
  >(null);
  const foundEvidenceSet = new Set(foundEvidenceIds);

  useEffect(() => {
    if (!selectedEvidenceId) {
      return;
    }

    const selectedAnchor = document.querySelector<HTMLElement>(
      `[data-evidence-anchor~="${selectedEvidenceId}"]`,
    );

    if (!selectedAnchor) {
      return;
    }

    selectedAnchor.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setFlashingEvidenceId(selectedEvidenceId);

    const timeoutId = window.setTimeout(() => {
      setFlashingEvidenceId((currentId) =>
        currentId === selectedEvidenceId ? null : currentId,
      );
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [selectedEvidenceId, focusTick]);

  useEffect(() => {
    if (!hintFocusEvidenceId) {
      return;
    }

    const hintAnchor = document.querySelector<HTMLElement>(
      `[data-evidence-anchor~="${hintFocusEvidenceId}"]`,
    );

    if (!hintAnchor) {
      return;
    }

    hintAnchor.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setHintFlashingEvidenceId(hintFocusEvidenceId);

    const timeoutId = window.setTimeout(() => {
      setHintFlashingEvidenceId((currentId) =>
        currentId === hintFocusEvidenceId ? null : currentId,
      );
    }, 1200);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hintFocusEvidenceId, hintFocusTick]);

  function getTargetTextEvidences(item: ClickableTextItem): EvidenceItem[] {
    return evidenceList.filter(
      (evidence) => isTextEvidenceForSentence(item.text, evidence),
    );
  }

  function getTargetFigureEvidences(label: string): EvidenceItem[] {
    return evidenceList.filter(
      (evidence) =>
        evidence.source_type === "figure" &&
        evidence.source_label === label,
    );
  }

  function handleTextClick(item: ClickableTextItem) {
    const timestamp = Date.now();

    onPaperClick?.({
      click_id: `click_${timestamp}`,
      case_id: caseId,
      page: item.page,
      target_type: "text",
      clicked_text: item.text,
      source_label: item.sourceLabel,
      timestamp,
    });
  }

  function handleFigureClick(label: string, page: number, bbox: EvidenceBBox) {
    const timestamp = Date.now();

    onPaperClick?.({
      click_id: `click_${timestamp}`,
      case_id: caseId,
      page,
      target_type: "figure",
      clicked_bbox: bbox,
      source_label: label,
      timestamp,
    });
  }

  function renderClickableSentence(item: ClickableTextItem) {
    const targetEvidences = getTargetTextEvidences(item);
    const foundEvidences = targetEvidences.filter((evidence) =>
      foundEvidenceSet.has(evidence.id),
    );

    return (
      <ClickableSentence
        item={item}
        targetEvidences={targetEvidences}
        foundEvidences={foundEvidences}
        isFlashing={foundEvidences.some(
          (evidence) => evidence.id === flashingEvidenceId,
        )}
        isHintFlashing={targetEvidences.some(
          (evidence) => evidence.id === hintFlashingEvidenceId,
        )}
        onClick={handleTextClick}
      />
    );
  }

  function renderFigure(label: string) {
    const targetEvidences = getTargetFigureEvidences(label);
    const foundEvidences = targetEvidences.filter((evidence) =>
      foundEvidenceSet.has(evidence.id),
    );

    return (
      <FigurePlaceholder
        figure={getFigure(paper, label)}
        label={label}
        targetEvidences={targetEvidences}
        foundEvidences={foundEvidences}
        isFlashing={foundEvidences.some(
          (evidence) => evidence.id === flashingEvidenceId,
        )}
        isHintFlashing={targetEvidences.some(
          (evidence) => evidence.id === hintFlashingEvidenceId,
        )}
        flashingEvidenceId={flashingEvidenceId}
        hintFlashingEvidenceId={hintFlashingEvidenceId}
        onFigureClick={handleFigureClick}
      />
    );
  }

  return (
    <article className="border border-[#cfd7cc] bg-white/80 p-5 shadow-[0_14px_40px_rgba(25,35,31,0.06)]">
      <div className="border-b border-[#d9dfd5] pb-5">
        <p className="mb-3 text-sm font-medium tracking-[0.18em] text-[#52635d] uppercase">
          Mock Paper Viewer
        </p>
        <h2 className="text-2xl font-semibold leading-snug text-[#14211d]">
          {paper.title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#52635d]">
          {paper.authors.join(", ")} · {paper.journal} · {paper.year}
        </p>
      </div>

      <div className="space-y-7 pt-6">
        <section>
          <h3 className="text-xl font-semibold text-[#14211d]">Abstract</h3>
          <p className="mt-3 text-base leading-8 text-[#364641]">
            {renderClickableSentence(clickableTexts.abstractResistance)}{" "}
            {renderClickableSentence(clickableTexts.abstractInvestigation)}
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-[#14211d]">
            Introduction
          </h3>
          <div className="mt-3 space-y-4 text-base leading-8 text-[#364641]">
            <p>
              {renderClickableSentence(clickableTexts.backgroundTreatment)}{" "}
              {renderClickableSentence(clickableTexts.adaptiveSurvivalSignaling)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.backgroundPathway)}{" "}
              {renderClickableSentence(clickableTexts.priorPathwayRewiring)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.backgroundResistance)}{" "}
              {renderClickableSentence(clickableTexts.incompleteEvidenceChain)}
            </p>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-[#14211d]">Results</h3>
          <div className="mt-3 space-y-4 text-base leading-8 text-[#364641]">
            <p>
              {renderClickableSentence(clickableTexts.resistantViabilityModel)}{" "}
              {renderClickableSentence(clickableTexts.plateReaderMethod)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.aktPhosphorylation)}{" "}
              {renderClickableSentence(clickableTexts.downstreamSurvivalSignal)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.survivalAssociation)}{" "}
              {renderClickableSentence(clickableTexts.archivedSpecimens)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.clinicalPAktAssociation)}{" "}
              {renderClickableSentence(clickableTexts.clinicalPattern)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.aktInhibitorViability)}{" "}
              {renderClickableSentence(clickableTexts.aktInhibitorPAkt)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.aktKnockdownSensitivity)}{" "}
              {renderClickableSentence(clickableTexts.geneticPerturbationContext)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.restoredApoptosis)}{" "}
              {renderClickableSentence(clickableTexts.apoptosisReadoutContext)}
            </p>
            <p>
              {renderClickableSentence(clickableTexts.combinationTumorGrowth)}{" "}
              {renderClickableSentence(
                clickableTexts.combinationGreaterInhibition,
              )}
            </p>
          </div>
        </section>

        {renderFigure("Figure 1")}
        {renderFigure("Figure 2")}
        {renderFigure("Figure 3B")}
        {renderFigure("Figure 4")}
        {renderFigure("Figure 5")}

        <section>
          <h3 className="text-xl font-semibold text-[#14211d]">Discussion</h3>
          <p className="mt-3 text-base leading-8 text-[#364641]">
            {renderClickableSentence(clickableTexts.verticalTargeting)}{" "}
            {renderClickableSentence(clickableTexts.evidenceModelInterpretation)}
          </p>
          <p className="mt-3 text-base leading-8 text-[#364641]">
            {renderClickableSentence(clickableTexts.therapeuticWindow)}{" "}
            {renderClickableSentence(clickableTexts.translationBoundary)}
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-[#14211d]">Limitations</h3>
          <p className="mt-3 text-base leading-8 text-[#364641]">
            {renderClickableSentence(
              clickableTexts.additionalResistanceMechanisms,
            )}{" "}
            {renderClickableSentence(clickableTexts.noClinicalTrial)}{" "}
            {renderClickableSentence(clickableTexts.orthotopicModels)}
          </p>
        </section>
      </div>
    </article>
  );
}
