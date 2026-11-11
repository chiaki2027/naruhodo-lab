/* なるほどニッポン研究所 — 記事ページ
   articles/<id>.md を読み込み、Markdown と特別なブロック（quiz / talk / words / point / try）を表示します。 */
(function () {
  "use strict";
  const { SITE, esc, ruby, rubyHtml, plain, visibleArticles, articleUrl, thumbHtml, metaHtml, cardHtml, gacha, charOf, charIcon, getPref, setPref } = NR;

  const id = new URLSearchParams(location.search).get("id");
  const all = visibleArticles();
  const art = all.find(a => a.id === id);

  const $ = s => document.querySelector(s);
  // 日本語の文では「**」の前後が記号だと太字にならない（Markdownの仕様）ので、太字だけ先に変換する
  const bold = s => String(s || "").replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>");
  const inline = s => rubyHtml(marked.parseInline(bold(s)));
  const block = s => rubyHtml(marked.parse(bold(s)));

  if (!art) {
    $("#head").innerHTML = "<h1>記事が見つかりません</h1>";
    $("#body").innerHTML = '<p><a href="index.html">トップページへもどる</a></p>';
    return;
  }

  // ---------- 見出し部分 ----------
  const cat = SITE.categories[art.category] || { name: art.category };
  document.title = plain(art.title) + " | なるほどニッポン研究所";
  $("#crumb-cat").innerHTML = ruby(cat.name);
  $("#head").innerHTML =
    thumbHtml(art, { noBadge: true, eager: true }) +
    "<h1>" + ruby(art.title) + "</h1>" +
    metaHtml(art) +
    (art.minutes ? '<div class="meta">読む時間：約' + esc(art.minutes) + "分</div>" : "") +
    (art.draft ? '<div class="draft-note">これは下書き（非公開）の記事です。URLに ?draft を付けたときだけ表示されます。</div>' : "") +
    (art.lead ? '<div class="lead">' + inline(art.lead) + "</div>" : "");

  // ---------- 本文 ----------
  fetch("articles/" + encodeURIComponent(art.id) + ".md", { cache: "no-cache" })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(render)
    .catch(() => {
      $("#body").innerHTML = "<p>本文を読み込めませんでした。</p>" +
        (location.protocol === "file:" ? "<p>（パソコンでファイルを直接開いた場合は表示できません。GitHub Pages に公開するか、ローカルサーバーで開いてください。）</p>" : "");
    });

  function render(md) {
    md = md.replace(/\r\n?/g, "\n");
    const blocks = [];
    md = md.replace(/^```(quiz|talk|words|point|try)[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm, (_, type, src) => {
      blocks.push({ type, src });
      return '\n<div class="nr-slot" data-i="' + (blocks.length - 1) + '"></div>\n';
    });
    $("#body").innerHTML = block(md);
    let qNo = 0;
    const builders = { talk: buildTalk, words: buildWords, point: buildPoint, try: buildTry };
    document.querySelectorAll(".nr-slot").forEach(slot => {
      const b = blocks[Number(slot.dataset.i)];
      slot.replaceWith(b.type === "quiz" ? buildQuiz(parseQuiz(b.src), ++qNo) : builders[b.type](b.src));
    });
    applyLang();
    updateScore();
    renderNext();
  }

  // ---------- クイズ ----------
  const TYPE_ALIASES = { "4択": "choice", "4たく": "choice", "選択": "choice", "3ヒント": "hint", "ドボン": "dobon", "めくる": "reveal" };
  const TYPE_LABEL = { choice: "選んで答えよう", hint: "ヒントが少ないほどすごい！", dobon: "ドボンを選ばずにクリアしよう", reveal: "考えてから答えを見よう" };

  function parseQuiz(src) {
    const q = { type: "choice", question: "", hints: [], choices: [], answer: "", explain: [] };
    let last = null;
    src.split("\n").forEach(line => {
      const t = line.trim();
      if (!t) return;
      let m;
      if ((m = /^[○◯〇]\s*(.+)$/.exec(t))) { q.choices.push({ text: m[1], ok: true }); last = null; }
      else if ((m = /^[×✕✗]\s*(.+)$/.exec(t))) { q.choices.push({ text: m[1], ok: false }); last = null; }
      else if ((m = /^(タイプ|問題|ヒント|答え|解説)\s*[:：]\s*(.*)$/.exec(t))) {
        const [, key, val] = m;
        if (key === "タイプ") q.type = TYPE_ALIASES[val.replace(/\s/g, "")] || "choice";
        else if (key === "問題") q.question = val;
        else if (key === "ヒント") q.hints.push(val);
        else if (key === "答え") q.answer = val;
        else if (key === "解説") q.explain.push(val);
        last = key;
      } else if (last === "解説") q.explain.push(t);
      else if (last === "問題") q.question += "<br>" + t;
      else if (last === "ヒント") q.hints[q.hints.length - 1] += "<br>" + t;
      else if (last === "答え") q.answer += "<br>" + t;
    });
    return q;
  }

  const scores = [];   // このページを開いている間だけ数える（保存しない）
  function track() { const s = { done: false, ok: false }; scores.push(s); return s; }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function resultBox(kind, verdict, q, extra) {
    const r = el("div", "result " + kind);
    let h = verdict ? '<span class="verdict">' + verdict + "</span>" : "";
    if (extra) h += "<div>" + extra + "</div>";
    if (q.answer) h += '<div class="answer">答え：' + inline(q.answer) + "</div>";
    if (q.explain.length) h += '<div class="explain">' + q.explain.map(inline).join("<br>") + "</div>";
    r.innerHTML = h;
    return r;
  }

  function buildQuiz(q, no) {
    const box = el("section", "quiz");
    box.appendChild(el("div", "quiz-head",
      charIcon("ポン") + '<span class="quiz-no">Q' + no + '</span><span class="quiz-type">' + TYPE_LABEL[q.type] + "</span>"));
    box.appendChild(el("div", "quiz-q", inline(q.question)));
    if (q.type === "hint") buildHint(box, q);
    else if (q.type === "dobon") buildDobon(box, q);
    else if (q.type === "reveal") buildReveal(box, q);
    else buildChoice(box, q);
    return box;
  }

  const isShort = q => q.choices.every(c => [...plain(c.text)].length <= 14);

  function choiceButtons(q, onPick, two) {
    const wrap = el("div", "choices" + (two ? " two" : ""));
    const marks = "1234567890";
    q.choices.forEach((c, i) => {
      const b = el("button", "choice", '<span class="mark">' + (marks[i] || "・") + "</span>" + inline(c.text));
      b.type = "button";
      b.addEventListener("click", () => onPick(c, b, wrap));
      wrap.appendChild(b);
    });
    return wrap;
  }

  function finishChoices(wrap, q, pickedBtn) {
    wrap.querySelectorAll(".choice").forEach((b, i) => {
      b.disabled = true;
      if (q.choices[i].ok) b.classList.add("correct");
      else if (b === pickedBtn) b.classList.add("wrong");
      else b.classList.add("dim");
    });
  }

  function buildChoice(box, q) {
    const s = track();
    const wrap = choiceButtons(q, (c, btn) => {
      if (s.done) return;
      s.done = true; s.ok = c.ok;
      finishChoices(wrap, q, btn);
      box.appendChild(resultBox(c.ok ? "good" : "bad", c.ok ? "せいかい！" : "ざんねん…", q));
      updateScore();
    }, isShort(q));
    box.appendChild(wrap);
  }

  function buildHint(box, q) {
    const list = el("ol", "hints");
    let shown = 1;
    const hasChoices = q.choices.length > 0;
    const s = hasChoices ? track() : null;
    let finished = false;

    const actions = el("div", "quiz-actions");
    const nextBtn = el("button", "btn btn-line", "次のヒントを見る");
    nextBtn.type = "button";
    nextBtn.addEventListener("click", () => { shown++; drawHints(); });
    actions.appendChild(nextBtn);
    const ansBtn = el("button", "btn btn-gacha", "答えを見る");
    ansBtn.type = "button";

    function drawHints(showAll) {
      if (showAll) shown = q.hints.length;
      list.innerHTML = q.hints.map((h, i) => i < shown
        ? '<li class="hint"><span class="tag">ヒント' + (i + 1) + "</span><span>" + inline(h) + "</span></li>"
        : '<li class="hint locked"><span class="tag">ヒント' + (i + 1) + "</span><span>？？？</span></li>").join("");
      nextBtn.hidden = finished || shown >= q.hints.length;
      if (!hasChoices) ansBtn.hidden = finished;
    }

    box.appendChild(list);
    if (hasChoices) {
      const wrap = choiceButtons(q, (c, btn) => {
        if (finished) return;
        finished = true; s.done = true; s.ok = c.ok;
        const used = shown;
        finishChoices(wrap, q, btn);
        drawHints(true);
        const msg = c.ok
          ? (used === 1 ? "ヒント1つで正解！ すごい！" : "ヒント" + used + "つで正解！")
          : "ざんねん…";
        box.appendChild(resultBox(c.ok ? "good" : "bad", msg, q));
        updateScore();
      }, isShort(q));
      box.appendChild(actions);
      box.appendChild(wrap);
    } else {
      ansBtn.addEventListener("click", () => {
        finished = true; drawHints(true);
        box.appendChild(resultBox("info", "", q));
      });
      actions.appendChild(ansBtn);
      box.appendChild(actions);
    }
    drawHints();
  }

  function buildDobon(box, q) {
    const s = track();
    const wide = q.choices.some(c => [...plain(c.text)].length > 7);
    const grid = el("div", "dobon-grid" + (wide ? " wide" : ""));
    const status = el("p", "dobon-status");
    const actions = el("div", "quiz-actions");
    const retry = el("button", "btn btn-line", "もう一度");
    retry.type = "button";
    actions.appendChild(retry);
    let found, over, result;
    const target = q.choices.filter(c => c.ok).length;

    function setup() {
      found = 0; over = false;
      if (result) { result.remove(); result = null; }
      actions.hidden = true;
      grid.innerHTML = "";
      q.choices.forEach(c => {
        const b = el("button", "choice", '<span class="mark"></span>' + inline(c.text));
        b.type = "button";
        b.addEventListener("click", () => pick(c, b));
        grid.appendChild(b);
      });
      status.textContent = "あと " + target + " こ";
    }
    function end(win) {
      over = true;
      grid.querySelectorAll(".choice").forEach((b, i) => {
        b.disabled = true;
        const c = q.choices[i];
        if (c.ok && !b.classList.contains("correct")) b.classList.add("correct", "dim");
        if (!c.ok && !b.classList.contains("boom")) b.classList.add("dim");
      });
      if (!s.done) { s.done = true; s.ok = win; updateScore(); }
      result = resultBox(win ? "good" : "bad", win ? "クリア！ おみごと！" : "ドボン！", q);
      box.insertBefore(result, actions);
      actions.hidden = false;
    }
    function pick(c, b) {
      if (over || b.disabled) return;
      b.disabled = true;
      if (c.ok) {
        b.classList.add("correct");
        found++;
        status.textContent = found >= target ? "ぜんぶ見つけた！" : "あと " + (target - found) + " こ";
        if (found >= target) end(true);
      } else {
        b.classList.add("boom");
        status.textContent = "それはドボン！（" + found + " / " + target + " こ見つけた）";
        end(false);
      }
    }
    retry.addEventListener("click", setup);
    box.appendChild(grid);
    box.appendChild(status);
    box.appendChild(actions);
    setup();
  }

  function buildReveal(box, q) {
    const actions = el("div", "quiz-actions");
    const b = el("button", "btn btn-gacha", "答えを見る");
    b.type = "button";
    b.addEventListener("click", () => {
      b.hidden = true;
      box.appendChild(resultBox("info", "", q));
    });
    actions.appendChild(b);
    box.appendChild(actions);
  }

  function updateScore() {
    const box = $("#score");
    if (!scores.length) { box.innerHTML = ""; return; }
    const done = scores.filter(s => s.done).length;
    const ok = scores.filter(s => s.ok).length;
    box.innerHTML = '<div class="score-box">' +
      (done < scores.length
        ? "<div>この記事のクイズ</div><div class=\"big\">" + done + " / " + scores.length + "</div><p>問 チャレンジ中</p>"
        : "<div>この記事のクイズの結果</div><div class=\"big\">" + ok + " / " + scores.length + " 問 正解</div><p>" +
          (ok === scores.length ? "パーフェクト！ なるほど博士だ！" : ok >= scores.length / 2 ? "いいね！ 解説を読みなおすと、もっと覚えられるよ。" : "解説を読んで、もう一度ほかの記事にもチャレンジしよう！") + "</p>") +
      "</div>";
  }

  // ---------- 会話（研究所のメンバーはアイコン、ほかの人は頭文字） ----------
  const SPEAKER_COLORS = ["#1d2742", "#ff5a3c", "#12a37b", "#2f6fed", "#f08a24"];
  function buildTalk(src) {
    const wrap = el("div", "talk");
    const order = [];
    src.split("\n").forEach(line => {
      const t = line.trim();
      if (!t) return;
      const m = /^([^:：]{1,16})[:：]\s*(.+)$/.exec(t);
      if (!m) { wrap.appendChild(el("p", "talk-note", inline(t))); return; }
      const name = m[1].trim();
      if (!order.includes(name)) order.push(name);
      const i = order.indexOf(name);
      const say = el("div", "say" + (i === 0 ? "" : " right"));
      const initial = [...plain(name).replace(/[（(].*$/, "")][0] || "？";
      const avatar = charIcon(name) ||
        '<div class="avatar" style="background:' + SPEAKER_COLORS[i % SPEAKER_COLORS.length] + '">' + esc(initial) + "</div>";
      say.innerHTML = avatar +
        '<div class="bubble-wrap"><div class="name">' + ruby(name) + '</div><div class="bubble">' + inline(m[2]) + "</div></div>";
      wrap.appendChild(say);
    });
    return wrap;
  }

  // ---------- ことばメモ（語 | よみ | 意味 | English | 中文 | Tiếng Việt） ----------
  const LANGS = SITE.langs || [];
  function buildWords(src) {
    const box = el("div", "words");
    const rows = src.split("\n").map(l => l.trim()).filter(Boolean).map(l => l.split(/\s*[|｜]\s*/));
    const hasTr = rows.some(r => r.length > 3);
    box.innerHTML = '<div class="words-title"><span>📘 ことばメモ</span>' +
      (hasTr ? '<select class="words-lang" aria-label="ことばメモの翻訳"><option value="">日本語だけ</option>' +
        LANGS.map(l => '<option value="' + esc(l.key) + '">' + esc(l.name) + "</option>").join("") + "</select>" : "") +
      "</div><dl>" + rows.map(r => {
        const word = r[0], yomi = r.length >= 3 ? r[1] : "", mean = r.length >= 3 ? r[2] : (r[1] || "");
        const tr = LANGS.map((l, i) => r[3 + i] ? '<span class="tr" data-lang="' + esc(l.key) + '" lang="' + esc(l.key === "zh" ? "zh-Hans" : l.key) + '" hidden>' + esc(r[3 + i]) + "</span>" : "").join("");
        return '<div class="row"><dt>' + inline(word) + (yomi && yomi !== plain(word) ? "<small>" + esc(yomi) + "</small>" : "") + "</dt><dd>" + inline(mean) + tr + "</dd></div>";
      }).join("") + "</dl>";
    const sel = box.querySelector(".words-lang");
    if (sel) sel.addEventListener("change", () => { setPref("nr-lang", sel.value); applyLang(); });
    return box;
  }
  function applyLang() {
    const lang = getPref("nr-lang", "");
    document.querySelectorAll(".words-lang").forEach(s => { s.value = lang; });
    document.querySelectorAll(".words .tr").forEach(t => { t.hidden = t.dataset.lang !== lang; });
  }

  // ---------- なるほどポイント（ホドのまとめ） ----------
  function buildPoint(src) {
    const box = el("div", "point");
    box.innerHTML = '<span class="point-title">' + charIcon("ホド") + "なるほどポイント</span>" + block(src);
    return box;
  }

  // ---------- 使ってみよう（ポンのミッション） ----------
  function buildTry(src) {
    const box = el("div", "try");
    box.innerHTML = charIcon("ポン") + '<div><div class="try-title">使ってみよう！ ポンのミッション</div>' + block(src) + "</div>";
    return box;
  }

  // ---------- 次に読む ----------
  function renderNext() {
    let h = "";
    if (art.series) {
      const items = all.filter(a => a.series === art.series).sort((a, b) => a.seriesNo - b.seriesNo);
      const i = items.findIndex(a => a.id === art.id);
      const prev = items[i - 1], next = items[i + 1];
      if (prev || next) {
        h += '<h2 class="section-title">連載「' + ruby(art.series) + "」</h2><div class=\"pager\">" +
          (prev ? '<a href="' + articleUrl(prev) + '"><small>← 前の回 #' + esc(prev.seriesNo) + "</small>" + ruby(prev.title) + "</a>" : "") +
          (next ? '<a class="next" href="' + articleUrl(next) + '"><small>次の回 #' + esc(next.seriesNo) + " →</small>" + ruby(next.title) + "</a>" : "") +
          "</div>";
      }
    }
    const same = all.filter(a => a.id !== art.id && a.category === art.category);
    const others = all.filter(a => a.id !== art.id && a.category !== art.category);
    const pick = same.concat(others).slice(0, 3);
    if (pick.length) h += '<h2 class="section-title">こちらもおすすめ</h2><div class="grid">' + pick.map(cardHtml).join("") + "</div>";
    h += '<div class="gacha-box"><button class="btn btn-gacha" type="button" id="gacha">🎲 記事ガチャを回す</button></div>';
    $("#next").innerHTML = h;
    $("#gacha").addEventListener("click", () => gacha(art.id));
  }
})();
