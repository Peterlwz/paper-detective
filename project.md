下面给你拆成适合 Vibe Coding / Codex 监督开发的流程。核心原则一句话：

不要让 Codex 一次性开发《论文侦探》整个产品，而是让它一轮一轮做“小闭环”。先假数据跑通体验，再接 PDF，再接 AI。

《论文侦探》的核心闭环是：上传论文 → AI 生成案件 → 用户点击正文/图表收集证据 → 顶部证据栏更新 → 原文高亮 → 生成结案报告。MVP 也明确只需要验证“一篇论文能否被 AI 转化成一个可玩的证据推理关卡”。

一、Vibe Coding 总开发策略
第一原则：先做“能玩”，再做“真 AI”

你真正要验证的不是模型多牛，而是这个体验有没有爽感：

用户点一下论文内容，抓到证据，证据飞进证据栏，原文高亮，最后拼出证据链。

所以开发顺序应该是：

假论文数据
 ↓
假案件数据
 ↓
假证据锚点
 ↓
点击命中
 ↓
顶部证据栏
 ↓
高亮
 ↓
结案报告
 ↓
再接 PDF
 ↓
再接 Qwen3-VL / AI 解析

不要一开始就让 Codex 搞：

PDF 解析 + 图表识别 + AI 推理 + 前端交互 + 数据库存储

这样大概率会乱。

二、推荐技术路线

你不用管技术细节，但可以把这个方案交给 Codex。

前端

建议：

Next.js + TypeScript + TailwindCSS

原因：

页面开发快；
适合做交互产品；
Codex 很擅长；
后续可以直接接 API。
PDF 阅读

MVP 第一阶段先不用真 PDF。

先用：

模拟论文页面 FakePaperViewer

里面放几段正文和几张假图表区域。

后面再接：

PDF.js / react-pdf
状态管理

先用：

React useState / Zustand

不要一开始搞复杂后端。

数据

第一版用本地 JSON：

mockPaper.json
mockCases.json
mockEvidence.json

等交互跑通后，再换成后端接口。

三、开发阶段总表
阶段 0：搭项目骨架

目标：先让项目跑起来。

要做什么
创建 Next.js 项目
配置 TypeScript
配置 TailwindCSS
创建基础页面布局
Codex 指令

你可以直接复制：

请创建一个 Next.js + TypeScript + TailwindCSS 项目。

项目名称：paper-detective

先只做一个首页，显示：
- 产品名：论文侦探 Paper Detective
- 一个“上传论文”按钮
- 一个“进入 Demo 案件”按钮

要求：
1. 页面简洁，科研侦探风格；
2. 不要接真实后端；
3. 所有代码保持清晰；
4. 完成后告诉我运行命令和改动文件。
验收标准
npm run dev 能启动
首页能打开
有上传按钮
有进入 Demo 案件按钮
四、阶段 1：先做假数据

目标：不要碰 AI，不要碰 PDF，先把数据结构定下来。

产品设计书里已经有 Paper、Case、Evidence、Click Event、Click Result 这些对象，这些就是第一版的数据骨架。

要做什么

建立三个 mock 文件：

/mock/paper.ts
/mock/cases.ts
/mock/evidence.ts
数据要包含什么
Paper
{
  paper_id: string
  title: string
  sections: Section[]
  figures: Figure[]
}
Case
{
  case_id: string
  case_title: string
  main_claim: string
  difficulty: 'easy' | 'medium' | 'hard'
  evidence_required: number
}
Evidence
{
  id: string
  case_id: string
  type: string
  title: string
  source_type: 'text' | 'figure'
  source_label: string
  page: number
  text_anchor?: string
  bbox?: {
    x: number
    y: number
    width: number
    height: number
  }
  explanation: string
  strength: 'weak' | 'medium' | 'strong'
  limitation: string
  found: boolean
}
Codex 指令
请为《论文侦探 Paper Detective》创建 mock 数据。

要求：
1. 创建 mock/paper.ts；
2. 创建 mock/cases.ts；
3. 创建 mock/evidence.ts；
4. 模拟一篇肝癌索拉非尼耐药论文；
5. 生成 3 个案件；
6. 每个案件生成 5-7 条证据；
7. 证据要分为 text 和 figure 两类；
8. 每条证据要包含解释、强度、局限性；
9. 不接真实 AI，不接真实 PDF。

完成后请列出数据结构和文件路径。
验收标准
有 mock 数据
TypeScript 类型不报错
一个案件能对应多条证据
证据能区分文本证据和图表证据
五、阶段 2：做案件选择页

