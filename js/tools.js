/* 应援实用工具 · 纯前端（无后端 / 无数据库） */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const DOUYIN = {
    share: "https://v.douyin.com/3Ed4QuQJTBA/",
    id: "81183888747",
    name: "憨宝宝",
  };

  const SHARE_TEXT =
    "长按复制此条消息，打开抖音搜索，查看TA的更多作品。 " + DOUYIN.share;

  const COPY_TEMPLATES = [
    { tag: "评论", text: "今天也要元气满满呀～ 憨宝宝加油 ♡" },
    { tag: "评论", text: "十万粉快乐！每一份喜欢都值得被认真对待 ✦" },
    { tag: "评论", text: "第一次刷到就被治愈了，会一直在的。" },
    { tag: "祝福", text: "愿每一次打开，都能碰到一点温柔。" },
    { tag: "祝福", text: "憨家军在此报到，理性应援，真心最闪亮。" },
    { tag: "转发", text: "安利一个超级可爱的憨宝宝！抖音号 " + DOUYIN.id },
    { tag: "转发", text: "小宇宙扩列～ 一起来看 " + DOUYIN.name + " " + DOUYIN.share },
    { tag: "生日", text: "生日快乐！愿你被世界温柔以待，也被我们好好守护。" },
  ];

  const CHECKIN_KEY = "hanbaby_checkin_v1";

  function toast(msg) {
    const el = $("#toast");
    if (!el) {
      window.alert(msg);
      return;
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function copyText(text, okMsg) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        toast(okMsg || "已复制");
        return;
      }
    } catch {
      /* fallthrough */
    }
    window.prompt("请手动复制：", text);
  }

  function todayStr() {
    const d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function ymd(d) {
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0")
    );
  }

  function loadCheckins() {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveCheckins(list) {
    try {
      localStorage.setItem(CHECKIN_KEY, JSON.stringify(list));
    } catch {
      toast("无法保存打卡（浏览器限制）");
    }
  }

  function calcStreak(days) {
    const set = new Set(days);
    let streak = 0;
    const cur = new Date();
    // 若今日未打卡，从昨天开始算连续
    if (!set.has(ymd(cur))) {
      cur.setDate(cur.getDate() - 1);
    }
    while (set.has(ymd(cur))) {
      streak += 1;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  }

  function initQuickCopy() {
    $("#toolCopyLink")?.addEventListener("click", () =>
      copyText(DOUYIN.share, "主页链接已复制")
    );
    $("#toolCopyShare")?.addEventListener("click", () =>
      copyText(SHARE_TEXT, "分享文案已复制")
    );
    $("#toolCopyId")?.addEventListener("click", () =>
      copyText(DOUYIN.id, "抖音号已复制")
    );
  }

  function initCopyList() {
    const box = $("#copyList");
    if (!box) return;
    box.innerHTML = COPY_TEMPLATES.map(
      (item, i) => `
      <div class="copy-item">
        <span class="copy-tag">${item.tag}</span>
        <p class="copy-text">${item.text}</p>
        <button type="button" class="btn btn-sm" data-copy-i="${i}">复制</button>
      </div>`
    ).join("");
    box.querySelectorAll("[data-copy-i]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = COPY_TEMPLATES[Number(btn.getAttribute("data-copy-i"))];
        if (item) copyText(item.text, "文案已复制，去抖音粘贴吧");
      });
    });
  }

  /* ---------- Poster (Canvas) ---------- */
  const THEMES = {
    pink: {
      bg0: "#fff5f9",
      bg1: "#ffe0ee",
      bg2: "#f0e6ff",
      accent: "#ff7eb3",
      text: "#2a2430",
      muted: "#8e8792",
    },
    purple: {
      bg0: "#f7f2ff",
      bg1: "#e8deff",
      bg2: "#ffe8f5",
      accent: "#a98ae8",
      text: "#2a2430",
      muted: "#8e8792",
    },
    cream: {
      bg0: "#fffdf8",
      bg1: "#fff0d6",
      bg2: "#ffe8f1",
      accent: "#e8a317",
      text: "#2a2430",
      muted: "#8e8792",
    },
  };

  let avatarImg = null;

  function loadAvatar() {
    return new Promise((resolve) => {
      if (avatarImg) {
        resolve(avatarImg);
        return;
      }
      const img = new Image();
      img.onload = () => {
        avatarImg = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = "assets/douyin/avatar.jpg";
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  async function renderPoster() {
    const canvas = $("#posterCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const theme = THEMES[$("#posterTheme")?.value || "pink"] || THEMES.pink;
    const name = ($("#posterName")?.value || "憨家军").trim().slice(0, 12);
    const msg = ($("#posterMsg")?.value || "十万份喜欢").trim().slice(0, 40);
    const W = canvas.width;
    const H = canvas.height;

    // background
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, theme.bg0);
    g.addColorStop(0.5, theme.bg1);
    g.addColorStop(1, theme.bg2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // soft orbs
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.beginPath();
    ctx.arc(W * 0.2, H * 0.15, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.85, H * 0.35, 160, 0, Math.PI * 2);
    ctx.fill();

    // card
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    roundRect(ctx, 48, 80, W - 96, H - 180, 36);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,183,213,0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // title
    ctx.fillStyle = theme.accent;
    ctx.font = "600 28px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("HanBaby Fan Universe", W / 2, 140);

    ctx.fillStyle = theme.text;
    ctx.font = "400 48px 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif";
    ctx.fillText("憨宝宝的小宇宙", W / 2, 210);

    // avatar
    const av = await loadAvatar();
    const ax = W / 2;
    const ay = 380;
    const ar = 110;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax, ay, ar + 8, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(ax, ay, ar, 0, Math.PI * 2);
    ctx.clip();
    if (av) {
      // cover circle
      const s = Math.min(av.width, av.height);
      const sx = (av.width - s) / 2;
      const sy = (av.height - s) / 2;
      ctx.drawImage(av, sx, sy, s, s, ax - ar, ay - ar, ar * 2, ar * 2);
    } else {
      ctx.fillStyle = theme.bg1;
      ctx.fillRect(ax - ar, ay - ar, ar * 2, ar * 2);
    }
    ctx.restore();

    ctx.fillStyle = theme.text;
    ctx.font = "600 40px 'ZCOOL KuaiLe', 'Noto Sans SC', sans-serif";
    ctx.fillText(DOUYIN.name, W / 2, 540);

    ctx.fillStyle = theme.muted;
    ctx.font = "500 24px 'Noto Sans SC', sans-serif";
    ctx.fillText("抖音号 " + DOUYIN.id, W / 2, 580);

    // message bubble
    ctx.fillStyle = "rgba(255,232,241,0.85)";
    roundRect(ctx, 90, 620, W - 180, 120, 20);
    ctx.fill();
    ctx.fillStyle = theme.text;
    ctx.font = "500 28px 'Noto Sans SC', sans-serif";
    wrapText(ctx, "「" + msg + "」", W / 2, 670, W - 220, 36);

    ctx.fillStyle = theme.accent;
    ctx.font = "600 26px 'Noto Sans SC', sans-serif";
    ctx.fillText("— " + name, W / 2, 800);

    ctx.fillStyle = theme.muted;
    ctx.font = "400 20px 'Noto Sans SC', sans-serif";
    ctx.fillText("十万份喜欢，汇成一颗只为她闪耀的星 ✦", W / 2, 860);

    ctx.fillStyle = "rgba(142,135,146,0.85)";
    ctx.font = "400 18px 'Noto Sans SC', sans-serif";
    ctx.fillText("粉丝自发应援 · 理性表达喜欢", W / 2, 920);
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split("");
    let line = "";
    let yy = y;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, yy);
        line = chars[i];
        yy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, yy);
  }

  function downloadPoster() {
    const canvas = $("#posterCanvas");
    if (!canvas) return;
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          // fallback
          const a = document.createElement("a");
          a.href = canvas.toDataURL("image/png");
          a.download = "hanbaby-poster.png";
          a.click();
          toast("海报已开始下载");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "hanbaby-poster.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        toast("海报已开始下载");
      }, "image/png");
    } catch {
      toast("下载失败，请换浏览器试试");
    }
  }

  function initPoster() {
    if (!$("#posterCanvas")) return;
    $("#posterRender")?.addEventListener("click", async () => {
      await renderPoster();
      toast("预览已更新");
    });
    $("#posterDownload")?.addEventListener("click", async () => {
      await renderPoster();
      downloadPoster();
    });
    // first paint
    renderPoster();
  }

  /* ---------- Check-in ---------- */
  function renderCheckin() {
    const days = loadCheckins();
    const set = new Set(days);
    const today = todayStr();
    const todayEl = $("#checkinToday");
    const streakEl = $("#checkinStreak");
    const totalEl = $("#checkinTotal");
    const btn = $("#checkinBtn");
    const cal = $("#checkinCal");

    if (todayEl) todayEl.textContent = set.has(today) ? "已打卡 ♡" : "未打卡";
    if (streakEl) streakEl.textContent = calcStreak(days) + " 天";
    if (totalEl) totalEl.textContent = days.length + " 天";
    if (btn) {
      btn.disabled = set.has(today);
      btn.textContent = set.has(today) ? "今日已打卡" : "今日打卡 ♡";
      btn.classList.toggle("done", set.has(today));
    }

    if (!cal) return;
    const cells = [];
    const cur = new Date();
    cur.setHours(12, 0, 0, 0);
    for (let i = 27; i >= 0; i--) {
      const d = new Date(cur);
      d.setDate(cur.getDate() - i);
      const key = ymd(d);
      const on = set.has(key);
      const isToday = key === today;
      cells.push(
        `<span class="checkin-day${on ? " on" : ""}${isToday ? " is-today" : ""}" title="${key}">${d.getDate()}</span>`
      );
    }
    cal.innerHTML = cells.join("");
  }

  function initCheckin() {
    $("#checkinBtn")?.addEventListener("click", () => {
      const days = loadCheckins();
      const t = todayStr();
      if (days.includes(t)) {
        toast("今天已经打过卡啦");
        return;
      }
      days.push(t);
      days.sort();
      saveCheckins(days);
      renderCheckin();
      toast("打卡成功 · 连续 " + calcStreak(days) + " 天");
      // 同步应援任务里的「每日签到」（同日本机）
      try {
        const key = "hanbaby_tasks_v1";
        const all = JSON.parse(localStorage.getItem(key) || "{}");
        const day = t;
        if (!all[day]) all[day] = {};
        all[day].checkin = true;
        localStorage.setItem(key, JSON.stringify(all));
        const item = document.querySelector('.task-item[data-task="checkin"]');
        if (item) {
          item.classList.add("done");
          const b = item.querySelector("[data-complete]");
          if (b) b.textContent = "已完成";
        }
      } catch {
        /* ignore */
      }
    });
    renderCheckin();
  }

  /* ---------- Quick download ---------- */
  async function quickDownload(path) {
    const name = path.split("/").pop() || "hanbaby.png";
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error("fail");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast("开始下载：" + name);
    } catch {
      window.open(path, "_blank", "noopener,noreferrer");
      toast("已打开文件，可长按/右键保存");
    }
  }

  function initQuickDl() {
    $$("[data-quick-dl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const path = btn.getAttribute("data-quick-dl");
        if (path) quickDownload(path);
      });
    });
  }

  function boot() {
    if (!$("#tools")) return;
    initQuickCopy();
    initCopyList();
    initPoster();
    initCheckin();
    initQuickDl();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
