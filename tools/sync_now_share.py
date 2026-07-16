import html
import hashlib
import json
import os
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
CONTENT_PATH = ROOT / "content" / "site-content.json"
INDEX_PATH = ROOT / "index.html"
OUTPUT_PATH = ROOT / "public" / "assets" / "images" / "social-preview.png"
WIDTH, HEIGHT = 1200, 627


def first_existing(paths: list[str]) -> str:
    for path in paths:
        if Path(path).exists():
            return path
    raise FileNotFoundError(f"No usable font found in: {paths}")


SANS = first_existing([
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
])
SANS_BOLD = first_existing([
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
])
SERIF_BOLD = first_existing([
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
])


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def wrap(draw: ImageDraw.ImageDraw, text: str, face: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and draw.textlength(candidate, font=face) > max_width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def clipped_lines(lines: list[str], limit: int) -> list[str]:
    if len(lines) <= limit:
        return lines
    clipped = lines[:limit]
    clipped[-1] = clipped[-1].rstrip(".,;:—-") + "…"
    return clipped


def draw_preview(now: dict[str, str]) -> None:
    canvas = Image.new("RGB", (WIDTH, HEIGHT), "white")
    pixels = canvas.load()
    start = (255, 255, 255)
    end = (225, 238, 247)
    for y in range(HEIGHT):
        for x in range(WIDTH):
            mix = min(1.0, (x / WIDTH) * 0.74 + (y / HEIGHT) * 0.26)
            pixels[x, y] = tuple(round(start[i] * (1 - mix) + end[i] * mix) for i in range(3))

    draw = ImageDraw.Draw(canvas)
    draw.rectangle((0, 0, 14, HEIGHT), fill="#005ea8")
    draw.ellipse((76, 63, 92, 79), fill="#d62f2f")
    draw.text((105, 54), "NOW", font=font(SANS_BOLD, 23), fill="#005ea8")
    draw.text((790, 56), now["updated"].upper(), font=font(SANS_BOLD, 19), fill="#595959")

    draw.text((76, 122), now["eyebrow"], font=font(SANS_BOLD, 31), fill="#005ea8")

    title_size = 53
    while title_size >= 39:
        title_face = font(SERIF_BOLD, title_size)
        title_lines = wrap(draw, now["title"], title_face, 1045)
        if len(title_lines) <= 3:
            break
        title_size -= 2
    title_lines = clipped_lines(title_lines, 3)
    title_y = 184
    title_step = title_size + 9
    for index, line in enumerate(title_lines):
        draw.text((76, title_y + index * title_step), line, font=title_face, fill="#151515")

    body_y = title_y + len(title_lines) * title_step + 24
    body_face = font(SANS, 23)
    body_lines = clipped_lines(wrap(draw, now["body"], body_face, 1045), 2)
    for index, line in enumerate(body_lines):
        draw.text((76, body_y + index * 34), line, font=body_face, fill="#40474d")

    pill_y = 501
    deadline_face = font(SANS_BOLD, 22)
    pill_width = int(draw.textlength(now["deadline"], font=deadline_face)) + 46
    draw.rounded_rectangle((76, pill_y, 76 + pill_width, pill_y + 51), radius=8, fill="#005ea8")
    draw.text((99, pill_y + 12), now["deadline"], font=deadline_face, fill="white")

    draw.line((76, 577, 1124, 577), fill="#9fb8c8", width=2)
    draw.text((76, 591), "RABBI, LUTFOR RAHMAN · PERSONAL WEBSITE", font=font(SANS_BOLD, 17), fill="#595959")
    canvas.save(OUTPUT_PATH, format="PNG", optimize=True)


def sync_meta(now: dict[str, str]) -> None:
    site_url = os.environ.get("SITE_URL", "").rstrip("/")
    version_source = json.dumps(now, ensure_ascii=False, sort_keys=True).encode("utf-8")
    version = hashlib.sha256(version_source).hexdigest()[:10]
    page_url = f"{site_url}/?now={version}#now" if site_url else f"?now={version}#now"
    image_url = f"{site_url}/public/assets/images/social-preview.png?v={version}" if site_url else f"public/assets/images/social-preview.png?v={version}"
    title = f"{now['eyebrow']} | Rabbi, Lutfor Rahman"
    description = f"{now['title']} {now['deadline']}"

    values = {key: html.escape(value, quote=True) for key, value in {
        "title": title,
        "description": description,
        "page_url": page_url,
        "image_url": image_url,
        "image_alt": now["eyebrow"],
    }.items()}
    block = f'''<!-- NOW_SOCIAL_META_START -->
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Rabbi, Lutfor Rahman" />
    <meta property="og:title" content="{values['title']}" />
    <meta property="og:description" content="{values['description']}" />
    <meta property="og:url" content="{values['page_url']}" />
    <meta property="og:image" content="{values['image_url']}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="627" />
    <meta property="og:image:alt" content="{values['image_alt']}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{values['title']}" />
    <meta name="twitter:description" content="{values['description']}" />
    <meta name="twitter:image" content="{values['image_url']}" />
    <!-- NOW_SOCIAL_META_END -->'''

    index = INDEX_PATH.read_text(encoding="utf-8")
    updated, count = re.subn(
        r"<!-- NOW_SOCIAL_META_START -->.*?<!-- NOW_SOCIAL_META_END -->",
        block,
        index,
        count=1,
        flags=re.DOTALL,
    )
    if count != 1:
        raise RuntimeError("Could not find the Now social metadata block in index.html")
    INDEX_PATH.write_text(updated, encoding="utf-8")


content = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
now = content["now"]
required = ("eyebrow", "updated", "title", "body", "deadline")
if any(not isinstance(now.get(key), str) or not now[key].strip() for key in required):
    raise ValueError(f"The Now section must contain text for: {', '.join(required)}")

draw_preview(now)
sync_meta(now)
print(f"Updated {OUTPUT_PATH.relative_to(ROOT)} and the homepage share metadata")
