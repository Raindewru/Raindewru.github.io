// 题库数据
const questions = [
    { id: 1, dimension: 'A', question: '在一个热烈的线上群聊中，你的角色通常是：', options: [
        { text: '潜水，看大家聊就行', value: 1 },
        { text: '偶尔发发“哈哈”或表情包', value: 2 },
        { text: '参与讨论，能清晰表达自己的观点', value: 3 },
        { text: '“金句”输出者，你的发言总能引爆全场', value: 4 }
    ]},
    { id: 2, dimension: 'A', question: '你安利一部电影给朋友，你更倾向于：', options: [
        { text: '快去看，很牛！', value: 1 },
        { text: '讲的是…（复述一遍剧情）', value: 2 },
        { text: '它的镜头…它的隐喻…（开始有条理地分析）', value: 3 },
        { text: '它让我想起…（讲一个生动的故事或比喻，让对方瞬间get到）', value: 4 }
    ]},
    { id: 3, dimension: 'A', question: '当你和别人发生辩论时，你的状态是：', options: [
        { text: '算了，不想吵架，对方说的都对', value: 1 },
        { text: '脑子里有，但嘴上说不出来，很着急', value: 2 },
        { text: '能有条不紊地陈述1、2、3点，以理服人', value: 3 },
        { text: '语言的艺术，能瞬间抓住对方的逻辑漏洞，并用巧妙的类比反击', value: 4 }
    ]},
    { id: 4, dimension: 'A', question: '你需要写一份重要的邮件或报告：', options: [
        { text: '拖延症晚期，不知道怎么动笔', value: 1 },
        { text: '只能写出干巴巴的要点，缺乏文采', value: 2 },
        { text: '用词专业、结构清晰，是一份标准的文书', value: 3 },
        { text: '你的文字极富感染力或说服力，能让读者身临其境', value: 4 }
    ]},
    { id: 5, dimension: 'B', question: '拿到一个新电子产品或APP，你会：', options: [
        { text: '凭感觉乱按，功能用到哪算哪', value: 1 },
        { text: '只看“快速入门指南”，学会必要功能', value: 2 },
        { text: '把说明书或设置菜单从头到尾看一遍，搞懂系统架构', value: 3 },
        { text: '快速上手后，开始研究它的规则漏洞或最优用法', value: 4 }
    ]},
    { id: 6, dimension: 'B', question: '你安排一次多人旅行，你的计划表是：', options: [
        { text: '计划？随缘，到时候再说', value: 1 },
        { text: '列出几个必去的地点，但时间随意', value: 2 },
        { text: '制作Excel表，时间精确到小时，预算精确到个位', value: 3 },
        { text: '不仅有Plan A，还有Plan B和Plan C应急预案', value: 4 }
    ]},
    { id: 7, dimension: 'B', question: '玩一个“狼人杀”或“剧本杀”游戏时，你更像是：', options: [
        { text: '小透明，完全搞不懂谁是谁', value: 1 },
        { text: '跟风者，跟着大神的逻辑走', value: 2 },
        { text: '分析师，能记住谁说了什么，并找出矛盾点', value: 3 },
        { text: '操盘手，能推演多条逻辑线，并布局引人上钩', value: 4 }
    ]},
    { id: 8, dimension: 'B', question: '看到一个复杂的社会新闻，你的第一反应是：', options: [
        { text: '太复杂了，只看情绪和结论', value: 1 },
        { text: '理清时间线，搞明白发生了什么', value: 2 },
        { text: '分析各方的利益诉求，找出为什么会发生', value: 3 },
        { text: '洞察其背后的系统性根源，并预测下一步走向', value: 4 }
    ]},
    { id: 9, dimension: 'C', question: '你去一个陌生的地方，你看地图的方式是：', options: [
        { text: '地图白痴，完全依赖导航语音播报', value: 1 },
        { text: '一步一看，必须实时对照手机和路', value: 2 },
        { text: '看一眼地图，在脑中建立3D模型，然后关掉手机', value: 3 },
        { text: '人肉GPS，即使没有地图，也能凭太阳或建筑辨认方向', value: 4 }
    ]},
    { id: 10, dimension: 'C', question: '你在玩“拼图”或“乐高”时：', options: [
        { text: '毫无耐心，这简直是折磨', value: 1 },
        { text: '必须严格按照图纸一步步来', value: 2 },
        { text: '享受从局部拼凑出整体的过程', value: 3 },
        { text: '脱离图纸，能即兴创作出更酷的结构', value: 4 }
    ]},
    { id: 11, dimension: 'C', question: '购买新家具时，你脑中：', options: [
        { text: '毫无概念，必须带尺子现场比划', value: 1 },
        { text: '大概知道放哪里，但不确定是否协调', value: 2 },
        { text: '能清晰想象出它摆放后的样子和空间占比', value: 3 },
        { text: '能瞬间模拟出多种摆放方案，并选出最优解', value: 4 }
    ]},
    { id: 12, dimension: 'C', question: '你能闭上眼睛想象：', options: [
        { text: '一片空白，什么都想不清楚', value: 1 },
        { text: '一个模糊的轮廓', value: 2 },
        { text: '一个清晰的物体，比如红色的苹果', value: 3 },
        { text: '一个极其复杂的场景，并能360度旋转它', value: 4 }
    ]},
    { id: 13, dimension: 'D', question: '当你情绪爆发（如愤怒或悲伤）时：', options: [
        { text: '完全失控，你不知道自己怎么了', value: 1 },
        { text: '后知后觉，事情过去很久才明白过来', value: 2 },
        { text: '当下就能意识到：OK，我现在很生气。', value: 3 },
        { text: '不仅意识到，还能瞬间分析：我生气是因为我的XX需求没有被满足。', value: 4 }
    ]},
    { id: 14, dimension: 'D', question: '你独处的时候，你脑子里：', options: [
        { text: '很慌，必须找点事情做或找人聊天', value: 1 },
        { text: '很无聊， 刷手机打发时间', value: 2 },
        { text: '享受这份宁静，复盘今天的言行', value: 3 },
        { text: '进行深度的自我对话， 探索自己的价值观', value: 4 }
    ]},
    { id: 15, dimension: 'D', question: '别人批评你时，你的第一反应是：', options: [
        { text: '立刻反弹， 本能地防卫或攻击', value: 1 },
        { text: '表面接受， 内心极度沮丧或怨恨', value: 2 },
        { text: '冷静听完， 客观评估哪些是事实，哪些是偏见', value: 3 },
        { text: '感谢对方， 你能从批评中看到自己的盲点', value: 4 }
    ]},
    { id: 16, dimension: 'D', question: '你设定新年目标时：', options: [
        { text: '随大流， 别人定什么我定什么', value: 1 },
        { text: '定很多目标， 但从不知道自己是否真的想要', value: 2 },
        { text: '目标很清晰， 你知道自己的短板', value: 3 },
        { text: '目标直指内心， 你非常清楚什么能让你真正快乐', value: 4 }
    ]},
    { id: 17, dimension: 'E', question: '参加一个全是陌生人的聚会：', options: [
        { text: '社恐发作， 躲在角落玩手机', value: 1 },
        { text: '只和带你来的朋友聊天', value: 2 },
        { text: '能礼貌地和身边的人开启寒暄', value: 3 },
        { text: '气氛组长， 能轻松地融入任何圈子，甚至成为焦点', value: 4 }
    ]},
    { id: 18, dimension: 'E', question: '朋友找你吐槽， 你通常：', options: [
        { text: '很尴尬， 不知道怎么回应， 只好嗯嗯啊啊', value: 1 },
        { text: '急着给建议， 试图帮他解决问题', value: 2 },
        { text: '能安静地倾听， 并表示理解 (我懂你)', value: 3 },
        { text: '能敏锐地捕捉到他没说出口的真实情绪', value: 4 }
    ]},
    { id: 19, dimension: 'E', question: '在团队合作中，你发现自己：', options: [
        { text: '总是那个被忽视的人', value: 1 },
        { text: '只做好自己分内的事， 不多交流', value: 2 },
        { text: '很会协调， 能照顾到大家的情绪， 是润滑剂', value: 3 },
        { text: '天生的领导者， 能让不同的人都服你，并激励大家', value: 4 }
    ]},
    { id: 20, dimension: 'E', question: '你能否通过表情读懂人心？', options: [
        { text: '完全不能， 所有人对我来说都是扑克脸', value: 1 },
        { text: '只能读懂很夸张的喜怒哀乐', value: 2 },
        { text: '能察觉到对方在礼貌微笑下的不耐烦', value: 3 },
        { text: '对方一个眼神闪烁， 你就知道他在撒谎', value: 4 }
    ]},
    { id: 21, dimension: 'F', question: '学习一项新的运动或舞蹈：', options: [
        { text: '肢体僵硬， 总是同手同脚', value: 1 },
        { text: '脑子会了， 身体跟不上， 需要大量重复练习', value: 2 },
        { text: '学得很快， 教练教一遍就能模仿个八九不离十', value: 3 },
        { text: '不仅学得快， 还能举一反三， 加入自己的风格', value: 4 }
    ]},
    { id: 22, dimension: 'F', question: '你在做精细的手工（如穿针、拼模型）时：', options: [
        { text: '手抖得不行， 非常烦躁', value: 1 },
        { text: '能完成， 但过程很笨拙， 需要很专注', value: 2 },
        { text: '手很稳， 享受这种精细的控制感', value: 3 },
        { text: '人机合一， 工具仿佛是你手指的延伸', value: 4 }
    ]},
    { id: 23, dimension: 'F', question: '当你说话时， 你的身体：', options: [
        { text: '很拘谨， 几乎没有多余动作', value: 1 },
        { text: '会有一些不自觉的小动作（如摸头发、抖腿）', value: 2 },
        { text: '会不自觉地配合大量的手势来辅助表达', value: 3 },
        { text: '你的肢体语言本身就是一种表达， 极富表现力', value: 4 }
    ]},
    { id: 24, dimension: 'F', question: '你对自己身体的感知：', options: [
        { text: '很迟钝， 经常不知道自己是冷是热是饿', value: 1 },
        { text: '能感知到， 但总是滞后的（饿过头了才吃）', value: 2 },
        { text: '很敏锐， 能察觉到身体微小的变化和需求', value: 3 },
        { text: '控制力极强， 能通过意志主动调节自己的心跳或呼吸', value: 4 }
    ]},
    { id: 25, dimension: 'G', question: '听一首新歌， 你最先注意到的是：', options: [
        { text: '歌词写得好不好', value: 1 },
        { text: '旋律是否抓耳', value: 2 },
        { text: '鼓点和贝斯的节奏是否到位', value: 3 },
        { text: '编曲的层次、和声的走向以及乐器的音色', value: 4 }
    ]},
    { id: 26, dimension: 'G', question: '如果没有背景音乐：', options: [
        { text: '没感觉， 安静挺好的', value: 1 },
        { text: '会有点不习惯', value: 2 },
        { text: '会非常难受， 你会自己哼出来', value: 3 },
        { text: '你的脑子里自带BGM， 世界万物都有节奏', value: 4 }
    ]},
    { id: 27, dimension: 'G', question: '你在KTV里：', options: [
        { text: '五音不全， 是气氛组', value: 1 },
        { text: '不跑调， 但总是抢拍或慢拍', value: 2 },
        { text: '节奏感很好， 是天生的Rapper或鼓手', value: 3 },
        { text: '不仅不跑调， 还能即兴唱出和声', value: 4 }
    ]},
    { id: 28, dimension: 'G', question: '学习一种乐器：', options: [
        { text: '完全没兴趣， 音乐是噪音', value: 1 },
        { text: '学过， 但很快就放弃了', value: 2 },
        { text: '能轻松地扒出简单的谱子', value: 3 },
        { text: '无师自通， 随便什么乐器到你手里都能玩两下', value: 4 }
    ]},
    { id: 29, dimension: 'H', question: '你去公园散步， 你的注意力在：', options: [
        { text: '手机上， 或思考工作', value: 1 },
        { text: '看其他的人', value: 2 },
        { text: '看花花草草， 能叫出常见植物的名字', value: 3 },
        { text: '看云的形状、树叶的脉络、 昆虫的行为', value: 4 }
    ]},
    { id: 30, dimension: 'H', question: '在养宠物或植物方面， 你是：', options: [
        { text: '植物杀手， 养什么死什么', value: 1 },
        { text: '严格按照攻略来， 但还是养不好', value: 2 },
        { text: '很有耐心， 能照顾得很好', value: 3 },
        { text: '天生的园丁， 仿佛能猜到它们的需求', value: 4 }
    ]},
    { id: 31, dimension: 'H', question: '你对天气的感知：', options: [
        { text: '只关心温度， 看App穿衣服', value: 1 },
        { text: '能感觉到要下雨了', value: 2 },
        { text: '能通过风向和云层判断天气的变化', value: 3 },
        { text: '活的天气预报， 你的直觉比App还准', value: 4 }
    ]},
    { id: 32, dimension: 'H', question: '如果你在野外迷路了：', options: [
        { text: '非常恐慌， 在原地等救援', value: 1 },
        { text: '会尝试寻找有人走过的路', value: 2 },
        { text: '会通过观察苔藓、太阳来辨别方向', value: 3 },
        { text: '你能识别哪些浆果可食， 哪里有水源', value: 4 }
    ]},
    { id: 33, dimension: 'I', question: '面对一个问题， 你的第一反应：', options: [
        { text: '网上搜， 看别人是怎么解决的', value: 1 },
        { text: '套用过去的成功经验', value: 2 },
        { text: '在现有的基础上做一些改良', value: 3 },
        { text: '脑子里冒出三个谁也没想到的新点子', value: 4 }
    ]},
    { id: 34, dimension: 'I', question: '你看待规则：', options: [
        { text: '规则是用来遵守的', value: 1 },
        { text: '规则很烦， 但不得不遵守', value: 2 },
        { text: '规则是用来理解的， 然后再绕过去', value: 3 },
        { text: '规则是用来打破的， 我来制定新规则', value: 4 }
    ]},
    { id: 35, dimension: 'I', question: '你是否经常做白日梦？', options: [
        { text: '很少， 我非常现实', value: 1 },
        { text: '会， 但通常是关于工作和生活的', value: 2 },
        { text: '经常， 脑子里有各种天马行空的幻想', value: 3 },
        { text: '我的幻想已经构成了一个完整的世界观', value: 4 }
    ]},
    { id: 36, dimension: 'I', question: '当你看到一个普通的回形针：', options: [
        { text: '它就是回形针', value: 1 },
        { text: '它可以用来捅手机卡槽', value: 2 },
        { text: '它可以弯成一个小钩子', value: 3 },
        { text: '你能想出它的30种不同用途', value: 4 }
    ]},
    { id: 37, dimension: 'J', question: '你买一件衣服， 最看重：', options: [
        { text: '价格和耐穿性', value: 1 },
        { text: '舒适度', value: 2 },
        { text: '流行款式和品牌', value: 3 },
        { text: '它的剪裁、配色和设计感是否独特', value: 4 }
    ]},
    { id: 38, dimension: 'J', question: '如果一个APP功能很强， 但界面很丑：', options: [
        { text: '没关系， 能用就行', value: 1 },
        { text: '会吐槽， 但还是会用', value: 2 },
        { text: '非常难受， 会到处寻找更好看的替代品', value: 3 },
        { text: '立刻卸载， 丑是原罪', value: 4 }
    ]},
    { id: 39, dimension: 'J', question: '你对自己房间的布置：', options: [
        { text: '能住就行， 很乱', value: 1 },
        { text: '干净整洁， 但没有风格', value: 2 },
        { text: '会购买艺术品和装饰物， 追求氛围感', value: 3 },
        { text: '强迫症， 每个物体的摆放角度和光线都有讲究', value: 4 }
    ]},
    { id: 40, dimension: 'J', question: '你看一部电影时， 什么最容易让你出戏？', options: [
        { text: '情节不合理', value: 1 },
        { text: '演员演技差', value: 2 },
        { text: '配乐太难听', value: 3 },
        { text: '画面构图失衡或配色刺眼', value: 4 }
    ]}
];

