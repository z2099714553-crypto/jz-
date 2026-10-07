# verified.md — 阶段 1.5 三重验证结果

> validation_version: task-first-v2（cangjie-skill v2.5）
> 输入：candidates/ 下 frameworks ×3、principles ×3、cases、counter-examples、glossary，共约 396 条候选
> 方法：按 BOOK_OVERVIEW 关键任务 T01–T14 合并去重为规范单元；每个单元保留全部原候选 ID 作出处
> 用户重点场景：投资、职业选择、日常决策（V2 演练均用这三类新输入）
> source_id: src-main-book（中译本 EPUB，中信出版社）；位置用章节标注，行号见各候选的 refs/line_ref

---

## v01 运气与能力归因诊断

```yaml
id: v01
title: 运气与能力归因诊断（这份成功有多少是运气？）
type: framework + checklist
tasks: [T01, T13]
merged_from:
  frameworks: [fA01, fA12, fA17, fA19, fC08, fC18, fD01, fD02]
  principles: [pA03, pA06, pA13, pA20, pA30, pA31, pA36, pC25, pC32, pC33, pC34, pC35, pC45, pD01, pD02]
  cases: [c03, c04, c06, c07, c11, c47, c51, c52, c53, c65, c66, c67, c68, c69]
  counter_examples: [x01, x02, x07, x28, x29, x38, x44, x53]
source_evidence:
  - 前言（混为一谈表、犯错成本不对称）
  - 第1章（行业平均值、血清素正回馈）
  - 第5章（横断面问题）
  - 第二篇开头、第9章（随机成分 × 猴子数量；一万名经理人模拟）
  - 第10章（非线性、赢家通吃、路径依赖）
V1_source_sufficiency:
  passed: true
  reason: 混为一谈表、"随机成分×参与人数"两因素、横断面问题、非线性正回馈均有完整论述；第9章给出 N×p^k 模拟口径
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "同事 A 去年靠重仓某行业 ETF 赚了 60%，现在开课教'行业轮动'，我要不要跟？"
  walkthrough: |
    ①左右栏：60% 属"市场表现"一行，默认放左栏（运气）待证 → ②行业随机成分：高（单年、单行业）
    → ③猴子数：去年做行业押注的散户极多，必有大量 60%+ 者 → ④横断面：去年最赚的人最适合去年的行情
    → ⑤是否有过程证据：能否说清发生器、经历过逆境 → 结论：绩效记录不足以证明能力，不跟课，
    若感兴趣只看其方法的可证伪部分
  expected: 给出"证据不足/倾向运气"的结论 + 依据清单
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 防止追星、自负加仓、跟风职业选择；统一"看过程不看结果"的检查口径
gaps: 作者未给出"确实是能力"的正面判据（第9章自承答不上来），能力卡须明说只能给出"证据强/弱"，不能判定"是能力"
decision: verified
importance: critical
```

## v02 另类历史：按过程而非结果评价决策

```yaml
id: v02
title: 另类历史 / 俄罗斯转盘检验
type: framework
tasks: [T02]
merged_from:
  frameworks: [fA02, fA03, fA04, fA05, fA06, fA07, fA16]
  principles: [pA04, pA05, pA12]
  cases: [c07, c08, c09, c11, c12, c13, c16]
  counter_examples: [x03, x04, x08, x11]
source_evidence:
  - 第1章末（牙医与门卫，"重活一百万次"）
  - 第2章（另类历史、俄罗斯转盘、发生器、预测 vs 预言）
  - 第3章（样本路径、蒙特卡罗、在历史之下求和）
V1_source_sufficiency:
  passed: true
  reason: 第2章完整给出"以另类成本论断成败"规则和转盘思想实验；第3章补充路径途中低点与蒙特卡罗思考方式
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "我两年前没去大厂、选了国企，现在大厂同学年薪是我两倍，我是不是选错了？"
  walkthrough: |
    ①识别发生器：当年两条路的结果分布 → ②列出另类历史：大厂路径中裁员、35岁危机、部门被砍等；国企路径中的稳定下限
    → ③看分布宽窄与下限，而非同学这一条已实现路径 → ④结合当时信息与偏好判断"决策质量"
    → 结论：同学的结果只是宽分布中较好的一条；若当时信息下选择合理，决策并不因此变差
  expected: 决策质量评语与结果评语分开写
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 减少以成败论英雄的后悔与误判；统一"决策质量 vs 结果"两栏输出
gaps: 现实中发生器不可见，另类历史只能定性列举、粗估；卡片须提醒"列举而非精算"
decision: verified
importance: critical
```

