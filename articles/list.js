/* =========================================================
   なるほどニッポン研究所 — 記事の一覧
   記事を追加するときは：
     1) articles/ に「記事ID.md」を作る（本文）
     2) 下の window.ARTICLES に1つ追加する（タイトルなど）
   くわしくは「記事の追加マニュアル」を見てください。
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
    1: { name: "N3くらい", desc: "ふだんの{会話|かいわ}で使うことばが中心。むずかしい{漢字|かんじ}にはふりがなを付けます。" },
    2: { name: "N2くらい", desc: "ニュースや{説明文|せつめいぶん}によく出ることばも使います。" },
    3: { name: "N1くらい", desc: "{抽象的|ちゅうしょうてき}なことばや、{長|なが}めの{文章|ぶんしょう}にチャレンジ。" }
  }
};

window.ARTICLES = [
  {
    id: "kanji-himitsu-01",
    title: "この漢字、なーんだ？ 3つのヒントで当てよう",
    format: "hint3",
    category: "kotoba",
    level: 1,
    date: "2026-11-11",
    series: "漢字のヒミツ",
    seriesNo: 1,
    thumb: "峠",
    minutes: 5,
    lead: "漢字は、小さな{部品|ぶひん}の組み合わせでできています。ヒントを1つずつ見て、どの漢字か当ててみよう。ヒントが少ないほど、あなたは漢字博士！"
  },
  {
    id: "umi-nai-ken",
    title: "海がない県はどれ？ ドボンをさけて全部見つけよう",
    format: "dobon",
    category: "zatsugaku",
    level: 2,
    date: "2026-11-08",
    thumb: "海？",
    minutes: 4,
    lead: "日本は海に{囲|かこ}まれた島国。でも、海に{面|めん}していない県もあるんです。いくつあるか知っていますか？"
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
    thumb: "すみません",
    minutes: 7,
    lead: "あやまるときも、お礼を言うときも、店員さんを呼ぶときも「すみません」。1つのことばに、どうしてこんなに{役割|やくわり}があるのでしょう？"
  },
  {
    id: "kimochi-onomatopoeia",
    title: "ドキドキ・ワクワク・イライラ 気持ちのオノマトペクイズ",
    format: "quiz4",
    category: "kotoba",
    level: 1,
    date: "2026-11-02",
    thumb: "ドキドキ",
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
    thumb: "袋は？",
    minutes: 5,
    lead: "コンビニのレジでは、{店員|てんいん}さんがいろいろなことを聞いてきます。{早口|はやくち}でも{大丈夫|だいじょうぶ}。よく聞かれる質問と答え方を知っておこう。"
  },
  {
    id: "nihon-ichi",
    title: "日本一はどこ？ 山・川・湖・県のナンバーワンクイズ",
    format: "quiz4",
    category: "zatsugaku",
    level: 2,
    date: "2026-10-29",
    thumb: "日本一",
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
    thumb: "やばい",
    minutes: 8,
    lead: "「このケーキ、やばい！」はおいしいという意味。でも「テストがやばい」は困っているという意味。正反対の意味が同居することばの変化を追ってみます。"
  }
];