// 维度信息
const dimensions = {
    A: { name: "表达力", tag: "天生的叙事者", brief: "该维度衡量你使用语言、文字和故事来清晰、生动、且有说服力地传达思想与情感的能力。" },
    B: { name: "分析力", tag: "秩序的构建者", brief: "该维度衡量你拆解复杂问题、识别数据规律、并使用严谨逻辑来推导最优结论的能力。" },
    C: { name: "想象力", tag: "维度的幻想家", brief: "该维度衡量你在大脑中构建、操纵和推演三维空间、结构或复杂场景的能力。" },
    D: { name: "自察力", tag: "灵魂的潜行者", brief: "该维度衡量你向内探索、清晰感知并理解自己情绪、动机和价值观的自我认知能力。" },
    E: { name: "共情力", tag: "情感的共振器", brief: "该维度衡量你敏锐地感知、理解并回应他人情绪、立场和未说出口需求的社交能力。" },
    F: { name: "协调力", tag: "优雅的行动派", brief: "该维度衡量你精准、流畅地掌控自己身体，完成精细操作或复杂动态（如运动、舞蹈）的能力。" },
    G: { name: "律动力", tag: "世界的节拍器", brief: "该维度衡量你对节奏、旋律、节拍和声音模式的敏感度，以及你本能地创造或跟随音乐律动的能力。" },
    H: { name: "观察力", tag: "敏锐的博物学家", brief: "该维度衡量你注意到环境中被他人忽视的细节、模式或微小变化（尤其在自然中）的能力。" },
    I: { name: "原创力", tag: "规则的打破者", brief: "该维度衡量你打破常规、跳出思维框架、并产生“从0到1”的独特新奇想法的能力。" },
    J: { name: "审美力", tag: "和谐的鉴赏家", brief: "该维度衡量你对美、和谐、色彩和构图的敏感度，以及你对品质和设计有着天生直觉的能力。" }
};

