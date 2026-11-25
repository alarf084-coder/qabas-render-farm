#!/usr/bin/env bash
set -euo pipefail

JOB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(pwd)"
SKILL_DIR="$REPO_ROOT/qabas_skill_pack"
STUDIO_DIR="/tmp/qabas_studio"
YT_URL="https://www.youtube.com/watch?v=sLy8yMk2qcE"

echo ">>> [1/6] Installing latest yt-dlp & opencv-python-headless for 1-frame face check..."
python3 -m pip install --quiet --upgrade yt-dlp opencv-python-headless || \
  python3 -m pip install --quiet --break-system-packages --upgrade yt-dlp opencv-python-headless

echo ">>> [2/6] Setting up temporary Remotion studio from qabas_skill_pack..."
rm -rf "$STUDIO_DIR"
mkdir -p "$STUDIO_DIR/src/components" "$STUDIO_DIR/public/fonts" "$STUDIO_DIR/public/sfx" "$STUDIO_DIR/public/media"

cp "$SKILL_DIR/remotion_components/package.json.template" "$STUDIO_DIR/package.json"
cp "$SKILL_DIR/remotion_components/remotion.config.ts" "$STUDIO_DIR/remotion.config.ts"
cp "$SKILL_DIR/remotion_components/theme.ts" "$STUDIO_DIR/src/theme.ts"
cp "$SKILL_DIR/remotion_components/fonts.ts" "$STUDIO_DIR/src/fonts.ts"
cp "$SKILL_DIR/remotion_components/sfx.tsx" "$STUDIO_DIR/src/sfx.tsx"
cp "$SKILL_DIR/remotion_components/QabasPrimitives.tsx" "$STUDIO_DIR/src/components/QabasPrimitives.tsx"
cp "$SKILL_DIR/remotion_components/QabasSceneLibrary.tsx" "$STUDIO_DIR/src/components/QabasSceneLibrary.tsx"
cp "$SKILL_DIR/remotion_components/EditorialCaption.tsx" "$STUDIO_DIR/src/components/EditorialCaption.tsx"
cp "$SKILL_DIR"/fonts/*.ttf "$STUDIO_DIR/public/fonts/"
cp "$SKILL_DIR"/sfx/*.wav "$STUDIO_DIR/public/sfx/"

cat << 'EOF' > "$STUDIO_DIR/tsconfig.json"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": ["src"]
}
EOF

cat << 'EOF' > "$STUDIO_DIR/src/index.ts"
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
registerRoot(RemotionRoot);
EOF

cp "$JOB_DIR/src/"*.tsx "$STUDIO_DIR/src/"
cp "$JOB_DIR/src/face_pos.json" "$STUDIO_DIR/src/face_pos.json"

echo ">>> [3/6] Downloading ONLY the 2 exact 1080p sections via yt-dlp (Anti-Bot + Cookies support)..."
COOKIE_ARGS=()
if [ -n "${YOUTUBE_COOKIES:-}" ]; then
  printf "%s" "$YOUTUBE_COOKIES" > /tmp/cookies.txt
  COOKIE_ARGS=(--cookies /tmp/cookies.txt)
  echo "Using YOUTUBE_COOKIES secret."
fi

download_section() {
  local start_ts="$1"
  local end_ts="$2"
  local out_file="$3"
  local clients=("android,web" "ios,web" "tv_embedded,web" "visionos,web")
  for client in "${clients[@]}"; do
    echo "Trying yt-dlp section *${start_ts}-${end_ts} with player_client=${client}..."
    if yt-dlp --no-check-certificates \
      "${COOKIE_ARGS[@]}" \
      --extractor-args "youtube:player_client=${client}" \
      --download-sections "*${start_ts}-${end_ts}" \
      --force-keyframes-at-cuts \
      -f "137+bestaudio[ext=m4a]/bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" \
      --merge-output-format mp4 \
      -o "$out_file" \
      "$YT_URL"; then
      if [ -s "$out_file" ]; then
        echo "Downloaded $out_file successfully!"
        return 0
      fi
    fi
    rm -f "$out_file" "${out_file}.part"
  done
  echo "ERROR: All yt-dlp player_client fallbacks failed for ${start_ts}-${end_ts}" >&2
  return 1
}

download_section "00:48:08.500" "00:49:31.500" "$STUDIO_DIR/public/media/reel_01_raw.mp4"
download_section "00:08:15.700" "00:09:38.400" "$STUDIO_DIR/public/media/reel_02_raw.mp4"

echo ">>> [4/6] 1-Frame OpenCV Face Center Detection -> Exact CSS objectPosition (ZERO re-encoding!)..."
python3 - "$STUDIO_DIR/public/media/reel_01_raw.mp4" "$STUDIO_DIR/public/media/reel_02_raw.mp4" "$STUDIO_DIR/src/face_pos.json" << 'PYEOF'
import json, subprocess, sys
from pathlib import Path

r1_path, r2_path, out_json = sys.argv[1], sys.argv[2], Path(sys.argv[3])
defaults = json.loads(out_json.read_text(encoding="utf-8"))

def detect_css_x_pct(video_path: str, fallback: float) -> float:
    try:
        import cv2
        mid_img = f"/tmp/mid_{Path(video_path).stem}.jpg"
        subprocess.run(
            ["ffmpeg", "-y", "-ss", "20", "-i", video_path, "-vframes", "1", "-q:v", "2", mid_img],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
        img = cv2.imread(mid_img)
        if img is None:
            return fallback
        ih, iw = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        frontal = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"))
        faces = frontal.detectMultiScale(gray, scaleFactor=1.12, minNeighbors=5, minSize=(70, 70))
        if len(faces) == 0:
            profile = cv2.CascadeClassifier(str(Path(cv2.data.haarcascades) / "haarcascade_profileface.xml"))
            faces = profile.detectMultiScale(gray, scaleFactor=1.12, minNeighbors=5, minSize=(70, 70))
        if len(faces) > 0:
            fx, fy, fw, fh = max(faces, key=lambda b: b[2] * b[3])
            face_frac = (fx + fw / 2.0) / float(iw)
            # Exact CSS object-fit: cover math for 16:9 -> 9:16 (1080x1920)
            w_scaled = 1920.0 * (iw / float(ih))
            w_box = 1080.0
            overflow = max(1.0, w_scaled - w_box)
            css_pct = ((face_frac * w_scaled) - (w_box / 2.0)) / overflow * 100.0
            css_pct = round(max(0.0, min(100.0, css_pct)), 1)
            print(f"[FACE 1-FRAME] {Path(video_path).name}: face_cx={face_frac*100:.1f}% -> CSS objectPosition={css_pct}%")
            return css_pct
    except Exception as e:
        print(f"[FACE WARN] {e}; using fallback {fallback}%")
    return fallback

res = {
    "reel_01": detect_css_x_pct(r1_path, defaults["reel_01"]),
    "reel_02": detect_css_x_pct(r2_path, defaults["reel_02"]),
}
out_json.write_text(json.dumps(res, indent=2) + "\n", encoding="utf-8")
print("Final face_pos.json:", res)
PYEOF

echo ">>> [5/6] Installing Remotion & bundling ONCE..."
cd "$STUDIO_DIR"
export NODE_OPTIONS="--dns-result-order=ipv4first"
npm install --no-audit --no-fund
npx remotion browser ensure
npx remotion bundle src/index.ts --out-dir ./build

echo ">>> [6/6] Rendering Full HD 1080x1920 Master Reels into out/..."
mkdir -p "$REPO_ROOT/out"
npx remotion render ./build Reel01AlRida "$REPO_ROOT/out/reel_01_alrida.mp4" \
  --codec=h264 --crf=18 --x264-preset=fast \
  --image-format=jpeg --jpeg-quality=95 \
  --audio-bitrate=192k --concurrency=4

npx remotion render ./build Reel02AlIstikhara "$REPO_ROOT/out/reel_02_alistikhara.mp4" \
  --codec=h264 --crf=18 --x264-preset=fast \
  --image-format=jpeg --jpeg-quality=95 \
  --audio-bitrate=192k --concurrency=4

ls -lh "$REPO_ROOT/out/"
echo "=== ALL REELS RENDERED SUCCESSFULLY ==="
