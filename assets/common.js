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

  function stars(level) {
    const n = Math.max(1, Math.min(3, level | 0));
    return '<span class="stars" title="' + esc(SITE.levels[n].name) + '">' +
      "★".repeat(n) + '<span class="off">' + "★".repeat(3 - n) + "</span></span>";
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

  function thumbHtml(a, opts) {
    opts = opts || {};
    const cat = SITE.categories[a.category] || { color: "#888" };
    const fmt = SITE.formats[a.format] || { name: a.format };
    const glyph = a.thumb || "？";
    return '<div class="thumb cat-' + esc(a.category) + '">' +
      '<span class="glyph' + ([...glyph].length > 2 ? " long" : "") + '">' + esc(glyph) + "</span>" +
      (opts.noBadge ? "" : '<span class="fmt">' + esc(fmt.name) + "</span>") +
      (!opts.noBadge && isNew(a) ? '<span class="new">NEW</span>' : "") +
      "</div>";
  }

  function metaHtml(a) {
    const cat = SITE.categories[a.category] || { name: a.category };
    return '<div class="meta">' +
      '<span class="cat-tag cat-' + esc(a.category) + '">' + esc(cat.name) + "</span>" +
      stars(a.level) +
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

  // ---- ふりがなON/OFF（この端末にだけ覚えておく） ----
  function getFurigana() {
    try { return localStorage.getItem("nr-furigana") !== "off"; } catch (e) { return true; }
  }
  function setFurigana(on) {
    document.body.classList.toggle("no-furigana", !on);
    document.querySelectorAll(".furigana-toggle").forEach(b => b.setAttribute("aria-pressed", String(on)));
    try { localStorage.setItem("nr-furigana", on ? "on" : "off"); } catch (e) { /* 保存できなくても動く */ }
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
    el.innerHTML = "<b>なるほどニッポン研究所</b><br>" +
      "日本で学ぶ留学生のための「なるほど！」を集めた読みものサイトです。<br>" +
      "このサイトは学習の記録やアクセスした人の情報を保存しません。";
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    setFurigana(getFurigana());
  });

  window.NR = {
    SITE, SHOW_DRAFT, esc, ruby, rubyHtml, plain, stars, visibleArticles, isNew, fmtDate,
    articleUrl, thumbHtml, metaHtml, cardHtml, gacha
  };
})();