## v03 毁灭风险优先（防炸毁）

```yaml
id: v03
title: 先问失败能否承受：毁灭风险优先与防炸毁纪律
type: principle + procedure
tasks: [T03]
merged_from:
  frameworks: [fA08, fA09, fA18, fA22, fA23]
  principles: [pA01, pA02, pA07, pA08, pA09, pA21, pA22, pA23, pA32, pA34, pC19, pD26, pD37]
  cases: [c02, c03, c04, c15, c17, c18, c19, c26, c101]
  counter_examples: [x05, x12, x13, x25, x69]
source_evidence:
  - 第一篇引子（偏态：失败代价无法承受时成功概率无关紧要）
  - 第1章（炸毁定义、塔利波的交易纪律、收入与积蓄风险分离）
  - 第2章（俄罗斯转盘：反复玩必遇子弹）
  - 第3章（遍历性；"这次不一样"；用别人的概率推演自己）
  - 第5章（杠杆）
  - 后记（专业纪律未迁移到个人生活）
V1_source_sufficiency:
  passed: true
  reason: 原则一句话讲透，第1章给出可执行纪律清单（止损、亏损上限、不卖未抵押期权、积蓄只放最安全工具）
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "朋友劝我把首付款加 3 倍杠杆买某币，说胜率 90%。"
  walkthrough: |
    ①列出最坏路径：爆仓 → 首付清零、可能负债 → ②能否承受：不能（买房计划终结）
    → ③判定：不论胜率多高，不做；若坚持参与，只用"亏光也不影响生活"的钱、不加杠杆
    → ④重复博弈检查：即便这次赢，反复这样做终会遇到"子弹"
  expected: 拒绝或封顶损失的明确建议
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 防止不可逆损失；职业上拒绝"一次失败就出局"的赌注（违规、全押一个雇主等）
gaps: 无；"不可承受"的线需用户自定（卡片要求先问清）
decision: verified
importance: critical
```

## v04 期望值与不对称下注

```yaml
id: v04
title: 看期望值而非胜率；方向判断与押注方向分开
type: calculation + framework
tasks: [T04]
merged_from:
  frameworks: [fC01, fC02, fD04, fD05]
  principles: [pA10, pC01, pC02, pC03, pC05, pC06, pC12, pD04, pD05, pD06]
  cases: [c28, c29, c30, c31, c32, c33, c34, c44, c72, c77]
  counter_examples: [x30, x33, x54, x58]
source_evidence:
  - 第6章（999/1 赌局、"看涨却卖空"、频率无关紧要、倾力赌一边）
  - 第11章（期望值 vs 最可能情境；1 美元价外期权；一次只能想象一种状态）
V1_source_sufficiency:
  passed: true
  reason: 第6章与第11章给出完整公式口径（概率×结果求和）与数值例题，可复算
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "某理财产品：95% 概率年化 6%，5% 概率本金亏 40%。"
  walkthrough: |
    EV = 0.95×6% + 0.05×(−40%) = 5.7% − 2% = 3.7%；最可能情境 = +6%；
    → 期望值远低于"最可能"的 6%，且含 −40% 的尾部 → 与存款等无风险替代比较，并转 v03 检查 −40% 能否承受
  expected: EV=3.7%
  observed: 3.7%
V3_task_utility:
  passed: true
  expected_benefit: 把"胜率高所以该做"改为结构化计算；识别"常赚小钱、偶亏大钱"的产品与工作机会
gaps: 稀有事件概率本身难以估计（作者亦无实证），卡片须要求给区间并做敏感性分析
decision: verified
importance: high
```