// 维度详细描述
const dimensionDescriptions = {
    A: {
        description: "你是那种能把\"白开水\"讲成\"龙舌兰\"的人。语言对你来说不是工具，而是武器和魔法。你天生知道如何组织词汇、营造氛围、掌控节奏，让听众随着你的叙事而沉浸其中。",
        talent: "擅长写作、公开演讲、辩论、销售或任何需要用语言说服和感染他人的工作。",
        power: "你的核心力量是\"构建意义\"。你总能为平凡的事物赋予\"故事感\"，让人们愿意相信你、追随你。",
        advice: "将表达结构化：先观点后论证，使用“三点陈述+类比+故事”提升理解与说服。刻意练习复述与总结，录音回听优化节奏与措辞。"
    },
    B: {
        description: "你对\"混乱\"有天然的过敏反应。你的大脑是一台精密的分析引擎，总是在不自觉地拆解你看到的一切：从一个商业模式到一部电影的情节。你追求的不是\"差不多\"，而是\"为什么\"和\"最优解\"。",
        talent: "擅长数据分析、策略规划、编程、侦探推理或任何需要严谨逻辑和系统思维的领域。",
        power: "你的核心力量是\"洞察规律\"。你能在别人眼中的一团乱麻里，清晰地看到那条隐藏的逻辑线。",
        advice: "搭建问题框架：明确目标与约束，画因果/流程图，用数据与反例校验结论。保持“假设-验证-复盘”的闭环，提高推理准确性。"
    },
    C: {
        description: "当别人在看\"一堵墙\"时，你看到的是\"墙内的结构\"、\"房间的布局\"和\"光线穿过窗户的角度\"。你的大脑天生是\"三维\"的。你闭上眼，就能构建出一个完整的、细节丰富的世界。",
        talent: "擅长建筑设计、工业设计、导演、3D建模、下棋或任何需要在脑中进行\"空间推演\"的工作。",
        power: "你的核心力量是\"多维构建\"。你能\"看见\"尚未存在的事物，并把它们在现实中创造出来。",
        advice: "进行心像训练：闭眼旋转物体、在脑中拼装/解构结构；多做素描/建模与拼装练习，从局部到整体强化空间感。"
    },
    D: {
        description: "你拥有一个极其丰富的\"内心宇宙\"。相比于外界的喧嚣，你更习惯于向内探索。你清楚自己每一个情绪的来源，了解自己真正的欲望和恐惧。你不是\"活给别人看\"的，你是\"活给自己看\"的。",
        talent: "擅长哲学思考、心理咨询、写作、战略规划或任何需要深度自我认知和坚定价值观的领域。",
        power: "你的核心力量是\"内在导航\"。你永远不会\"迷失\"自己，你知道自己是谁，要去哪里。",
        advice: "建立情绪日志：记录事件-感受-需求-选择；每天 10 分钟冥想与自我对话，识别触发点与价值观边界，减少自动化反应。"
    },
    E: {
        description: "你是一块\"情绪海绵\"。当别人走进房间时，你不需要他开口，就能\"感觉\"到他的喜怒哀乐。你天生能捕捉到他人\"没说出口\"的需求和\"隐藏\"的情绪，并能给予最恰当的回应。",
        talent: "擅长团队管理、心理疗愈、谈判、教学、人力资源或任何需要\"搞定人\"的工作。",
        power: "你的核心力量是\"建立连接\"。你是天生的\"粘合剂\"，能让一个团队产生真正的信任和归属感。",
        advice: "练习主动倾听：镜像对方的事实与感受，延迟建议，先确认需求；关注微表情与语气，营造心理安全，提高连接质量。"
    },
    F: {
        description: "你的\"灵魂\"并不只活在你的大脑里，它活在你的\"全身\"。你对自己的身体有极强的掌控力，你的动手能力远超常人。你学习新运动、舞蹈或手工艺品的速度快得惊人。",
        talent: "擅长运动、舞蹈、外科手术、乐器演奏、烹饪、手工艺或任何需要\"人机合一\"的精细操作。",
        power: "你的核心力量是\"完美执行\"。你总能将\"脑中所想\"，通过身体\"毫厘不差\"地在现实中实现。",
        advice: "提升身体控制：从呼吸与节奏入手，做慢动作分解；小肌群精细训练与核心稳定结合，视频回看纠错，形成稳定动作模板。"
    },
    G: {
        description: "你对\"时间\"的感知异于常人。你不仅能\"听见\"音乐，你还能\"看见\"节奏。无论是说话的韵律、走路的步伐，还是电影的剪辑，你总能本能地找到那个\"最舒服\"的\"节拍\"。",
        talent: "擅长音乐创作、演奏、指挥、剪辑、舞蹈或任何需要精准把握\"时间点\"和\"节奏感\"的领域。",
        power: "你的核心力量是\"掌控节奏\"。你总能让事物按你的\"节拍\"发生，创造出和谐的流动感。",
        advice: "建立节奏感：跟随节拍器分解拍点，练习“分层听/分段打”；把工作切块进入节奏循环，用节奏管理专注与输出质量。"
    },
    H: {
        description: "你拥有\"像素级\"的眼睛。当别人\"走马观花\"时，你已经注意到了\"叶子背面的虫卵\"、\"远处天空的云层变化\"或\"朋友新换的耳钉\"。你对\"细节\"和\"环境\"的感知力，让你能发现别人忽视的真相。",
        talent: "擅长刑侦、数据分析、生态研究、摄影、质检或任何需要\"从细节中发现规律\"的工作。",
        power: "你的核心力量是\"细节索引\"。世界对你来说是一本打开的书，你总能读到隐藏在细节里的信息。",
        advice: "训练细节敏感：制定观察清单（颜色/形状/变化），做自然笔记与对比拍摄；放慢速度，定期复盘微差与规律。"
    },
    I: {
        description: "你的大脑里没有\"应该\"\"这样\"。你总是本能地问\"为什么不能那样？\"。你讨厌模仿，厌恶陈规。你享受\"从0到1\"的快感，你来此世间的目的，就是为了创造\"前所未有\"的新事物。",
        talent: "擅长创业、艺术创作、发明、广告创意、科学研究或任何需要\"跳出框架\"的领域。",
        power: "你的核心力量是\"无中生有\"。当所有人都走进\"死胡同\"时，你能推倒一堵墙，开辟一条新路。",
        advice: "双模思考：先发散再收敛，使用 SCAMPER 与限制条件激发新解；建立灵感库，小步实验验证，把点子尽快转化为原型。"
    },
    J: {
        description: "你天生就知道什么是\"美\"。你对\"丑\"有一种生理性的无法忍受。你对色彩、构图、光影、排版、甚至气味都有着极其挑剔的标准。你不是在\"追求\"美，你本身就是\"美\"的\"探测器\"。",
        talent: "擅长平面设计、时尚、摄影、室内设计、艺术评论或任何需要\"高级品味\"的领域。",
        power: "你的核心力量是\"定义品质\"。你能立刻分辨出\"90分\"和\"99分\"的区别，你是\"和谐\"与\"品质\"的最终守门人。",
        advice: "构建审美参考系：拆解大师作品的色彩与构图，制作情绪板并应用到场景；减少噪声、统一风格与留白，提高整体品质。"
    }
};

