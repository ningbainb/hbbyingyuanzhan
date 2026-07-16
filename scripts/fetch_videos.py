# -*- coding: utf-8 -*-
"""尝试用 Playwright 抓取抖音主页作品链接（可能被登录/风控拦截）。"""
from __future__ import annotations

import json
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
SEC = "MS4wLjABAAAAIsFqgUpChGGpVYpp_aut0UQQeA7NYypEUM703AhiCZc"
USER_URL = f"https://www.douyin.com/user/{SEC}"


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    posts: list[dict] = []
    dom_links: list[str] = []

    with sync_playwright() as p:
        # headless_shell 可能未装全；优先用完整 Chromium / 系统 Chrome
        chrome_candidates = [
            Path.home()
            / "AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe",
            Path(r"C:\Program Files\Google\Chrome\Application\chrome.exe"),
            Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"),
        ]
        exe = next((str(c) for c in chrome_candidates if c.exists()), None)
        launch_kwargs = {"headless": True}
        if exe:
            launch_kwargs["executable_path"] = exe
            print("using browser:", exe)
        browser = p.chromium.launch(**launch_kwargs)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1360, "height": 900},
            locale="zh-CN",
        )
        page = context.new_page()

        def on_response(resp) -> None:
            try:
                u = resp.url
                if resp.status != 200:
                    return
                if "aweme" not in u:
                    return
                if not any(k in u for k in ("post", "list", "detail", "module")):
                    return
                body = resp.text()
                if not body or "aweme" not in body:
                    return
                data = json.loads(body)
                arr = data.get("aweme_list")
                if arr is None and isinstance(data.get("data"), dict):
                    arr = data["data"].get("aweme_list")
                if not isinstance(arr, list) or not arr:
                    return
                print("API HIT", u[:140], "n=", len(arr))
                posts.extend(arr)
            except Exception:
                return

        page.on("response", on_response)
        print("goto", USER_URL)
        page.goto(USER_URL, wait_until="domcontentloaded", timeout=90000)
        time.sleep(4)

        for text in ("暂时不要", "我知道了", "允许", "关闭"):
            try:
                page.get_by_text(text, exact=False).first.click(timeout=1200)
            except Exception:
                pass

        for _ in range(6):
            page.mouse.wheel(0, 2400)
            time.sleep(1.6)

        try:
            dom_links = page.eval_on_selector_all(
                'a[href*="/video/"]',
                "els => Array.from(new Set(els.map(e => e.href)))",
            )
        except Exception:
            dom_links = []

        html = page.content()
        (DATA / "douyin_page_snip.html").write_text(html[:120000], encoding="utf-8")
        print("dom video links:", len(dom_links))
        for x in dom_links[:10]:
            print(" ", x)

        try:
            sample = page.inner_text("body")[:400]
            print("body:", sample.replace("\n", " ")[:300])
        except Exception:
            pass

        browser.close()

    # dedupe posts
    seen: set[str] = set()
    out: list[dict] = []
    for a in posts:
        aid = str(a.get("aweme_id") or a.get("id") or "")
        if not aid or aid in seen:
            continue
        seen.add(aid)
        stats = a.get("statistics") or {}
        video = a.get("video") or {}
        play = None
        for k in ("play_addr", "play_addr_h264", "download_addr"):
            urls = (video.get(k) or {}).get("url_list") or []
            if urls:
                play = urls[0]
                break
        cover = None
        for k in ("cover", "origin_cover", "dynamic_cover"):
            urls = (video.get(k) or {}).get("url_list") or []
            if urls:
                cover = urls[0]
                break
        out.append(
            {
                "id": aid,
                "desc": (a.get("desc") or "")[:100],
                "likes": stats.get("digg_count"),
                "share_url": f"https://www.douyin.com/video/{aid}",
                "play_url": play,
                "cover": cover,
            }
        )

    # fallback from DOM
    if not out and dom_links:
        for href in dom_links:
            m = None
            if "/video/" in href:
                m = href.split("/video/")[-1].split("?")[0].split("/")[0]
            if not m:
                continue
            out.append(
                {
                    "id": m,
                    "desc": "",
                    "likes": None,
                    "share_url": f"https://www.douyin.com/video/{m}",
                    "play_url": None,
                    "cover": None,
                }
            )

    (DATA / "videos.json").write_text(
        json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("saved videos:", len(out), "-> data/videos.json")


if __name__ == "__main__":
    main()