## v05 隐藏尾部风险诊断（比索问题 / 在铁轨上打盹）

```yaml
id: v05
title: "稳定高收益"背后的隐藏尾部风险诊断
type: troubleshooting
tasks: [T05]
merged_from:
  frameworks: [fA13, fA14, fC03, fC04, fC20]
  principles: [pA33, pC07, pC08, pC09, pC10, pC13, pC14]
  cases: [c04, c26, c35, c36, c37, c38, c39, c40, c41]
  counter_examples: [x05, x06, x26, x31, x32, x33, x34]
source_evidence:
  - 第1章（在铁轨上打盹）
  - 第5章（10 西格玛、越久没遇稀有事件越脆弱）
  - 第6章（比索问题、剔除离群值、定常性、卢布基金）
V1_source_sufficiency:
  passed: true
  reason: 症状（长期低波动、稳定小赚）→ 判断（是否把随机性塞到地毯下、宽历史中有无崩跌、是否剔除离群值）→ 处置，均有原文
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "某私募产品 3 年来每月都正收益，最大回撤 0.5%，年化 12%。"
  walkthrough: |
    症状命中（平滑高收益）→ 问：收益来源是否卖保险/卖期权/高杠杆利差？更宽的历史（同类策略在 2008/2015/2020）有无崩跌？
    是否有流动性/平仓踩踏风险？→ 结论：在弄清来源前视为"铁轨上打盹"型，按 v03 只投可承受全损的金额
  expected: 列出待查三问 + 风险提示
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 识别最典型的炸毁结构；职业上识别"一直很稳"的单一雇主/行业依赖
gaps: 无
decision: verified
importance: high
```

## v06 存活者偏差审计

```yaml
id: v06
title: 存活者偏差审计（数一数猴子）
type: procedure + calculation
tasks: [T06]
merged_from:
  frameworks: [fC09, fC10, fC11, fC12, fC15, fC17, fC19]
  principles: [pC28, pC29, pC30, pC31, pC32, pC33, pC37, pC38, pC39, pC42, pC44, pC46]
  cases: [c47, c49, c50, c52, c54, c56, c57, c58, c59, c60, c61, c63, c64]
  counter_examples: [x38, x39, x42, x43, x44, x46, x47, x48, x49, x50]
source_evidence:
  - 第二篇开头（打字机前的猴子）
  - 第8章（双重存活者偏差、罗宾汉策略研究的修正方法）
  - 第9章（一万名经理人模拟、神秘信件、数据挖掘、书评、1900 年股市）
V1_source_sufficiency:
  passed: true
  reason: 第9章给出完整模拟口径（N=10000，p=0.5，5 年剩 313；p=0.45 剩 184），第8章给出"从过去起点群体追到今天"的修正流程
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "某平台'年度十佳基金经理'榜单，前十名都连续 3 年跑赢大盘，全市场约 3000 名经理。"
  walkthrough: |
    纯运气基准：3000 × 0.5^3 = 375 人连续 3 年跑赢 → 十佳完全可由运气产生；
    再问：榜单是否只含仍在任者（退出者被剔除）？统计区间是否恰逢某风格行情（双重偏差）？→ 结论：榜单不构成能力证据
  expected: 375
  observed: 375
V3_task_utility:
  passed: true
  expected_benefit: 统一"先算纯运气能产出多少明星"的口径；适用于基金榜单、成功学、职业"成功人士"建议、回测
gaps: 原始群体规模常不可得（卡片要求给区间估计）
decision: verified
importance: critical
```

## v07 主动上门机会的逆向选择检查

