/* ふりがな（読み方の辞書引き）の共通処理。ブラウザと tools/ の両方で使う。
   辞書 dict = { y: {語: 読み}, a: {記事ID: {語: 読み}}, g: {語: 翻訳キー}, k: {翻訳キー: 読み} } */
(function (root, factory) {
  const core = factory();
  if (typeof module === "object" && module.exports) module.exports = core;
  else root.NRYomi = core;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const KANJI = /[㐀-䶿一-鿿豈-﫿々]/;
  const KANA = /[぀-ゟ゠-ヿー]/;
  const hasKanji = s => KANJI.test(s);
  const toHira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  // 文字列を左から読み、辞書のいちばん長い語に当てはめる
  function makeScanner(dict, articleId) {
    const y = Object.assign({}, dict.y || {}, (dict.a || {})[articleId] || {});
    const g = dict.g || {};
    const index = new Map();
    const add = s => {
      if (!s) return;
      const arr = index.get(s[0]) || [];
      if (!index.has(s[0])) index.set(s[0], arr);
      if (!arr.includes(s)) arr.push(s);
    };
    Object.keys(y).forEach(add);
    Object.keys(g).forEach(add);
    index.forEach(arr => arr.sort((a, b) => b.length - a.length));

    return function scan(text) {
      const out = [];
      let buf = "", i = 0;
      const flush = () => { if (buf) { out.push({ t: buf }); buf = ""; } };
      while (i < text.length) {
        const cands = index.get(text[i]);
        let hit = null;
        if (cands) for (const s of cands) if (text.startsWith(s, i)) { hit = s; break; }
        if (hit) { flush(); out.push({ s: hit, r: y[hit] || null, g: g[hit] || null }); i += hit.length; }
        else { buf += text[i]; i++; }
      }
      flush();
      return out;
    };
  }

  // 「伝える」＋「つたえる」→ [{b:"伝", r:"つた"}, {b:"える"}] のように、漢字の部分だけに読みを割り当てる
  function align(surface, reading) {
    if (!reading || !hasKanji(surface)) return [{ b: surface }];
    const runs = [];
    for (const c of surface) {
      const k = KANA.test(c);
      const last = runs[runs.length - 1];
      if (last && last.k === k) last.s += c; else runs.push({ k, s: c });
    }
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp("^" + runs.map(r => r.k ? esc(toHira(r.s)) : "(.+?)").join("") + "$");
    const m = re.exec(toHira(reading));
    if (!m) return [{ b: surface, r: reading }];
    let n = 1;
    return runs.map(r => r.k ? { b: r.s } : { b: r.s, r: m[n++] });
  }

  // 辞書に当たらなかった漢字（ふりがなが付かない漢字）を返す
  function uncovered(tokens) {
    const out = [];
    tokens.forEach(t => { if (t.t) for (const c of t.t) if (KANJI.test(c)) out.push(c); });
    return out;
  }

  return { makeScanner, align, uncovered, hasKanji, KANJI };
});