const dimensionLevelContent = {
    A: {
        high: {
            tag: "语言的织梦者",
            desc: `你不是在“说话”，你是在“构建世界”。你能把抽象讲成画面，把混乱讲得有秩序，把情绪讲成别人能理解的语言。你的表达不仅传递信息，还能改变氛围、影响情绪、塑造认知。在人群中，你的语言像光，让观点变得清晰，让故事变得鲜活。`,
            insight: `你的真正天赋是用语言调控世界。别人是描述事情，而你能重构事情：设定框架、营造语境、影响他人对事件的理解。你不仅能“说得好”，更能让人走进你创造的意义之中。`,
            advice: `让语言结构化，让观点更具力量；使用比喻和场景感加强画面呈现；用写作沉淀风格，把影响力从当下延展到长期；以“故事驱动观点”，让表达更具改变力；当你的语言不仅让人听懂，更能让人改变，你的天赋将彻底被释放。`
        },
        mid: {
            tag: "自带故事感的人",
            desc: `你天生让人愿意听你说话。你的表达有节奏、有温度、有画面，能把复杂讲得简单，也能把平淡讲得有趣。你不是最张扬的表达者，但你能稳定、清晰、舒服地讲好每一段内容。`,
            insight: `你的核心能力是组织和提炼意义。你能下意识地抓重点、排逻辑、连观点，让信息变得更顺畅易懂。你并不依赖技巧，而是天生让人“听得进去”。`,
            advice: `尝试“三段式表达”：结论—理由—例子；在表达中加入比喻，提升画面感；练习复述他人观点，加强逻辑能力；找到最适合你的表达风格（故事型/洞察型/幽默型）；当你的表达从“好听”变成“有结构”，你会成为团队中非常稳定的沟通者。`
        },
        low: {
            tag: "沉稳的倾听者",
            desc: `你并不依赖华丽语言，也不喜欢抢话，你的沟通方式是一种稀缺的安静力量。你说话简洁直接，但你真正的优势在于你深度而真诚的倾听，让人感到被尊重和理解。你不是表达弱，而是更习惯让想法沉淀后再说出口。`,
            insight: `你的天赋在于深度聆听与诚实沟通。你的一对一表达往往比群体表达更有力量。你反应可能不快，但思考更深，因此你在关键时刻的发言通常直击核心。`,
            advice: `先用文字整理思路，再进行表达；在沟通前准备一句总结，让表达更清晰；练习每日50字以内观点，增强表达紧凑度；接受你的表达风格，它本身就很有价值；当你愿意让观点被听见，你的表达力将快速提升。`
        }
    },
    B: {
        high: {
            tag: "规律的捕手",
            desc: `你拥有直面复杂、拆解混乱的天赋。别人看到的是一团乱麻，你看到的是结构、规律、因果链。你能在信息过载中迅速找到关键变量，用极清晰的逻辑构建通向结论的路径。你的大脑像一台精准的分析引擎：冷静、高效、稳定。`,
            insight: `你的核心能力是把复杂问题化为可控模型。你不仅会解题，你会“定义问题”“建立框架”“找到最优解的底层逻辑”。你的判断通常极少出错，因为你不是凭感觉，而是凭结构化思维做决策。你属于少数能在混乱中保持清晰的人。`,
            advice: `把经验沉淀成方法论，提高复用性；使用“假设—验证”模式，让分析更高效；在模型化之外，适当加入情感与情境，避免结论过冷；尝试输出分析文章，强化结构表达能力；当你从“解决问题的人”进化为“定义问题的人”，你的分析力将成为真正的核心竞争力。`
        },
        mid: {
            tag: "思路清晰的解题者",
            desc: `你思维清楚、逻辑稳健，能从纷乱的信息里找出重点，把问题拆成可处理的小部分，再逐步推进解决。你的分析不张扬，但很实用、很可靠，让人安心。你属于那种“讲一遍大家就懂了”的人。`,
            insight: `你的优势是条理化与结构感。你会自然地整理信息、找规律、排优先级，是团队里很重要的“稳定器”。当别人陷入情绪或混乱时，你往往能站在更高的位置看到整体。`,
            advice: `练习“金字塔结构”，让表达更有逻辑力；对问题进行“拆解—归类—排序”，提升效率；适当加入数据验证，增强判断底气；尝试把思考可视化（思维导图/列表），提升表现力；当你能把清晰的思路转成清晰的表达，你的分析力会进一步上升到更高层级。`
        },
        low: {
            tag: "感知型思考者",
            desc: `你不喜欢复杂的推演，也不擅长处理大量信息，你更习惯依赖直觉、经验和感受判断事情。这让你在很多情境下反而能做出更“人性化”的决定。你的优势不在逻辑，而在感知和对整体氛围的把握。`,
            insight: `你的潜在能力是“直觉识别问题”。你可能觉得自己逻辑不强，但你的直觉常常很准：你能感受到问题的方向，而不是纠结细枝末节。你的思考方式更偏整体感受，而非碎片化推理。这不是弱，是另一种有效的认知方式。`,
            advice: `练习把“直觉”用语言表达出来，从模糊变清晰；使用简单的三步法：问题→关键点→决策；尝试用列表整理思路，减少混乱感；在重要决策前先写下3个理由，强化逻辑链条；当你的直觉有了逻辑的支撑，你会获得既快又准的判断力。`
        }
    },
    C: {
        high: {
            tag: "未来蓝图的创造者",
            desc: `你的大脑像一座永不停止运转的创造工厂。你能在脑中构建复杂空间、推演多种场景，并把不相关的碎片组合成全新的可能性。别人看到的是现实，你看到的是“可能发生的一切”。你的想象不是天马行空，而是带有方向、结构与逻辑的高维度创造力。`,
            insight: `你的天赋是构建尚未存在的世界，并让它变得可感知、可理解、可实现。你能在别人看不到的地方发现结构，在无序中创造秩序，在抽象中捕捉形态。这让你具备天生的创新潜质：你不只是幻想，你是在设计未来。`,
            advice: `把脑中的画面用草图或文字外化，使想象更具可执行性；用“场景推演法”提升创意落地能力：如果这样→会怎样？；把灵感沉淀成作品，而不仅仅存在脑中；结合分析工具，让你的想象具备现实可行性；当你的想象力与结构化能力结合，你将成为真正的创造型思考者。`
        },
        mid: {
            tag: "画面感鲜明的构思者",
            desc: `你有自然的画面感和情境感。你能把信息转成视觉图像，也能在脑中组合元素、模拟结果、创造新的视角。你的想象力温和但持续，能在需要创意时稳定输出。你对事物的理解方式往往是“以图代思”。`,
            insight: `你的核心优势是将抽象转成可以“看到”的东西。你不会忽然爆发式创造，但你擅长一步步把想法拼起来，让思考变得具象、立体、有画面感。在团队中，你是能让别人“看见想法”的那个人。`,
            advice: `尝试可视化笔记，提升想象的组织度；在思考前先画框架，再填内容；用联想练习（一个词→三个画面）扩展创造范围；在创意输出中加入结构，让想法更易落地；当你的想象被更清晰地呈现，你的创造能力会成倍提升。`
        },
        low: {
            tag: "扎根现实的实践者",
            desc: `你不会沉迷幻想，也不喜欢在脑中构建过度复杂的场景。你更关注“现在是什么”和“怎么把事情做好”。这让你在很多需要落地执行的场景中表现稳、准、快。你的优势不在幻想，而在务实的判断。`,
            insight: `你的核心潜力是把抽象问题变得实际可行。你也许没有强烈的视觉化思维，但你能看清现实、抓住重点，并在限制条件下做出最有效率的选择。你不是“想象型”，你是“行动型”。`,
            advice: `使用简单图示辅助思考，让思维更立体；先问“目的是什么”，再决定是否需要想象；多练习类比，让大脑建立更多连接；尝试写下两三种其他可能性，训练发散思维；当你为思考加入一点想象，你的决策会变得更灵活、更有空间。`
        }
    },
    D: {
        high: {
            tag: "灵魂的掌舵人",
            desc: `你拥有一个极其丰富的内心宇宙，并且持有它的地图。你清楚自己每一个情绪的来源，了解自己真正的欲望、动机和恐惧。你不是“活给别人看”的，你是“活给自己看”的。你的判断标准来自于你内心那把坚定的标尺。`,
            insight: `你的真正天赋是“内在导航”与“自我驱动”。你永远不会“迷失”自己，你知道自己是谁，要去哪里。你内心的“锚”比任何外界的“风浪”都更强大。这让你在混乱中能保持惊人的清醒和稳定。`,
            advice: `从“自察”到“自洽”，接纳自己所有的面向；将你的“自我认知”转化为“行动力”，去创造你想要的生活；警惕“过度内省”，学会“向外”分享你的深刻洞察；在理解自己的同时，尝试去理解他人的动机；当你能把内心的清醒活成现实的坚定，你的天赋将无人能及。`
        },
        mid: {
            tag: "清醒的思考者",
            desc: `你是一个清醒的人，不愿随波逐流。你会在“周期性”的独处中“复盘”自己的言行，试图搞清楚“我为什么这么做”“我真的想要这个吗？”。你的人生轨迹可能曲折，但大方向从没错过。`,
            insight: `你的核心能力是“自我反思”与“校准”。你擅长“自我纠错”，能从失败和情绪中汲取教训。当别人在“重复犯错”时，你已经在“迭代升级”。你总是在不断接近更真实的自己。`,
            advice: `建立“反思”仪式（如冥想或日记），将“随机”思考变为“固定”功课；尝试“向外”表达你的感受，而不仅仅是“闷在心里”；练习“区分”：这是“我的情绪”还是“事实”？；设定基于“内心渴望”而非“外界标准”的目标；当你能更频繁地“听见”内心的声音，你的决策会更果断。`
        },
        low: {
            tag: "活在当下的行动派",
            desc: `你是一个能量“向外”释放的人。你享受“即时”的快乐和“真实”的互动，不喜欢花时间“向内”挖掘那些“虚无缥缈”的感受。你不是没有感受，而是你的感受来得快去得也快，你更习惯“用行动解决问题”。`,
            insight: `你的天赋在于“专注当下”和“强大的行动力”。你很少“内耗”，这让你在执行层面效率极高。你只是“不习惯”独处和“审视”自己，你更喜欢在与世界的“碰撞”中认识自己。`,
            advice: `在做决定前，强迫自己“暂停”5秒钟，问自己“我为什么这么做？”；每天留出10分钟“安静”时间，什么也不做；尝试用一个词“命名”你当下的情绪（如：烦躁、开心、疲惫）；练习“复盘”，从“行动”中总结“动机”；当你开始“有意识”地行动，你的行动力将变得更精准。`
        }
    },
    E: {
        high: {
            tag: "情感的共振器",
            desc: `你是一块情绪海绵。当别人走进房间时，你不需要他开口，就能感觉到他的喜怒哀乐。你天生能捕捉到他人没说出口的需求和隐藏的情绪。你不仅理解感受，你能进入感受。`,
            insight: `你的真正天赋是建立深度连接。你是人与人之间的桥梁。你的存在本身就是一种疗愈，能让一个紧张的氛围变得缓和，能让一个封闭的团队产生信任。`,
            advice: `建立情绪边界，学会课题分离，分清谁的情绪；练习清空自己，避免因吸收过多负能量而内耗；将共情力赋能于表达，你会成为非凡的说服者；在理解之后，加入分析，提供建设性的引领；当你的共情力既能温暖人心又能解决问题，你的天赋将所向披靡。`
        },
        mid: {
            tag: "温暖的倾听者",
            desc: `你是一个善良且敏锐的人。你不忍心看到别人难过，总能体察到氛围的变化。朋友们都爱找你吐槽，因为你真的懂。你擅长换位思考，能本能地站在对方的立场想问题。`,
            insight: `你的核心能力是获取信任与营造安全感。你让人愿意开口，你总能提供稳定的情绪价值。在团队中，你是粘合剂和润滑剂，让协作变得更顺畅。`,
            advice: `从被动共情到主动询问，确认你的理解是否准确；尝试引领对话，而不仅仅是被动倾听；在共情的同时，保留客观的视角；将你的理解力公开表达出来，让更多人受益；当你的善意被结构化地使用，你的影响力会倍增。`
        },
        low: {
            tag: "理性的问题解决者",
            desc: `你更关注事情本身，而非人的感受。你是一个耿直的问题解决者，你更习惯就事论事。你不是冷漠，你只是认为解决问题比安抚情绪更重要。`,
            insight: `你的天赋在于客观与效率。你不被情绪绑架，这让你在混乱和高压下依然保持理性。你是最可靠的执行者。`,
            advice: `在解决问题前，先尝试回应感受（例如：我知道你很急）；练习观察非语言信息（如表情和语气）；主动询问对方的感受：你现在感觉如何？；理解情绪本身也是问题的一部分；当你的理性加上一点温度，你将无往不利。`
        }
    },
    F: {
        high: {
            tag: "优雅的行动派",
            desc: `你的灵魂并不只活在你的大脑里，它活在你的全身。你对自己的身体有极强的掌控力，你的动手能力、节奏感和平衡感远超常人。你学习新运动、舞蹈或手工艺品的速度快得惊人。`,
            insight: `你的真正天赋是完美执行。你的身体是思想最忠实的仆人。你总能将脑中所想，通过身体毫厘不差地在现实中实现。这是一种知行合一的本能。`,
            advice: `将你的协调力赋能于他人，成为一名出色的教练或导师；挑战更精密的领域，如外科、精密仪器或职业竞技；警惕过度依赖身体直觉，在行动中加入战略分析；你的身体是你的天赋，注意保护它，避免运动损伤；当你的本能与智慧结合，你就是大师。`
        },
        mid: {
            tag: "灵巧的实践者",
            desc: `你手很稳，学东西动手快。你可能不是运动健将，但你在做饭、做手工、打字或玩游戏时，总比别人更灵巧。你通过动手来理解世界，而不是空想。`,
            insight: `你的核心能力是具体化。你擅长将抽象的想法落地为具体成品。你是团队中那个靠谱的执行者，能把事情做出来。`,
            advice: `刻意练习手眼协调，如绘画、乐器或电子竞技；尝试教授他人一个动作，在教学中拆解你的本能；在动手前，先构思蓝图；保持耐心，不要因为暂时做不到而放弃；当你的灵巧拥有纪律，你会成为专家。`
        },
        low: {
            tag: "沉思的思考者",
            desc: `你更习惯用脑而不是动手。你可能觉得自己的身体有点笨拙，学跳舞或新运动时总慢半拍。你的战场在精神世界，而非物理世界。`,
            insight: `你的天赋在于精神而非物质。你的思维跑得比身体快。你只是缺乏耐心去训练你的身体，而非没有能力。`,
            advice: `从低强度的协调训练开始（如瑜伽或散步）；把动作拆解成最慢的步骤，用思考弥补本能；享受身体活动的乐趣，而非追求结果；认识到身体是思维的伙伴，善待它；当你的大脑开始理解身体，你的协调性会快速改善。`
        }
    },
    G: {
        high: {
            tag: "世界的节拍器",
            desc: `你对时间、节奏和韵律的感知异于常人。你的脑子里自带BGM，万物在你眼中皆有节拍。你不仅能听懂音乐，你还能看见节奏。无论是说话的韵律、电影的剪辑，还是走路的步伐，你总能本能地找到那个最和谐的点。`,
            insight: `你的真正天赋是掌控节奏。你不是在跟随节拍，你是在创造节拍。你能让事物按你的韵律发生，创造出和谐的流动感。你总能卡准那个完美的时机。`,
            advice: `将你的律动天赋从音乐延伸至更广领域，如演讲、写作或视频剪辑；挑战复杂的编曲或指挥，你的天赋上限极高；警惕陷入固定的节奏，尝试探索和打破常规节拍；你的节奏能感染他人，试着成为团队的节拍引领者；当你开始有意识地运用你的节奏感，你将无所不能。`
        },
        mid: {
            tag: "天生的鼓手",
            desc: `你对节奏很敏感。听一首歌，你可能会先注意到鼓点和贝斯。你做事有自己的节奏，不喜欢被人打乱。你也许不会乐器，但你打拍子一定很准。没有背景音乐的环境会让你有点不自在。`,
            insight: `你的核心能力是感知和跟随节奏。你擅长在已有的框架内找到最舒服的律动。你是团队中那个让执行变得流畅的人，能为混乱的事务带来秩序感。`,
            advice: `刻意练习一种打击乐器（如架子鼓或B-Box），将本能变为技能；在演讲或写作中，有意识地加入停顿和韵脚；尝试用音乐来辅助你的工作或学习，提升效率；不要只停留在“听”，尝试“创造”你的节奏；当你的节奏感被主动运用时，你的效率和魅力会大幅提升。`
        },
        low: {
            tag: "沉静的内容派",
            desc: `你更关注内容本身，而不是形式。听歌时，你更在意歌词写了什么，而不是旋律好不好听。安静的环境让你感到舒适，你做事有自己的内在逻辑，但不一定有外在的节奏感。`,
            insight: `你的天赋在于深度和内容。你不容易被“洗脑”的旋律或“带节奏”的言论所影响。你更看重一件事的“本质”和“意义”，这让你有更强的“定力”。`,
            advice: `尝试在运动时（如跑步）听一些节拍器应用，建立身体对节奏的记忆；把音乐当作“工具”而非“艺术”，用它来放松或集中注意力；练习“卡点”，比如跟着秒表的“滴答”声按暂停；认识到“节奏”也是一种“效率工具”，它能帮你更好地规划时间；当你的深度思考配上一点节奏感，你的产出会更稳定。`
        }
    },
    H: {
        high: {
            tag: "敏锐的博物学家",
            desc: `你拥有像素级的眼睛和雷达般的耳朵。当别人走马观花时，你已经注意到了叶子背面的虫卵、远处天空的云层变化、或朋友新换的耳钉。你对环境细节的感知力，让你能发现别人永远忽视的真相。`,
            insight: `你的真正天赋是细节索引。世界对你来说是一本打开的书，你总能读到隐藏在微小变化里的信息。你不是在看，你是在扫描和解码。`,
            advice: `将你的观察力从自然转向人文，去观察人的微表情和行为模式；刻意练习从观察到分析，问自己：这个细节意味着什么？；你的天赋是数据分析和刑侦的底层能力，尝试进入这些领域；学会关闭你的观察力，否则你容易因信息过载而疲惫；当你的观察力与分析力结合，你就是真相的发现者。`
        },
        mid: {
            tag: "细心的记录者",
            desc: `你是一个非常细心的人。只要你愿意，你总能发现环境中的不对劲。你擅长找茬，能注意到别人PPT上的错别字、衣服上的线头。你对事物的感知是具体而真实的。`,
            insight: `你的核心能力是详实与具体。你也许不会一眼看透全局，但你擅长沉浸式观察，收集信息。你是团队中那个托底的人，能避免大家犯低级错误。`,
            advice: `从被动观察转向主动寻找，给自己设定找茬任务；练习分类你的观察所得，而不是让细节堆积在脑中；尝试用文字或拍照来固化你的观察结果；多问一句为什么，让你的观察更有深度；当你的细心被有意识地使用时，你会成为一个出色的质检员。`
        },
        low: {
            tag: "专注的全局者",
            desc: `你更关注森林，而不是树叶。你总是能抓住重点和大方向，但容易忽略细枝末节。你不在意衣服上的线头，你只在意这件衣服的风格。`,
            insight: `你的天赋在于抓大放小和把握核心。你不会被细节干扰你的判断，这让你的决策更高效。你是一个战略型思考者。`,
            advice: `刻意练习：每天在熟悉的路上找出一个新事物；在对话中，尝试记住对方的一个细节（如穿着、语气）；在做决策前，强迫自己多找一个支持你结论的细节证据；利用工具（如清单）来弥补你对细节的忽视；当你的全局观辅以必要的细节，你的决策将更稳健。`
        }
    },
    I: {
        high: {
            tag: "规则的打破者",
            desc: `你的大脑里没有应该这样。你总是本能地问为什么不能那样？你讨厌模仿，厌恶陈规。你享受从0到1的快感，你来此世间的目的，就是为了创造前所未有的新事物。`,
            insight: `你的真正天赋是无中生有。当所有人都走进死胡同时，你能推倒一堵墙，开辟一条新路。你的思维不受框架束缚，总能产生颠覆性的见解和方案。`,
            advice: `保护你的原创力，不要用常规去修剪你的奇思妙想；学会将你的原创力产品化，让它从点子变为价值；寻找分析力强的搭档，让你的疯狂得以落地；接受孤独，因为真正的原创者总是走在人群前面；当你的原创力被赋予使命，你将改变世界。`
        },
        mid: {
            tag: "聪明的改良者",
            desc: `你总能找到更好的方法。你也许不会发明轮子，但你能把轮子改良成轮胎。你擅长在现有的基础上做微创新，你的点子不天马行空，但非常管用。`,
            insight: `你的核心能力是迭代与优化。你总能举一反三，把A领域的方法用到B领域。你是一个出色且高效的问题解决者。`,
            advice: `刻意进行跨界学习，为你的改良储备弹药；练习头脑风暴，强迫自己想出10个不靠谱的点子；将你的改良标准化，形成可复制的流程；多问“还有没有更好的办法？”，保持思维活跃；当你开始有意识地连接不同的事物，你的原创力会更强。`
        },
        low: {
            tag: "坚实的执行者",
            desc: `你是成熟方案的拥护者。你相信久经考验的流程，而不是不靠谱的新点子。你擅长从1到100，把一个成熟的模式复制、放大、做到极致。`,
            insight: `你的天赋在于优化而非颠覆。你拥有强大的执行力和纪律性，是任何一个成熟体系中不可或缺的稳定器和加速器。`,
            advice: `在执行时，尝试问“这个流程中，哪一步可以优化？”；练习组合，把两个旧的东西拼成一个新的东西；不要排斥新点子，尝试去分析它的可行性；你的价值在于让事情发生，这是原创的基础；当你的执行力开始改良流程时，你的原创力就已经苏醒。`
        }
    },
    J: {
        high: {
            tag: "和谐的鉴赏家",
            desc: `你天生就知道什么是美。你对丑有一种生理性的无法忍受。你对色彩、构图、光影、排版、甚至气味都有着极其挑剔的标准。你不是在追求美，你本身就是美的探测器。`,
            insight: `你的真正天赋是定义品质。你能立刻分辨出90分和99分的区别。你是和谐与品质的最终守门人，你的品味就是标准。`,
            advice: `绝对相信你对美的直觉，它是你最强的武器；将你的鉴赏力转化为创造力，去设计和产出；寻找能落地的搭档，把你对完美的要求变为现实；学会向下兼容，不要让对丑的厌恶瘫痪你的行动；当你的审美成为一个品牌，你的天赋价值万金。`
        },
        mid: {
            tag: "有品味的装点者",
            desc: `你拥有不错的好品味。你懂得如何搭配，无论是衣服、家居还是PPT，你都能让它们看起来很舒服。你追求氛围感，能敏锐地感知到环境是否和谐。`,
            insight: `你的核心能力是营造和谐。你也许不会开创一个流派，但你擅长运用已有的元素，组合出最得体的美感。你是那个能提升团队体面度的人。`,
            advice: `尝试将你的感觉系统化，比如学习色彩理论或排版；刻意练习一个美学相关的技能，如摄影、插花或绘画；不只停留在消费美，更要创造美；相信你的品味，在项目中更主动地提出你的审美建议；当你的品味能赋能工作时，它会成为你的核心竞争力。`
        },
        low: {
            tag: "务实的功能主义者",
            desc: `你是一个实用至上的人。你更关心这东西能不能用，而不是它好不好看。你对华而不实的东西天然无感，你追求的是效率和结果。`,
            insight: `你的天赋在于直达本质。你不被形式所迷惑，能看穿事物的核心功能。你的思维没有噪音，非常高效。`,
            advice: `承认美也是功能的一部分，好看的设计能提升效率；尝试去理解一个你认为美的设计，它为什么让你感觉好；把排版整洁作为功能的一部分来要求自己；在实用之外，给自己留一点无用的空间；当你的功能主义开始包容美感，你的产出将更受欢迎。`
        }
    }
};