目标：用户上传后，先看到 AI 生成的“案件主线”。

产品设计书里案件选择页需要展示案件标题、claim、证据数量、涉及图表、实验类型、难度、预计阅读时间和开始按钮。

页面路径
/cases
页面效果

用户看到：

AI 识别出 3 条案件主线

案件 1：
找出“PI3K/AKT 通路激活导致肝癌索拉非尼耐药”的证据
证据数量：7
难度：中等
开始侦破
Codex 指令
请开发案件选择页 /cases。

数据来源使用 mock/cases.ts 和 mock/evidence.ts。

页面要求：
1. 顶部显示论文标题；
2. 显示 3 个案件卡片；
3. 每张卡片显示：
   - 案件标题
   - main claim
   - 证据数量
   - 难度
   - 推荐指数
   - 开始按钮
4. 点击开始按钮跳转到 /case/[caseId]；
5. 不接后端；
6. 样式简洁，有侦探感和科研感。
验收标准
/cases 能打开
能看到 3 个案件
点击案件能进入阅读页
六、阶段 3：做核心阅读页骨架

这是最关键的一页。

设计书里的桌面端布局是：

顶部：当前案件标题 + 进度
顶部证据栏：[E1] [E2] [?] [?]
左侧：论文正文 / 图表阅读区
右侧：证据详情

这是产品核心页面，必须先做出来。

页面路径
/case/[caseId]
页面结构
┌──────────────────────────────┐
│ 案件标题 + 证据进度            │
├──────────────────────────────┤
│ 顶部证据栏                    │
├──────────────────┬───────────┤
│ 论文阅读区        │ 证据详情区 │
└──────────────────┴───────────┘
Codex 指令
请开发 /case/[caseId] 阅读页骨架。

要求：
1. 根据 caseId 读取 mock case；
2. 顶部显示案件标题；
3. 显示证据进度，例如 0 / 7；
4. 顶部显示证据栏：
   - 已找到显示 E1、E2
   - 未找到显示 ?
5. 左侧显示 FakePaperViewer；
6. 右侧显示 EvidenceDetailPanel；
7. 先不做点击命中逻辑；
8. 页面布局参考：
   - 顶部案件栏
   - 顶部证据栏
   - 左侧论文区
   - 右侧详情区
验收标准
阅读页能打开
能显示当前案件标题
能显示 0 / N 进度
能显示证据栏空位
左右布局正常
七、阶段 4：做 FakePaperViewer

目标：先用假的论文内容模拟真实 PDF。

不要一开始接 PDF。

FakePaperViewer 里面放什么
标题
Abstract
Introduction
Results
几段正文
Figure 1
Figure 2
Figure 3B 假图表区域
Figure legend
Discussion
Limitations

每段文字和每个图表区域都要能点击。

Codex 指令
请创建 FakePaperViewer 组件。

要求：
1. 显示一篇模拟论文内容；
2. 内容包括：
   - Abstract
   - Introduction
   - Results
   - Figure 1
   - Figure 2
   - Figure 3B
   - Discussion
   - Limitations
3. 正文中的句子可以点击；
4. 图表区域可以点击；
5. 点击时回传：
   - target_type: text 或 figure
   - clicked_text
   - source_label
   - bbox 如果是图表
6. 暂时不需要真实 PDF；
7. 用 div 模拟图表区域即可。
验收标准
正文能点击
图表区域能点击
点击后 console 能看到点击对象
八、阶段 5：做点击命中判断

这是产品的“灵魂”。

点击后分三类：

有效证据
相关但不是核心证据
无效点击

设计书明确要求点击反馈不能只有“对/错”，而要分成有效证据、相关信息、无效点击三类。

命中规则第一版

先做简单规则：

文本点击
如果 clicked_text 包含 evidence.text_anchor
或者 evidence.text_anchor 包含 clicked_text
=> 命中
图表点击
如果 source_label === evidence.source_label
=> 命中

先不要做复杂坐标判断。

坐标判断放下一阶段。

Codex 指令
请实现 evidence matching 逻辑。

要求：
1. 创建 utils/matchEvidence.ts；
2. 输入：
   - click event
   - current case evidence list
3. 输出：
   - result_type: valid_evidence | related_info | invalid_click
   - matched_evidence_id
   - feedback
   - score_delta
   - highlight
4. 文本命中规则：
   - clicked_text 和 evidence.text_anchor 有包含关系则命中
