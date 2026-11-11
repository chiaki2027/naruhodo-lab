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
    1: { name: "N3", desc: "ふだんの{会話|かいわ}で使うことばが中心。むずかしい{漢字|かんじ}にはふりがなを付けます。" },
    2: { name: "N2", desc: "ニュースや{説明文|せつめいぶん}によく出ることばも使います。" },
    3: { name: "N1", desc: "{抽象的|ちゅうしょうてき}なことばや、{長|なが}めの{文章|ぶんしょう}にチャレンジ。" }
  },

  // 研究所のメンバー。会話（talk）で同じ名前を使うと、このアイコンが出ます
  characters: {
    "ナル": {
      icon: "img/icon-naru.webp",
      role: "{研究員|けんきゅういん}（{留学生|りゅうがくせい}）",
      desc: "日本に来て2年目。「なんで？」が{口|くち}ぐせ。気になったことは、すぐノートに書く。"
    },
    "ホド": {
      icon: "img/icon-hodo.webp",
      role: "{先輩|せんぱい}研究員",
      desc: "ことばと{文化|ぶんか}にくわしい。むずかしいことを、やさしく{説明|せつめい}するのが{得意|とくい}。"
    },
    "ポン": {
      icon: "img/icon-pon.webp",
      role: "研究所のたぬき",
      desc: "クイズを出すのが大好き。ときどき自分がドボンする。"
    }
  },

  // ことばメモの翻訳（words ブロックの4列目以降の順番）
  langs: [
    { key: "en", name: "English" },
    { key: "zh", name: "中文" },
    { key: "vi", name: "Tiếng Việt" }
  ]
};

/* tag  : サムネイルの小さいラベル
   catch: サムネイルの大きい文字（1〜2行。1行は7文字くらいまで） */
window.ARTICLES = [
  {
    id: "anime-nihongo",
    title: "アニメで{覚|おぼ}えた日本語、そのまま使って大丈夫？",
    format: "dobon",
    category: "kotoba",
    level: 1,
    date: "2026-11-11",
    tag: "アニメの日本語",
    catch: ["「貴様！」は", "キケン？"],
    minutes: 6,
    pickup: true,
    lead: "アニメは最高の日本語の先生。でも、キャラクターのセリフをそのまま使うと、相手がびっくりすることも…。使っていいことば、あぶないことばを見分けよう。"
  },
  {
    id: "itami-onomatopoeia",
    title: "ズキズキ？ ガンガン？ 病院で{痛|いた}みを伝えるオノマトペ",
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
    title: "その{敬語|けいご}、お客様に言って大丈夫？ アルバイトの日本語",
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
    lead: "漢字は、小さな{部品|ぶひん}の組み合わせでできています。ヒントを1つずつ見て、どの漢字か当ててみよう。ヒントが少ないほど、あなたは漢字博士！"
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
    tag: "ことばのナゾ",
    catch: ["すみませんの", "3つの顔"],
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
    lead: "コンビニのレジでは、{店員|てんいん}さんがいろいろなことを聞いてきます。{早口|はやくち}でも{大丈夫|だいじょうぶ}。よく聞かれる質問と答え方を知っておこう。"
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