```yaml
id: v07
title: 主动找上门的投资/机会：逆向选择检查
type: checklist
tasks: [T14]
merged_from:
  frameworks: [fC14]
  principles: [pC36]
  cases: [c54, c55]
  counter_examples: [x45, x46]
source_evidence:
  - 第9章（网球赛基金广告、神秘信件骗局、"主动上门推销的投资纯靠运气的概率接近100%"）
V1_source_sufficiency:
  passed: true
  reason: 第9章明确给出规则及两个机制案例
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "银行客户经理打电话推荐一只'近一年收益 35%'的新产品。"
  walkthrough: |
    ①上门 → 提高标准 ②为什么推给我：展示的是被挑选出的最好产品/区间 ③要全部同类产品与完整期间业绩
    ④问过程（策略、风险）而非业绩 ⑤推荐方的激励（佣金）→ 结论：业绩数字信息量极低，按 v06/v05 审查
  expected: 检查清单输出
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 高频投资场景（理财推销、荐股群、猎头报"高薪机会"）一步识别选择偏差
gaps: 证据只在一章，但机制完整；与 v06 相邻，路由时区分"主动上门"
decision: verified
importance: medium
```

## v08 证伪条件与止损（天真否证论）

```yaml
id: v08
title: 下注前先写下"我错了的信号"，到点认错
type: procedure
tasks: [T07]
merged_from:
  frameworks: [fA15, fC05, fC06, fC07, fD14, fD15]
  principles: [pA26, pA27, pC15, pC16, pC17, pC18, pC20, pC21, pD31]
  cases: [c42, c43, c45, c46]
  counter_examples: [x35, x36, x37, x66]
source_evidence:
  - 第5章（事先规划亏损对策；身份事先确定；亏损时先检验分析框架）
  - 第7章（黑天鹅、用数据否证不证实、画界问题、帕斯卡式使用统计、止损）
  - 第13章（风险不可像赌局般测度）
V1_source_sufficiency:
  passed: true
  reason: 第7章完整给出"用统计积极下注，但不用它管风险；事先确定证伪事件并止损"
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "我看好新能源车板块，准备买入 20% 仓位。"
  walkthrough: |
    ①写下论点 ②写下证伪事件（如渗透率连续两季下滑/价格跌破买入价 15%）③写下身份与期限（交易 vs 长期持有，事先定）
    ④最大亏损上限与出场动作 ⑤"从未发生过"不作为安全依据 → 输出一张可执行的进出场单
  expected: 论点 + 证伪条件 + 出场规则三项齐全
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 防止事后改口（"我是长线投资"）、死守；职业上可用于"给新工作/创业设 12 个月检查点"
gaps: 跳空/流动性枯竭时止损可能无法按价执行（作者自己描述的平仓踩踏）→ 写入 B，并要求配合 v03 的仓位上限
decision: verified
importance: high
```

## v09 信息节食与查看频率

```yaml
id: v09
title: 时间尺度与噪声：降低查看频率、换低频信息源
type: calculation + procedure
tasks: [T08]
merged_from:
  frameworks: [fA10, fA11, fD07, fD12]
  principles: [pA14, pA15, pA16, pA17, pA18, pA19, pC23, pC24, pD14, pD15, pD20, pD22]
  cases: [c20, c21, c81, c85, c88]
  counter_examples: [x14, x15, x61]
source_evidence:
  - 第3章（退休牙医：93%/67%/50.02%；噪声比 0.7/2.32/30/1796；信息有毒；提炼后的思想）
  - 第11章（噪声过滤、显著性、核平滑）
  - 第12章（未达门槛不看绩效报告）
V1_source_sufficiency:
  passed: true
  reason: 第3章给出完整数值；公式原文未写，经复算：P(赚)=Φ((μ/σ)√Δt)，噪声比=σ/(μ√Δt)，与原文数值一致（年 0.67≈0.7，月 2.31≈2.32），作为"提炼者约定"标注
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "我的组合预期年化 8%、波动 20%，每天看盘很焦虑。"
  walkthrough: |
    日（Δt=1/252）：Φ(0.4×0.063)=Φ(0.025)≈51% 的日子赚钱；月：Φ(0.4×0.289)=Φ(0.115)≈54.6%；年：Φ(0.4)≈65.5%
    → 每天看几乎是抛硬币，情绪赤字（负面感受约为正面 2.5 倍）→ 建议改为月度或季度查看，配合 v08 预设的硬止损提醒
  expected: 日≈51%、月≈54.6%、年≈65.5%
  observed: 一致（容差 ±0.5 个百分点）
V3_task_utility:
  passed: true
  expected_benefit: 用数字说服自己少看；职业上对 KPI、日常对体重/学习进度同样适用
gaps: 正态假设忽略肥尾；"2.5 倍"无出处；低频查看必须配硬止损，否则与第5章约翰"不理会市场起伏"冲突 → 写入 B
decision: verified
importance: high
resources_planned: [resources/noise_ratio.py]
```