const dimensionTagVariants = {
    A: { high: "语言的织梦者", mid: dimensions.A.tag, low: "沉稳的倾听者" },
    B: { high: "逻辑的统帅", mid: dimensions.B.tag, low: "清晰的实干者" },
    C: { high: "维度的建筑师", mid: dimensions.C.tag, low: "稳健的拼图师" },
    D: { high: "内在的领航员", mid: dimensions.D.tag, low: "诚实的内观者" },
    E: { high: "心灵的连接者", mid: dimensions.E.tag, low: "温柔的倾听者" },
    F: { high: "行动的雕刻师", mid: dimensions.F.tag, low: "稳练的实践者" },
    G: { high: "节奏的指挥家", mid: dimensions.G.tag, low: "节拍的追随者" },
    H: { high: "细节的侦察官", mid: dimensions.H.tag, low: "认真观察者" },
    I: { high: "规则的改写者", mid: dimensions.I.tag, low: "创意探索者" },
    J: { high: "品质的鉴定官", mid: dimensions.J.tag, low: "风格敏感者" }
};

// 全局变量
let currentQuestion = 0;
let userAnswers = [];
let scores = {
    A: 0, B: 0, C: 0, D: 0,
    E: 0, F: 0, G: 0, H: 0,
    I: 0, J: 0
};
let radarChart = null;
const authState = { unlocked: false, controller: null };