5. 图表命中规则：
   - source_label 相同则命中
6. 如果未命中，但点击内容包含 pathway、AKT、sorafenib、resistance 等关键词，则返回 related_info；
7. 其他返回 invalid_click。
验收标准
点中证据句子，返回 valid_evidence
点中背景信息，返回 related_info
点中无关区域，返回 invalid_click
九、阶段 6：做证据栏更新

目标：用户命中证据后，顶部证据栏自动填上。

设计书里证据栏不是普通收藏夹，而是“证据链进度条”，要显示已找到和未找到证据，并支持回跳原文。

状态

前端需要维护：

foundEvidenceIds: string[]
selectedEvidenceId: string | null
highlightedRegions: HighlightRegion[]
clickCount: number
wrongClickCount: number
attentionScore: number
Codex 指令
请实现证据捕获后的状态更新。

要求：
1. 当 matchEvidence 返回 valid_evidence：
   - 把 matched_evidence_id 加入 foundEvidenceIds
   - 如果已经找到过，不重复加入
   - 更新证据进度
   - 顶部证据栏对应位置显示证据卡
   - 右侧显示该证据详情
2. 当 related_info：
   - 显示提示，但不加入证据栏
3. 当 invalid_click：
   - 显示错误提示，不加入证据栏
4. 维护 clickCount、wrongClickCount、attentionScore
5. attentionScore 初始为 20
6. 点中有效证据 +2
7. 点错 -1
验收标准
点中证据后进度从 0 / 7 变成 1 / 7
顶部证据栏出现 E1
右侧出现证据解释
重复点击同一证据不重复计数
点错会出现提示
十、阶段 7：做原文高亮

目标：用户点中证据后，原文或图表区域永久高亮。

设计书强调，高亮是为了建立“证据卡 ↔ 原文位置 ↔ 图表数据 ↔ 科学结论”的映射。

第一版高亮规则

不要做复杂 PDF 坐标，先在 FakePaperViewer 里做：

如果这段文字对应 evidence.id 且 foundEvidenceIds 包含它
=> 加高亮样式

图表同理：

如果 Figure 3B 对应 evidence.id 且已找到
=> 图表区域加边框和标签
Codex 指令
请实现证据高亮功能。

要求：
1. FakePaperViewer 接收 foundEvidenceIds；
2. 如果某段文本对应已找到证据，则添加高亮背景；
3. 如果某个图表区域对应已找到证据，则添加高亮边框；
4. 高亮旁边显示证据标签，例如：
   - 表达证据 E1
   - 功能证据 E3
5. 点击顶部证据卡时：
   - selectedEvidenceId 更新
   - 对应高亮区域闪烁一次
   - 右侧显示证据详情
验收标准
点中正文证据后，正文高亮
点中图表证据后，图表高亮
点击顶部证据卡，右侧能切换详情
十一、阶段 8：做证据详情卡

目标：右侧解释“这条证据为什么重要”。

证据详情卡应该显示：

证据编号
证据类型
来源
证据内容
支持的推理
证据强度
局限性
Codex 指令
请开发 EvidenceDetailPanel 组件。

要求：
1. 没有选中证据时，显示提示：
   “点击论文中的可疑证据开始侦破”
2. 选中证据后显示：
   - 证据编号
   - 证据标题
   - 来源
   - 证据类型
   - 证据强度
   - explanation
   - limitation
3. 证据强度显示为：
   - weak 弱
   - medium 中
   - strong 强
4. 局限性必须醒目显示。
验收标准
点击证据后右侧显示解释
能看到证据强度
能看到局限性
十二、阶段 9：做提示系统

提示系统是 P1，但建议 MVP 后半段就做，因为它能提升新手体验。

设计书里提示分三级：

一级提示：提示章节
二级提示：提示段落或图表
三级提示：直接高亮附近区域

Codex 指令
请实现 HintSystem 组件。

要求：
1. 每个案件有 3 级提示；
2. 用户点击“使用提示”后逐级显示；
3. 一级提示显示章节；
4. 二级提示显示具体图表或段落；
5. 三级提示让相关区域轻微闪烁，但不直接加入证据；
6. 每使用一次提示，hintUsed +1；
7. attentionScore 扣分：
   - 一级提示 -1
   - 二级提示 -2
   - 三级提示 -3
验收标准
可以点击提示
提示逐级出现
使用提示会扣注意力值
三级提示能引导用户看某个区域
十三、阶段 10：做结案报告页

