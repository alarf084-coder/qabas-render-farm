#!/usr/bin/env python3
"""
Ultra-Fast YouTube Arabic Lecture Transcript Fetcher (2-4 seconds vs 40-minute CPU Whisper!).

Use this FIRST on any long YouTube lecture (30-120 min) to pick the strongest standalone Reels
with complete openings and complete endings — WITHOUT downloading the full 1080p video!
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path


def parse_vtt(vtt_path: Path) -> list[dict]:
    lines = vtt_path.read_text(encoding="utf-8", errors="replace").splitlines()
    ts_re = re.compile(r"(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})")
    tag_re = re.compile(r"<[^>]+>")

    raw_entries = []
    cur_start, cur_end = None, None
    buf = []

    for line in lines:
        m = ts_re.search(line)
        if m:
            if cur_start and buf:
                text = " ".join(buf).strip()
                if text:
                    raw_entries.append({"start": cur_start, "end": cur_end, "text": text})
            cur_start, cur_end = m.group(1)[:8], m.group(2)[:8]
            buf = []
        elif line.strip() == "" or line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
            continue
        else:
            clean = tag_re.sub("", line).strip()
            if clean:
                buf.append(clean)

    if cur_start and buf:
        text = " ".join(buf).strip()
        if text:
            raw_entries.append({"start": cur_start, "end": cur_end, "text": text})

    # Deduplicate rolling YouTube auto-caption overlaps
    deduped = []
    prev_text = ""
    for entry in raw_entries:
        t = re.sub(r"\s+", " ", entry["text"]).strip()
        if not t or t == prev_text or t in prev_text:
            continue
        deduped.append({"start": entry["start"], "end": entry["end"], "text": t})
        prev_text = t
    return deduped


def main() -> int:
    parser = argparse.ArgumentParser(description="Fetch Arabic YouTube transcript in ~3 seconds for fast clip discovery.")
    parser.add_argument("--url", required=True, help="YouTube lecture URL")
    parser.add_argument("--out-dir", default="./lecture_discovery", help="Output directory")
    args = parser.parse_args()

    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    sub_tpl = str(out_dir / "lecture.%(ext)s")

    cmd = [
        "yt-dlp",
        "--no-check-certificates",
        "--skip-download",
        "--write-sub",
        "--write-auto-sub",
        "--sub-lang", "ar,ar-EG,ar-SA",
        "--convert-subs", "vtt",
        "-o", sub_tpl,
        args.url,
    ]
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=False)

    vtt_files = sorted(out_dir.glob("*.vtt"))
    if not vtt_files:
        print(
            "[NO YOUTUBE SUBS FOUND] Fallback: download ONLY low-bitrate audio (`yt-dlp -f worstaudio`) "
            "and run `faster-whisper --model tiny` to locate timestamps — NEVER download 1080p full lecture!",
            file=sys.stderr,
        )
        return 1

    segments = parse_vtt(vtt_files[0])
    txt_path = out_dir / "lecture_transcript.txt"
    json_path = out_dir / "lecture_segments.json"

    txt_lines = [f"[{s['start']}] {s['text']}" for s in segments]
    txt_path.write_text("\n".join(txt_lines), encoding="utf-8")
    json_path.write_text(json.dumps(segments, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[DISCOVERY READY] {len(segments)} timestamped segments -> {txt_path}")
    print("Pick clips with STANDALONE opening hooks and COMPLETE closing sentences!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
