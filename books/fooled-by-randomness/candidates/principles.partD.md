# 原则候选 · 分段 D（第10–14章、第三篇开头、后记）

> extractor: principle-extractor（全量扫描）｜来源块: parts/D.txt 第1–198行 + parts/E.txt 第1–7行（后记）
> E.txt 第8行以后（中文版赞誉、刘建位推荐、重复前言）不是作者内容，未提取。
> 用户重点场景：投资 / 职业选择 / 日常决策，summary 末尾分别写明用法。
> 原子化拆分；与框架候选（frameworks.partD.md）可能交叉，留给阶段 1.5 去重。

```yaml
- id: pD01
  title: 赢家不一定是最好的（非线性领域里别把胜出等同于优越）
  type: principle
  source_chapter: 第十章 赢家通吃
  chunk_ref: D.txt L14-L16
  source_quote: |
    "经济优越性取决于概率事件加上正面回馈，而不是看技术优越性。"
  summary: |
    规则：在存在正回馈/网络外部性的领域，不要从"谁赢了"推出"谁更好"。作者引用布赖恩·阿瑟，QWERTY 是"最不适任者胜出"的例子。
    投资：别把行业龙头的地位直接当作管理或技术优势的证据；职业：选择雇主/赛道时不以"头部=最好"为准；
    日常：别因为"大家都用"就认为某产品最好。
  tags: [winner-take-all, attribution, path-dependence]
  task_ids: [T13, T01]

- id: pD02
  title: 赢家与等候室：成功者也有演技，失败者同样有演技
  type: principle
  source_chapter: 第十章 加入随机性
  chunk_ref: D.txt L10-L12
  source_quote: |
    "赢家也许有不错的演技，但其他演员也有演技，否则就不会在等候室等待试演。"
  summary: |
    规则：评价某行业的明星时，把"等候室里的所有人"作为分母——能力是入场条件，胜出可能取决于试演官当天心情这样的细节。
    投资：评估明星基金经理时问同期同类有多少人；职业：进入演员、作家、网红等赛道前按等候室群体估算，而不是按明星；
    日常：别把自己的失败全归于能力不足。
  tags: [survivorship, attribution, career, fame]
  task_ids: [T01, T06, T13]

- id: pD03
  title: 无差别时用随机化决定，并欣然接受结果
  type: principle
  source_chapter: 第十章 随机性的优点
  chunk_ref: D.txt L23-L24
  source_quote: |
    "现在在这幅画面中加入随机性，随便把驴子轻轻推向任一方，使它更接近某一边，离另一边稍远些，这么一来，僵局马上解开"
  summary: |
    规则：只有在两个选项近似等价且拖延有代价时，用抛硬币等随机方式打破僵局，结果出来后不再反悔。
    missing_conditions: 书中未界定"近似等价"的判断标准；不适用于有毁灭风险的选项（据全书 T03 原则推断，非本段原文）。
    投资：两个近似等价的标的不必无限期研究；职业：两个差不多的 offer 设截止日后抛硬币；日常：小选择不内耗。
  tags: [decision, randomization, tie-breaking]
  task_ids: []
  task_note: 无对应 T 任务，为日常决策补充工具。

- id: pD04
  title: 期望值公式：各状态概率 × 金额结果之和
  type: calculation
  source_chapter: 第十一章 只能想象一种状态
  chunk_ref: D.txt L33
  source_quote: |
    "数学期望值，也就是拿每种回报的概率，乘以用金额表示的可能结果（50%乘以0加上50%乘以2000美元，等于1000美元）。"
  summary: |
    inputs: 所有可能状态、各自概率、各自金额结果；formula: E = Σ pᵢ × xᵢ；units: 金额；output: 赌局的公平价值。
    规则：用计算而不是想象来定价，因为想象只会呈现一种状态。
    missing_conditions: 稀有事件概率如何估计书中此处未说明（概览已列为 T04 尚缺条件）。
    投资：每个下注写出概率×结果表；职业：比较两份工作时把各种情景的收入加权；日常：买保险、延保时算期望值。
  tags: [expected-value, calculation, probability]
  task_ids: [T04]

- id: pD05
  title: 价外期权不是损耗性资产：期望值 ≠ 最可能情境
  type: calculation
  source_chapter: 第十一章 我们是期权文盲
  chunk_ref: D.txt L73-L74
  source_quote: |
    "这个期权到期时有很高的概率（比方说是90%）价值变成零，但可能有10%的概率平均价值为10美元。"
  summary: |
    inputs: 归零概率90%、获利概率10%、获利时平均价值10美元；formula: 0.9×0 + 0.1×10 = 1美元；
    output: 期望值1美元（等于售价），而最可能情境是0。规则：期权价值是各种可能状况的加权平均，不要用"大概率归零"否定它。
    投资：评估期权、彩票型资产、早期股权按加权平均；职业：对"大概率没结果"的副业/研究做期望值评估；
    日常：备用方案、应急储备也按此思路看价值。
  tags: [options, expected-value, calculation]
  task_ids: [T04, T05]

- id: pD06
  title: 警惕"稳定小赚"的安稳感：期权卖方吃时像小鸡，拉时像大象
  type: principle
  source_chapter: 第十一章 我们是期权文盲
  chunk_ref: D.txt L75-L76
  source_quote: |
    "这一行的人常说，期权卖方吃时像小鸡，拉时像大象。唉，我在事业生涯上碰的大部分期权交易员都是溢价卖方，而他们炸毁时，赔掉的通常是别人的钱。"
  summary: |
    规则：每天小赚带来的"畅流"愉快感不是风险低的证据；能长期获利但经常赔小钱的策略只有坚强的人能忍受，所以多数人选择了反方向。
    检查：一个策略/收入是否"经常小赚、偶尔巨亏"？若是，尾部是否承受得起？
    投资：对收益平滑的产品（卖权、高息理财、套息）追问尾部；职业：稳定但可能被行业一次性淘汰的岗位同理；
    日常：习惯性小冒险（不系安全带、超速）也是"卖期权"。
  tags: [tail-risk, option-seller, skewness, peso-problem]
  task_ids: [T05, T03]

- id: pD07
  title: 别让大脑配合行为：警惕事后用统计为既有行为找理由
  type: principle
  source_chapter: 第十一章 我们是期权文盲
  chunk_ref: D.txt L77
  source_quote: |
    "有一种人，通常是学者，不去要求行为配合大脑，却支使大脑去配合行为。这些人回过头去拿统计数字来为自己的行为找合理化的借口。"
  summary: |
    规则：如果你先做了决定、再去找数据支持，那不是分析而是合理化。明知卖期权不好还要卖，再用统计证明其正确，是自欺欺人。
    投资：先写下决策逻辑和反证条件再看数据；职业：别为已经做出的跳槽/留任决定专门搜集支持性证据；
    日常：注意"我早就知道"式事后解释。
  tags: [rationalization, self-deception, confirmation-bias]
  task_ids: [T07, T10]

- id: pD08
  title: 联合概率相乘：联合事件概率低于任一单独事件
  type: calculation
  source_chapter: 第十一章 犯罪的概率
  chunk_ref: D.txt L51-L52
  source_quote: |
    "假设各为10万分之一，则两者同时成立的概率为100亿分之一，也就是把两个显然独立的事件概率相乘。"
  summary: |
    inputs: 两个（近似）独立事件的概率；formula: P(A且B) = P(A)×P(B)；output: 联合概率。
    规则①：多条独立证据的相乘效果会让结论强度急剧上升（辛普森案的血型+丈夫身份+其他证据）；
    规则②：联合事件的概率一定低于任一单独事件（"女权意识的银行职员"不可能比"银行职员"更可能）。
    missing_conditions: 独立性需确认，书中未讨论相关事件如何处理。
    投资：一个"必须多个条件同时成立"的投资故事，其概率是各条件概率相乘，常被高估；
    职业：成功计划依赖多个环节时，整体成功率要相乘；日常：越具体生动的剧情越不可能，警惕被细节说服。
  tags: [joint-probability, conjunction-fallacy, calculation]
  task_ids: [T09]

- id: pD09
  title: 条件概率要用对条件
  type: principle
  source_chapter: 第十一章 犯罪的概率
  chunk_ref: D.txt L50
  source_quote: |
    "正确的方法应该是看妻子遭丈夫谋杀的案子中，以前也曾遭丈夫殴打的比率有多高（高达50%）。"
  summary: |
    规则：评估概率时先确认"已知的条件是什么"，以该条件为前提计算，而不是引用无条件概率。
    "打妻者只有10%会杀妻"是不以谋杀为前提的概率；已知妻子被杀时，应看被杀妻子中曾被殴打的比例。
    投资：评估"这家公司财务造假的概率"时，以已知的异常信号为条件；职业：用"在已具备X条件的人中成功率多少"而非全体统计；
    日常：读新闻统计时问"这个比例的分母是谁"。
  tags: [conditional-probability, base-rate]
  task_ids: [T09]

- id: pD10
  title: 基础率计算：检测阳性者真正患病的概率（1/51）
  type: calculation
  source_chapter: 第十一章 偏差的例子
  chunk_ref: D.txt L66-L70
  source_quote: |
    "假设没有漏报存在。1000个受检的病患中，预料将有一位罹患这种疾病。999位健康的病患中，检测的结果将有约50位染病，因为准确率是95%。"
  summary: |
    inputs: 患病率1‰、误报率5%、假设无漏报；formula: 真阳性/(真阳性+假阳性) = 1/(1+约50)；units: 人数/概率；
    output: 约1/51（接近2%），而非95%。不到1/5的医生答对。
    规则：任何检测/筛选/信号的意义，必须结合基础率计算；基础率低时，多数阳性是误报。
    投资：低概率事件（如"某只股票是下一个十倍股"）的筛选信号多为误报；职业：简历筛选/面试信号在稀缺人才中误报多；
    日常：体检阳性先复查再接受副作用大的治疗。
  tags: [base-rate, bayes, false-positive, calculation, medical]
  task_ids: [T09]

- id: pD11
  title: 缺乏证据不等于证明没有
  type: principle
  source_chapter: 第十一章 概率与新闻媒体
  chunk_ref: D.txt L80
  source_quote: |
    "他们常把缺乏证据与证明没有这回事混为一谈。"
  summary: |
    规则：样本不足导致"没有证据显示有效"时，结论只能是"有待进一步研究"，不能说成"证明无效"。
    投资：某策略"没有证据显示能跑赢"不等于"肯定跑不赢"，反之"没有证据显示有风险"也不等于安全；
    职业：没听说某行业有人成功≠不可能；日常：读医疗新闻时区分两种表述。
  tags: [evidence, statistics, media, absence-of-evidence]
  task_ids: [T09]

- id: pD12
  title: 平均值的极大值波动低于极大值的平均值
  type: calculation
  source_chapter: 第十一章 CNBC的荒唐言论
  chunk_ref: D.txt L82-L83
  source_quote: |
    "依随机变量极大值分布的概率法则，平均值极大值的波动幅度一定低于极大值的平均值。上述现象并不必然意味空头市场已经来临。"
  summary: |
    inputs: 一组非完全相关的个股价格；规则：个股在不同时点见顶，所以"大盘从高点下跌10%而个股平均从高点下跌40%"并不矛盾，
    更不能据此判断空头来临。output: 对"个股跌幅远大于指数"类说法的正确解读。
    missing_conditions: 未给出定量公式。
    投资：别被这类"背离"统计吓到；职业/日常：比较"团队平均最佳"与"个人最佳的平均"时同理。
  tags: [maximum-distribution, statistics, market-commentary]
  task_ids: [T09]

- id: pD13
  title: 条件预期寿命随年龄增加：别用出生时的平均寿命做规划
  type: calculation
  source_chapter: 第十一章 对寿命的错误预测
  chunk_ref: D.txt L85
  source_quote: |
    "新闻记者把无条件预期寿命和条件预期寿命混为一谈了。刚出生时，你的无条件预期寿命可能是73岁。但是随着年龄日增且没有死亡，你的预期寿命会跟着你的年龄而提高。"
  summary: |
    inputs: 当前年龄、健康状况；规则：剩余寿命期望 = 以"已活到当前年龄"为条件的期望，而不是"平均寿命 − 当前年龄"；
    书中示例：73岁健康者可能仍有9年，82岁仍有约5年，100岁也为正。类似谬误：手术死亡率1%不意味第100位病人必死。
    投资/理财：退休资金规划要按条件预期寿命甚至更长，防止活得比钱久；职业：规划职业年限时同理；
    日常：理解"已经连续成功99次"不改变独立事件的概率。
  tags: [conditional-expectation, life-expectancy, retirement, calculation]
  task_ids: [T09]

- id: pD14
  title: 不解释噪声：低于常态波动的变动不需要理由
  type: principle
  source_chapter: 第十一章 非线性的概率
  chunk_ref: D.txt L92
  source_quote: |
    "道琼斯工业股价指数在11000点时涨跌1.03点，幅度根本不到0.01%。这样的波动不值得提出解释。诚实的人看不到有可以解释的东西"
  summary: |
    规则：微小波动没有原因可讲；任何为噪声提供的"因为……所以……"都是编造。记者拿薪水就要解释，所以他们的评论应当舍弃。
    投资：跳过财经媒体的日内涨跌解释；职业：别对领导一两句话、一次数据的波动过度解读；日常：社交媒体热点同理。
  tags: [noise, media, explanation, information-diet]
  task_ids: [T08]

- id: pD15
  title: 显著性的非线性：涨跌2%的显著性约为1%的4倍
  type: calculation
  source_chapter: 第十一章 非线性的概率
  chunk_ref: D.txt L96
  source_quote: |
    "涨跌2%的显著性不是涨跌1%的2倍，而应该是4倍。今天我的屏幕上道琼斯指数上涨1.03点，显著性不到1997年10月股市重挫7%的1/109。"
  summary: |
    inputs: 变动幅度（相对常态波动）；formula（书中隐含）: 显著性约与幅度平方成正比；output: 变动的相对重要性。
    missing_conditions: "1/109"的计算方式书中未给出；平方关系是由"2%→4倍"推断，原文未写公式。
    投资：大跌的信息量远超几次小跌之和，应区别对待；职业/日常：一次重大反馈的重要性远大于多次轻微反馈。
  tags: [significance, nonlinearity, calculation, signal]
  task_ids: [T08]

- id: pD16
  title: 统计显著不等于因果；信赖水平不到90%就没什么好说
  type: principle
  source_chapter: 第十一章 非线性的概率（因果关系）
  chunk_ref: D.txt L94-L95
  source_quote: |
    "最后，必须给各项因素一个信赖水平；如果信赖水平不到90%，那就没有什么好说的。"
  summary: |
    规则①：一秒之差、52% vs 48%这样的差异不足以下结论，差异要显著才开始分析原因；
    规则②：即使显著，也不意味着找到了原因（医院A生男孩多不说明在A生就会生男孩）；
    规则③：多因素影响时，单个因素的信赖水平低于90%则不作因果声明。
    投资：对"X导致市场涨跌"的说法要求多变量和信赖水平；职业：绩效差异小时不归因于个人能力；日常：别把偶然相关当生活规律。
  tags: [causality, significance, confidence-level, threshold]
  task_ids: [T01, T09]

- id: pD17
  title: 误差范围比预测值重要
  type: principle
  source_chapter: 第十一章 我们不了解信赖水准
  chunk_ref: D.txt L103-L104
  source_quote: |
    "在市场中操作时，我认为市场会往哪里走的重要性，远不如我在某种信赖水平下允许的误差率。"
  summary: |
    规则：做任何预测或接受他人预测时，先要误差范围；决策（仓位、准备）按区间而非点估计定。
    专业人士常忘：一个人发表的意见中，估计值的重要性不如信赖水平。
    投资：问分析师"目标价的区间是多少"，按下限设仓位；职业：评估收入/晋升预期时要区间；日常：旅行、工期、预算都留余量。
  tags: [confidence-interval, forecasting, position-sizing]
  task_ids: [T03, T04]

- id: pD18
  title: 承认自己容易受骗，时时提高警觉
  type: principle
  source_chapter: 第十一章 自白；第三篇 我没那么聪明
  chunk_ref: D.txt L106, L115-L116
  source_quote: |
    "但我和别人不一样的是，我知道自己这方面的能力很弱。我的本性一直试图害我自取其败，所以必须时时提高警觉才行。"
  summary: |
    规则：专业训练不能使人免于被随机性愚弄；唯一的区别是知道自己弱，并据此设防。
    投资：别以为懂概率就不会犯错，仍需外部规则约束；职业：越资深越要设置复核机制；日常：对"我不会上当"的自信保持警惕。
  tags: [humility, self-awareness, bias]
  task_ids: [T11, T01]

- id: pD19
  title: 不读会引发情绪的评论（批评者文章、记者市场评论、书评）
  type: principle
  source_chapter: 第三篇 活在随机世界中（我没那么聪明）
  chunk_ref: D.txt L119
  source_quote: |
    "阅读他们的评论时，我没办法克制自己的情绪，我能做的事是不去读他们写的东西。对新闻记者也比照办理，不去看他们写市场发生了什么事，可以免去很多情绪性的反应。"
  summary: |
    规则：无法控制阅读后的情绪时，就不读，而不是读了再努力冷静。
    投资：不看市场评论、股吧、持仓讨论；职业：不追看对自己工作的匿名差评或同行八卦；日常：关闭引发愤怒的推送。
  tags: [information-diet, emotion, avoidance, wax-in-ears]
  task_ids: [T08, T11]

- id: pD20
  title: 戒掉媒体；无法离开时把电视静音
  type: principle
  source_chapter: 第三篇 戒掉媒体
  chunk_ref: D.txt L121
  source_quote: |
    "我最引以为豪的成就，是戒掉了接触电视和新闻媒体的习惯。……我的花招是把音量完全关闭。"
  summary: |
    规则：主动戒除电视和新闻；在无法关掉的环境里（交易室的 CNBC）把声音关掉，静音后的权威显得荒唐可笑，失去威吓效果。
    投资：只在固定低频率看行情，不开财经直播；职业：开放式办公环境中屏蔽噪声源；日常：新闻 App 关通知、视频静音浏览。
  tags: [media, information-diet, trick]
  task_ids: [T08, T11]

- id: pD21
  title: 用小窍门转移情绪对象：不对视、把对方当火星人/危险动物
  type: principle
  source_chapter: 第三篇 我没那么聪明
  chunk_ref: D.txt L118
  source_quote: |
    "其中之一是避免和别人的眼睛接触，在上述开车的例子中，你可以不看后视镜。我试着把对方想成是火星人，有时这个办法还挺管用的"
  summary: |
    规则：对他人的冒犯无法理性到不动气时，不看对方，或把对方重新框定为不同物种，使其能危害你却不能引你动怒。
    投资：面对唱空/嘲讽你的人，不进入情绪对抗；职业：处理无礼客户、同事时用"非人化"框架降低情绪卷入（仅用于自我调节）；
    日常：路怒、网络争吵。
  tags: [emotion-regulation, reframing, trick]
  task_ids: [T11, T12]

- id: pD22
  title: 绩效未达预定门槛不看报告
  type: principle
  source_chapter: 第十二章 难以抛弃本性的人
  chunk_ref: D.txt L142
  source_quote: |
    "不让自己去接触绩效报告，除非绩效到达预定的门槛。"
  summary: |
    规则：事先设定门槛，未达门槛时不接触绩效信息，以免对噪声产生情绪化操作。
    missing_conditions: 门槛如何设定未给出。
    投资：只有收益/回撤超阈值才查看账户；职业：新项目设评估节点，节点前不按日报调整方向；日常：减重、存钱计划按周期而非每天检查。
  tags: [threshold, performance, noise, information-diet]
  task_ids: [T08, T11]

- id: pD23
  title: 不在交易台底下摆巧克力：移除诱惑源，而不是对抗诱惑
  type: principle
  source_chapter: 第十二章 难以抛弃本性的人
  chunk_ref: D.txt L142-L143
  source_quote: |
    "这就像想吃巧克力时，把脑子和口腹之欲分离开来。我的做法是绝不在交易台底下摆巧克力。"
  summary: |
    规则：大部分人知道应该怎么做，问题在没有起而行；所以需要"低等形式的窍门"而不是大道理——把诱惑物移出可及范围。
    投资：删掉手机交易 App、关闭融资功能；职业：把分心工具从工作环境中移除；日常：家里不放零食、不在卧室放手机。
  tags: [environment-design, temptation, willpower]
  task_ids: [T11]

- id: pD24
  title: 知道≠做到：用窍门而非说教改变行为
  type: principle
  source_chapter: 第十二章 难以抛弃本性的人
  chunk_ref: D.txt L143-L144
  source_quote: |
    "大部分人都知道言谈举止应该如何才对，问题出在我们没有起而行，而非我们不懂。"
  summary: |
    规则：别指望通过多学知识、听劝诫来改变行为（护士在癌症中心门口吸烟）；先接受自己"只是动物"，再设计窍门。
    投资：不要以为读完行为金融学就不会追涨杀跌，要设规则和自动化；职业：自我提升计划依赖机制而非决心；
    日常：新年愿望式目标改为环境安排。
  tags: [behavior-change, willpower, knowing-doing-gap]
  task_ids: [T11]

- id: pD25
  title: 小样本关联是骗人的：别把好运与无关动作挂钩
  type: principle
  source_chapter: 第十二章 赌徒的迷信
  chunk_ref: D.txt L132
  source_quote: |
    "这种无意识的行为，反映我内心深处相信绩效和眼镜之间有某种关联。在理性上，这种统计关联性是骗人的，因为样本很小。"
  summary: |
    规则：在随机结果密集的环境里，留意自己是否在重复与结果无关的仪式（入口、领带、眼镜）；样本小时任何关联都不可信。
    投资：不把"上次穿这件衣服/在这个时点下单赚了"当方法；职业：成功一次的做法不等于有效流程；日常：可保留作为生活诗意，但不让它进入重大决策。
  tags: [superstition, small-sample, causality]
  task_ids: [T01, T09]

- id: pD26
  title: 不要相信命运会特别眷顾自己
  type: principle
  source_chapter: 第十二章 赌徒的迷信
  chunk_ref: D.txt L133
  source_quote: |
    "即使赔率对赌徒显然不利，他有时还是相信命运之神会特别眷顾而义无反顾。"
  summary: |
    规则：赔率对你不利时，不因"我运气好/我特别"而下注；聪明人和概率专家也会在赌场里成为肥羊，甚至请算命师预卜大头寸。
    作者对赌博的定义：不管赔率有利与否，面对随机结果都能获得刺激的活动。
    投资：检查自己的下注是为了正期望还是为了刺激；职业：别因"我会是那个例外"而进入期望值为负的赛道；日常：彩票、赌博。
  tags: [gambling, overconfidence, odds]
  task_ids: [T04, T03]

- id: pD27
  title: 重新买入测试：如果今天不会按市价买入，就不该继续持有
  type: principle
  source_chapter: 第十三章 路径依赖的信念
  chunk_ref: D.txt L169
  source_quote: |
    "你不肯按目前市价买进的画，表示市价已高于其实价，留着它不放根本不合理，你所做的只是感情上的投资。"
  summary: |
    规则：对任何持有物定期问"手头没有的话，按现价会买吗？"答"不会"则持有只是感情投资。
    投资：对每只持仓、每套房产做此测试；职业：对现职、现有项目做"今天还会选吗"测试；日常：会员、藏品、长期关系中的投入同理。
  tags: [path-dependence, sunk-cost, endowment-effect, position-review]
  task_ids: [T10]

- id: pD28
  title: 保留改变主意的权利，且不必为改变主意辩解
  type: principle
  source_chapter: 第十三章 怀疑论之子 / 破除路径依赖
  chunk_ref: D.txt L158-L167
  source_quote: |
    "他可能一时冲动买进几个小时前才强烈断定会下跌的某种货币，但他一点也不觉得不好意思。什么事情改变了他的心意？他认为没有必要回答这个问题。"
  summary: |
    规则：不因过去讲过、做过而坚持原有意见（西塞罗、贝比奇、索罗斯"每一天都是一张白纸"）；改主意不羞耻，也无需交代理由。
    边界（书中可见）：同一特质也让依赖索罗斯资金的侯让几乎毁了事业——对别人的承诺与对市场的观点要区分。
    投资：发现判断错时立即反手或止损，不为一致性付费；职业：允许自己换赛道，不被"当初说过要干一辈子"绑住；
    日常：争论中坦然说"我改主意了"。
  tags: [changing-mind, path-dependence, flexibility, soros]
  task_ids: [T10, T07]

- id: pD29
  title: 团队纪律：每次开会先确认"我们是一群傻子，容易犯错"
  type: principle
  source_chapter: 第十三章 计算而不思考
  chunk_ref: D.txt L177
  source_quote: |
    "我从索罗斯身上学到这个教训，于是在公司每次开会之初，都要说服在场的每个人相信我们不过是一群傻子，什么也不懂且容易犯错"
  summary: |
    规则：把"我们容易犯错"制度化为会议开场，以对抗团队为既有观点辩护的倾向（对比 LTCM 主事者事后怪罪稀有事件与对手）。
    投资：投资委员会或个人投资日记每次开头写"我可能错在哪"；职业：团队复盘先承认无知；日常：家庭重大决策前同理。
  tags: [humility, team-process, error-acceptance]
  task_ids: [T07, T10]

- id: pD30
  title: 失败后不怪罪稀有事件或对手，而是承认错误、汲取教训
  type: principle
  source_chapter: 第十三章 计算而不思考
  chunk_ref: D.txt L177
  source_quote: |
    "接受已发生的事是该勇敢面对的事，但这会毁掉他们整个学术生涯辛苦建立的观念。"
  summary: |
    规则：重大失败后，先检讨方法本身，而不是用"稀有事件""对手像秃鹰"来辩护；问"你怎么知道那是稀有事件？"
    投资：亏损复盘不用"黑天鹅"作结论；职业：项目失败先问方法是否错了；日常：人际冲突后先查自己的判断。
  tags: [post-mortem, accountability, error-correction]
  task_ids: [T07, T10]

- id: pD31
  title: 不把风险当作可精确测度的赌局
  type: principle
  source_chapter: 第十三章 计算而不思考
  chunk_ref: D.txt L174-L176
  source_quote: |
    "生命不是一副扑克牌，我们甚至不知道里面有多少颜色。但不知道为什么，有些人就是爱'测度'风险，尤其是他们拿了钱就得做事的时候。"
  summary: |
    规则：现实没有明确规则，风险测度模型（马克维茨式）以为已知未来的不确定性；对精确风险数字保持怀疑，并注意测度者的激励（拿钱就得做事）。
    投资：不按模型给出的"最大回撤"上杠杆；职业：对咨询、评估报告的精确风险数字打折；日常：对"安全率99.9%"之类宣传保留余量。
  tags: [risk-measurement, model-risk, incentives]
  task_ids: [T03, T05]

- id: pD32
  title: 区分科学与科学家：科学可信，个别科学家会被偏见污染
  type: principle
  source_chapter: 第十三章 科学的进化
  chunk_ref: D.txt L179-L180
  source_quote: |
    "人们常把科学和科学家混淆。科学很伟大，但个别科学家很危险。他们是凡人，也会被凡人的偏差给污染，或许有过之而无不及。"
  summary: |
    规则：不因专家、诺奖得主的身份而相信其结论；个人会为既有观点"辩护"，学科的纠错往往要靠代际更替（"从一场葬礼赶往另一场葬礼"）。
    投资：对明星经济学家/基金经理的观点与其历史立场的利益关系保持警惕；职业：对行业前辈的建议区分"其经验"与"可检验的规律"；
    日常：健康、育儿建议同理。
  tags: [authority, expertise, skepticism, science]
  task_ids: [T01, T07]

- id: pD33
  title: 有情绪不失尊严，失尊严的是举止（斯多噶真义）
  type: principle
  source_chapter: 第十四章 与概率平起平坐
  chunk_ref: D.txt L192
  source_quote: |
    "有那些情绪反应并没有错，也不失尊严—人生来就有情绪。错的是不能像英雄般，或至少像个有尊严的人那样挺直腰杆。这才是斯多噶哲学的真正意义，它要人与概率平起平坐。"
  summary: |
    规则：不要求自己没有情绪，只要求在情绪中保持举止；英雄以其行为而论，不以成败论。
    投资：亏损时允许难过，但不做报复性交易；职业：被拒、被裁时允许失落，但不卑躬屈膝；日常：坏消息面前先挺直腰杆。
  tags: [stoicism, dignity, emotion]
  task_ids: [T12]

- id: pD34
  title: 逆境中的尊严行为清单
  type: principle
  source_chapter: 第十四章 随机现象与优雅行为
  chunk_ref: D.txt L197
  source_quote: |
    "赔钱的时候，务必对你的助理更为客气，不要对他发怒（许多交易员经常这个样子，令人不齿）。不要将你的命运怪罪于任何人，即使他们确实是祸首也是一样。"
  summary: |
    清单（原文逐项）：①行刑日穿最好的衣服、刮好胡子、挺直站立；②确诊癌症不哭天喊地，只和医生讨论病情，不让别人知道；
    ③赔钱时对助理更客气，不发怒；④不把命运怪罪于任何人，即使他们是祸首；⑤伴侣出轨也不自怜自艾；⑥别怨东怨西；
    ⑦生意变少不哈腰屈膝——"生意虽少，态度不变"。另见：今天绝对不拍某人马屁；求爱时不做有损尊严的事。
    核心：命运女神唯一不能控制的是你的行为。
    投资：亏损期对家人、同事的态度是第一考核项；职业：业务下滑、失业时维持专业与体面；日常：疾病、失恋、背叛时的自我准则。
  tags: [dignity, checklist, stoicism, adversity, behavior]
  task_ids: [T12]

- id: pD35
  title: 用个人美感与尊严而非说教驱动行为
  type: principle
  source_chapter: 第十四章 随机现象与优雅行为
  chunk_ref: D.txt L195-L196
  source_quote: |
    "下次碰到厄运时，不妨开始强调个人举止的优雅。你应该表现出不管在什么状况下，都'知道如何生存'。"
  summary: |
    规则：理性的劝诫一走出教室就失效，自助励志书大致没效果；斯多噶有效是因为它诉诸尊严和美感，这是基因的一部分。
    所以给自己设定的行为准则应以"优雅、体面"为标准，而不是以"正确"为标准。
    投资：把交易纪律表述为"体面的投资者不做什么"；职业：用职业尊严约束行为（不拍马屁、不乞求）；日常：逆境中以"优雅应对"为目标。
  tags: [motivation, dignity, aesthetics, behavior-change]
  task_ids: [T12, T11]

- id: pD36
  title: 不要太成功也不要太失败（对两极化结果的个人偏好）
  type: principle
  source_chapter: 第十章 两极化现象
  chunk_ref: D.txt L27
  source_quote: |
    "太成功容易树敌，太失败则叫人气馁。如果可以选择的话，两者我都不要。"
  summary: |
    作者在募资、出书中感受到世界的两极化：不是吸引所有资金，就是一毛钱也得不到。此处是个人偏好而非严格规则，收录供阶段 1.5 判断。
    投资：在两极化市场（募资、热门赛道）里预期结果分布极端，不按中间值规划；职业：选择赢家通吃行业要准备好"全有或全无"的心理和财务缓冲；
    日常：对"小成功"保持满足。
  tags: [polarization, winner-take-all, preference]
  task_ids: [T13]
  task_note: 强度弱，属作者感受；可能降为参考。

- id: pD37
  title: 把专业上的概率纪律延伸到个人生命风险
  type: principle
  source_chapter: 后记 遇上黑天鹅
  chunk_ref: E.txt L7
  source_quote: |
    "塔利波在自己的专业上非常重视概率问题，却不知道为什么，没有将之充分运用到个人生命所冒的风险上。"
  summary: |
    规则（由后记寓言推出，作者未直接写成规则）：在职业中小心规避尾部风险的人，可能在个人生活中（为了"放纵自己"驾直升机）承担不可逆风险；
    风险纪律要跨领域适用，尤其是不可逆的死亡/伤残风险。属寓言，建议阶段 1.5 视为案例支撑而非独立原则。
    投资：别在投资上严控回撤，却在健康、保险、杠杆消费上裸奔；职业：职业规划中的风险意识用于个人健康、安全；
    日常：高危爱好（驾驶、极限运动）也要做毁灭风险检查。
  tags: [ruin, personal-risk, black-swan, consistency]
  task_ids: [T03]
  task_note: 依据为虚构寓言，证据强度低。
```