## v10 概率盲纠错清单

```yaml
id: v10
title: 概率直觉纠错（基础率、条件概率、合取、显著性、误差区间）
type: checklist + calculation
tasks: [T09]
merged_from:
  frameworks: [fD06, fD08, fD09, fC16]
  principles: [pD07, pD08, pD09, pD10, pD11, pD12, pD13, pD16, pD17, pC40, pC41, pC43]
  cases: [c62, c73, c74, c75, c76, c78, c79, c80, c82]
  counter_examples: [x51, x52, x55, x56, x57, x59, x60, x62]
source_evidence:
  - 第9章（证词 vs 基础率、自发复原、统计显著≠可利用）
  - 第11章（辛普森案、银行职员、假阳性 1/51、缺乏证据≠证明没有、条件寿命、信赖水平）
V1_source_sufficiency:
  passed: true
  reason: 第11章逐项给出错误类型与例题（含可复算的 1/51）
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "某选股指标历史上'预测上涨'准确率 90%，误报率 10%；真正大涨股约占 2%。指标亮灯，这只股大涨的概率？"
  walkthrough: |
    1000 只中：真大涨 20 只，亮灯 18；不涨 980 只，误报 98 → P = 18/(18+98) ≈ 15.5%
  expected: ≈15.5%
  observed: 15.5%
V3_task_utility:
  passed: true
  expected_benefit: 体检、选股信号、面试"成功率"、新闻统计的系统性纠错
gaps: "显著性平方律"为原文举例推得，非原文公式，标为约定；作者部分数据（辛普森案数字）无出处
decision: verified
importance: high
```

## v11 路径依赖信念测试（敢于改主意）

```yaml
id: v11
title: 重新买入测试：如果今天没有，你还会要它吗？
type: procedure
tasks: [T10]
merged_from:
  frameworks: [fA15, fA20, fD13, fD16]
  principles: [pA24, pA25, pA28, pA29, pC22, pD27, pD28, pD29, pD30]
  cases: [c23, c24, c27, c90, c91, c92, c93, c94, c95, c96]
  counter_examples: [x16, x17, x18, x19, x20, x21, x22, x23, x24, x65, x67]
source_evidence:
  - 第5章（不懂随机常态的市场傻瓜特质清单；死守头寸；消防站效应）
  - 第13章（路径依赖的信念；"如果现在没有，你会按市价买进吗"；索罗斯、贝比奇；LTCM 归咎；开会自认傻子）
V1_source_sufficiency:
  passed: true
  reason: 第13章给出测试问句与 2 万买画涨到 4 万的例题；第5章给出六项特质清单
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "我在现公司 5 年，晋升停滞，但觉得走了前面的积累就白费了。"
  walkthrough: |
    重新买入测试：假如今天你是外部候选人，以现在的薪资、前景，你会主动申请这份工作吗？
    → 若否：5 年是沉没成本，进入换岗评估；若是：说明具体理由并设下次复查时点
    → 同时检查第5章特质：是否在改说辞（"我是在长期耕耘"）、是否只和同组人交流（消防站效应）
  expected: 是/否结论 + 理由 + 复查时点
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 处理持仓、工作、项目、关系中的沉没成本与死守
gaps: 作者未讨论"随时改主意"对承诺与信誉的代价（索罗斯撤资侯让）→ 写入 B
decision: verified
importance: high
```

