/* なるほどニッポン研究所 — 共通の処理
   記事データは articles/list.js（window.SITE と window.ARTICLES）から読みます。 */
(function () {
  "use strict";

  const SITE = window.SITE;
  const params = new URLSearchParams(location.search);
  const SHOW_DRAFT = params.has("draft");   // ?draft を付けると下書きも表示（確認用）

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // {漢字|かんじ} → <ruby>漢字<rt>かんじ</rt></ruby>（HTMLとして組み立て済みの文字列に使う）
  function rubyHtml(html) {
    return String(html).replace(/\{([^{}|\n]+)\|([^{}|\n]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>");
  }
  // ふつうの文字列 → エスケープしてからふりがなを付ける
  function ruby(text) { return rubyHtml(esc(text)); }
  // ふりがな記法を取りのぞいた文字列（<title>用）
  function plain(text) { return String(text).replace(/\{([^{}|\n]+)\|([^{}|\n]+)\}/g, "$1"); }

  function levelHtml(level) {
    const n = Math.max(1, Math.min(3, level | 0));
    return '<span class="lv lv' + n + '"><span class="stars">' + "★".repeat(n) +
      '<span class="off">' + "★".repeat(3 - n) + "</span></span>" + esc(SITE.levels[n].name) + "</span>";
  }

  function visibleArticles() {
    return (window.ARTICLES || [])
      .filter(a => SHOW_DRAFT || !a.draft)
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  function isNew(a) {
    const d = new Date(a.date + "T00:00:00");
    return (Date.now() - d.getTime()) / 86400000 <= SITE.newDays;
  }

  function fmtDate(s) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || "");
    return m ? m[1] + "." + m[2] + "." + m[3] : esc(s);
  }

  function articleUrl(a) {
    return "article.html?id=" + encodeURIComponent(a.id) + (SHOW_DRAFT ? "&draft" : "");
  }

  // サムネイル：画像（img/thumb/記事ID.webp）の上に、tag と catch の文字を重ねる
  function thumbHtml(a, opts) {
    opts = opts || {};
    const lines = Array.isArray(a.catch) ? a.catch : (a.catch ? [a.catch] : []);
    const longest = Math.max(1, ...lines.map(l => [...l].length));
    const size = Math.min(11.5, 60 / longest).toFixed(2);
    const img = a.image === false ? "" :
      '<img src="' + esc(a.image || "img/thumb/" + a.id + ".webp") + '" alt="" loading="' + (opts.eager ? "eager" : "lazy") + '" onerror="this.remove()">';
    return '<div class="thumb cat-' + esc(a.category) + '">' + img +
      '<div class="catch">' +
      (a.tag ? '<span class="pill">' + esc(a.tag) + "</span>" : "") +
      (lines.length ? '<span class="big" style="font-size:' + size + 'cqw">' + lines.map(esc).join("<br>") + "</span>" : "") +
      "</div>" +
      (!opts.noBadge && isNew(a) ? '<span class="new">NEW</span>' : "") +
      "</div>";
  }

  function metaHtml(a) {
    const cat = SITE.categories[a.category] || { name: a.category };
    const fmt = SITE.formats[a.format] || { name: a.format };
    return '<div class="meta">' +
      '<span class="fmt-tag">' + esc(fmt.name) + "</span>" +
      '<span class="cat-tag cat-' + esc(a.category) + '">' + esc(cat.name) + "</span>" +
      levelHtml(a.level) +
      "<span>" + fmtDate(a.date) + "</span>" +
      (a.series ? '<span class="series-tag">連載「' + ruby(a.series) + "」#" + esc(a.seriesNo) + "</span>" : "") +
      "</div>";
  }

  function cardHtml(a) {
    return '<a class="card" href="' + articleUrl(a) + '">' + thumbHtml(a) +
      '<div class="card-body"><h3 class="card-title">' + ruby(a.title) + "</h3>" + metaHtml(a) + "</div></a>";
  }

  function gacha(exceptId) {
    const list = visibleArticles().filter(a => a.id !== exceptId);
    if (!list.length) return;
    const a = list[Math.floor(Math.random() * list.length)];
    location.href = articleUrl(a);
  }

  // 研究所のメンバー（名前から探す。「ナル（研究員）」のような書き方でも見つかる）
  function charOf(name) {
    const key = plain(name).replace(/[（(].*$/, "").trim();
    const c = (SITE.characters || {})[key];
    return c ? Object.assign({ name: key }, c) : null;
  }
  function charIcon(name, cls) {
    const c = charOf(name);
    return c ? '<img class="' + (cls || "avatar") + '" src="' + esc(c.icon) + '" alt="' + esc(c.name) + '">' : "";
  }

  // ---- この端末にだけ覚えておく設定（ふりがな・ことばメモの翻訳） ----
  function getPref(key, def) {
    try { const v = localStorage.getItem(key); return v == null ? def : v; } catch (e) { return def; }
  }
  function setPref(key, val) {
    try { localStorage.setItem(key, val); } catch (e) { /* 保存できなくても動く */ }
  }
  function setFurigana(on) {
    document.body.classList.toggle("no-furigana", !on);
    document.querySelectorAll(".furigana-toggle").forEach(b => b.setAttribute("aria-pressed", String(on)));
    setPref("nr-furigana", on ? "on" : "off");
  }

  const LOGO_SVG =
    '<svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">' +
    '<circle cx="20" cy="20" r="15" fill="#fff" stroke="#1d2742" stroke-width="4"/>' +
    '<path d="M31 31 L43 43" stroke="#1d2742" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M20 11 v10" stroke="#ff5a3c" stroke-width="4.5" stroke-linecap="round"/>' +
    '<circle cx="20" cy="28" r="2.8" fill="#ff5a3c"/></svg>';

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    el.className = "site-header";
    el.innerHTML = '<div class="inner">' +
      '<a class="logo" href="index.html' + (SHOW_DRAFT ? "?draft" : "") + '">' + LOGO_SVG +
      '<span class="logo-text"><small>NARUHODO NIPPON LAB</small><span>なるほどニッポン研究所</span></span></a>' +
      '<button class="furigana-toggle" type="button" aria-pressed="true">ふりがな<span class="sw"></span></button>' +
      "</div>";
    el.querySelector(".furigana-toggle").addEventListener("click", function () {
      setFurigana(this.getAttribute("aria-pressed") !== "true");
    });
  }

  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    el.className = "site-footer";
    el.innerHTML = '<div class="footer-chars">' +
      Object.keys(SITE.characters || {}).map(n => charIcon(n, "avatar")).join("") + "</div>" +
      "<b>なるほどニッポン研究所</b><br>" +
      "日本で学ぶ留学生のための「なるほど！」を集めた読みものサイトです。<br>" +
      "このサイトは学習の記録やアクセスした人の情報を保存しません。";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    setFurigana(getPref("nr-furigana", "on") !== "off");
  });

  window.NR = {
    SITE, SHOW_DRAFT, esc, ruby, rubyHtml, plain, levelHtml, visibleArticles, isNew, fmtDate,
    articleUrl, thumbHtml, metaHtml, cardHtml, gacha, charOf, charIcon, getPref, setPref
  };
})();
