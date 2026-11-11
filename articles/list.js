/* =========================================================
   なるほどニッポン研究所 — 記事の一覧
   記事を追加するときは：
     1) articles/ に「記事ID.md」を作る（本文）
     2) img/thumb/ に「記事ID.webp」を置く（サムネイル。なくても動く）
     3) 下の window.ARTICLES に1つ追加する（タイトルなど）
   ========================================================= */

window.SITE = {
  newDays: 14, // 公開から何日間「NEW」を表示するか

  categories: {
    kotoba:    { name: "ことば" },
    kurashi:   { name: "くらし" },
    zatsugaku: { name: "ざつがく" }
  },

  formats: {
    quiz4:     { name: "4択クイズ" },
    hint3:     { name: "3ヒントクイズ" },
    dobon:     { name: "ドボン" },
    fukabori:  { name: "深掘り" },
    interview: { name: "インタビュー" }
  },

  levels: {
    1: { name: "N3", desc: "ふだんの会話で使うことばが中心です。" },
    2: { name: "N2", desc: "ニュースや説明文によく出ることばも使います。" },
    3: { name: "N1", desc: "抽象的なことばや、長めの文章にチャレンジ。" }
  },

  // 研究所のメンバー。会話（talk）で同じ名前を使うと、このアイコンが出ます
  characters: {
    "ナル": {
      icon: "img/icon-naru.webp",
      role: "研究員（留学生）",
      desc: "日本に来て2年目。「なんで？」が口ぐせ。気になったことは、すぐノートに書く。"
    },
    "ホド": {
      icon: "img/icon-hodo.webp",
      role: "先輩研究員",
      desc: "ことばと文化にくわしい。むずかしいことを、やさしく説明するのが得意。"
    },
    "ポン": {
      icon: "img/icon-pon.webp",
      role: "研究所のたぬき",
      desc: "クイズを出すのが大好き。ときどき自分がドボンする。"
    }
  },

  // 翻訳の言語（翻訳データは i18n/<key>.js。key は言語タグ）
  langs: [
    { key: "en",      name: "English" },
    { key: "zh-Hant", name: "繁體中文" },
    { key: "zh-Hans", name: "简体中文" },
    { key: "es",      name: "Español" },
    { key: "my",      name: "မြန်မာ" },
    { key: "ne",      name: "नेपाली" },
    { key: "vi",      name: "Tiếng Việt" },
    { key: "mn",      name: "Монгол" }
  ]
};

/* tag  : サムネイルの小さいラベル
   catch: サムネイルの大きい文字（1〜2行。1行は7文字くらいまで） */