## v12 塞蜡：用环境设计替代意志力

```yaml
id: v12
title: 塞蜡策略：承认改不了本性，改环境
type: procedure
tasks: [T11]
merged_from:
  frameworks: [fC13, fA21, fD10, fD11]
  principles: [pC26, pC27, pD18, pD19, pD21, pD23, pD24, pD25]
  cases: [c05, c48, c83, c84, c85, c86, c87, c88, c89]
  counter_examples: [x40, x41, x63, x64]
source_evidence:
  - 第1章（嫉妒邻居、相对地位）
  - 第8章（马克与珍娜：用公平样本衡量自己，搬家而非说理）
  - 第三篇开头（奥德修斯与塞蜡的水手；电视静音；不看后视镜）
  - 第12章（赌徒的迷信、斯金纳的鸽子、不在交易台下放巧克力、吸烟的护士）
V1_source_sufficiency:
  passed: true
  reason: 原则与多个具体做法均有原文
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "我知道不该频繁交易，但一刷到群里有人晒收益就忍不住买。"
  walkthrough: |
    ①识别刺激源：晒收益群（存活者样本 + 社会比较）②切断：退群/免打扰，卸载行情 App 的推送
    ③加摩擦：交易前必须先填 v08 的证伪单 ④改参照：只和自己的计划比，不和群里最好的人比
    → 输出 3–5 条具体环境改动
  expected: 具体到动作的环境改动清单
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 把"我应该自律"变成可执行的环境改动；职业上处理同辈压力、日常处理消费冲动
gaps: 无
decision: verified
importance: high
```

## v13 逆境中的尊严（与概率平起平坐）

```yaml
id: v13
title: 厄运来时：只控制自己的举止
type: checklist
tasks: [T12]
merged_from:
  frameworks: [fD17]
  principles: [pD33, pD34, pD35]
  cases: [c98, c99, c100]
  counter_examples: [x68]
source_evidence:
  - 第14章（随机性是最后的裁判；斯多噶真义；逆境行为清单；"生意虽少，态度不变"）
V1_source_sufficiency:
  passed: true
  reason: 第14章给出完整行为清单
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "我被裁员了，很想在朋友圈骂公司。"
  walkthrough: |
    清单逐项：不怪罪任何人（即使对方是祸首）→ 不自怜、不抱怨 → 对身边人更客气 → 照常打理仪表与作息
    → 把可控部分（下一步求职）与不可控部分（裁员决定）分开 → 输出今天可做的 3 个举止动作
  expected: 行为清单输出
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 在亏损、失业、被拒时减少二次伤害（冲动发言、报复性交易）
gaps: 属价值观指引，效果难客观验证；不替代心理援助 → 写入 B
decision: verified
importance: medium
```

## v14 随机化打破僵局

```yaml
id: v14
title: 两个选项真的差不多时，掷硬币
type: procedure
tasks: [清单外补充]
merged_from:
  frameworks: [fD03]
  principles: [pD03]
  cases: [c70]
source_evidence:
  - 第10章（布里丹之驴、随机"轻推"）
V1_source_sufficiency:
  passed: true
  reason: 一处完整说明（僵局 → 随机轻推 → 打破）
V2_executability:
  passed: true
  check_mode: walkthrough
  input: "两个 offer 薪资、平台、通勤都差不多，纠结了两周。"
  walkthrough: |
    ①先确认真的无差别（用 v02/v03 检查下限与毁灭风险无差异）②掷硬币 ③观察自己对结果的第一反应，若明显失望则说明并非无差别，回到评估
  expected: 判停条件明确
  observed: 一致
V3_task_utility:
  passed: true
  expected_benefit: 减少在等价选项上的时间消耗
gaps: 书中只是一处修辞性举例；"观察第一反应"为提炼者约定，非原文 → 标注
decision: verified
importance: low
```