// DOM元素
const homepage = document.getElementById('homepage');
const testpage = document.getElementById('testpage');
const resultspage = document.getElementById('resultspage');
const historypage = document.getElementById('historypage');
const startTestBtn = document.getElementById('startTest');
const questionTitle = document.getElementById('questionTitle');
const optionsContainer = document.getElementById('optionsContainer');
const prevQuestionBtn = document.getElementById('prevQuestion');
const nextQuestionBtn = document.getElementById('nextQuestion');
const progress = document.getElementById('progress');
const progressText = document.getElementById('progressText');
const talentType = document.getElementById('talentType');
const retakeTestBtn = document.getElementById('retakeTest');
const shareResultsBtn = document.getElementById('shareResults');
const backHomeResultsBtn = document.getElementById('backHomeResults');
const exportChartBtn = document.getElementById('exportChart');
const viewHistoryBtn = document.getElementById('viewHistory');
const historyList = document.getElementById('historyList');
const backHomeBtn = document.getElementById('backHome');
const unlockCard = document.getElementById('unlock-card');
const unlockButton = document.getElementById('unlock-btn');
const fullReport = document.getElementById('full-report');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 事件监听
    prevQuestionBtn.addEventListener('click', prevQuestion);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    retakeTestBtn.addEventListener('click', resetTest);
    if (shareResultsBtn) shareResultsBtn.addEventListener('click', shareResults);
    if (backHomeResultsBtn) backHomeResultsBtn.addEventListener('click', () => showPage('homepage'));
    if (exportChartBtn) exportChartBtn.addEventListener('click', exportChart);
    if (viewHistoryBtn) viewHistoryBtn.addEventListener('click', openHistory);
    if (backHomeBtn) backHomeBtn.addEventListener('click', () => showPage('homepage'));
});

