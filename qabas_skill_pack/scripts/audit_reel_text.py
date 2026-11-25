#!/usr/bin/env python3
"""
Pre-Render Integrity Auditor for Qabas Reels (Catches Fabricated Words & Double-Caption Risks!).

Checks a Reel `.tsx` file against `words_verified.json` BEFORE rendering:
  1. ZERO FABRICATION CHECK: Flags any Arabic word inside captions or typography scenes that
     does NOT appear in the speaker's verified spoken transcript (`words_verified.json`).
  2. ZERO DOUBLE-CAPTION CHECK: Verifies the Reel uses `EditorialCaptionTrack` with `hideRanges`
     (and warns if raw `<EditorialCaption` is mapped directly or if `hideRanges` is missing!).
  3. ZERO STARTFROM DRIFT CHECK: Warns if `<OffthreadVideo startFrom=` is used (causes audio/caption desync!).
"""
import argparse
import json
import re
import sys
from pathlib import Path

ARABIC_WORD_RE = re.compile(r"[\u0621-\u064A\u0671]+")
TASHKEEL_RE = re.compile(r"[\u064B-\u065F\u0670\u0640]")


def normalize_ar(text: str) -> str:
    t = TASHKEEL_RE.sub("", text)
    t = re.sub(r"[أإآ]", "ا", t)
    t = t.replace("ى", "ي").replace("ة", "ه")
    return t


def extract_arabic_words(text: str) -> set[str]:
    return {normalize_ar(m.group(0)) for m in ARABIC_WORD_RE.finditer(text) if len(m.group(0)) >= 2}


def main() -> int:
    parser = argparse.ArgumentParser(description="Audit a Reel TSX file for unspoken/fabricated words and double-caption bugs.")
    parser.add_argument("--tsx", required=True, help="Path to the Reel .tsx file")
    parser.add_argument("--verified-words", required=True, help="Path to words_verified.json")
    args = parser.parse_args()

    tsx_code = Path(args.tsx).read_text(encoding="utf-8")
    # Strip comments so JSDoc examples don't trigger false positives
    code_no_comments = re.sub(r"/\*.*?\*/", "", tsx_code, flags=re.S)
    code_no_comments = re.sub(r"//.*", "", code_no_comments)

    verified = json.loads(Path(args.verified_words).read_text(encoding="utf-8"))
    spoken_text = " ".join(w["word"] for w in verified)
    spoken_vocab = extract_arabic_words(spoken_text)

    # Extract all quoted string literals containing Arabic characters
    string_literals = re.findall(r'"([^"]*[\u0600-\u06FF][^"]*)"|\'([^\']*[\u0600-\u06FF][^\']*)\'', code_no_comments)
    rendered_strings = [a or b for a, b in string_literals]
    rendered_vocab = set()
    for s in rendered_strings:
        rendered_vocab |= extract_arabic_words(s)

    unspoken = sorted(w for w in rendered_vocab if w not in spoken_vocab)
    issues = 0

    print(f"=== QABAS PRE-RENDER AUDIT: {Path(args.tsx).name} ===")

    if unspoken:
        issues += 1
        print(f"[FAIL - UNSPOKEN/FABRICATED WORDS] Found {len(unspoken)} Arabic word(s) NOT in words_verified.json:")
        print("  ", ", ".join(unspoken[:30]))
        print("  -> FIX: Remove ALL invented words/labels/conjunctions (like 'لكن', 'الخلاصة', 'الدرس الأول') not spoken by the speaker!")
    else:
        print("[OK] 100% of Arabic words in TSX match the speaker's verified spoken transcript!")

    if "EditorialCaptionTrack" not in code_no_comments:
        issues += 1
        print("[FAIL - CAPTION OVERLAP RISK] Reel does NOT use <EditorialCaptionTrack />! Replace manual <EditorialCaption /> loops with <EditorialCaptionTrack />.")
    elif "hideRanges" not in code_no_comments:
        issues += 1
        print("[FAIL - DOUBLE CAPTION RISK] <EditorialCaptionTrack /> is missing `hideRanges`! Add EVERY typography scene range (including overlays 01/02/03/15) to `hideRanges`.")
    else:
        print("[OK] <EditorialCaptionTrack /> with `hideRanges` detected.")

    if "startFrom=" in code_no_comments:
        issues += 1
        print("[FAIL - AUDIO/CAPTION DESYNC RISK] Found `startFrom=` on video! Use `scripts/finalize_clip.py` so video & timestamps both start at frame 0.")
    else:
        print("[OK] Zero `startFrom=` offset drift risk.")

    if issues > 0:
        print(f"\n[AUDIT FAILED] Fix the {issues} issue(s) above BEFORE rendering!")
        return 1

    print("\n[AUDIT PASSED] Zero fabricated words, zero double-caption risks, zero startFrom desync!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
