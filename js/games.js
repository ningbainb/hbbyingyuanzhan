/* 小宇宙游戏屋 · 纯前端三款小游戏 */
(function () {
  "use strict";

  const BEST_KEY = "hanbaby_game_best_v1";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const state = {
    game: "catch",
    running: false,
    score: 0,
    timer: null,
    left: 0,
    raf: 0,
    memory: null,
    tapBound: null,
  };

  function loadBest() {
    try {
      return JSON.parse(localStorage.getItem(BEST_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveBest(game, score) {
    const all = loadBest();
    if (!all[game] || score > all[game]) {
      all[game] = score;
      try {
        localStorage.setItem(BEST_KEY, JSON.stringify(all));
      } catch {
        /* ignore */
      }
      return true;
    }
    return false;
  }

  function bestOf(game) {
    return loadBest()[game] || 0;
  }

  function setHud(score, timeText) {
    const s = $("#gameScore");
    const t = $("#gameTime");
    const b = $("#gameBest");
    if (s) s.textContent = String(score);
    if (t) t.textContent = timeText == null ? "—" : String(timeText);
    if (b) b.textContent = String(bestOf(state.game));
  }

  function setTip(text) {
    const el = $("#gameTip");
    if (el) el.textContent = text;
  }

  function setResult(text, show) {
    const el = $("#gameResult");
    if (!el) return;
    if (!show) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = text;
  }

  function stopLoops() {
    state.running = false;
    if (state.timer) {
      clearInterval(state.timer);
      state.timer = null;
    }
    if (state.raf) {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
    const stage = $("#gameStage");
    if (stage && state.tapBound) {
      stage.removeEventListener("pointerdown", state.tapBound);
      state.tapBound = null;
    }
  }

  function finish(msg) {
    stopLoops();
    const isNew = saveBest(state.game, state.score);
    setHud(state.score, 0);
    setResult(
      (msg || `本局得分 ${state.score}`) + (isNew ? " · 新纪录！" : ""),
      true
    );
    const btn = $("#gameStartBtn");
    if (btn) btn.textContent = "再玩一次";
    // 轻量反馈
    try {
      window.dispatchEvent(
        new CustomEvent("hanbaby-game-end", {
          detail: { game: state.game, score: state.score, isNew },
        })
      );
    } catch {
      /* ignore */
    }
  }

  /* ---------- 接爱心 ---------- */
  function setupCatchIdle() {
    const stage = $("#gameStage");
    if (!stage) return;
    stage.className = "game-stage mode-catch";
    stage.innerHTML = `
      <div class="game-idle">
        <div class="game-idle-icons" aria-hidden="true">♡ ✦ ♡ ☆ ♡</div>
        <p>20 秒内点掉粉色爱心得分<br />点到紫色星星会扣分</p>
      </div>`;
    setTip("点开始，接住下落的爱心 ♡（点到星星 ✦ 会扣分哦）");
    setHud(0, 20);
    setResult("", false);
  }

  function startCatch() {
    const stage = $("#gameStage");
    if (!stage) return;
    stopLoops();
    state.running = true;
    state.score = 0;
    state.left = 20;
    setHud(0, 20);
    setResult("", false);
    setTip("快接住爱心！");
    stage.className = "game-stage mode-catch is-playing";
    stage.innerHTML = "";

    const spawn = () => {
      if (!state.running) return;
      const el = document.createElement("button");
      el.type = "button";
      el.className = "fall-item";
      const bad = Math.random() < 0.22;
      el.classList.add(bad ? "is-star" : "is-heart");
      el.textContent = bad ? "✦" : "♡";
      el.style.left = 8 + Math.random() * 84 + "%";
      el.style.animationDuration = 1.6 + Math.random() * 1.4 + "s";
      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (!state.running) return;
        if (bad) {
          state.score = Math.max(0, state.score - 2);
          el.classList.add("pop-bad");
        } else {
          state.score += 1;
          el.classList.add("pop-good");
        }
        setHud(state.score, state.left);
        setTimeout(() => el.remove(), 180);
      });
      el.addEventListener("animationend", () => el.remove());
      stage.appendChild(el);
    };

    state.timer = setInterval(() => {
      state.left -= 1;
      setHud(state.score, state.left);
      if (state.left <= 0) {
        finish(`接爱心结束 · 得分 ${state.score}`);
        stage.querySelectorAll(".fall-item").forEach((n) => n.remove());
        return;
      }
      spawn();
      if (Math.random() > 0.45) spawn();
    }, 1000);

    spawn();
    spawn();
  }

  /* ---------- 翻牌配对 ---------- */
  const MEMORY_ICONS = ["♡", "✦", "☆", "🌸", "🎀", "★"];

  function setupMemoryIdle() {
    const stage = $("#gameStage");
    if (!stage) return;
    stage.className = "game-stage mode-memory";
    stage.innerHTML = `
      <div class="game-idle">
        <div class="game-idle-icons" aria-hidden="true">♡ ✦ ☆ 🌸 🎀 ★</div>
        <p>翻开两张相同图案即可配对<br />步数越少越好（得分 = 剩余步数奖励）</p>
      </div>`;
    setTip("点开始进入翻牌配对，找出全部 6 对");
    setHud(0, "—");
    setResult("", false);
  }

  function startMemory() {
    const stage = $("#gameStage");
    if (!stage) return;
    stopLoops();
    state.running = true;
    state.score = 0;
    setResult("", false);
    setTip("翻两张，图案相同就配对成功");

    const deck = [...MEMORY_ICONS, ...MEMORY_ICONS]
      .map((icon, i) => ({ icon, id: i, key: icon + "-" + Math.random() }))
      .sort(() => Math.random() - 0.5);

    let moves = 0;
    let matched = 0;
    let lock = false;
    let first = null;

    stage.className = "game-stage mode-memory is-playing";
    stage.innerHTML = `<div class="memory-grid" id="memoryGrid"></div>`;
    const grid = $("#memoryGrid");

    deck.forEach((card, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "memory-card";
      btn.dataset.icon = card.icon;
      btn.dataset.idx = String(idx);
      btn.innerHTML = `<span class="memory-back">?</span><span class="memory-face">${card.icon}</span>`;
      btn.addEventListener("click", () => {
        if (!state.running || lock || btn.classList.contains("matched") || btn.classList.contains("open")) {
          return;
        }
        btn.classList.add("open");
        if (!first) {
          first = btn;
          return;
        }
        moves += 1;
        lock = true;
        if (first.dataset.icon === btn.dataset.icon) {
          first.classList.add("matched");
          btn.classList.add("matched");
          matched += 1;
          state.score = matched * 10 + Math.max(0, 40 - moves);
          setHud(state.score, moves + " 步");
          first = null;
          lock = false;
          if (matched >= MEMORY_ICONS.length) {
            state.score = matched * 10 + Math.max(0, 50 - moves) * 2;
            setHud(state.score, moves + " 步");
            finish(`全部配对！用了 ${moves} 步 · 得分 ${state.score}`);
          }
        } else {
          const a = first;
          const b = btn;
          setTimeout(() => {
            a.classList.remove("open");
            b.classList.remove("open");
            first = null;
            lock = false;
          }, 520);
          setHud(state.score, moves + " 步");
        }
      });
      grid.appendChild(btn);
    });

    setHud(0, "0 步");
  }

  /* ---------- 疯狂比心 ---------- */
  function setupTapIdle() {
    const stage = $("#gameStage");
    if (!stage) return;
    stage.className = "game-stage mode-tap";
    stage.innerHTML = `
      <div class="game-idle">
        <div class="tap-heart-preview" aria-hidden="true">♡</div>
        <p>10 秒内狂点大爱心<br />看你能比多少次心</p>
      </div>`;
    setTip("点开始后，对着大爱心连点！");
    setHud(0, 10);
    setResult("", false);
  }

  function startTap() {
    const stage = $("#gameStage");
    if (!stage) return;
    stopLoops();
    state.running = true;
    state.score = 0;
    state.left = 10;
    setHud(0, 10);
    setResult("", false);
    setTip("快比心！连点大爱心 ♡");
    stage.className = "game-stage mode-tap is-playing";
    stage.innerHTML = `
      <button type="button" class="tap-target" id="tapTarget" aria-label="比心">
        <span class="tap-target-heart">♡</span>
        <span class="tap-target-count" id="tapCount">0</span>
      </button>`;

    const target = $("#tapTarget");
    const countEl = $("#tapCount");

    const onTap = (e) => {
      if (!state.running) return;
      e.preventDefault();
      state.score += 1;
      if (countEl) countEl.textContent = String(state.score);
      setHud(state.score, state.left);
      target.classList.remove("bump");
      // reflow
      void target.offsetWidth;
      target.classList.add("bump");
      // floating +1
      const plus = document.createElement("span");
      plus.className = "tap-plus";
      plus.textContent = "+1";
      plus.style.left = 40 + Math.random() * 20 + "%";
      plus.style.top = 30 + Math.random() * 20 + "%";
      stage.appendChild(plus);
      setTimeout(() => plus.remove(), 500);
    };

    target.addEventListener("pointerdown", onTap);

    state.timer = setInterval(() => {
      state.left -= 1;
      setHud(state.score, state.left);
      if (state.left <= 0) {
        finish(`疯狂比心结束 · 连点 ${state.score} 次`);
      }
    }, 1000);
  }

  const TIPS = {
    catch: "点开始，接住下落的爱心 ♡（点到星星 ✦ 会扣分哦）",
    memory: "点开始进入翻牌配对，找出全部 6 对",
    tap: "点开始后，对着大爱心连点！",
  };

  function showIdle() {
    stopLoops();
    state.score = 0;
    setHud(0, state.game === "memory" ? "—" : state.game === "tap" ? 10 : 20);
    setResult("", false);
    setTip(TIPS[state.game] || "");
    if (state.game === "catch") setupCatchIdle();
    else if (state.game === "memory") setupMemoryIdle();
    else setupTapIdle();
    const btn = $("#gameStartBtn");
    if (btn) btn.textContent = "开始游戏";
  }

  function startCurrent() {
    if (state.game === "catch") startCatch();
    else if (state.game === "memory") startMemory();
    else startTap();
  }

  function initGames() {
    if (!$("#gameStage")) return;

    $$(".game-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        $$(".game-tab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        state.game = tab.dataset.game || "catch";
        showIdle();
      });
    });

    $("#gameStartBtn")?.addEventListener("click", () => startCurrent());
    $("#gameResetBtn")?.addEventListener("click", () => showIdle());

    showIdle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGames);
  } else {
    initGames();
  }
})();
