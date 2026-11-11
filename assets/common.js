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

  // ふりがなは辞書（assets/dict.js）から自動で付く。ここは、手で指定するときの記法だけを処理する
  //   {漢字|かんじ} → この読みを付ける（辞書より優先）
  //   {{漢字}}      → ふりがなを付けない（読みがクイズの答えになるときなど）
  function rubyHtml(html) {
    return String(html)
      .replace(/\{\{([^{}\n]+)\}\}/g, '<span class="no-yomi">$1</span>')
      .replace(/\{([^{}|\n]+)\|([^{}|\n]+)\}/g, "<ruby>$1<rt>$2</rt></ruby>");
  }
  // ふつうの文字列 → エスケープしてから記法を処理する
  function ruby(text) { return rubyHtml(esc(text)); }
  // 記法を取りのぞいた文字列（<title>用）
  function plain(text) {
    return String(text).replace(/\{\{([^{}\n]+)\}\}/g, "$1").replace(/\{([^{}|\n]+)\|([^{}|\n]+)\}/g, "$1");
  }

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
    // 画像は3つの大きさ（幅640 / 960 / 1280）を用意してあり、表示する大きさに合うものをブラウザが選ぶ
    const id = encodeURIComponent(a.id);
    const src = a.image
      ? 'src="' + esc(a.image) + '"'
      : 'src="img/thumb/m/' + id + '.webp" srcset="img/thumb/s/' + id + ".webp 640w, img/thumb/m/" + id + ".webp 960w, img/thumb/" + id + '.webp 1280w" sizes="' +
        (opts.large ? "(max-width: 760px) 80vw, 720px" : "(max-width: 760px) 50vw, 320px") + '"';
    const img = a.image === false ? "" :
      "<img " + src + ' alt="" loading="' + (opts.eager ? "eager" : "lazy") + '" onerror="this.remove()">';
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

  // ---- 記事ガチャ：ハンドルが回る → カプセルが出る → 開く → 記事へ移動 ----
  const CAPSULE_COLORS = ["#2f6fed", "#12a37b", "#f08a24", "#ff5a3c", "#ffe36b", "#b05cff", "#2f6fed", "#ff5a3c"];
  function machineSvg() {
    const balls = [[78, 128, 0], [112, 148, 1], [150, 136, 2], [96, 96, 3], [138, 100, 4], [165, 110, 5], [70, 96, 6], [122, 68, 7]];
    return '<svg class="gacha-machine" viewBox="0 0 240 320" aria-hidden="true">' +
      '<rect x="30" y="288" width="180" height="20" rx="10" fill="#1d2742"/>' +
      '<rect x="40" y="176" width="160" height="118" rx="20" fill="#ff5a3c" stroke="#1d2742" stroke-width="6"/>' +
      '<circle cx="120" cy="104" r="90" fill="#eaf4ff" stroke="#1d2742" stroke-width="6"/>' +
      balls.map(b => '<g class="gm-ball" style="--i:' + b[2] + '"><circle cx="' + b[0] + '" cy="' + b[1] + '" r="19" fill="' + CAPSULE_COLORS[b[2]] +
        '" stroke="#1d2742" stroke-width="4"/><path d="M' + (b[0] - 19) + " " + b[1] + "a19 19 0 0 0 38 0z" + '" fill="#fff" stroke="#1d2742" stroke-width="4"/></g>').join("") +
      '<path d="M52 70a80 80 0 0 1 50-46" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".8"/>' +
      '<rect x="96" y="4" width="48" height="18" rx="9" fill="#1d2742"/>' +
      '<rect x="40" y="176" width="160" height="22" fill="#1d2742" opacity=".18"/>' +
      '<rect x="54" y="246" width="50" height="36" rx="10" fill="#1d2742"/>' +
      '<g class="gm-handle"><circle cx="150" cy="238" r="30" fill="#fff" stroke="#1d2742" stroke-width="6"/>' +
      '<rect x="143" y="212" width="14" height="52" rx="7" fill="#ffe36b" stroke="#1d2742" stroke-width="4"/></g>' +
      "</svg>";
  }

  let gachaBusy = false;
  function gacha(exceptId) {
    if (gachaBusy) return;
    const list = visibleArticles().filter(a => a.id !== exceptId);
    if (!list.length) return;
    const a = list[Math.floor(Math.random() * list.length)];
    const url = articleUrl(a);
    const still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gachaBusy = true;

    const confetti = Array.from({ length: 26 }, (_, i) => {
      const ang = (i / 26) * Math.PI * 2 + Math.random() * .4, dist = 120 + Math.random() * 150;
      return '<i style="--dx:' + Math.round(Math.cos(ang) * dist) + "px;--dy:" + Math.round(Math.sin(ang) * dist - 40) + "px;--r:" +
        Math.round(Math.random() * 720 - 360) + "deg;background:" + CAPSULE_COLORS[i % CAPSULE_COLORS.length] + '"></i>';
    }).join("");

    const ov = document.createElement("div");
    ov.className = "gacha-ov";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-label", "記事ガチャ");
    ov.innerHTML =
      '<div class="gacha-rays"></div>' +
      '<button class="gacha-close" type="button" aria-label="やめる">✕</button>' +
      '<div class="gacha-stage">' + machineSvg() +
      '<div class="gacha-capsule" style="--cap:var(--cat-' + esc(a.category) + ', #ff5a3c)"><span class="cap-top"></span><span class="cap-bottom"></span></div>' +
      '<div class="gacha-flash"></div><div class="gacha-confetti">' + confetti + "</div></div>" +
      '<p class="gacha-say" aria-live="polite"></p>' +
      '<a class="gacha-result" href="' + url + '">' +
      '<span class="gacha-got">' + charIcon("ポン") + "この記事が出たポン！</span>" +
      thumbHtml(a, { noBadge: true, eager: true, large: true }) +
      '<span class="gacha-title">' + ruby(a.title) + "</span>" +
      '<span class="gacha-go">読みに行く →<span class="gacha-bar"></span></span></a>';
    document.body.appendChild(ov);
    document.body.classList.add("gacha-lock");

    const say = ov.querySelector(".gacha-say");
    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const phase = (name, text) => { ov.dataset.phase = name; say.textContent = text; };
    function close() {
      timers.forEach(clearTimeout);
      document.removeEventListener("keydown", onKey);
      document.body.classList.remove("gacha-lock");
      ov.remove();
      gachaBusy = false;
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    ov.querySelector(".gacha-close").addEventListener("click", close);
    // 記事ページから「戻る」で帰ってきたときに、演出が残らないようにする
    window.addEventListener("pageshow", e => { if (e.persisted) close(); }, { once: true });

    if (still) {            // 動きを減らす設定の人には、結果だけ見せる
      phase("result", "");
      at(1800, () => { location.href = url; });
      return;
    }
    phase("spin", "ガチャ、ガチャ…");
    at(1500, () => phase("drop", "コロン！"));
    at(2250, () => phase("focus", "なにが出るかな…？"));
    at(3150, () => phase("open", "パカッ！"));
    at(3500, () => phase("result", ""));
    at(3500 + 2600, () => { location.href = url; });
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

  // ---- 自動ふりがな：辞書（assets/dict.js）を引いて、全部の漢字に読みを付ける ----
  const DICT = window.NR_DICT || null;
  const articleId = /article\.html$/.test(location.pathname) ? params.get("id") : null;
  const scan = DICT && window.NRYomi ? window.NRYomi.makeScanner(DICT, articleId) : null;
  // ふりがなを付けない場所（翻訳の文 .tr は日本語ではないので、必ず対象外にする）
  const SKIP = "ruby, rt, rp, script, style, select, option, textarea, svg, .no-yomi, .gl, .gl-pop, .tr, .catch, .logo";
  const missing = new Set();   // 辞書になかった漢字（確認用。NR.missing で見られる）

  function tokenNode(tok, glossOk) {
    const frag = document.createDocumentFragment();
    window.NRYomi.align(tok.s, tok.r).forEach(p => {
      if (!p.r) { frag.appendChild(document.createTextNode(p.b)); return; }
      const rb = document.createElement("ruby");
      rb.textContent = p.b;
      const rt = document.createElement("rt");
      rt.textContent = p.r;
      rb.appendChild(rt);
      frag.appendChild(rb);
    });
    if (!(tok.g && glossOk)) return frag;
    const sp = document.createElement("span");   // タップで訳を出す語
    sp.className = "gl";
    sp.dataset.g = tok.g;
    sp.tabIndex = 0;
    sp.setAttribute("role", "button");
    sp.appendChild(frag);
    return sp;
  }
  function annotateText(n) {
    const p = n.parentElement;
    if (!scan || !p || p.closest(SKIP)) return;
    const text = n.nodeValue;
    if (!text || !/\S/.test(text)) return;
    const toks = scan(text);
    window.NRYomi.uncovered(toks).forEach(c => missing.add(c));
    const glossOk = !!p.closest(".gloss-on") && !p.closest("button, a, .no-gloss");
    // 書きかえるのは「漢字があって読みを付ける語」か「タップ語」だけ。
    // かなだけの語を同じ文字で置きかえると、置きかえが止まらなくなるので、必ずここで除く
    const use = t => t.s && ((t.r && window.NRYomi.hasKanji(t.s)) || (t.g && glossOk));
    if (!toks.some(use)) return;
    const frag = document.createDocumentFragment();
    toks.forEach(t => frag.appendChild(use(t) ? tokenNode(t, glossOk) : document.createTextNode(t.s || t.t)));
    n.replaceWith(frag);
  }
  function annotate(root) {
    if (!scan || !root || (root.closest && root.closest(SKIP))) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(annotateText);
  }
  function startYomi() {
    if (!scan) return;
    annotate(document.body);
    // あとから画面に足された文字（クイズの結果など）にも、自動でふりがなを付ける
    new MutationObserver(muts => muts.forEach(m => m.addedNodes.forEach(n => {
      if (n.nodeType === 3) annotateText(n); else if (n.nodeType === 1) annotate(n);
    }))).observe(document.body, { childList: true, subtree: true });
  }

  // ---- 翻訳の言語（選んだ言語のデータ i18n/<言語>.js だけを読みこむ） ----
  const LANGS = SITE.langs || [];
  const LANG_SHORT = { en: "EN", "zh-Hant": "繁", "zh-Hans": "简", es: "ES", my: "MY", ne: "NE", vi: "VI", mn: "MN" };
  let lang = "";
  const langListeners = [];
  function guessLang() {   // 最初は、端末の言語に合わせる（日本語の端末は「日本語だけ」）
    const keys = LANGS.map(l => l.key);
    for (const n of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])) {
      const l = String(n).toLowerCase();
      if (l.startsWith("ja")) return "";
      if (l.startsWith("zh")) return /tw|hk|mo|hant/.test(l) ? "zh-Hant" : "zh-Hans";
      const k = keys.find(k => l === k.toLowerCase() || l.startsWith(k.toLowerCase() + "-"));
      if (k) return k;
    }
    return "";
  }
  function loadLang(key) {
    return new Promise(res => {
      if (!key) return res(null);
      window.NR_I18N = window.NR_I18N || {};
      if (window.NR_I18N[key]) return res(window.NR_I18N[key]);
      const s = document.createElement("script");
      s.src = "i18n/" + key + ".js";
      s.onload = () => res(window.NR_I18N[key] || null);
      s.onerror = () => res(null);
      document.head.appendChild(s);
    });
  }
  function setLang(key, save) {
    lang = LANGS.some(l => l.key === key) ? key : "";
    if (save) setPref("nr-lang", lang || "none");
    closePop();
    document.body.classList.toggle("has-lang", !!lang);
    document.querySelectorAll(".lang-pick").forEach(p => {
      p.classList.toggle("none", !lang);
      p.querySelector("select").value = lang;
      p.querySelector("b").textContent = lang ? (LANG_SHORT[lang] || lang) : "Language";
    });
    loadLang(lang).then(data => { if (lang === key || !key) langListeners.forEach(fn => fn(lang, data)); });
  }
  function onLang(fn) { langListeners.push(fn); loadLang(lang).then(data => fn(lang, data)); }

  // ---- タップ翻訳：点線が付いた語をタップすると、読みと訳の小さい窓が出る ----
  let pop = null;
  function closePop() { if (pop) { pop.remove(); pop = null; } }
  function openPop(el) {
    closePop();
    const key = el.dataset.g;
    const data = (window.NR_I18N || {})[lang];
    const tr = data && data.words && data.words[key];
    const yomiText = DICT && DICT.k ? DICT.k[key] || "" : "";
    pop = document.createElement("div");
    pop.className = "gl-pop";
    pop.setAttribute("role", "tooltip");
    pop.innerHTML = '<div class="gl-word">' + esc(key) + (yomiText && yomiText !== key ? '<span class="gl-yomi">' + esc(yomiText) + "</span>" : "") + "</div>" +
      '<div class="gl-tr" lang="' + esc(lang) + '">' + (tr ? esc(tr) : "…") + "</div>";
    document.body.appendChild(pop);
    const r = el.getClientRects()[0] || el.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, pw = pop.offsetWidth, ph = pop.offsetHeight;
    const left = Math.max(8, Math.min(vw - pw - 8, r.left + r.width / 2 - pw / 2));
    const above = r.top - ph - 12 > 64;   // 上に出す場所がなければ、下に出す
    pop.style.left = left + window.scrollX + "px";
    pop.style.top = (above ? r.top - ph - 10 : r.bottom + 10) + window.scrollY + "px";
    pop.style.setProperty("--arrow", Math.max(14, Math.min(pw - 14, r.left + r.width / 2 - left)) + "px");
    pop.classList.add(above ? "above" : "below");
  }
  document.addEventListener("click", e => {
    const g = e.target.closest ? e.target.closest(".gl") : null;
    if (g && lang) { e.preventDefault(); openPop(g); }
    else if (!(e.target.closest && e.target.closest(".gl-pop"))) closePop();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePop();
    else if ((e.key === "Enter" || e.key === " ") && lang && e.target.classList && e.target.classList.contains("gl")) { e.preventDefault(); openPop(e.target); }
  });
  window.addEventListener("resize", closePop);

  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    el.className = "site-header";
    el.innerHTML = '<div class="inner">' +
      '<a class="logo" href="index.html' + (SHOW_DRAFT ? "?draft" : "") + '">' + LOGO_SVG +
      '<span class="logo-text"><small>NARUHODO NIPPON LAB</small><span>なるほどニッポン研究所</span></span></a>' +
      '<div class="hdr-tools">' +
      '<label class="lang-pick none"><span class="lang-now">🌐<b>Language</b></span>' +
      '<select aria-label="Language / 翻訳の言語"><option value="">日本語だけ</option>' +
      LANGS.map(l => '<option value="' + esc(l.key) + '">' + esc(l.name) + "</option>").join("") + "</select></label>" +
      '<button class="furigana-toggle" type="button" aria-pressed="true">ふりがな<span class="sw"></span></button>' +
      "</div></div>";
    el.querySelector(".furigana-toggle").addEventListener("click", function () {
      setFurigana(this.getAttribute("aria-pressed") !== "true");
    });
    el.querySelector(".lang-pick select").addEventListener("change", function () { setLang(this.value, true); });
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
    const saved = getPref("nr-lang", null);
    setLang(saved == null ? guessLang() : (saved === "none" ? "" : saved), false);
    startYomi();
  });

  window.NR = {
    SITE, SHOW_DRAFT, esc, ruby, rubyHtml, plain, levelHtml, visibleArticles, isNew, fmtDate,
    articleUrl, thumbHtml, metaHtml, cardHtml, gacha, charOf, charIcon, getPref, setPref,
    onLang, missing, lang: () => lang
  };
})();