window.ARTICLES = [
  {
    id: "daijoubu",
    title: "「大丈夫です」は、はい？ いいえ？",
    format: "fukabori",
    category: "kotoba",
    level: 1,
    date: "2026-11-11",
    series: "ことばのナゾ",
    seriesNo: 3,
    tag: "ことばのナゾ",
    catch: ["大丈夫です", "YES？ NO？"],
    minutes: 6,
    pickup: true,
    lead: "「大丈夫です」と言ったのに、コーヒーが出てこなかった。そんな経験はありませんか。「はい」にも「いいえ」にもなる、ふしぎなことばのルールを見てみよう。"
  },
  {
    id: "sensei-message",
    title: "先生に送って大丈夫？ メッセージの日本語",
    format: "dobon",
    category: "kurashi",
    level: 2,
    date: "2026-11-11",
    series: "使える！くらしの日本語",
    seriesNo: 3,
    tag: "先生への連絡",
    catch: ["そのメッセージ", "送って平気？"],
    minutes: 6,
    lead: "欠席の連絡、質問、お礼。先生にメッセージを送るとき、友達と同じ書き方をしていませんか。使っていい表現を見分けよう。"
  },
  {
    id: "kazoekata",
    title: "ビールは3個？ 3本？ 3杯？ 数え方クイズ",
    format: "quiz4",
    category: "kotoba",
    level: 1,
    date: "2026-11-11",
    tag: "数え方",
    catch: ["3個？ 3本？", "3杯？"],
    minutes: 5,
    lead: "えんぴつは「{本|ほん}」、紙は「{枚|まい}」、車は「{台|だい}」。日本語は、ものによって数え方が変わります。よく使う数え方を、クイズで覚えよう。"
  },
  {
    id: "todofuken-hint",
    title: "ここはどこ？ 3つのヒントで都道府県を当てよう",
    format: "hint3",
    category: "zatsugaku",
    level: 1,
    date: "2026-11-11",
    tag: "3ヒントクイズ",
    catch: ["ここは", "どこだ？"],
    minutes: 5,
    lead: "雪まつり、たこ焼き、赤い鳥居。ヒントから、どの都道府県かわかるかな。旅行の計画にも役に立つクイズです。"
  },
  {
    id: "yoroshiku",
    title: "「よろしくお願いします」は、何をお願いしているの？",
    format: "fukabori",
    category: "kotoba",
    level: 2,
    date: "2026-11-11",
    series: "ことばのナゾ",
    seriesNo: 4,
    tag: "ことばのナゾ",
    catch: ["よろしく", "って何？"],
    minutes: 7,
    lead: "自己紹介でも、メールの最後でも使う「よろしくお願いします」。ほかの言語に訳しにくいこのことばの、中心にある気持ちをさぐります。"
  },
  {
    id: "kanji-himitsu-02",
    title: "読み方がいっぱい！ 漢字「{{生}}」クイズ",
    format: "quiz4",
    category: "kotoba",
    level: 2,
    date: "2026-11-11",
    series: "漢字のヒミツ",
    seriesNo: 2,
    tag: "漢字のヒミツ",
    catch: ["「生」の", "読み方"],
    minutes: 6,
    lead: "なま、せい、しょう、き、ふ…。1つの漢字に、読み方がいくつあるでしょう。お店のメニューや町の中のことばで、クイズに挑戦しよう。"
  },
  {
    id: "anime-nihongo",
    title: "アニメで覚えた日本語、そのまま使って大丈夫？",
    format: "dobon",
    category: "kotoba",
    level: 1,
    date: "2026-11-11",
    tag: "アニメの日本語",
    catch: ["「貴様！」は", "キケン？"],
    minutes: 6,
    lead: "アニメは最高の日本語の先生。でも、キャラクターのセリフをそのまま使うと、相手がびっくりすることも…。使っていいことば、あぶないことばを見分けよう。"
  },
  {
    id: "itami-onomatopoeia",
    title: "ズキズキ？ ガンガン？ 病院で痛みを伝えるオノマトペ",
    format: "quiz4",
    category: "kurashi",
    level: 2,
    date: "2026-11-11",
    series: "オノマトペ研究室",
    seriesNo: 2,
    tag: "病院で使える",
    catch: ["ズキズキ？", "ガンガン？"],
    minutes: 6,
    lead: "「どんなふうに痛いですか？」。病院でこう聞かれて、こまったことはありませんか。日本語では、痛みの種類をオノマトペで伝えます。"
  },
  {
    id: "baito-keigo",
    title: "その敬語、お客様に言って大丈夫？ アルバイトの日本語",
    format: "dobon",
    category: "kurashi",
    level: 2,
    date: "2026-11-11",
    series: "使える！くらしの日本語",
    seriesNo: 2,
    tag: "バイト敬語",
    catch: ["その敬語", "ドボン！"],
    minutes: 6,
    lead: "カフェやコンビニのアルバイトで使う日本語は、教科書の日本語と少しちがいます。お客様に使っていいことば、だめなことばを見分けられるかな？"
  },
  {
    id: "kanji-himitsu-01",
    title: "この漢字、なーんだ？ 3つのヒントで当てよう",
    format: "hint3",
    category: "kotoba",
    level: 1,
    date: "2026-11-10",
    series: "漢字のヒミツ",
    seriesNo: 1,
    tag: "3ヒントクイズ",
    catch: ["この漢字", "なーんだ？"],
    minutes: 5,
    lead: "漢字は、小さな部品の組み合わせでできています。ヒントを1つずつ見て、どの漢字か当ててみよう。ヒントが少ないほど、あなたは漢字博士！"
  },
  {
    id: "umi-nai-ken",
    title: "海がない県はどれ？ ドボンをさけて全部見つけよう",
    format: "dobon",
    category: "zatsugaku",
    level: 2,
    date: "2026-11-08",
    tag: "ドボン注意",
    catch: ["海なし県を", "さがせ！"],
    minutes: 4,
    lead: "日本は海に囲まれた島国。でも、海に面していない県もあるんです。いくつあるか知っていますか？"
  },
  {
    id: "sumimasen",
    title: "「すみません」はなぜこんなに便利なの？",
    format: "fukabori",
    category: "kotoba",
    level: 2,
    date: "2026-11-05",
    series: "ことばのナゾ",
    seriesNo: 1,
    tag: "ことばのナゾ",
    catch: ["すみませんの", "3つの顔"],
    minutes: 7,
    lead: "あやまるときも、お礼を言うときも、店員さんを呼ぶときも「すみません」。1つのことばに、どうしてこんなに役割があるのでしょう？"
  },
  {
    id: "kimochi-onomatopoeia",
    title: "ドキドキ・ワクワク・イライラ 気持ちのオノマトペクイズ",
    format: "quiz4",
    category: "kotoba",
    level: 1,
    date: "2026-11-02",
    series: "オノマトペ研究室",
    seriesNo: 1,
    tag: "気持ちの音",
    catch: ["ドキドキ？", "ワクワク？"],
    minutes: 5,
    lead: "日本語は、気持ちを音で表すことばがとても多い言語です。この気持ち、どのオノマトペで言う？"
  },
  {
    id: "konbini-nihongo",
    title: "「温めますか？」コンビニで聞かれる日本語、どう答える？",
    format: "quiz4",
    category: "kurashi",
    level: 1,
    date: "2026-10-31",
    series: "使える！くらしの日本語",
    seriesNo: 1,
    tag: "コンビニの日本語",
    catch: ["レジで", "ピンチ！"],
    minutes: 5,
    lead: "コンビニのレジでは、店員さんがいろいろなことを聞いてきます。早口でも大丈夫。よく聞かれる質問と答え方を知っておこう。"
  },
  {
    id: "nihon-ichi",
    title: "日本一はどこ？ 山・川・湖・県のナンバーワンクイズ",
    format: "quiz4",
    category: "zatsugaku",
    level: 2,
    date: "2026-10-29",
    tag: "ナンバーワン",
    catch: ["日本一は", "どこだ？"],
    minutes: 5,
    lead: "日本でいちばん高い山は知っていても、いちばん長い川は？ いちばん小さい県は？ 地図を思いうかべながら答えよう。"
  },
  {
    id: "yabai",
    title: "「やばい」はいつからほめ言葉になったのか",
    format: "fukabori",
    category: "kotoba",
    level: 3,
    date: "2026-10-25",
    series: "ことばのナゾ",
    seriesNo: 2,
    tag: "ことばの変化",
    catch: ["「やばい」の", "正体"],
    minutes: 8,
    lead: "「このケーキ、やばい！」はおいしいという意味。でも「テストがやばい」は困っているという意味。正反対の意味が同居することばの変化を追ってみます。"
  }
];
