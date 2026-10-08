#!/usr/bin/env python3
"""Add Wikimedia Commons portrait references with eligible license metadata.

Only CC BY, CC BY-SA, CC0, and Public Domain files with a visible creator/credit,
source page, and license URL are accepted. This checks supplied file metadata, not
separate personality/publicity rights. Non-matching records are left unchanged.
"""

import argparse
import html
import json
import re
import time
from html.parser import HTMLParser
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

API_URL = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "ProjectC Player Portrait Enrichment/1.0 (https://github.com/cartikeya/project-c)"
ALLOWED_LICENSES = ("cc by ", "cc by-sa", "cc0", "public domain")


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_data(self, data):
        self.parts.append(data)


def clean_html(value):
    parser = TextOnly()
    try:
        parser.feed(value or "")
    except Exception:
        pass
    return re.sub(r"\s+", " ", html.unescape(" ".join(parser.parts))).strip()


def metadata_value(metadata, key):
    value = (metadata.get(key) or {}).get("value", "")
    return value.strip() if isinstance(value, str) else ""


def normalize(value):
    return re.sub(r"[^a-z0-9]", "", (value or "").casefold())


def license_is_allowed(name):
    normalized = (name or "").strip().casefold()
    if "-nc" in normalized or re.search(r"-nd(?:\s|$)", normalized):
        return False
    return any(normalized.startswith(prefix) for prefix in ALLOWED_LICENSES)


def license_url(metadata):
    raw = metadata_value(metadata, "LicenseUrl")
    match = re.search(r'href=["\']([^"\']+)', raw, flags=re.IGNORECASE)
    if match:
        return html.unescape(match.group(1))
    return clean_html(raw)


def search_player(name):
    params = {
        "action": "query",
        "format": "json",
        "formatversion": 2,
        "generator": "search",
        "gsrsearch": f'"{name}" filetype:bitmap',
        "gsrnamespace": 6,
        "gsrlimit": 20,
        "prop": "imageinfo",
        "iiprop": "url|extmetadata|mime",
        "iiurlwidth": 640,
    }
    request = Request(
        f"{API_URL}?{urlencode(params)}",
        headers={"User-Agent": USER_AGENT, "Accept": "application/json"},
    )
    for attempt in range(4):
        try:
            with urlopen(request, timeout=25) as response:
                return json.load(response)
        except HTTPError as error:
            if error.code == 429 or 500 <= error.code < 600:
                if attempt == 3:
                    raise
                retry_after = error.headers.get("Retry-After")
                time.sleep(float(retry_after) if retry_after and retry_after.isdigit() else 10 * (attempt + 1))
                continue
            raise
        except URLError:
            if attempt == 3:
                raise
            time.sleep(3 * (attempt + 1))
    return {}


def choose_image(name, response):
    pages = (response.get("query") or {}).get("pages") or []
    if isinstance(pages, dict):
        pages = list(pages.values())

    exact = normalize(name)
    candidates = []
    for page in pages:
        title = page.get("title", "")
        normalized_title = normalize(title.removeprefix("File:"))
        if not exact or exact not in normalized_title:
            continue
        if re.search(r"logo|signature|autograph|silhouette|coat.of.arms|ambassador|diplomat|politician|minister|president", title, re.IGNORECASE):
            continue
        info = (page.get("imageinfo") or [{}])[0]
        if info.get("mime") not in {"image/jpeg", "image/png", "image/webp"}:
            continue
        ext = info.get("extmetadata") or {}
        license_name = clean_html(metadata_value(ext, "LicenseShortName"))
        if not license_is_allowed(license_name):
            continue
        artist = clean_html(metadata_value(ext, "Artist"))
        credit = clean_html(metadata_value(ext, "Credit"))
        attribution = artist or credit
        source_url = info.get("descriptionurl", "")
        license_link = license_url(ext)
        image_url = info.get("thumburl", "")
        if not (attribution and source_url and license_link and image_url):
            continue
        candidates.append({
            "title": title,
            "img": image_url,
            "imageCredit": attribution,
            "imageLicense": license_name,
            "imageLicenseUrl": license_link,
            "imageSource": source_url,
            "imageProvider": "Wikimedia Commons",
        })

    if not candidates:
        return None
    # Prefer the file title that most closely matches the player's exact name.
    candidates.sort(key=lambda item: (
        normalize(item["title"].removeprefix("File:")) != exact,
        len(normalize(item["title"])),
        item["title"].casefold(),
    ))
    selected = candidates[0]
    selected["imageTitle"] = selected.pop("title")
    return selected


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", default=str(Path(__file__).resolve().parents[1] / "playersData.json"))
    parser.add_argument("--output", required=True, help="Write enriched JSON to this path; input is never changed automatically.")
    parser.add_argument("--delay-seconds", type=float, default=1.1, help="Delay between Commons requests (default: 1.1s).")
    parser.add_argument("--limit", type=int, default=0, help="Optional cap for test runs; 0 processes all players.")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    players = json.loads(input_path.read_text(encoding="utf-8"))
    if args.limit:
        players = players[:args.limit]

    matched = 0
    failures = []
    for index, player in enumerate(players, 1):
        if player.get("img"):
            matched += 1
        else:
            try:
                result = choose_image(player.get("name", ""), search_player(player.get("name", "")))
                if result:
                    player.update(result)
                    matched += 1
            except Exception as error:
                failures.append({"name": player.get("name", ""), "error": str(error)[:180]})
        if index % 25 == 0 or index == len(players):
            print(f"Checked {index}/{len(players)}; portraits with explicit license metadata and attribution: {matched}", flush=True)
        if index < len(players):
            time.sleep(max(0, args.delay_seconds))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(players, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({
        "input": str(input_path),
        "output": str(output_path),
        "players_processed": len(players),
        "players_with_eligible_portraits": matched,
        "players_without_eligible_portraits": len(players) - matched,
        "lookup_failures": failures,
    }, ensure_ascii=False, indent=2), flush=True)


if __name__ == "__main__":
    main()