function setFullReportVisible(isVisible) {
    if (fullReport) {
        fullReport.style.display = isVisible ? 'block' : 'none';
    }
    if (unlockCard) {
        unlockCard.style.display = isVisible ? 'none' : 'block';
    }
}

function unlockFullReport() {
    if (authState.unlocked) return;
    authState.unlocked = true;
    setFullReportVisible(true);
}

async function resolveApiBase() {
    try {
        const res = await fetch('/config/app-config.json', { cache: 'no-store' });
        if (res.ok) {
            const cfg = await res.json();
            if (cfg && cfg.apiBase) {
                return String(cfg.apiBase).trim();
            }
        }
    } catch (err) {
        console.warn('无法读取 app-config.json，将使用当前域名:', err);
    }
    return window.location.origin;
}

async function setupAuthGate() {
    if (!window.AuthorizationSDK || !unlockButton) {
        return;
    }
    if (!authState.controller) {
        const apiBase = await resolveApiBase();
        authState.controller = await AuthorizationSDK.init({
            testType: 'tianfu',
            apiBase,
            startButtons: ['#unlock-btn'],
            onAuthorized: unlockFullReport,
            authContext: 'result'
        });
    }
    const config = authState.controller?.state?.config;
    if (config && config.auth_required === 0) {
        unlockFullReport();
        return;
    }
    const mode = (config && config.auth_mode) ? String(config.auth_mode).toLowerCase() : 'start';
    if (mode !== 'result') {
        unlockFullReport();
        return;
    }
    if (authState.controller.isSessionActive()) {
        unlockFullReport();
    }
}

// 开始测试
function loadQuestions() {
    // 重置数据
    currentQuestion = 0;
    userAnswers = [];
    scores = {
        A: 0, B: 0, C: 0, D: 0,
        E: 0, F: 0, G: 0, H: 0,
        I: 0, J: 0
    };
    // 切换页面
    showPage('testpage');
    
    // 显示第一题
    displayQuestion();
}

// 显示问题
function displayQuestion() {
    const question = questions[currentQuestion];
    questionTitle.textContent = `${currentQuestion + 1}. ${question.question}`;
    
    // 清空选项容器
    optionsContainer.innerHTML = '';
    
    // 创建选项
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option.text;
        
        // 如果已经回答过，标记已选选项
        if (userAnswers[currentQuestion] === index) {
            optionElement.classList.add('selected');
        }
        
        // 添加点击事件
        optionElement.addEventListener('click', () => selectOption(index));
        
        optionsContainer.appendChild(optionElement);
    });
    
    // 更新进度
    updateProgress();
    
    // 更新按钮状态
    updateNavigationButtons();
}

// 选择选项
function selectOption(optionIndex) {
    // 保存答案
    userAnswers[currentQuestion] = optionIndex;
    
    // 更新UI
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        if (index === optionIndex) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
    
    // 更新按钮状态
    updateNavigationButtons();
    
    // 自动跳转到下一题（延迟300ms，让用户看到选择效果）
    setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
            nextQuestion();
        }
    }, 300);
}

// 更新进度条
function updateProgress() {
    const progressPercentage = ((currentQuestion + 1) / questions.length) * 100;
    progress.style.width = `${progressPercentage}%`;
    progressText.textContent = `${currentQuestion + 1}/${questions.length}`;
}

// 更新导航按钮状态
function updateNavigationButtons() {
    // 上一题按钮
    prevQuestionBtn.disabled = currentQuestion === 0;
    
    // 下一题按钮
    const hasAnswer = userAnswers[currentQuestion] !== undefined;
    nextQuestionBtn.disabled = !hasAnswer;
    
    // 如果是最后一题，更改按钮文本
    if (currentQuestion === questions.length - 1) {
        nextQuestionBtn.textContent = '提交';
    } else {
        nextQuestionBtn.textContent = '下一题';
    }
}

// 上一题
function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        displayQuestion();
    }
}

// 下一题
function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        displayQuestion();
    } else {
        // 最后一题，计算结果
        calculateResults();
    }
}

// 计算结果
function calculateResults() {
    Object.keys(scores).forEach(k => { scores[k] = 0; });
    userAnswers.forEach((answerIndex, questionIndex) => {
        const q = questions[questionIndex];
        const val = q.options[answerIndex] ? q.options[answerIndex].value : 0;
        scores[q.dimension] += val;
    });
    showResults();
}

// 显示结果
function showResults() {
    authState.unlocked = false;
    setFullReportVisible(false);
    showPage('resultspage');
    
    // 获取得分最高的三个维度
    const sortedDimensions = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const topDimensions = sortedDimensions.slice(0, 3);
    
    // 设置天赋类型标题
    const topDimensionNames = topDimensions.map(dim => dimensions[dim].name).join('、');
    talentType.textContent = `你的天赋原型是：${topDimensionNames}`;
    
    // 创建雷达图
    createRadarChart();
    
    // 显示所有维度得分
    displayDimensionScores();
    
    // 统一维度卡片（含等级、洞察与建议）
    displayUnifiedCards();

    saveResultToHistory();
    setupAuthGate();
    
}

function saveResultToHistory() {
    try {
        const maxMap = Object.keys(dimensions).reduce((acc, d) => {
            acc[d] = questions.filter(q => q.dimension === d)
                .reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
            return acc;
        }, {});
        const percents = Object.keys(scores).reduce((acc, d) => {
            const max = maxMap[d] || 0;
            acc[d] = max ? Math.round((scores[d] / max) * 100) : 0;
            return acc;
        }, {});
        const dimsSorted = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
        const top3 = dimsSorted.slice(0, 3);
        const record = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
            date: new Date().toISOString(),
            scores: { ...scores },
            percents,
            top3
        };
        const key = 'tf_history';
        const history = JSON.parse(localStorage.getItem(key) || '[]');
        history.unshift(record);
        localStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
    } catch (e) {}
}

function openHistory() {
    showPage('historypage');
    loadHistory();
}

function loadHistory() {
    if (!historyList) return;
    const key = 'tf_history';
    let history = [];
    try { history = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { history = []; }
    historyList.innerHTML = '';
    if (!history.length) {
        const empty = document.createElement('div');
        empty.className = 'history-item';
        empty.innerHTML = `<strong>暂无测试记录</strong><p>完成一次测试后，这里会显示你的记录。</p>`;
        historyList.appendChild(empty);
        return;
    }
    history.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'history-item';
        const date = new Date(rec.date);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
        const topNames = rec.top3.map(d => dimensions[d].name).join('、');
        const chips = Object.keys(dimensions).map(d => {
            const p = rec.percents[d] || 0;
            const lvl = getLevelTag(p);
            return `<span class="level-tag ${lvl.className}" style="margin-right:6px;">${dimensions[d].name} ${p}%</span>`;
        }).join('');
        item.innerHTML = `
            <div class="history-top"><strong>${dateStr}</strong></div>
            <div class="history-meta">天赋原型：${topNames}</div>
            <div class="history-chips" style="margin-top:8px;">${chips}</div>
            <div class="history-actions" style="margin-top:10px;">
                <button class="btn secondary history-view" data-id="${rec.id}">查看详情</button>
                <button class="btn danger history-delete" data-id="${rec.id}" style="margin-left:8px;">删除</button>
            </div>
        `;
        historyList.appendChild(item);
    });
}

// 历史操作事件委托
if (historyList) {
    historyList.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (btn.classList.contains('history-view')) {
            viewRecord(id);
        } else if (btn.classList.contains('history-delete')) {
            deleteRecord(id);
        }
    });
}

