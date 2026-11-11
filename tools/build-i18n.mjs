// 翻訳（tools/i18n/<言語>.json）を点検して、サイトが読みこむ i18n/<言語>.js を作る
// 使い方: node tools/build-i18n.mjs
// 翻訳ファイルの形: { "words": {"語": "訳"}, "ex": {"記事ID/語": "例文の訳"}, "point": {"記事ID": "ポイントの訳"} }
import fs from "node:fs";
import path from "node:path";
import { ROOT, loadSite } from "./lib.mjs";

const dir = path.join(ROOT, "tools", "i18n");
const source = JSON.parse(fs.readFileSync(path.join(dir, "source.json"), "utf8"));
const { SITE } = loadSite();
fs.mkdirSync(path.join(ROOT, "i18n"), { recursive: true });
let bad = 0;

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;   // --only <言語> で、その言語だけ点検する
for (const { key, name } of SITE.langs) {
  if (only && key !== only) continue;
  const p = path.join(dir, key + ".json");
  if (!fs.existsSync(p)) { console.log(`${name} (${key}): 翻訳ファイルがありません`); bad++; continue; }
  let tr;
  try { tr = JSON.parse(fs.readFileSync(p, "utf8")); }
  catch (e) { console.log(`${name} (${key}): JSON として読めません（${e.message}）`); bad++; continue; }
  const out = { words: {}, ex: {}, point: {} };
  const miss = [], extra = [], suspicious = [];
  for (const table of ["words", "ex", "point"]) {
    const src = source[table], got = tr[table] || {};
    for (const k of Object.keys(src)) {
      const v = typeof got[k] === "string" ? got[k].trim() : "";
      if (!v) { miss.push(table + ":" + k); continue; }
      // 日本語がそのまま残っていないか（ひらがな・カタカナが多い訳は、訳し忘れの可能性）
      const kana = (v.match(/[぀-ヿ]/g) || []).length;
      if (kana > 0 && table !== "ex" && kana / v.length > 0.3) suspicious.push(table + ":" + k + " → " + v);
      out[table][k] = v;
    }
    for (const k of Object.keys(got)) if (!(k in src)) extra.push(table + ":" + k);
  }
  fs.writeFileSync(path.join(ROOT, "i18n", key + ".js"),
    "/* 自動で作られるファイルです。tools/i18n/" + key + ".json を直して node tools/build-i18n.mjs を実行してください */\n" +
    "window.NR_I18N = window.NR_I18N || {};\nwindow.NR_I18N[" + JSON.stringify(key) + "] = " + JSON.stringify(out) + ";\n");
  const kb = Math.round(fs.statSync(path.join(ROOT, "i18n", key + ".js")).size / 1024);
  console.log(`${name} (${key}): 語 ${Object.keys(out.words).length} / 例文 ${Object.keys(out.ex).length} / ポイント ${Object.keys(out.point).length} / ${kb} KB` +
    (miss.length ? ` / 訳がない ${miss.length} 件` : "") + (extra.length ? ` / 余分 ${extra.length} 件` : "") + (suspicious.length ? ` / 要確認 ${suspicious.length} 件` : ""));
  miss.slice(0, 8).forEach(m => console.log("   訳がない: " + m));
  suspicious.slice(0, 5).forEach(m => console.log("   要確認: " + m));
  if (miss.length) bad++;
}
process.exit(bad ? 1 : 0);
