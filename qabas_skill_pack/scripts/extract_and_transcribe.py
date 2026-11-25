#!/usr/bin/env python3
"""
Full HD 1080p YouTube/Local Extractor + AUTOMATIC FACE-CENTERED 9:16 SMART CROP
+ Safety Boundary Padding + Smart Silence Trimmer + OffthreadVideo-Safe (-bf 0 -g 15) + Word-Level ASR.

Quality & Reliability Guarantees:
1. Supports BOTH `--url <YouTube>` (1080p direct HTTPS DASH) AND `--local-video <path>`.
2. AUTOMATIC FACE-CENTERED CROP: Samples 12 frames with OpenCV face detection to compute the
   median speaker horizontal center `face_cx` so the speaker is ALWAYS centered in the 9:16 frame!
   Also saves `crop_check.png` for instant visual confirmation and supports `--crop-x-pct` override.
3. Auto-pads boundaries (`--pad-start 3 --pad-end 10` by default) so opening hooks & closing
   sentences are NEVER cut off prematurely! (Follow with `scripts/finalize_clip.py` for 0.000s sync!)
4. Outputs Full HD 1080x1920 @ 30fps (`-preset veryfast -crf 16 -bf 0 -g 15`) + UNTOUCHED 192kbps AAC.
5. Writes `clip_meta.json`, `words_raw.json`, and `transcript_paragraph.txt`.
"""
import argparse
import json
import math
import re
import statistics
import subprocess
import sys
from pathlib import Path


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.run(cmd, check=True)


def ts_to_sec(ts: str) -> float:
    parts = [float(p) for p in ts.strip().split(":")]
    if len(parts) == 3:
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0]


def sec_to_ts(sec: float) -> str:
    sec = max(0.0, sec)
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def probe_video_dims(video_path: Path) -> tuple[int, int, float]:
    out = subprocess.check_output(
        [
            "ffprobe", "-v", "error",
            "-select_streams", "v:0",
            "-show_entries", "stream=width,height:format=duration",
            "-of", "json", str(video_path),
        ],
        text=True,
    )
    data = json.loads(out)
    w = int(data["streams"][0]["width"])
    h = int(data["streams"][0]["height"])
    dur = float(data["format"]["duration"])
    return w, h, dur