目标：找齐证据后生成结果页。

结果页内容包括：

最终结论
证据链图
证据强度表
用户阅读复盘
可导出内容

设计书中结果页叫 Evidence Verdict，要展示结论、证据链、证据强度和用户复盘。

页面路径
/case/[caseId]/verdict
Codex 指令
请开发结案报告页 /case/[caseId]/verdict。

要求：
1. 当用户找齐所有证据后，显示“生成结案报告”按钮；
2. 点击后进入 verdict 页面；
3. verdict 页面展示：
   - 最终结论
   - 证据链
   - 证据强度表
   - 用户阅读复盘
   - 局限性总结
4. 数据来自当前案件的 evidence list 和用户状态；
5. 暂时不接 AI，总结内容可以根据 mock 数据生成。
验收标准
证据找齐后出现按钮
能进入结案报告页
能看到证据链
能看到强度表
能看到局限性
十四、阶段 11：再接真实 PDF

前面都跑通之后，才开始接真实 PDF。

这一步的目标不是 AI，而是：

让用户上传 PDF
能看到 PDF 页面
能点击页面区域
能拿到点击坐标
Codex 指令
请接入 PDF 阅读能力。

要求：
1. 使用 react-pdf 或 PDF.js；
2. 用户可以上传 PDF；
3. 上传后显示 PDF 页面；
4. 支持翻页；
5. 用户点击 PDF 页面时，能获得：
   - page number
   - x 坐标
   - y 坐标
   - 页面宽高
6. 坐标需要归一化为 0-1；
7. 暂时不做 AI 解析；
8. 暂时不要求文本选择。
验收标准
能上传 PDF
能显示 PDF
点击页面能输出 page、x、y
坐标是 0-1 范围
十五、阶段 12：接文本层点击

目标：用户点击正文，不只是点坐标，还要知道点了哪句话。

Codex 指令
请为 PDF 阅读器增加文本层点击能力。

要求：
1. 使用 PDF.js text layer；
2. 每个文本 span 可点击；
3. 点击后返回：
   - page
   - clicked_text
   - span bbox
4. 能把点击文本传给 matchEvidence；
5. 如果命中 evidence.text_anchor，则触发证据捕获。
验收标准
点击 PDF 正文能拿到文字
文字可以参与证据命中判断
命中后证据栏能更新
十六、阶段 13：接图表区域点击

目标：用户点击图表区域时，可以判断是否落在证据 bbox 内。

产品设计书中图像证据需要保存 page、figure_id、bbox、subfigure_label、caption_anchor、image_crop_path 等。

Codex 指令
请实现图表区域 evidence bbox 命中判断。

要求：
1. evidence 中的 bbox 使用归一化坐标：
   - x
   - y
   - width
   - height
2. 用户点击 PDF 页面时，也转换成归一化坐标；
3. 判断点击点是否落入 evidence.bbox；
4. 如果落入，则返回 valid_evidence；
5. 命中后在 PDF 页面上叠加高亮框；
6. 高亮框位置要跟随页面缩放。
验收标准
点击图表 bbox 内部能命中
点击 bbox 外部不命中
图表高亮框位置正确
缩放后高亮不偏移
十七、阶段 14：最后接 AI 后端

这一步才轮到 Qwen3-VL / AI。

AI 后台不是只输出摘要，而是要输出结构化数据：

paper
cases
evidence_items
anchors
bbox
explanations
strength
limitations
click feedback rules

设计书也明确说后台应该生成结构化数据，而不是只生成自然语言总结。

AI 接口第一版
上传接口
POST /api/papers/upload

返回：

{
  paper_id: string
  status: 'processing'
}
解析结果接口
GET /api/papers/:paperId/analysis

返回：

{
  paper: Paper
  cases: Case[]
  evidence_items: Evidence[]
}
Codex 指令
请创建 AI 分析接口的 mock 后端。

要求：
1. POST /api/papers/upload 接收 PDF；
2. 暂时不真实调用模型；
3. 返回 paper_id；
4. GET /api/papers/:paperId/analysis 返回 mock paper、cases、evidence；
5. 前端上传页改成调用 upload；
6. 上传完成后跳转到 /cases?paperId=xxx；
7. /cases 根据 paperId 获取 analysis。
验收标准
上传流程像真的
接口能返回案件和证据
前端不再直接 import mock，而是通过 API 获取
十八、阶段 15：接真实 Qwen3-VL / 多模态模型

这个阶段要非常谨慎，不要让 Codex 自由发挥。

