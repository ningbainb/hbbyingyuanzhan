# -*- coding: utf-8 -*-
"""从 data/videos.json 生成作品列表并下载封面。"""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
COVERS = ROOT / "assets" / "covers"


def fmt_likes(n) -> str:
    if not n:
        return "热门"
    n = int(n)
    if n >= 10000:
        s = f"{n / 10000:.1f}".rstrip("0").rstrip(".")
        return s + "万"
    return str(n)


def cat_of(desc: str) -> tuple[str, str]:
    d = desc or ""
    if any(k in d for k in ("偷外卖", "外卖", "卧底", "辣爪", "恶心")):
        return "hot", "热门"
    if any(k in d for k in ("甜妹", "少女", "青春", "洗头", "成年", "报备", "纯爱", "心事", "朦胧")):
        return "look", "颜值高光"
    if any(k in d for k in ("10万", "破10万")):
        return "grow", "成长记录"
    if any(k in d for k in ("大学生", "期末", "日常", "散步", "晚饭")):
        return "daily", "日常分享"
    return "daily", "日常分享"


def clean_title(desc: str) -> str:
    t = re.sub(r"#\S+", "", desc or "").strip()
    t = re.sub(r"\s+", " ", t)
    if not t:
        t = "憨宝宝的日常"
    if len(t) > 28:
        t = t[:28] + "…"
    return t


def main() -> None:
    videos = json.loads((DATA / "videos.json").read_text(encoding="utf-8"))
    videos = sorted(videos, key=lambda x: x.get("likes") or 0, reverse=True)
    COVERS.mkdir(parents=True, exist_ok=True)

    ua = (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    )
    works = []
    for i, v in enumerate(videos[:12], 1):
        cover_rel = f"assets/covers/{v['id']}.jpg"
        local = ROOT / cover_rel
        if v.get("cover") and not local.exists():
            try:
                req = urllib.request.Request(
                    v["cover"],
                    headers={"User-Agent": ua, "Referer": "https://www.douyin.com/"},
                )
                data = urllib.request.urlopen(req, timeout=25).read()
                if len(data) > 800:
                    local.write_bytes(data)
                    print("cover ok", v["id"], len(data))
                else:
                    cover_rel = "assets/hero_1.jpg"
            except Exception as e:
                print("cover fail", v["id"], e)
                cover_rel = "assets/hero_1.jpg"
        elif not local.exists():
            cover_rel = "assets/hero_1.jpg"

        cat, tag = cat_of(v.get("desc") or "")
        works.append(
            {
                "id": i,
                "title": clean_title(v.get("desc") or ""),
                "desc": (v.get("desc") or "")[:60],
                "cover": cover_rel,
                "likes": fmt_likes(v.get("likes")),
                "cat": cat,
                "tag": tag,
                "url": v["share_url"],
                "play": v.get("play_url") or "",
                "aweme_id": v["id"],
            }
        )

    (DATA / "works.json").write_text(
        json.dumps(works, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("works", len(works))


if __name__ == "__main__":
    main()
