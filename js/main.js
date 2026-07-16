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

  /* 抖音真实作品（share 页链接稳定；直链 play_url 会过期故不使用） */
  const DOUYIN_HOME = "https://v.douyin.com/3Ed4QuQJTBA/";
  const WORKS = [
    {
      id: 1,
      title: "非要逮着我的偷吗我真的生气了嘞",
      desc: "非要逮着我的偷吗我真的生气了嘞#偷外卖 #绝版甜妹 #日常",
      cover: "assets/covers/7643414360581361530.jpg",
      likes: "32.6万",
      cat: "hot",
      tag: "热门",
      url: "https://www.douyin.com/video/7643414360581361530",
    },
    {
      id: 2,
      title: "突然翻到前女友的报备视频，她以前真的好漂亮好可爱，我好后…",
      desc: "突然翻到前女友的报备视频，她以前真的好漂亮好可爱，我好后悔。",
      cover: "assets/covers/7630513408798691449.jpg",
      likes: "14万",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7630513408798691449",
    },
    {
      id: 3,
      title: "请把音量调到最大。",
      desc: "请把音量调到最大。#少女心事 #朦胧甜妹 #日常#日常",
      cover: "assets/covers/7644881495202923365.jpg",
      likes: "10万",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7644881495202923365",
    },
    {
      id: 4,
      title: "呜呜呜本来想美美回个家的，现在在校门口喂蚊子。 @金龙鱼",
      desc: "呜呜呜本来想美美回个家的，现在在校门口喂蚊子。#素甜妹 #大学生 #日常 @金龙鱼 #金龙鱼x厨房里的冠军",
      cover: "assets/covers/7652687278062301041.jpg",
      likes: "5.8万",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7652687278062301041",
    },
    {
      id: 5,
      title: "怎么先炽热的却先变冷了",
      desc: "怎么先炽热的却先变冷了#散步 #日常 #晚饭#大学生#甜妹",
      cover: "assets/covers/7656396201361961905.jpg",
      likes: "3.7万",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7656396201361961905",
    },
    {
      id: 6,
      title: "你吐的一口烟和两根手指头都很恶心",
      desc: "你吐的一口烟和两根手指头都很恶心
#猎奇 #恶心",
      cover: "assets/covers/7654536525598659579.jpg",
      likes: "1.9万",
      cat: "hot",
      tag: "热门",
      url: "https://www.douyin.com/video/7654536525598659579",
    },
    {
      id: 7,
      title: "你咋那么没用，欺软怕硬呢。",
      desc: "你咋那么没用，欺软怕硬呢。
#大学生 #日常 #恶心",
      cover: "assets/covers/7655282441842275301.jpg",
      likes: "1.5万",
      cat: "hot",
      tag: "热门",
      url: "https://www.douyin.com/video/7655282441842275301",
    },
    {
      id: 8,
      title: "外卖贼，你体会过被偷外卖的痛苦吗。你知道别人学了一下午，…",
      desc: "外卖贼，你体会过被偷外卖的痛苦吗。你知道别人学了一下午，就等着这一口饭吗。我满心期待跑过去拿外卖想着可以休息一下了，还一",
      cover: "assets/covers/7659755685152802426.jpg",
      likes: "1.5万",
      cat: "hot",
      tag: "热门",
      url: "https://www.douyin.com/video/7659755685152802426",
    },
    {
      id: 9,
      title: "我有点小腼腆呀～",
      desc: "我有点小腼腆呀～
#少女感 #夏日甜妹 #甜系青春",
      cover: "assets/covers/7657889111659053179.jpg",
      likes: "6831",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7657889111659053179",
    },
    {
      id: 10,
      title: "温馨提示:下课不要趴桌子上睡觉",
      desc: "温馨提示:下课不要趴桌子上睡觉
#大学生 #少女感 #今天有甜到你吗",
      cover: "assets/covers/7654530129738589361.jpg",
      likes: "6692",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7654530129738589361",
    },
    {
      id: 11,
      title: "比我萌没我坏，比我坏的不存在！",
      desc: "比我萌没我坏，比我坏的不存在！
#淡颜系 #忧郁学妹 #不甜的妹",
      cover: "assets/covers/7657129237920820849.jpg",
      likes: "5217",
      cat: "daily",
      tag: "日常分享",
      url: "https://www.douyin.com/video/7657129237920820849",
    },
    {
      id: 12,
      title: "夹子2.0版本。谁还敢说我五音不全！",
      desc: "夹子2.0版本。谁还敢说我五音不全！
#甜妹wink #翻唱 #夹子音 #日常",
      cover: "assets/covers/7652632586535249393.jpg",
      likes: "4560",
      cat: "look",
      tag: "颜值高光",
      url: "https://www.douyin.com/video/7652632586535249393",
    }
  ];

  const TIMELINE = [
    {
      date: "起点",
      title: "发布第一个作品",
      story: "小宇宙的第一颗星，从此开始闪烁。",
      img: "assets/emoji_1.jpg",
    },
    {
      date: "里程碑",
      title: "首次突破 1 万粉丝",
      story: "原来认真生活，会被看见。",
      img: "assets/emoji_2.jpg",
    },
    {
      date: "高光",
      title: "首条 10 万点赞作品",
      story: "那条视频，让更多人记住了憨宝宝。",
      img: "assets/emoji_3.jpg",
      highlight: true,
    },
    {
      date: "连接",
      title: "首次直播 · 粉丝群成立",
      story: "从单向关注，变成双向陪伴。",
      img: "assets/emoji_7.jpg",
    },
    {
      date: "跃升",
      title: "突破 5 万粉丝",
      story: "憨家军队伍越来越热闹了。",
      img: "assets/emoji_9.jpg",
    },
    {
      date: "纪念",
      title: "突破 10 万粉丝",
      story: "十万份喜欢，汇成一颗只为她闪耀的星。",
      img: "assets/hero_1.jpg",
      highlight: true,
    },
    {
      date: "期待",
      title: "第一次生日应援 & 下一站",
      story: "故事未完，我们继续走下去。",
      img: "assets/emoji_8.jpg",
      highlight: true,
    },
  ];

  const RANKS = [
    { name: "星河小糖", score: 9860, badge: "星河陪伴官", avatar: "assets/emoji_1.jpg" },
    { name: "粉紫日记", score: 8720, badge: "紫色守护者", avatar: "assets/emoji_2.jpg" },
    { name: "憨家小北", score: 8010, badge: "憨家军成员", avatar: "assets/emoji_3.jpg" },
    { name: "晚风与星", score: 7450, badge: "陪伴小爱心", avatar: "assets/emoji_7.jpg" },
    { name: "奶油蝴蝶结", score: 6980, badge: "初见小星星", avatar: "assets/emoji_9.jpg" },
  ];

  const ASSETS = [
    {
      title: "官方主视觉插画",
      meta: "JPG · 竖版 · 头像/海报",
      img: "assets/hero_1.jpg",
      file: "assets/hero_1.jpg",
    },
    {
      title: "挥手欢迎图",
      meta: "JPG · 横版 · 横幅/封面",
      img: "assets/hero_2.jpg",
      file: "assets/hero_2.jpg",
    },
    {
      title: "比心高清立绘",
      meta: "JPG · 正方形 · 群头像",
      img: "assets/hero_4.jpg",
      file: "assets/hero_4.jpg",
    },
    {
      title: "表情包套装预览",
      meta: "JPG · 预览 · 聊天应援",
      img: "assets/emoji_2.jpg",
      file: "assets/emoji_2.jpg",
    },
    {
      title: "手机壁纸素材",
      meta: "JPG · 竖屏 · 壁纸",
      img: "assets/hero_5.jpg",
      file: "assets/hero_5.jpg",
    },
    {
      title: "甜美特写",
      meta: "JPG · 高清 · 灯牌/二创",
      img: "assets/emoji_9.jpg",
      file: "assets/emoji_9.jpg",
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

  /** 站点根路径（兼容 /repo 与 /repo/ ） */
  function siteBase() {
    let path = window.location.pathname || "/";
    if (/\.[a-zA-Z0-9]+$/.test(path)) {
      path = path.slice(0, path.lastIndexOf("/") + 1);
    } else if (!path.endsWith("/")) {
      path += "/";
    }
    return window.location.origin + path;
  }

  function assetUrl(path) {
    if (!path) return "";
    if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
    path = String(path).replace(/^\.\//, "").replace(/^\//, "");
    return siteBase() + path;
  }

  /** 图片失败兜底 + 可重试 */
  function bindImgFallback(root = document) {
    $$("img", root).forEach((img) => {
      if (img.dataset.fallbackBound) return;
      img.dataset.fallbackBound = "1";
      img.addEventListener("error", function onErr() {
        const tried = Number(img.dataset.retry || 0);
        const src = img.getAttribute("src") || "";
        if (tried < 1 && src && !src.startsWith("data:")) {
          img.dataset.retry = "1";
          // 纠偏路径后重试一次
          const fixed = assetUrl(src.replace(siteBase(), "").replace(/^\//, ""));
          img.src = fixed + (fixed.includes("?") ? "&" : "?") + "r=" + Date.now();
          return;
        }
        img.classList.add("img-broken");
        img.alt = img.alt || "图片暂时无法加载";
        img.removeEventListener("error", onErr);
      });
    });
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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const chars = ["♡", "✦", "☆", "·", "✧"];
    const count = window.matchMedia("(max-width: 640px)").matches ? 8 : 14;
    for (let i = 0; i < count; i++) {
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
          <img src="${w.cover}" alt="${escapeHtml(w.title)}" loading="lazy" decoding="async" />
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
    bindImgFallback(grid);
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
    bindImgFallback(track);

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
        <img class="rank-avatar" src="${r.avatar}" alt="" loading="lazy" decoding="async" width="48" height="48" />
        <div>
          <div class="name">${r.name}</div>
          <div class="badge">${r.badge}</div>
        </div>
        <span class="score">${formatNum(r.score)} ♡</span>
      </li>`
    ).join("");
    bindImgFallback(list);
  }

  /* ---------- Assets ---------- */
  function renderAssets() {
    const grid = $("#assetGrid");
    if (!grid) return;
    grid.innerHTML = ASSETS.map(
      (a, i) => `
      <article class="asset-card reveal">
        <div class="asset-preview">
          <img src="${a.img}" alt="${a.title}" loading="lazy" decoding="async" />
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
    bindImgFallback(grid);
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
    if (note && !note.textContent.trim()) {
      note.textContent = "进度记在本机，每人每天可送一次。";
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
    const backTop = $("#backTop");
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (topNav) topNav.classList.toggle("scrolled", y > 20);
        if (backTop) backTop.hidden = y < 480;
        updateActiveNav();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    $$(".bottom-nav a, .nav-links a, .logo, .nav-cta").forEach((a) => {
      a.addEventListener("click", () => {
        setTimeout(updateActiveNav, 120);
      });
    });

    backTop?.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    onScroll();
  }

  function updateActiveNav() {
    const map = [
      "home",
      "stats",
      "douyin",
      "about",
      "works",
      "tools",
      "support",
      "timeline",
      "assets",
      "join",
    ];
    let current = "home";
    const y = window.scrollY + 140;
    map.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= y) current = id;
    });

    // 底栏只高亮主入口
    const bottomMap = {
      home: "home",
      stats: "home",
      douyin: "home",
      about: "home",
      works: "works",
      tools: "tools",
      support: "support",
      timeline: "support",
      assets: "tools",
      join: "join",
    };
    const bn = bottomMap[current] || "home";
    $$(".bn-item").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === bn);
    });

    // 顶栏链接高亮
    $$(".nav-links a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const id = href.startsWith("#") ? href.slice(1) : "";
      a.classList.toggle("is-active", id === current);
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
    bindImgFallback(document);
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
    updateActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
