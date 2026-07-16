# -*- coding: utf-8 -*-
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
works = json.loads((ROOT / "data/works.json").read_text(encoding="utf-8"))

items = []
for w in works:
    items.append(
        "    {\n"
        f"      id: {w['id']},\n"
        f"      title: {json.dumps(w['title'], ensure_ascii=False)},\n"
        f"      desc: {json.dumps(w['desc'], ensure_ascii=False)},\n"
        f"      cover: {json.dumps(w['cover'], ensure_ascii=False)},\n"
        f"      likes: {json.dumps(w['likes'], ensure_ascii=False)},\n"
        f"      cat: {json.dumps(w['cat'], ensure_ascii=False)},\n"
        f"      tag: {json.dumps(w['tag'], ensure_ascii=False)},\n"
        f"      url: {json.dumps(w['url'], ensure_ascii=False)},\n"
        "    }"
    )
block = (
    "  /* 抖音真实作品（share 页链接稳定；直链 play_url 会过期故不使用） */\n"
    "  const DOUYIN_HOME = \"https://v.douyin.com/3Ed4QuQJTBA/\";\n"
    "  const WORKS = [\n" + ",\n".join(items) + "\n  ];\n"
)

main = ROOT / "js/main.js"
text = main.read_text(encoding="utf-8")
pat = re.compile(
    r"  /\* 代表作品清单.*?const WORKS = \[\n.*?\n  \];\n",
    re.S,
)
if not pat.search(text):
    # fallback older comment
    pat = re.compile(
        r"  /\* 抖音真实作品.*?const WORKS = \[\n.*?\n  \];\n",
        re.S,
    )
new_text, n = pat.subn(block, text, count=1)
if n != 1:
    raise SystemExit(f"replace failed n={n}")
main.write_text(new_text, encoding="utf-8")
print("injected", len(works), "works into main.js")
