// tools 共通：記事・一覧・画面の文字から「ふりがなを付ける対象の文」を取り出す
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const yomi = createRequire(import.meta.url)(path.join(ROOT, "assets", "yomi.js"));

export function loadSite() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "articles", "list.js"), "utf8"), ctx);
  return { SITE: ctx.window.SITE, ARTICLES: ctx.window.ARTICLES };
}

export function articleIds() {
  return fs.readdirSync(path.join(ROOT, "articles")).filter(f => f.endsWith(".md")).map(f => f.replace(/\.md$/, "")).sort();
}

// 1行を、タグや記号の切れ目で分ける（ブラウザでも、太字などの切れ目をまたいでは辞書を引かない）
export function segments(line) {
  return line.replace(/\{\{[^{}]*\}\}/g, "\u0000")           // {{漢字}} はふりがなを付けない
    .replace(/\{[^{}|]+\|[^{}|]+\}/g, "\u0000")              // {漢字|よみ} は読みが書いてあるので検査しない
    .split(/\*\*|<[^>]*>|\u0000|\||`/)
    .map(s => s.trim()).filter(Boolean);
}

// 記事のブロックを読む。戻り値: [{type, lines:[{no, text}]}]（type: text / quiz / talk / words / point / try）
export function readArticle(id) {
  const md = fs.readFileSync(path.join(ROOT, "articles", id + ".md"), "utf8").replace(/\r\n?/g, "\n");
  const out = [];
  let cur = { type: "text", lines: [] };
  md.split("\n").forEach((text, i) => {
    const m = /^```(\w*)\s*$/.exec(text);
    if (m) {
      if (cur.lines.length) out.push(cur);
      cur = { type: cur.type === "text" ? (m[1] || "code") : "text", lines: [] };
      return;
    }
    cur.lines.push({ no: i + 1, text });
  });
  if (cur.lines.length) out.push(cur);
  return out;
}

// ことばメモの1行 → {word, yomi, expl, ex}
export function parseWord(text) {
  const f = text.split(/\s+[|｜]\s+/).map(s => s.trim());
  return { word: f[0], yomi: f[1] || "", expl: f[2] || "", ex: f[3] || "" };
}

// ふりがな検査の対象になる文（記事）: [{where, text}]
export function articleTexts(id) {
  const out = [];
  for (const b of readArticle(id)) {
    for (const { no, text } of b.lines) {
      if (!text.trim()) continue;
      const where = `articles/${id}.md:${no}`;
      if (b.type === "words") {
        const w = parseWord(text);
        [w.word, w.expl, w.ex].forEach(s => s && out.push({ where, text: s }));
      } else if (b.type === "quiz") {
        if (/^タイプ\s*[:：]/.test(text.trim())) continue;
        out.push({ where, text: text.trim().replace(/^(問題|ヒント|答え|解説)\s*[:：]\s*/, "").replace(/^[○◯〇×✕✗]\s*/, "") });
      } else {
        out.push({ where, text });
      }
    }
  }
  return out;
}

// 一覧（list.js）の文。サムネイルの重ね文字（tag / catch）は、ふりがなを付けないので対象外
export function listTexts() {
  const { SITE, ARTICLES } = loadSite();
  const out = [];
  const push = (where, text) => text && out.push({ where: "articles/list.js " + where, text: String(text) });
  Object.values(SITE.categories).forEach(c => push("categories", c.name));
  Object.values(SITE.formats).forEach(c => push("formats", c.name));
  Object.values(SITE.levels).forEach(c => push("levels", c.desc));
  Object.entries(SITE.characters).forEach(([n, c]) => { push("characters." + n, c.role); push("characters." + n, c.desc); });
  ARTICLES.forEach(a => { push(a.id + ".title", a.title); push(a.id + ".lead", a.lead); push(a.id + ".series", a.series); });
  return out;
}

// 画面の文字（ボタンや見出し）。tools/ui-strings.txt に1行ずつ書いてある
export function uiTexts() {
  const p = path.join(ROOT, "tools", "ui-strings.txt");
  if (!fs.existsSync(p)) return [];
  return fs.readFileSync(p, "utf8").split(/\r?\n/).map((text, i) => ({ where: "tools/ui-strings.txt:" + (i + 1), text }))
    .filter(x => x.text.trim() && !x.text.startsWith("#"));
}

// 辞書の部品（tools/dict/*.json）を読んで合わせる。only を渡すと、その部品だけ
export function loadParts(only) {
  const dir = path.join(ROOT, "tools", "dict");
  const dict = { y: {}, a: {}, g: {}, k: {} };
  const conflicts = [];
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith(".json")).sort() : [];
  for (const f of files) {
    if (only && f !== only && f !== only + ".json" && f !== "part-" + only + ".json") continue;
    let part;
    try { part = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")); }
    catch (e) { conflicts.push(`${f}: JSON として読めません（${e.message}）`); continue; }
    const put = (target, key, val, label) => {
      const a = JSON.stringify(target[key]), b = JSON.stringify(val);
      if (target[key] !== undefined && a !== b) conflicts.push(`${label}「${key}」: ${a} と ${b}（${f}）`);
      else target[key] = val;
    };
    Object.entries(part.y || {}).forEach(([s, r]) => put(dict.y, s, r, "読み"));
    Object.entries(part.a || {}).forEach(([id, m]) => { dict.a[id] = dict.a[id] || {}; Object.entries(m).forEach(([s, r]) => put(dict.a[id], s, r, "読み(" + id + ")")); });
    Object.entries(part.g || {}).forEach(([s, k]) => put(dict.g, s, k, "タップ語"));
    Object.entries(part.k || {}).forEach(([k, v]) => { if (dict.k[k] === undefined) dict.k[k] = v; else if (dict.k[k].y !== v.y) conflicts.push(`翻訳キー「${k}」の読み: ${dict.k[k].y} と ${v.y}（${f}）`); });
  }
  return { dict, conflicts, files };
}
