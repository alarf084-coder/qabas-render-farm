#!/usr/bin/env python3
"""
Strict Verbatim Quranic Verse Fetcher for «قَبسٌ مِنْ أَثر».

HARD RULE:
- NEVER type or vowelize Quranic verses from memory.
- Fetches verbatim Hafs text from official API (api.alquran.cloud -> api.quran.com fallback).
- Handles cloud sandbox SSL proxy constraints gracefully (tries verified HTTPS first, then
  falls back to verify=False only on SSLError) so Quran APIs work reliably on cloud VMs.
- If BOTH APIs fail or are unreachable, writes {"status": "FALLBACK_TO_RAW_FOOTAGE"}
  so SafeQuranGoldFrameScene renders NULL and keeps the REAL speaker footage untouched!
"""
import argparse
import json
import sys
import warnings
from pathlib import Path
import requests
from requests.exceptions import SSLError

ARABIC_DIGITS = str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; QabasStudio/3.0; +https://api.alquran.cloud)"
}


def to_arabic_digits(num: int) -> str:
    return str(num).translate(ARABIC_DIGITS)


def safe_get_json(url: str, timeout: int = 12) -> dict:
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout, verify=True)
        resp.raise_for_status()
        return resp.json()
    except SSLError:
        # Cloud sandboxes with corporate/proxy TLS inspection may fail default CA verification
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            resp = requests.get(url, headers=HEADERS, timeout=timeout, verify=False)
            resp.raise_for_status()
            return resp.json()


def fetch_from_alquran_cloud(surah: int, ayah: int, timeout: int = 12) -> dict:
    url = f"https://api.alquran.cloud/v1/ayah/{surah}:{ayah}/quran-simple-enhanced"
    payload = safe_get_json(url, timeout=timeout)
    if payload.get("code") != 200 or "data" not in payload:
        raise ValueError(f"Unexpected api.alquran.cloud response: {payload}")
    data = payload["data"]
    return {
        "status": "OK",
        "surahNumber": surah,
        "ayahNumber": ayah,
        "ayahNumberArabic": to_arabic_digits(ayah),
        "surahName": data["surah"]["name"],
        "text": data["text"].strip(),
        "sourceUrl": url,
    }


def fetch_from_quran_com(surah: int, ayah: int, timeout: int = 12) -> dict:
    verse_key = f"{surah}:{ayah}"
    url = f"https://api.quran.com/api/v4/quran/verses/uthmani?verse_key={verse_key}"
    chapter_url = f"https://api.quran.com/api/v4/chapters/{surah}?language=ar"
    verses = safe_get_json(url, timeout=timeout).get("verses", [])
    if not verses:
        raise ValueError("Empty verses from api.quran.com")
    chapter_data = safe_get_json(chapter_url, timeout=timeout)
    surah_name = f"سُورَةُ {chapter_data['chapter']['name_arabic']}"
    return {
        "status": "OK",
        "surahNumber": surah,
        "ayahNumber": ayah,
        "ayahNumberArabic": to_arabic_digits(ayah),
        "surahName": surah_name,
        "text": verses[0]["text_uthmani"].strip(),
        "sourceUrl": url,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch verbatim Quranic Ayah or return RAW_FOOTAGE fallback.")
    parser.add_argument("--surah", type=int, required=True, help="Surah number (1-114)")
    parser.add_argument("--ayah", type=int, required=True, help="Ayah number")
    parser.add_argument("--out", type=str, required=True, help="Output JSON path")
    args = parser.parse_args()

    result = None
    errors = []

    for fetcher in (fetch_from_alquran_cloud, fetch_from_quran_com):
        try:
            result = fetcher(args.surah, args.ayah)
            break
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{fetcher.__name__}: {exc}")

    if result is None:
        result = {
            "status": "FALLBACK_TO_RAW_FOOTAGE",
            "surahNumber": args.surah,
            "ayahNumber": args.ayah,
            "reason": "Official Quran APIs unreachable. DO NOT type Quran text manually; leave raw speaker footage untouched.",
            "errors": errors,
        }
        print(
            f"[QURAN FAIL-SAFE TRIGGERED] Could not reach Quran API for {args.surah}:{args.ayah}. "
            "Returning FALLBACK_TO_RAW_FOOTAGE — DO NOT write the verse on screen!",
            file=sys.stderr,
        )
    else:
        print(f"[QURAN VERIFIED] {result['surahName']} ({args.surah}:{args.ayah}) fetched from {result['sourceUrl']}")

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