模型任务拆开

不要给模型一个大任务：

解析论文并生成所有东西

要拆成几个小任务：

1. 提取论文结构
2. 提取核心 claim
3. 生成案件主线
4. 为每个案件生成证据点
5. 定位文本锚点
6. 定位图表 bbox
7. 生成证据解释
8. 生成局限性
Codex 指令
请实现 AI Analysis Pipeline 的骨架，不需要真实模型。

要求：
1. 创建 services/aiPipeline.ts；
2. 拆成以下函数：
   - extractPaperStructure()
   - extractClaims()
   - generateCases()
   - generateEvidenceItems()
   - locateTextAnchors()
   - locateFigureBboxes()
   - generateEvidenceExplanations()
   - generateLimitations()
3. 每个函数先返回 mock 数据；
4. 保持输入输出类型清晰；
5. 后续可以替换为真实 Qwen3-VL 调用。
验收标准
AI pipeline 是分层的
每一层都能单独替换
不会把所有逻辑写死在一个接口里
十九、推荐的开发顺序总清单

你可以让 Codex 按这个顺序做：

01 初始化项目
02 创建 mock 数据结构
03 创建首页
04 创建案件选择页
05 创建阅读页布局
06 创建顶部证据栏
07 创建 FakePaperViewer
08 创建 EvidenceDetailPanel
09 实现点击事件
10 实现 matchEvidence
11 实现证据捕获状态
12 实现文本高亮
13 实现图表高亮
14 实现注意力值
15 实现提示系统
16 实现结案报告页
17 接入上传接口 mock
18 接入 PDF viewer
19 接入 PDF 文本层点击
20 接入 PDF 坐标点击
21 接入真实 AI pipeline mock
22 替换为真实模型调用
23 增加用户纠错
24 增加导出 Markdown / PDF
二十、每一轮 Vibe Coding 固定模板

以后你每次丢给 Codex，都用这个模板：

你现在只做一个小任务，不要扩展需求。

任务：
【这里写本轮任务】

背景：
这是《论文侦探 Paper Detective》项目。
核心体验是：用户点击论文正文或图表，命中证据后加入顶部证据栏，并在原文高亮。

要求：
1. 只修改和本任务相关的文件；
2. 不要重构无关代码；
3. 不要接真实 AI；
4. 不要引入不必要的新库；
5. 保持 TypeScript 类型清晰；
6. 完成后列出：
   - 改动文件
   - 新增组件
   - 如何运行
   - 如何验收

验收标准：
【这里写 3-5 条具体标准】
二十一、Codex 监督时重点查什么

你让 Codex 监督时，重点盯这些：

1. 有没有越界开发

不该做 AI 的时候，它偷偷接了 AI。

不该做数据库的时候，它偷偷加数据库。

这都要打回去。

2. 有没有把逻辑写死

例如只支持：

Figure 3B

而不是支持任意 evidence。

打回去。

3. 状态是不是清楚

必须有：

foundEvidenceIds
selectedEvidenceId
highlightedRegions
attentionScore
hintUsed
clickCount
wrongClickCount
4. 数据结构是不是稳定

Paper、Case、Evidence、ClickEvent、ClickResult 不要乱改。

5. 是否每一步都能跑

每一轮开发后都应该能：

npm run dev

页面不能坏。

二十二、第一版绝对不要做什么

这些先别做：

多人协作
排行榜
社区分享
账号体系
多论文证据链
自动生成 PPT
模型微调平台
复杂数据库权限
真实科研数据库检索

设计书里也明确说，MVP 暂不建议做这些，第一版目标只有一个：验证论文能否变成可玩的证据推理关卡。

二十三、最终 MVP 应该长什么样

第一版跑通后，用户体验应该是这样：

打开首页
 ↓
点击进入 Demo 案件
 ↓
看到 3 个案件
 ↓
选择一个案件
 ↓
进入论文阅读页
 ↓
点击正文一句实验结果
 ↓
系统提示：找到证据 E1
 ↓
顶部证据栏出现 E1
 ↓
原文高亮
 ↓
右侧显示解释、强度、局限性
 ↓
继续点击图表
 ↓
找到 E2、E3、E4...
 ↓
证据找齐
 ↓
生成结案报告
 ↓
看到完整证据链和论文结论边界

这就是第一版要做出来的东西。

一句话总结：

先别急着做“AI 论文神器”，先用假数据做出“点一下就抓到证据”的爽感。这个爽感成立了，后面再接 PDF 和模型。