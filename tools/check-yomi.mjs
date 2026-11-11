// ふりがなの検査：辞書に載っていない漢字（＝ふりがなが付かない漢字）を全部報告する
// 使い方:
//   node tools/check-yomi.mjs                      全部の記事＋一覧＋画面の文字を、全部の辞書部品で検査
//   node tools/check-yomi.mjs --part A id1 id2 @list @ui   部品 part-A.json だけを使って、指定したものを検査
//   --list を付けると、使われた「語 → 読み」を全部表示する（読みまちがいの見直し用）
import { yomi, articleIds, articleTexts, listTexts, uiTexts, segments, loadParts } from "./lib.mjs";

const args = process.argv.slice(2);
let part = null, showList = false;
const targets = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--part") part = args[++i];
  else if (args[i] === "--list") showList = true;
  else targets.push(args[i]);
}
const want = targets.length ? targets : [...articleIds(), "@list", "@ui"];
const { dict, conflicts } = loadParts(part);

let bad = 0, warn = 0;
const used = new Map();   // "語→読み" → {n, sample}
const scanners = new Map();
const scannerFor = id => { if (!scanners.has(id)) scanners.set(id, yomi.makeScanner(dict, id)); return scanners.get(id); };

for (const t of want) {
  const id = t.startsWith("@") ? null : t.replace(/\.md$/, "").replace(/^articles\//, "");
  const texts = t === "@list" ? listTexts() : t === "@ui" ? uiTexts() : articleTexts(id);
  const scan = scannerFor(id);
  for (const { where, text } of texts) {
    for (const seg of segments(text)) {
      const toks = scan(seg);
      const miss = yomi.uncovered(toks);
      if (miss.length) { bad++; console.log(`未登録 ${where}  [${[...new Set(miss)].join("")}]  ${seg}`); }
      toks.forEach((tok, i) => {
        if (!tok.s) return;
        if (tok.r) {
          const key = tok.s + " → " + tok.r;
          const u = used.get(key) || { n: 0, sample: seg, where };
          u.n++; used.set(key, u);
        }
        // 漢字のかたまりが、2つの語に分かれて読まれている（読みまちがいの可能性）
        const next = toks[i + 1];
        if (next && next.s && yomi.KANJI.test(tok.s.slice(-1)) && yomi.KANJI.test(next.s[0])) {
          warn++; console.log(`分割注意 ${where}  「${tok.s}」(${tok.r})＋「${next.s}」(${next.r})  ${seg}`);
        }
      });
    }
  }
}
conflicts.forEach(c => console.log("辞書の食いちがい: " + c));
if (showList) {
  console.log("\n--- 使われた読み（語 → 読み ／ 回数 ／ 例） ---");
  [...used.entries()].sort((a, b) => a[0].localeCompare(b[0], "ja")).forEach(([k, u]) => console.log(`${k}\t${u.n}\t${u.sample.slice(0, 40)}`));
}
console.log(`\n結果: 未登録 ${bad} 件 / 分割注意 ${warn} 件 / 食いちがい ${conflicts.length} 件`);
process.exit(bad || conflicts.length ? 1 : 0);
