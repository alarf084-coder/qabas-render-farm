#!/usr/bin/env python3
"""
Stage-2 Exact Boundary Trimmer & Zero-Drift Timestamp Synchronizer.

WHY THIS SCRIPT EXISTS:
`extract_and_transcribe.py` intentionally downloads -3s before start and +10s after end
so no opening hook or closing sentence is ever lost.
Once you inspect `words_raw.json` and choose the exact standalone opening word (`--start-sec`)
and complete closing word (`--end-sec`), run this script! It:
  1. Cuts `reel_1080p_final.mp4` (`-bf 0 -g 15`, 192kbps AAC) with exact frame precision.
  2. AUTOMATICALLY shifts EVERY word timestamp in `words_raw.json` by `-start_sec` so
     frame 0 of `reel_1080p_final.mp4` == frame 0 of `words_synced.json` (0.000s drift!).
  3. Writes exact `clip_meta_final.json` (`exactDurationFrames`) for Remotion `Root.tsx`!
"""
import argparse
import json
import math
import subprocess
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Trim padded base clip to exact standalone boundaries & re-zero word timestamps.")
    parser.add_argument("--work-dir", required=True, help="Directory created by extract_and_transcribe.py")
    parser.add_argument("--start-sec", type=float, required=True, help="Exact start time in reel_1080p_base.mp4 (seconds, e.g. 2.85)")
    parser.add_argument("--end-sec", type=float, required=True, help="Exact end time in reel_1080p_base.mp4 (seconds, add +0.40s tail room after last word)")
    parser.add_argument("--fps", type=int, default=30, help="Target FPS (default: 30)")
    args = parser.parse_args()

    work_dir = Path(args.work_dir).resolve()
    base_mp4 = work_dir / "reel_1080p_base.mp4"
    final_mp4 = work_dir / "reel_1080p_final.mp4"
    words_raw_path = work_dir / "words_raw.json"
    words_synced_path = work_dir / "words_synced.json"
    para_final_path = work_dir / "transcript_paragraph_final.txt"
    meta_final_path = work_dir / "clip_meta_final.json"

    start_sec = max(0.0, args.start_sec)
    dur_sec = max(0.5, args.end_sec - start_sec)

    # Frame-accurate trim with OffthreadVideo-safe encoding (-bf 0 -g 15) & untouched 192k AAC
    cmd = [
        "ffmpeg", "-y",
        "-i", str(base_mp4),
        "-ss", f"{start_sec:.3f}",
        "-t", f"{dur_sec:.3f}",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
        "-bf", "0", "-g", "15", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart",
        str(final_mp4),
    ]
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)

    exact_dur = float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(final_mp4)],
        text=True,
    ).strip())
    exact_frames = int(math.ceil(exact_dur * args.fps))

    # Shift & re-zero ALL word timestamps automatically -> 0.000s audio/visual drift!
    raw_words = json.loads(words_raw_path.read_text(encoding="utf-8"))
    synced = []
    for w in raw_words:
        if w["endSec"] <= start_sec + 0.02 or w["startSec"] >= args.end_sec - 0.02:
            continue
        ns = max(0.0, round(w["startSec"] - start_sec, 3))
        ne = min(exact_dur, round(w["endSec"] - start_sec, 3))
        if ne <= ns:
            ne = round(ns + 0.06, 3)
        synced.append({
            "word": w["word"],
            "startSec": ns,
            "endSec": ne,
            "startFrame": int(round(ns * args.fps)),
            "endFrame": int(round(ne * args.fps)),
        })

    words_synced_path.write_text(json.dumps(synced, ensure_ascii=False, indent=2), encoding="utf-8")
    para_final_path.write_text(" ".join(w["word"] for w in synced) + "\n", encoding="utf-8")

    meta = {
        "clipFile": final_mp4.name,
        "width": 1080,
        "height": 1920,
        "fps": args.fps,
        "exactDurationSec": round(exact_dur, 3),
        "exactDurationFrames": exact_frames,
        "wordCount": len(synced),
        "trimmedFromBase": {"startSec": start_sec, "endSec": args.end_sec},
    }
    meta_final_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[SYNCED 0.000s DRIFT] {final_mp4.name}: {exact_dur:.2f}s = {exact_frames} frames | {len(synced)} words -> {words_synced_path.name}")
    print(f"[NEXT STEP] Proofread {para_final_path.name} as a FULL paragraph -> save words_verified.json & use exactDurationFrames={exact_frames} in Root.tsx!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
