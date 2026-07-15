/* 憨宝宝的小宇宙 · 纯静态前端交互（GitHub Pages 兼容）
 * 无后端：任务/积分/祝福仅保存在当前浏览器 localStorage，不跨设备、不共享给他人。
 */
(function () {
  "use strict";

  const STORAGE = {
    tasks: "hanbaby_tasks_v1",
    points: "hanbaby_points_v1",
    joined: "hanbaby_joined_v1",
    bless: "hanbaby_bless_count_v1",
  };

  /** 是否可用本地存储（隐私模式 / 禁用时降级） */
  let storageOk = true;
  try {
    const k = "__hanbaby_probe__";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
  } catch {
    storageOk = false;
  }

  /** 内存降级存储（localStorage 不可用时） */
  const memStore = {};

  /* 代表作品清单（精选标题 + 跳转抖音主页；单条视频链因平台限制用主页入口） */
  const DOUYIN_HOME = "https://v.douyin.com/3Ed4QuQJTBA/";
  const WORKS = [
    {
      id: 1,
      title: "那个眼神一抬 · 破圈初印象",
      desc: "很多人说：刷到的第一条，就记住了憨宝宝。",
      cover: "assets/emoji_1.png",
      likes: "高赞",
      cat: "hot",
      tag: "最高点赞",
      url: DOUYIN_HOME,
    },
    {
      id: 2,
      title: "✌︎ 今日份可爱已送达",
      desc: "签名同款元气脸，日常里藏着小星星。",
      cover: "assets/emoji_2.png",
      likes: "日常",
      cat: "daily",
      tag: "日常分享",
      url: DOUYIN_HOME,
    },
    {
      id: 3,
      title: "Hi · 眨眼比耶瞬间",
      desc: "甜酷切换自如，屏幕前会心一笑。",
      cover: "assets/emoji_3.png",
      likes: "颜值",
      cat: "look",
      tag: "颜值高光",
      url: DOUYIN_HOME,
    },
    {
      id: 4,
      title: "比心特辑 · 粉丝最爱",
      desc: "比心、眨眼，都是留给憨家军的小惊喜。",
      cover: "assets/hero_4.png",
      likes: "热门",
      cat: "hot",
      tag: "粉丝最爱",
      url: DOUYIN_HOME,
    },
    {
      id: 5,
      title: "十万粉丝 · 谢谢遇见",
      desc: "从第一个关注到十万份喜欢，故事还在继续。",
      cover: "assets/hero_6.png",
      likes: "纪念",
      cat: "grow",
      tag: "成长记录",
      url: DOUYIN_HOME,
    },
    {
      id: 6,
      title: "粉色蝴蝶结 · 手绘感造型日",
      desc: "校服感、蝴蝶结，粉紫氛围拉满。",
      cover: "assets/hero_7.png",
      likes: "造型",
      cat: "look",
      tag: "颜值高光",
      url: DOUYIN_HOME,
    },
    {
      id: 7,
      title: "奶茶在手 · 生活碎片",
      desc: "出门、发呆、喝一口，都是陪伴。",
      cover: "assets/emoji_9.png",
      likes: "日常",
      cat: "daily",
      tag: "日常分享",
      url: DOUYIN_HOME,
    },
    {
      id: 8,
      title: "水手服高光 · 漫画感出场",
      desc: "镜头前的她，像从插画里走出来。",
      cover: "assets/emoji_8.png",
      likes: "高光",
      cat: "look",
      tag: "颜值高光",
      url: DOUYIN_HOME,
    },
    {
      id: 9,
      title: "侧颜发呆 · 安静的可爱",
      desc: "不说话的时候，也很好看。",
      cover: "assets/emoji_7.png",
      likes: "氛围",
      cat: "daily",
      tag: "日常分享",
      url: DOUYIN_HOME,
    },
    {
      id: 10,
      title: "挥手问候 · 欢迎来到小宇宙",
      desc: "新朋友？先看她的主页，再回来应援。",
      cover: "assets/hero_2.png",
      likes: "欢迎",
      cat: "grow",
      tag: "成长记录",
      url: DOUYIN_HOME,
    },
    {
      id: 11,
      title: "贝雷帽主视觉 · 今日份收藏",
      desc: "站内主视觉同源氛围，去抖音看动态版。",
      cover: "assets/hero_1.png",
      likes: "镇站",
      cat: "hot",
      tag: "最高点赞",
      url: DOUYIN_HOME,
    },
    {
      id: 12,
      title: "托腮发呆 · 温柔停顿",
      desc: "慢一点也没关系，我们一直在。",
      cover: "assets/hero_5.png",
      likes: "温柔",
      cat: "look",
      tag: "颜值高光",
      url: DOUYIN_HOME,
    },
  ];

  const TIMELINE = [
    {
      date: "起点",
      title: "发布第一个作品",
      story: "小宇宙的第一颗星，从此开始闪烁。",
      img: "assets/emoji_1.png",
    },
    {
      date: "里程碑",
      title: "首次突破 1 万粉丝",
      story: "原来认真生活，会被看见。",
      img: "assets/emoji_2.png",
    },
    {
      date: "高光",
      title: "首条 10 万点赞作品",
      story: "那条视频，让更多人记住了憨宝宝。",
      img: "assets/emoji_3.png",
      highlight: true,
    },
    {
      date: "连接",
      title: "首次直播 · 粉丝群成立",
      story: "从单向关注，变成双向陪伴。",
      img: "assets/emoji_7.png",
    },
    {
      date: "跃升",
      title: "突破 5 万粉丝",
      story: "憨家军队伍越来越热闹了。",
      img: "assets/emoji_9.png",
    },
    {
      date: "纪念",
      title: "突破 10 万粉丝",
      story: "十万份喜欢，汇成一颗只为她闪耀的星。",
      img: "assets/hero_1.png",
      highlight: true,
    },
    {
      date: "期待",
      title: "第一次生日应援 & 下一站",
      story: "故事未完，我们继续走下去。",
      img: "assets/emoji_8.png",
      highlight: true,
    },
  ];

  const RANKS = [
    { name: "星河小糖", score: 9860, badge: "星河陪伴官", avatar: "assets/emoji_1.png" },
    { name: "粉紫日记", score: 8720, badge: "紫色守护者", avatar: "assets/emoji_2.png" },
    { name: "憨家小北", score: 8010, badge: "憨家军成员", avatar: "assets/emoji_3.png" },
    { name: "晚风与星", score: 7450, badge: "陪伴小爱心", avatar: "assets/emoji_7.png" },
    { name: "奶油蝴蝶结", score: 6980, badge: "初见小星星", avatar: "assets/emoji_9.png" },
  ];

  const ASSETS = [
    {
      title: "官方主视觉插画",
      meta: "PNG · 竖版 · 头像/海报",
      img: "assets/hero_1.png",
      file: "assets/hero_1.png",
    },
    {
      title: "挥手欢迎图",
      meta: "PNG · 横版 · 横幅/封面",
      img: "assets/hero_2.png",
      file: "assets/hero_2.png",
    },
    {
      title: "比心高清立绘",
      meta: "PNG · 正方形 · 群头像",
      img: "assets/hero_4.png",
      file: "assets/hero_4.png",
    },
    {
      title: "表情包套装预览",
      meta: "PNG · 9 张 · 聊天应援",
      img: "assets/emoji_2.png",
      file: "assets/emoji_2.png",
    },
    {
      title: "手机壁纸素材",
      meta: "PNG · 竖屏 · 壁纸",
      img: "assets/hero_5.png",
      file: "assets/hero_5.png",
    },
    {
      title: "甜美特写",
      meta: "PNG · 高清 · 灯牌/二创",
      img: "assets/emoji_9.png",
      file: "assets/emoji_9.png",
    },
  ];

  const THANKS_LINES = [
    "小星星已经飞向憨宝宝啦～",
    "今日份可爱，已成功投递！",
    "感谢你的陪伴，小宇宙又亮了一点点。",
    "你的喜欢，是她继续前进的光。",
    "理性应援，真心最闪亮 ✦",
  ];

  /* 抖音公开主页快照（scripts/fetch_douyin.py 可更新 data/profile.json） */
  const DOUYIN_PROFILE = {
    nickname: "憨宝宝",
    unique_id: "81183888747",
    sec_uid: "MS4wLjABAAAAIsFqgUpChGGpVYpp_aut0UQQeA7NYypEUM703AhiCZc",
    followers: 100000,
    total_favorited: 1520825,
    aweme_count: 80,
    following_count: 60,
    signature: "✌︎ ॑꒳ ॑✌︎\n姐姐:@打小胆小 \n妹妹:@稳稳的\n扣皮:@小土豆子...",
    share_url: "https://v.douyin.com/3Ed4QuQJTBA/",
    profile_url:
      "https://www.douyin.com/user/MS4wLjABAAAAIsFqgUpChGGpVYpp_aut0UQQeA7NYypEUM703AhiCZc",
  };

  const SHARE_CLIP =
    "长按复制此条消息，打开抖音搜索，查看TA的更多作品。 " + DOUYIN_PROFILE.share_url;

  /* ---------- Utils ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function storageGet(key) {
    try {
      if (storageOk) return localStorage.getItem(key);
    } catch {
      /* ignore */
    }
    return Object.prototype.hasOwnProperty.call(memStore, key) ? memStore[key] : null;
  }

  function storageSet(key, value) {
    try {
      if (storageOk) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch {
      storageOk = false;
    }
    memStore[key] = value;
    return false;
  }

  function loadJSON(key, fallback) {
    try {
      const raw = storageGet(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    storageSet(key, JSON.stringify(value));
  }

  function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function formatNum(n) {
    return Number(n).toLocaleString("zh-CN");
  }

  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function assetUrl(path) {
    // 相对路径，兼容 GitHub Pages 子路径仓库
    try {
      return new URL(path, window.location.href).href;
    } catch {
      return path;
    }
  }

  async function downloadAsset(path, filename) {
    const name = filename || path.split("/").pop() || "hanbaby-asset.png";
    try {
      const res = await fetch(assetUrl(path));
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast("开始下载：" + name);
      return;
    } catch {
      // 降级：新标签打开图片，用户可长按/右键保存
      window.open(assetUrl(path), "_blank", "noopener,noreferrer");
      toast("已打开素材，可右键/长按保存图片");
    }
  }

  async function shareSite() {
    const shareData = {
      title: "憨宝宝的小宇宙",
      text: "十万份喜欢，汇成一颗只为憨宝宝闪耀的星。",
      url: window.location.href.split("#")[0],
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return true;
      }
    } catch (err) {
      if (err && err.name === "AbortError") return false;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareData.url);
        toast("链接已复制，去发给朋友吧～");
        return true;
      }
    } catch {
      /* ignore */
    }
    // 最终降级：选中提示
    window.prompt("复制此链接分享给朋友：", shareData.url);
    return true;
  }

  function openModal(text) {
    const modal = $("#thanksModal");
    const p = $("#modalText");
    if (p) p.textContent = text || THANKS_LINES[Math.floor(Math.random() * THANKS_LINES.length)];
    if (modal) modal.hidden = false;
  }

  function closeModal() {
    const modal = $("#thanksModal");
    if (modal) modal.hidden = true;
  }

  /* ---------- Floating particles ---------- */
  function initFloatLayer() {
    const layer = $("#floatLayer");
    if (!layer) return;
    const chars = ["♡", "✦", "☆", "·", "✧"];
    for (let i = 0; i < 18; i++) {
      const s = document.createElement("span");
      s.className = "float-particle";
      s.textContent = chars[i % chars.length];
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDuration = 4 + Math.random() * 6 + "s";
      s.style.animationDelay = Math.random() * 3 + "s";
      s.style.fontSize = 10 + Math.random() * 14 + "px";
      s.style.color = i % 2 ? "#FFB7D5" : "#CBB8FF";
      layer.appendChild(s);
    }
  }

  /* ---------- Count up ---------- */
  function animateCount(el) {
    const target = Number(el.dataset.count || 0);
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(target * eased);
      el.textContent = formatNum(val) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = formatNum(target) + suffix;
    }
    requestAnimationFrame(frame);
  }

  function initStatsObserver() {
    const nums = $$(".stat-num");
    if (!nums.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animateCount(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    nums.forEach((n) => io.observe(n));
  }

  /* ---------- Works ---------- */
  function workHref(w) {
    return w.url || DOUYIN_HOME || DOUYIN_PROFILE.share_url;
  }

  function renderWorks(filter = "all") {
    const grid = $("#worksGrid");
    if (!grid) return;
    const list = filter === "all" ? WORKS : WORKS.filter((w) => w.cat === filter);
    if (!list.length) {
      grid.innerHTML = `<p class="empty-hint">这一类暂时还没有收录，去抖音主页看看更多吧～</p>`;
      return;
    }
    grid.innerHTML = list
      .map(
        (w) => `
      <a class="work-card reveal" data-cat="${w.cat}" href="${workHref(w)}" target="_blank" rel="noopener noreferrer" aria-label="在抖音查看：${escapeHtml(w.title)}">
        <div class="work-cover">
          <img src="${w.cover}" alt="${escapeHtml(w.title)}" loading="lazy" />
          <span class="work-badge">${escapeHtml(w.tag)}</span>
          <span class="work-likes">♡ ${escapeHtml(w.likes)}</span>
          <span class="work-play" aria-hidden="true">▶ 抖音</span>
        </div>
        <div class="work-body">
          <h3>${escapeHtml(w.title)}</h3>
          <p>${escapeHtml(w.desc)}</p>
          <span class="work-cta">去抖音看 TA →</span>
        </div>
      </a>`
      )
      .join("");
    observeReveals(grid);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initWorkFilters() {
    $$(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderWorks(btn.dataset.filter || "all");
      });
    });
  }

  /* ---------- Timeline ---------- */
  function renderTimeline() {
    const track = $("#timelineTrack");
    if (!track) return;
    track.innerHTML = TIMELINE.map(
      (t) => `
      <article class="tl-item ${t.highlight ? "highlight" : ""}">
        <div class="tl-card">
          <p class="tl-date">${t.date}</p>
          <h3>${t.title}</h3>
          <p>${t.story}</p>
          <img class="tl-thumb" src="${t.img}" alt="" loading="lazy" />
        </div>
      </article>`
    ).join("");

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    $$(".tl-item", track).forEach((el) => io.observe(el));
  }

  /* ---------- Rank ---------- */
  function renderRank() {
    const list = $("#rankList");
    if (!list) return;
    list.innerHTML = RANKS.map(
      (r, i) => `
      <li class="rank-item ${i < 3 ? "top" : ""}">
        <span class="rank-num">${i + 1}</span>
        <img class="rank-avatar" src="${r.avatar}" alt="" loading="lazy" />
        <div>
          <div class="name">${r.name}</div>
          <div class="badge">${r.badge}</div>
        </div>
        <span class="score">${formatNum(r.score)} ♡</span>
      </li>`
    ).join("");
  }

  /* ---------- Assets ---------- */
  function renderAssets() {
    const grid = $("#assetGrid");
    if (!grid) return;
    grid.innerHTML = ASSETS.map(
      (a, i) => `
      <article class="asset-card reveal">
        <div class="asset-preview">
          <img src="${a.img}" alt="${a.title}" loading="lazy" />
        </div>
        <h3>${a.title}</h3>
        <p class="meta">${a.meta}</p>
        <button type="button" class="btn btn-sm" data-dl="${i}">下载素材</button>
      </article>`
    ).join("");
    grid.querySelectorAll("[data-dl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const a = ASSETS[Number(btn.getAttribute("data-dl"))];
        if (!a) return;
        const name = (a.file || a.img).split("/").pop();
        downloadAsset(a.file || a.img, name);
      });
    });
    observeReveals(grid);
  }

  /* ---------- Tasks & Points ---------- */
  function getPoints() {
    return loadJSON(STORAGE.points, { heart: 0, support: 0 });
  }

  function setPoints(p) {
    saveJSON(STORAGE.points, p);
    const h = $("#heartPoints");
    const s = $("#supportPoints");
    if (h) h.textContent = p.heart;
    if (s) s.textContent = p.support;
  }

  function addPoints(heart, support) {
    const p = getPoints();
    p.heart += heart;
    p.support += support;
    setPoints(p);
  }

  function getTasksState() {
    const all = loadJSON(STORAGE.tasks, {});
    const day = todayKey();
    if (!all[day]) all[day] = {};
    return { all, day, done: all[day] };
  }

  function initTasks() {
    setPoints(getPoints());
    const { all, day, done } = getTasksState();
    const items = $$(".task-item");

    function refreshDoneCount() {
      const n = Object.keys(done).filter((k) => done[k]).length;
      const el = $("#taskDone");
      if (el) el.textContent = `${n}/5`;
    }

    items.forEach((item) => {
      const key = item.dataset.task;
      const btn = $("[data-complete]", item);
      if (done[key]) {
        item.classList.add("done");
        if (btn) btn.textContent = "已完成";
      }
      if (!btn) return;
      btn.addEventListener("click", async () => {
        if (done[key]) return;

        // 分享任务：先尝试真正分享/复制链接（纯静态可实现）
        if (key === "share") {
          const ok = await shareSite();
          if (!ok) {
            toast("取消分享也可以明天再来～");
            return;
          }
        }

        if (key === "watch") {
          openModal(
            "已尝试打开抖音主页。看完回来点完成即可～ 抖音号 81183888747 / 短链已配置。"
          );
        }

        done[key] = true;
        all[day] = done;
        saveJSON(STORAGE.tasks, all);
        item.classList.add("done");
        btn.textContent = "已完成";
        addPoints(8, 15);
        refreshDoneCount();
        if (key !== "watch") {
          openModal(THANKS_LINES[Math.floor(Math.random() * THANKS_LINES.length)]);
        }
        toast("任务完成，爱心值 +8（本机记录）");
      });
    });
    refreshDoneCount();
  }

  /* ---------- Campaign bless ---------- */
  function initCampaign() {
    const base = 8260;
    let bless = Number(storageGet(STORAGE.bless) || base);
    if (!Number.isFinite(bless) || bless < base) bless = base;
    const target = 10000;
    const pctEl = $("#progressPct");
    const fill = $("#progressFill");
    const countEl = $("#blessCount");
    const bar = $(".progress-bar");
    const note = $("#campaignStaticNote");
    if (note) {
      note.textContent = "进度为本机演示记录，每日可送出一次祝福。";
    }

    function updateUI() {
      const pct = Math.min(100, Math.round((bless / target) * 100));
      if (pctEl) pctEl.textContent = pct + "%";
      if (fill) fill.style.width = pct + "%";
      if (countEl) countEl.textContent = formatNum(bless);
      if (bar) bar.setAttribute("aria-valuenow", String(pct));
    }
    updateUI();

    const btn = $("#joinCampaignBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const key = "hanbaby_blessed_" + todayKey();
      if (storageGet(key)) {
        toast("今天已经送过祝福啦，明天再来～");
        return;
      }
      bless = Math.min(target, bless + 1);
      storageSet(STORAGE.bless, String(bless));
      storageSet(key, "1");
      updateUI();
      addPoints(12, 20);
      openModal("生日祝福 +1！谢谢你点亮小宇宙（本机记录）。");
    });
  }

  /* ---------- Douyin profile / copy ---------- */
  function initDouyin() {
    const links = ["#douyinLinkHero", "#douyinOpenBtn"]
      .map((s) => $(s))
      .filter(Boolean);
    links.forEach((a) => {
      a.href = DOUYIN_PROFILE.share_url || DOUYIN_PROFILE.profile_url;
    });

    const sign = $("#douyinSign");
    if (sign && DOUYIN_PROFILE.signature) {
      sign.textContent = DOUYIN_PROFILE.signature;
    }

    $("#copyDouyinLink")?.addEventListener("click", async () => {
      const url = DOUYIN_PROFILE.share_url || DOUYIN_PROFILE.profile_url;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          toast("主页链接已复制");
          return;
        }
      } catch {
        /* fallthrough */
      }
      window.prompt("复制链接：", url);
    });

    $("#copyShareText")?.addEventListener("click", async () => {
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(SHARE_CLIP);
          toast("分享文案已复制，去粘贴给朋友吧");
          return;
        }
      } catch {
        /* fallthrough */
      }
      window.prompt("复制分享文案：", SHARE_CLIP);
    });

    // 观看任务：跳真实主页
    const watchBtn = $('.task-item[data-task="watch"] [data-complete]');
    if (watchBtn) {
      watchBtn.addEventListener(
        "click",
        () => {
          window.open(DOUYIN_PROFILE.share_url, "_blank", "noopener,noreferrer");
        },
        { capture: true }
      );
    }
  }

  /* ---------- Join ---------- */
  function initJoin() {
    const btn = $("#joinBtn");
    if (!btn) return;
    if (storageGet(STORAGE.joined)) {
      btn.textContent = "你已是憨家军成员";
      btn.disabled = true;
      btn.style.opacity = "0.7";
    }
    btn.addEventListener("click", () => {
      storageSet(STORAGE.joined, "1");
      storageSet("hanbaby_nickname_v1", "憨家军游客");
      btn.textContent = "你已是憨家军成员";
      btn.disabled = true;
      addPoints(20, 30);
      openModal("欢迎加入憨家军！等级：Lv.1 初见小星星（游客模式 · 本机记录，无账号登录）");
    });
  }

  /* ---------- Nav / Scroll ---------- */
  function initNav() {
    const topNav = $("#topNav");
    window.addEventListener(
      "scroll",
      () => {
        if (topNav) topNav.classList.toggle("scrolled", window.scrollY > 20);
        updateBottomNav();
      },
      { passive: true }
    );

    $$(".bottom-nav a, .nav-links a, .logo, .nav-cta").forEach((a) => {
      a.addEventListener("click", () => {
        // active state after jump
        setTimeout(updateBottomNav, 100);
      });
    });
  }

  function updateBottomNav() {
    const sections = ["home", "works", "tools", "support", "join"];
    let current = "home";
    const y = window.scrollY + 120;
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) current = id;
    });
    $$(".bn-item").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === current);
    });
  }

  /* ---------- Reveal ---------- */
  function observeReveals(root = document) {
    const els = $$(".reveal", root);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Parallax (light) ---------- */
  function initParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const visual = $(".hero-visual");
    if (!visual) return;
    document.addEventListener("mousemove", (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      visual.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* ---------- Modal controls ---------- */
  function initModal() {
    $("#modalClose")?.addEventListener("click", closeModal);
    $("#modalOk")?.addEventListener("click", closeModal);
    $("#thanksModal")?.addEventListener("click", (e) => {
      if (e.target.id === "thanksModal") closeModal();
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    initFloatLayer();
    initStatsObserver();
    renderWorks("all");
    initWorkFilters();
    renderTimeline();
    renderRank();
    renderAssets();
    initTasks();
    initCampaign();
    initDouyin();
    initJoin();
    initNav();
    initModal();
    initParallax();
    observeReveals();
    updateBottomNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
