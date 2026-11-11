// 辞書の部品（tools/dict/*.json）と記事の「ことばメモ」をまとめて、次の2つを作る
//   assets/dict.js           サイトが読みこむ辞書（読み・タップ語）
//   tools/i18n/source.json   翻訳のもとになる日本語（語・例文・ポイント・クイズの解説）
// 使い方: node tools/build-dict.mjs
import fs from "node:fs";
import path from "node:path";
import { ROOT, yomi, articleIds, readArticle, parseWord, loadParts } from "./lib.mjs";

const { dict, conflicts } = loadParts();
const problems = [...conflicts];
const source = { words: {}, ex: {}, point: {}, quiz: {} };
const stripMark = s => s.replace(/\*\*/g, "").replace(/\{\{([^{}]*)\}\}/g, "$1").replace(/<br\s*\/?>/g, " ").trim();

// 記事の「ことばメモ」と「なるほどポイント」を読む
for (const id of articleIds()) {
  let pointNo = 0;
  for (const b of readArticle(id)) {
    if (b.type === "words") {
      for (const { text } of b.lines) {
        if (!text.trim()) continue;
        const w = parseWord(text);
        const key = stripMark(w.word);
        if (!w.yomi || !w.expl) { problems.push(`ことばメモの列が足りません: ${id} 「${text}」`); continue; }
        // ことばメモの語は、辞書の部品より優先して登録する（読みと説明は記事に書いたものが正）
        dict.k[key] = { y: w.yomi, h: w.expl };
        if (!key.includes("〜")) {
          dict.g[key] = key;
          if (yomi.hasKanji(key) && !dict.y[key]) dict.y[key] = w.yomi;
        }
        if (w.ex) source.ex[id + "/" + key] = stripMark(w.ex);
      }
    } else if (b.type === "point") {
      pointNo++;
      source.point[id + (pointNo > 1 ? "#" + pointNo : "")] = stripMark(b.lines.map(l => l.text).join(" "));
    } else if (b.type === "quiz") {
      // クイズの解説（読み方は assets/article.js の parseQuiz と同じ）
      const q = { question: "", answers: [], explain: [] };
      let last = null;
      for (const { text } of b.lines) {
        const t = text.trim();
        if (!t) continue;
        let m;
        if ((m = /^[○◯〇]\s*(.+)$/.exec(t))) { q.answers.push(m[1]); last = null; }
        else if (/^[×✕✗]/.test(t)) { last = null; }
        else if ((m = /^(タイプ|問題|ヒント|答え|解説)\s*[:：]\s*(.*)$/.exec(t))) {
          if (m[1] === "問題") q.question = m[2];
          else if (m[1] === "答え") q.answers.push(m[2]);
          else if (m[1] === "解説") q.explain.push(m[2]);
          last = m[1];
        } else if (last === "解説") q.explain.push(t);
        else if (last === "問題") q.question += " " + t;
      }
      if (q.explain.length) {
        const raw = q.explain.join(" ");
        // q（問題）と a（正解）は、翻訳者が文脈をつかむための参考。訳すのは t（解説）だけ
        source.quiz[id + "/" + yomi.textKey(raw)] = { q: yomi.plainText(q.question), a: q.answers.map(yomi.plainText).join(" / "), t: yomi.plainText(raw) };
      }
    }
  }
}

// 点検：タップ語は、読みが付く表記で、翻訳キーの情報があること
const scan = yomi.makeScanner({ y: dict.y, g: {} }, null);
for (const [surface, key] of Object.entries(dict.g)) {
  if (!dict.k[key]) problems.push(`タップ語「${surface}」の翻訳キー「${key}」が k にありません`);
  if (yomi.hasKanji(surface)) {
    const inArticle = Object.values(dict.a).some(m => m[surface]);
    if (!dict.y[surface] && !inArticle) problems.push(`タップ語「${surface}」に読みがありません（y に同じ表記が必要）`);
  }
}
for (const [key, v] of Object.entries(dict.k)) {
  if (!v || !v.y) problems.push(`翻訳キー「${key}」に読みがありません`);
  source.words[key] = { y: v.y, h: v.h || "" };
}
// 翻訳者向けの説明を補う（1つの語が記事によって違う意味で使われるとき）
const ovPath = path.join(ROOT, "tools", "hint-overrides.json");
if (fs.existsSync(ovPath)) for (const [k, h] of Object.entries(JSON.parse(fs.readFileSync(ovPath, "utf8")))) if (source.words[k]) source.words[k].h = h;
// 使われていない翻訳キーは外す
const usedKeys = new Set(Object.values(dict.g));
for (const key of Object.keys(source.words)) if (!usedKeys.has(key) && !Object.keys(source.ex).some(k => k.endsWith("/" + key))) delete source.words[key];

const sortObj = o => Object.fromEntries(Object.entries(o).sort((a, b) => a[0].localeCompare(b[0], "ja")));
const out = {
  y: sortObj(dict.y),
  a: Object.fromEntries(Object.entries(dict.a).map(([id, m]) => [id, sortObj(m)])),
  g: sortObj(dict.g),
  k: sortObj(Object.fromEntries(Object.keys(source.words).map(k => [k, dict.k[k].y])))
};
fs.writeFileSync(path.join(ROOT, "assets", "dict.js"),
  "/* 自動で作られるファイルです。直接書きかえず、tools/dict/*.json を直して node tools/build-dict.mjs を実行してください */\nwindow.NR_DICT = " + JSON.stringify(out) + ";\n");
fs.mkdirSync(path.join(ROOT, "tools", "i18n"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "tools", "i18n", "source.json"),
  JSON.stringify({ words: sortObj(source.words), ex: source.ex, point: source.point, quiz: source.quiz }, null, 2) + "\n");

problems.forEach(p => console.log("問題: " + p));
console.log(`辞書: 読み ${Object.keys(out.y).length} / 記事専用 ${Object.values(out.a).reduce((n, m) => n + Object.keys(m).length, 0)} / タップ表記 ${Object.keys(out.g).length} / 翻訳する語 ${Object.keys(out.k).length}`);
console.log(`翻訳のもと: 語 ${Object.keys(source.words).length} / 例文 ${Object.keys(source.ex).length} / ポイント ${Object.keys(source.point).length} / クイズの解説 ${Object.keys(source.quiz).length}`);
console.log(`dict.js ${Math.round(fs.statSync(path.join(ROOT, "assets", "dict.js")).size / 1024)} KB / 問題 ${problems.length} 件`);
process.exit(problems.length ? 1 : 0);
