# -*- coding: utf-8 -*-
"""Fetch Douyin profile for HanBaby fan site (static snapshot)."""
from __future__ import annotations

import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
ASSETS = ROOT / "assets" / "douyin"
SEC_UID = "MS4wLjABAAAAIsFqgUpChGGpVYpp_aut0UQQeA7NYypEUM703AhiCZc"
SHARE = "https://v.douyin.com/3Ed4QuQJTBA/"
UA = (
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) "
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
)


def get(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Referer": "https://www.douyin.com/",
            "Accept": "application/json,text/html,*/*",
        },
    )
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read()


def main() -> None:
    DATA.mkdir(parents=True, exist_ok=True)
    ASSETS.mkdir(parents=True, exist_ok=True)

    raw = get(f"https://www.iesdouyin.com/web/api/v2/user/info/?sec_uid={SEC_UID}")
    (DATA / "user_raw.json").write_bytes(raw)
    payload = json.loads(raw.decode("utf-8"))
    info = payload.get("user_info") or {}

    avatar_urls = (
        (info.get("avatar_medium") or {}).get("url_list")
        or (info.get("avatar_thumb") or {}).get("url_list")
        or []
    )
    avatar_path = ASSETS / "avatar.jpg"
    if avatar_urls:
        for candidate in [
            avatar_urls[0].replace("/100x100/", "/720x720/").replace("/200x200/", "/720x720/"),
            avatar_urls[0],
        ]:
            try:
                data = get(candidate)
                if len(data) > 500:
                    avatar_path.write_bytes(data)
                    break
            except Exception:
                continue

    signature = info.get("signature") or ""
    # extract @ mentions
    mentions = re.findall(r"@([^\s@]+)", signature)

    profile = {
        "nickname": info.get("nickname") or "憨宝宝",
        "unique_id": str(info.get("unique_id") or ""),
        "sec_uid": info.get("sec_uid") or SEC_UID,
        "followers": int(info.get("mplatform_followers_count") or 0),
        "total_favorited": int(info.get("total_favorited") or 0),
        "aweme_count": int(info.get("aweme_count") or 0),
        "following_count": int(info.get("following_count") or 0),
        "favoriting_count": int(info.get("favoriting_count") or 0),
        "signature": signature,
        "mentions": mentions,
        "share_url": SHARE,
        "profile_url": f"https://www.douyin.com/user/{info.get('sec_uid') or SEC_UID}",
        "avatar_local": "assets/douyin/avatar.jpg" if avatar_path.exists() else "",
        "fetched_note": "Snapshot via iesdouyin public share API for fan site display.",
    }
    (DATA / "profile.json").write_text(
        json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(profile, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