function deleteRecord(id) {
    const key = 'tf_history';
    let history = [];
    try { history = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { history = []; }
    history = history.filter(r => r.id !== id);
    localStorage.setItem(key, JSON.stringify(history));
    loadHistory();
}

function viewRecord(id) {
    const key = 'tf_history';
    let history = [];
    try { history = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { history = []; }
    const rec = history.find(r => r.id === id);
    if (!rec) return;
    // 使用记录渲染完整版结果
    renderRecord(rec);
}

function renderRecord(rec) {
    Object.keys(scores).forEach(k => { scores[k] = 0; });
    Object.keys(rec.scores || {}).forEach(k => { scores[k] = rec.scores[k]; });
    authState.unlocked = false;
    setFullReportVisible(false);
    showPage('resultspage');
    const topNames = (rec.top3 || Object.keys(scores).sort((a,b)=>scores[b]-scores[a]).slice(0,3)).map(dim => dimensions[dim].name).join('、');
    talentType.textContent = `你的天赋原型是：${topNames}`;
    createRadarChart();
    displayDimensionScores();
    displayUnifiedCards();
    setupAuthGate();
}

// 显示所有维度得分
function displayDimensionScores() {
    const scoresContainer = document.getElementById('scoresContainer');
    scoresContainer.innerHTML = '';
    
    const totalQuestions = questions.length;
    const sortedDimensions = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    
    sortedDimensions.forEach(dimensionKey => {
        const dimension = dimensions[dimensionKey];
        const score = scores[dimensionKey];
        const maxPossible = questions.filter(q => q.dimension === dimensionKey)
            .reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
        const percent = maxPossible ? Math.round((score / maxPossible) * 100) : 0;
        const level = getLevelTag(percent);
        
        const scoreElement = document.createElement('div');
        scoreElement.className = 'dimension-score';
        scoreElement.innerHTML = `
            <div class="dimension-score-header">
                <span class="dimension-score-title">
                    <span class="dimension-score-icon" data-dim="${dimensionKey}"><svg class="dim-svg" viewBox="0 0 24 24"><use href="#dim-${dimensionKey}"/></svg></span>
                    <span class="dimension-name">${dimension.name}</span>
                </span>
                <span class="dimension-percentage">${percent}%</span>
            </div>
            <div class="dimension-bar-container">
                <div class="dimension-bar" style="width: 0%;" data-width="${percent}%"></div>
            </div>
            <div class="dimension-score-detail">
                <span>得分：${score}/${maxPossible}</span>
                <span class="level-tag ${level.className}" style="margin-left:8px;">${level.label}</span>
            </div>
            <p class="dimension-brief">${dimension.brief || ''}</p>
        `;
        
        scoresContainer.appendChild(scoreElement);
    });
    
    // 动画效果：延迟加载进度条
    setTimeout(() => {
        const bars = document.querySelectorAll('.dimension-bar');
        bars.forEach(bar => {
            bar.style.width = bar.getAttribute('data-width');
        });
    }, 100);
}

// 显示天赋卡片
function displayTalentCards(topDimensions) {
    const talentCardsContainer = document.querySelector('.talent-cards');
    talentCardsContainer.innerHTML = '';
    const sortedDims = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    sortedDims.forEach(dimensionKey => {
        const dimMeta = dimensions[dimensionKey];
        const maxPossible = questions.filter(q => q.dimension === dimensionKey)
            .reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0);
        const score = scores[dimensionKey];
        const percent = maxPossible ? Math.round((score / maxPossible) * 100) : 0;
        const level = getLevelTag(percent);
        const lc = getDimensionLevelContent(dimensionKey, level.label);
        const tagText = lc.tag || (dimensionTagVariants[dimensionKey] ? dimensionTagVariants[dimensionKey][level.label === '高' ? 'high' : (level.label === '中' ? 'mid' : 'low')] : dimMeta.tag);
        const tagClass = `tag-dim-${dimensionKey}`;
        const descText = lc.desc || (dimensionDescriptions[dimensionKey] ? dimensionDescriptions[dimensionKey].description : '');
        const insights = lc.insight || getLevelBasedInsight(dimensionKey, level.label);
        const advice = lc.advice || getLevelBasedAdvice(dimensionKey, level.label);
        const card = document.createElement('div');
        card.className = 'talent-card';
        card.innerHTML = `
            <div class="dimension-score-header">
                <span class="dimension-score-title">
                    <span class="dimension-score-icon" data-dim="${dimensionKey}"><svg class="dim-svg" viewBox="0 0 24 24"><use href="#dim-${dimensionKey}"/></svg></span>
                    <span class="dimension-name">${dimMeta.name}</span>
                </span>
                <span class="level-tag ${level.className}">${level.label}</span>
            </div>
            <div class="dimension-score-detail">
                <span class="dimension-percentage">${percent}%</span>
                <span style="margin-left:8px;">得分：${score}/${maxPossible}</span>
                <span class="tag ${tagClass}" style="margin-left:8px;">${tagText}</span>
            </div>
            <p>${descText}</p>
            <div class="insight-item"><strong>洞察</strong><p>${insights}</p></div>
            <div class="insight-item"><strong>建议</strong>${renderAdviceList(advice)}</div>
        `;
        talentCardsContainer.appendChild(card);
    });
}

function displayUnifiedCards() {
    displayTalentCards();
}

function getDimensionLevelContent(dimKey, levelLabel) {
    const map = dimensionLevelContent[dimKey];
    if (!map) return {};
    if (levelLabel === '高') return map.high || {};
    if (levelLabel === '中') return map.mid || {};
    return map.low || {};
}

function renderAdviceList(text) {
    if (!text) return '';
    const items = text.split(/(?:；|;|\n)+/).map(s => s.trim()).filter(Boolean);
    if (!items.length) return `<p>${text}</p>`;
    return `<ul class="advice-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

// 创建雷达图
function createRadarChart() {
    const ctx = document.getElementById('radarChart').getContext('2d');
    
    // 销毁已存在的图表
    if (radarChart) {
        radarChart.destroy();
    }
    
    // 准备数据
    const labels = Object.keys(dimensions).map(key => dimensions[key].name);
    const data = Object.keys(scores).map(key => scores[key]);
    const maxDimScore = Math.max(...Object.keys(dimensions).map(d =>
        questions.filter(q => q.dimension === d).reduce((sum, q) => sum + Math.max(...q.options.map(o => o.value)), 0)
    ));
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(106, 17, 203, 0.25)');
    gradient.addColorStop(1, 'rgba(37, 117, 252, 0.15)');

    // 创建新图表
    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: '天赋分布',
                data: data,
                backgroundColor: gradient,
                borderColor: 'rgba(106, 17, 203, 0.8)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(106, 17, 203, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(106, 17, 203, 1)'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    suggestedMin: 0,
                    suggestedMax: maxDimScore,
                    ticks: {
                        stepSize: Math.max(1, Math.ceil(maxDimScore / 4)),
                        backdropColor: 'transparent'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.label}: ${ctx.formattedValue}`
                    }
                }
            },
            maintainAspectRatio: true
        }
    });
}

// 重置测试
function resetTest() {
    showPage('homepage');
}

// 分享结果
function shareResults() {
    // 获取得分最高的三个维度
    const sortedDimensions = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const topDimensionNames = sortedDimensions.slice(0, 3).map(dim => dimensions[dim].name).join('、');
    
    // 创建分享文本
    const shareText = `我刚刚完成了天赋原型测试，我的天赋原型是：${topDimensionNames}。你也来测测你的天赋原型吧！`;
    
    // 如果支持Web Share API
    if (navigator.share) {
        navigator.share({
            title: '天赋原型测试',
            text: shareText,
            url: window.location.href
        }).catch(console.error);
    } else {
        alert('截屏即可分享结果给朋友哦！');
    }
}

// 等级标签
function getLevelTag(percentage) {
    if (percentage >= 75) return { label: '高', className: 'dimension-card-level-high' };
    if (percentage >= 45) return { label: '中', className: 'dimension-card-level-mid' };
    return { label: '低', className: 'dimension-card-level-low' };
}

function getLevelBasedInsight(dimKey, levelLabel) {
    const d = dimensionDescriptions[dimKey] || {};
    const base = d.power || '';
    if (levelLabel === '高') return base;
    if (levelLabel === '中') return base ? `稳定发挥关键：${base}` : '';
    return base ? `基础认知：${base}` : '';
}

function getLevelBasedAdvice(dimKey, levelLabel) {
    const base = (dimensionDescriptions[dimKey] || {}).advice || `针对${dimensions[dimKey].name}：请从明确目标、刻意练习与持续复盘入手，逐步提升该维度的稳定输出。`;
    if (levelLabel === '高') return `巩固与扩展：${base}`;
    if (levelLabel === '中') return `提升与稳定：${base}`;
    return `起步与打底：${base}`;
}

// 历史记录
 

// 导出图像
function exportChart() {
    const canvas = document.getElementById('radarChart');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = '天赋原型雷达图.png';
    a.click();
}

// 页面切换
function showPage(pageId) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // 显示指定页面
    document.getElementById(pageId).classList.add('active');
}