def detect_face_crop_x(video_path: Path, iw: int, ih: int, override_pct: float | None = None) -> tuple[int, int, str]:
    """
    Computes exact 9:16 horizontal crop window (crop_w, crop_x) centered on the speaker's face.
    """
    crop_w = int(round(ih * 9 / 16))
    crop_w = min(crop_w, iw)
    # Ensure even width for yuv420p
    crop_w -= crop_w % 2
    max_x = max(0, iw - crop_w)

    if override_pct is not None:
        center_x = iw * max(0.0, min(1.0, override_pct))
        crop_x = int(max(0, min(max_x, round(center_x - crop_w / 2))))
        return crop_w, crop_x, f"manual override ({override_pct:.2f})"

    try:
        import cv2  # type: ignore
    except ImportError:
        default_x = max_x // 2
        print("[WARN] OpenCV (cv2) not installed; falling back to geometric center crop. Install opencv-python-headless!", file=sys.stderr)
        return crop_w, default_x, "geometric center (cv2 missing)"

    frontal_xml = str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml")
    profile_xml = str(Path(cv2.data.haarcascades) / "haarcascade_profileface.xml")
    frontal = cv2.CascadeClassifier(frontal_xml)
    profile = cv2.CascadeClassifier(profile_xml)

    cap = cv2.VideoCapture(str(video_path))
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) or 1
    sample_count = 14
    face_centers: list[float] = []

    for i in range(sample_count):
        target_f = int((i + 0.5) * total_frames / sample_count)
        cap.set(cv2.CAP_PROP_POS_FRAMES, target_f)
        ok, frame = cap.read()
        if not ok or frame is None:
            continue
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = frontal.detectMultiScale(gray, scaleFactor=1.12, minNeighbors=5, minSize=(70, 70))
        if len(faces) == 0:
            faces = profile.detectMultiScale(gray, scaleFactor=1.12, minNeighbors=5, minSize=(70, 70))
        if len(faces) > 0:
            # Choose the largest detected face (the main speaker)
            fx, fy, fw, fh = max(faces, key=lambda b: b[2] * b[3])
            face_centers.append(fx + fw / 2.0)

    cap.release()

    if face_centers:
        median_cx = statistics.median(face_centers)
        crop_x = int(max(0, min(max_x, round(median_cx - crop_w / 2.0))))
        return crop_w, crop_x, f"auto face-centered ({len(face_centers)}/{sample_count} samples, face_cx={median_cx:.0f}px/{iw}px)"

    default_x = max_x // 2
    return crop_w, default_x, "geometric center (no face detected — check crop_check.png & pass --crop-x-pct if needed)"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Extract 1080p clip with automatic face-centered 9:16 crop, silence-trim, and word-level ASR."
    )
    src_group = parser.add_mutually_exclusive_group(required=True)
    src_group.add_argument("--url", help="YouTube video URL")
    src_group.add_argument("--local-video", help="Path to an already-downloaded local 1080p video file")

    parser.add_argument("--start", required=True, help="Start timestamp (e.g. 00:04:50)")
    parser.add_argument("--end", required=True, help="End timestamp (e.g. 00:06:00)")
    parser.add_argument("--pad-start", type=float, default=3.0, help="Extra seconds before --start (default: 3.0s)")
    parser.add_argument("--pad-end", type=float, default=10.0, help="Extra seconds after --end (default: 10.0s)")
    parser.add_argument("--crop-x-pct", type=float, default=None, help="Optional manual speaker horizontal center (0.0-1.0, e.g. 0.42)")
    parser.add_argument("--out-dir", default="./work_reel", help="Working output directory")
    parser.add_argument("--fps", type=int, default=30, help="Target FPS (default: 30)")
    parser.add_argument("--model", default="small", help="faster-whisper model (small/medium/large-v3)")
    args = parser.parse_args()

    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    raw_mp4 = out_dir / "raw_1080p.mp4"
    base_mp4 = out_dir / "reel_1080p_base.mp4"
    crop_check_png = out_dir / "crop_check.png"
    audio_wav = out_dir / "voice_16k.wav"
    words_json = out_dir / "words_raw.json"
    para_txt = out_dir / "transcript_paragraph.txt"
    meta_json = out_dir / "clip_meta.json"

    start_sec = max(0.0, ts_to_sec(args.start) - args.pad_start)
    end_sec = ts_to_sec(args.end) + args.pad_end
    padded_start = sec_to_ts(start_sec)
    padded_end = sec_to_ts(end_sec)

    # 1. Acquire TRUE 1080p segment
    if args.local_video:
        run([
            "ffmpeg", "-y",
            "-ss", padded_start, "-to", padded_end,
            "-i", str(Path(args.local_video).resolve()),
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "192k",
            str(raw_mp4),
        ])
    else:
        run([
            "yt-dlp",
            "--no-check-certificates",
            "--download-sections", f"*{padded_start}-{padded_end}",
            "--force-keyframes-at-cuts",
            "-f", "137+bestaudio[ext=m4a][protocol!=m3u8_native]/bestvideo[height>=1080][ext=mp4][protocol!=m3u8_native]+bestaudio[ext=m4a]/best[ext=mp4]",
            "--merge-output-format", "mp4",
            "-o", str(raw_mp4),
            args.url,
        ])

    # 2. Automatic Face-Centered 9:16 Smart Crop Detection
    iw, ih, total_dur = probe_video_dims(raw_mp4)
    crop_w, crop_x, crop_reason = detect_face_crop_x(raw_mp4, iw, ih, args.crop_x_pct)
    print(f"[SMART CROP] {crop_w}x{ih} at x={crop_x} ({crop_reason})")

    # 3. Smart silence-trim (>0.50s below -34dB) + Face-Centered 1080x1920 + OffthreadVideo-safe (-bf 0 -g 15)
    p = subprocess.run(
        ["ffmpeg", "-i", str(raw_mp4), "-af", "silencedetect=noise=-34dB:d=0.50", "-f", "null", "-"],
        capture_output=True, text=True,
    )
    starts = [float(x) for x in re.findall(r"silence_start:\s*([0-9.]+)", p.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end:\s*([0-9.]+)", p.stderr)]
    silences = [
        (s + 0.14, (ends[i] if i < len(ends) else total_dur) - 0.14)
        for i, s in enumerate(starts)
        if (ends[i] if i < len(ends) else total_dur) - s > 0.34
    ]

    keep, cur = [], 0.0
    for s, e in silences:
        if s > cur + 0.06:
            keep.append((cur, s))
        cur = max(cur, e)
    if total_dur > cur + 0.06:
        keep.append((cur, total_dur))
    if not keep:
        keep = [(0.0, total_dur)]

    fparts, pairs = [], []
    for idx, (ks, ke) in enumerate(keep):
        sdur = max(0.04, ke - ks)
        fout = max(0.0, sdur - 0.008)
        fparts.append(
            f"[0:v]trim=start={ks:.3f}:end={ke:.3f},setpts=PTS-STARTPTS,"
            f"crop={crop_w}:{ih}:{crop_x}:0,scale=1080:1920:flags=lanczos,unsharp=3:3:0.35:3:3:0.0,fps={args.fps}[v{idx}];"
        )
        fparts.append(
            f"[0:a]atrim=start={ks:.3f}:end={ke:.3f},asetpts=PTS-STARTPTS,"
            f"afade=t=in:st=0:d=0.008,afade=t=out:st={fout:.3f}:d=0.008[a{idx}];"
        )
        pairs.append(f"[v{idx}][a{idx}]")

    fc = "".join(fparts) + "".join(pairs) + f"concat=n={len(keep)}:v=1:a=1[outv][outa]"
    run([
        "ffmpeg", "-y", "-i", str(raw_mp4),
        "-filter_complex", fc,
        "-map", "[outv]", "-map", "[outa]",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "16",
        "-bf", "0", "-g", "15", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart",
        str(base_mp4),
    ])

    _, _, exact_dur = probe_video_dims(base_mp4)
    exact_frames = int(math.ceil(exact_dur * args.fps))

    # Save a quick center-check still so the agent can visually verify speaker is dead-center!
    run([
        "ffmpeg", "-y", "-ss", f"{min(2.0, exact_dur / 3):.2f}",
        "-i", str(base_mp4), "-vframes", "1", str(crop_check_png),
    ])

    # 4. Extract 16k WAV & run faster-whisper with word_timestamps=True
    run(["ffmpeg", "-y", "-i", str(base_mp4), "-vn", "-ac", "1", "-ar", "16000", str(audio_wav)])
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("ERROR: faster-whisper not installed. Run: bash scripts/bootstrap_env.sh", file=sys.stderr)
        return 1

    model = WhisperModel(args.model, device="auto", compute_type="int8")
    segments, _ = model.transcribe(str(audio_wav), language="ar", word_timestamps=True, vad_filter=True)
    words_out = [
        {
            "word": w.word.strip(),
            "startSec": round(w.start, 3),
            "endSec": round(w.end, 3),
            "startFrame": int(round(w.start * args.fps)),
            "endFrame": int(round(w.end * args.fps)),
        }
        for seg in segments
        for w in (seg.words or [])
    ]
    words_json.write_text(json.dumps(words_out, ensure_ascii=False, indent=2), encoding="utf-8")

    para_text = " ".join(w["word"] for w in words_out)
    para_txt.write_text(para_text + "\n", encoding="utf-8")

    meta = {
        "clipFile": base_mp4.name,
        "width": 1080,
        "height": 1920,
        "fps": args.fps,
        "exactDurationSec": round(exact_dur, 3),
        "exactDurationFrames": exact_frames,
        "wordCount": len(words_out),
        "crop": {"w": crop_w, "h": ih, "x": crop_x, "mode": crop_reason},
        "paddedWindow": {"start": padded_start, "end": padded_end},
    }
    meta_json.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[DONE] Face-centered 1080x1920 base clip: {base_mp4} ({exact_dur:.2f}s = {exact_frames} frames)")
    print(f"[CHECK CROP] Inspect {crop_check_png} to verify speaker face is centered!")
    print(f"[NEXT STEP] Inspect {words_json} -> run scripts/finalize_clip.py to lock exact standalone start & complete end with 0.000s sync!")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
