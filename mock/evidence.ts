import type { EvidenceItem } from "../types/evidence";

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: "E1",
    case_id: "case_001",
    type: "expression",
    title: "耐药细胞中 AKT 磷酸化升高",
    source_type: "text",
    source_label: "Results paragraph 2",
    page: 7,
    text_anchor:
      "AKT phosphorylation was significantly increased in sorafenib-resistant HCC cells.",
    explanation:
      "该结果说明耐药细胞中 PI3K/AKT 通路处于激活状态，支持该通路可能参与索拉非尼耐药。",
    strength: "strong",
    limitation:
      "该证据主要说明相关性，不能单独证明 AKT 激活是耐药的直接原因。",
    found: false,
    confidence: 0.92,
  },
  {
    id: "E2",
    case_id: "case_001",
    type: "functional",
    title: "耐药细胞在索拉非尼处理下仍保持高存活率",
    source_type: "figure",
    source_label: "Figure 1",
    page: 8,
    bbox: {
      x: 0.16,
      y: 0.28,
      width: 0.31,
      height: 0.22,
    },
    explanation:
      "该图显示耐药 HCC 细胞在索拉非尼暴露后仍保持较高细胞活性，证明模型具有耐药表型。",
    strength: "strong",
    limitation:
      "该证据确认耐药表型，但不能直接指出 PI3K/AKT 是造成耐药的机制。",
    found: false,
    confidence: 0.89,
  },
  {
    id: "E3",
    case_id: "case_001",
    type: "omics",
    title: "PI3K/AKT 通路在耐药细胞中富集",
    source_type: "figure",
    source_label: "Figure 2",
    page: 9,
    bbox: {
      x: 0.52,
      y: 0.18,
      width: 0.34,
      height: 0.29,
    },
    explanation:
      "通路富集结果提示耐药细胞的差异表达基因集中在 PI3K/AKT 相关信号轴，为机制假设提供全局证据。",
    strength: "medium",
    limitation:
      "组学富集依赖统计阈值和样本设置，需要蛋白水平或功能实验进一步验证。",
    found: false,
    confidence: 0.84,
  },
  {
    id: "E4",
    case_id: "case_001",
    type: "mechanism",
    title: "PI3K/AKT 下游存活信号增强",
    source_type: "text",
    source_label: "Results paragraph 3",
    page: 8,
    text_anchor:
      "Resistant cells showed elevated phosphorylation of GSK3β and reduced cleaved PARP after sorafenib exposure.",
    explanation:
      "GSK3β 磷酸化升高和 PARP 裂解减少说明细胞存活信号增强、凋亡反应减弱，符合 AKT 激活促进耐药的机制。",
    strength: "medium",
    limitation:
      "这些下游标志物可受多条通路影响，仍需 AKT 特异性干预证明因果关系。",
    found: false,
    confidence: 0.78,
  },
  {
    id: "E5",
    case_id: "case_001",
    type: "clinical",
    title: "患者样本中 p-AKT 与较差疗效相关",
    source_type: "text",
    source_label: "Results paragraph 5",
    page: 9,
    text_anchor:
      "High tumoral p-AKT staining was associated with shorter progression-free survival in sorafenib-treated HCC patients.",
    explanation:
      "临床样本关联结果提示 p-AKT 较高的患者对索拉非尼获益较少，增强了通路激活与耐药之间的临床相关性。",
    strength: "medium",
    limitation:
      "该证据来自回顾性样本，存在样本量和混杂因素限制，不能替代前瞻性验证。",
    found: false,
    confidence: 0.73,
  },
  {
    id: "E6",
    case_id: "case_001",
    type: "limitation",
    title: "耐药机制可能并非只由 AKT 驱动",
    source_type: "text",
    source_label: "Limitations paragraph 1",
    page: 15,
    text_anchor:
      "Additional resistance mechanisms, including MAPK reactivation and altered drug transport, may coexist with PI3K/AKT activation.",
    explanation:
      "作者承认耐药可能由多机制共同造成，这限制了将 PI3K/AKT 激活视为唯一原因的解释强度。",
    strength: "weak",
    limitation:
      "这是对结论边界的说明，不直接支持主要机制，但对构建完整证据链很重要。",
    found: false,
    confidence: 0.7,
  },
  {
    id: "E7",
    case_id: "case_002",
    type: "drug_intervention",
    title: "AKT 抑制剂降低耐药细胞存活率",
    source_type: "figure",
    source_label: "Figure 3B",
    page: 10,
    bbox: {
      x: 0.32,
      y: 0.41,
      width: 0.25,
      height: 0.18,
    },
    explanation:
      "该图显示 AKT 抑制剂降低了耐药细胞存活率，支持阻断 AKT 通路可以恢复药物敏感性。",
    strength: "strong",
    limitation:
      "细胞活性下降可能包含细胞毒性影响，需要结合联合指数或凋亡数据判断是否真正逆转耐药。",
    found: false,
    confidence: 0.93,
  },
  {
    id: "E8",
    case_id: "case_002",
    type: "functional",
    title: "联合处理提升索拉非尼诱导的凋亡",
    source_type: "text",
    source_label: "Results paragraph 7",
    page: 10,
    text_anchor:
      "MK-2206 restored sorafenib-induced apoptosis in resistant HCC cells, as indicated by increased cleaved caspase-3 and Annexin V positivity.",
    explanation:
      "AKT 抑制剂使耐药细胞重新出现索拉非尼诱导的凋亡反应，说明敏感性恢复不仅体现在增殖下降，也体现在死亡程序恢复。",
    strength: "strong",
    limitation:
      "该证据来自体外细胞模型，需要在更复杂的体内环境中确认。",
    found: false,
    confidence: 0.9,
  },
  {
    id: "E9",
    case_id: "case_002",
    type: "mechanism",
    title: "AKT 抑制削弱下游存活通路",
    source_type: "figure",
    source_label: "Figure 3B",
    page: 10,
    bbox: {
      x: 0.58,
      y: 0.36,
      width: 0.28,
      height: 0.22,
    },
    explanation:
      "图中蛋白条带显示 AKT 抑制后 p-GSK3β 与 p-S6 水平下降，说明药物确实压低了 AKT 下游存活信号。",
    strength: "medium",
    limitation:
      "蛋白标志物变化说明通路被抑制，但仍需与功能读数共同解释。",
    found: false,
    confidence: 0.82,
  },
  {
    id: "E10",
    case_id: "case_002",
    type: "functional",
    title: "联合治疗减少耐药细胞克隆形成",
    source_type: "figure",
    source_label: "Figure 4",
    page: 11,
    bbox: {
      x: 0.12,
      y: 0.22,
      width: 0.38,
      height: 0.31,
    },
    explanation:
      "克隆形成实验显示联合处理显著减少长期增殖能力，支持 AKT 抑制剂恢复索拉非尼对耐药细胞的抑制作用。",
    strength: "strong",
    limitation:
      "克隆形成实验反映长期增殖，但无法单独区分增殖抑制和细胞死亡贡献。",
    found: false,
    confidence: 0.88,
  },
  {
    id: "E11",
    case_id: "case_002",
    type: "expression",
    title: "AKT 抑制后 p-AKT 信号下降",
    source_type: "text",
    source_label: "Results paragraph 6",
    page: 10,
    text_anchor:
      "Treatment with the AKT inhibitor markedly reduced p-AKT levels without changing total AKT abundance.",
    explanation:
      "该结果说明干预主要影响 AKT 活化状态，而不是简单降低 AKT 蛋白总量，使药物作用机制更清晰。",
    strength: "medium",
    limitation:
      "p-AKT 下降是预期药效标志，不足以单独证明敏感性恢复。",
    found: false,
    confidence: 0.8,
  },
  {
    id: "E12",
    case_id: "case_002",
    type: "limitation",
    title: "AKT 抑制剂剂量窗口仍需优化",
    source_type: "text",
    source_label: "Discussion paragraph 4",
    page: 14,
    text_anchor:
      "The therapeutic window of AKT inhibition requires further optimization to minimize toxicity in non-malignant hepatocytes.",
    explanation:
      "作者指出 AKT 抑制剂可能存在正常肝细胞毒性问题，提示恢复敏感性的策略仍需优化剂量和安全窗口。",
    strength: "weak",
    limitation:
      "这是转化应用层面的限制，不否定体外敏感性恢复，但影响后续临床可行性。",
    found: false,
    confidence: 0.72,
  },
  {
    id: "E13",
    case_id: "case_003",
    type: "animal",
    title: "联合治疗显著抑制耐药移植瘤生长",
    source_type: "figure",
    source_label: "Figure 5",
    page: 12,
    bbox: {
      x: 0.14,
      y: 0.2,
      width: 0.36,
      height: 0.27,
    },
    explanation:
      "体内肿瘤生长曲线显示联合治疗组肿瘤体积增长最慢，支持该治疗策略在动物模型中具有抗肿瘤潜力。",
    strength: "strong",
    limitation:
      "移植瘤模型不能完全模拟人类 HCC 的免疫微环境和肝脏原位环境。",
    found: false,
    confidence: 0.91,
  },
  {
    id: "E14",
    case_id: "case_003",
    type: "drug_intervention",
    title: "联合用药优于任一单药",
    source_type: "text",
    source_label: "Results paragraph 9",
    page: 12,
    text_anchor:
      "The combination of sorafenib and MK-2206 produced greater tumor growth inhibition than either agent alone.",
    explanation:
      "联合组相较单药组具有更强抑瘤效果，说明 AKT 抑制剂可能增强索拉非尼在体内的治疗作用。",
    strength: "strong",
    limitation:
      "该句说明联合治疗更有效，但仍需正式协同效应分析来区分相加和协同。",
    found: false,
    confidence: 0.87,
  },
  {
    id: "E15",
    case_id: "case_003",
    type: "mechanism",
    title: "联合治疗降低肿瘤组织 p-AKT 并增强凋亡",
    source_type: "figure",
    source_label: "Figure 5",
    page: 12,
    bbox: {
      x: 0.54,
      y: 0.18,
      width: 0.32,
      height: 0.3,
    },
    explanation:
      "免疫组化结果显示联合治疗同时降低 p-AKT 染色并增加 cleaved caspase-3，连接了通路抑制和体内抗肿瘤效应。",
    strength: "medium",
    limitation:
      "免疫组化为终点观察，不能显示药效随时间变化的动态因果过程。",
    found: false,
    confidence: 0.83,
  },
  {
    id: "E16",
    case_id: "case_003",
    type: "functional",
    title: "联合处理在体外预先显示抗增殖基础",
    source_type: "figure",
    source_label: "Figure 4",
    page: 11,
    bbox: {
      x: 0.55,
      y: 0.56,
      width: 0.31,
      height: 0.24,
    },
    explanation:
      "体外增殖曲线和克隆形成结果为体内联合治疗提供前置依据，说明组合策略并非只在动物实验中偶然出现。",
    strength: "medium",
    limitation:
      "体外效果不能直接外推至体内疗效，但可作为机制和剂量设计的支持证据。",
    found: false,
    confidence: 0.78,
  },
  {
    id: "E17",
    case_id: "case_003",
    type: "clinical",
    title: "治疗策略对应临床耐药需求",
    source_type: "text",
    source_label: "Discussion paragraph 2",
    page: 13,
    text_anchor:
      "These findings support vertical targeting of RAF and PI3K/AKT signaling as a candidate strategy for patients who develop acquired resistance to sorafenib.",
    explanation:
      "讨论部分将体内外结果放到临床获得性耐药背景中，说明联合治疗策略具有潜在转化意义。",
    strength: "weak",
    limitation:
      "这是基于实验结果的推论，并非真实临床试验证据。",
    found: false,
    confidence: 0.69,
  },
  {
    id: "E18",
    case_id: "case_003",
    type: "limitation",
    title: "缺少原位和免疫完整模型验证",
    source_type: "text",
    source_label: "Limitations paragraph 2",
    page: 15,
    text_anchor:
      "Future studies should evaluate the combination in orthotopic and immune-competent HCC models before clinical translation.",
    explanation:
      "作者明确指出当前体内证据仍需在更贴近临床的模型中验证，这限定了联合治疗潜力的证据边界。",
    strength: "weak",
    limitation:
      "该证据强调尚未完成关键转化验证，不能作为疗效证据，但有助于结案报告保持严谨。",
    found: false,
    confidence: 0.76,
  },
];
