#!/usr/bin/env bash
# ==============================================================================
# Qabas Min Athar — Zero-to-One Automated Full HD Studio Bootstrapper (FINAL)
# Installs LATEST tools & copies ALL 18 coded scenes, ALL 19 coded caption styles,
# 16 Arabic fonts, 11 organic SFX + typed sfx.tsx, and starter tsconfig/index/Root.
# ==============================================================================
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_STUDIO="${1:-./remotion_studio}"

echo ">>> [1/5] Checking system tools (ffmpeg, ffprobe, python3, node, npm)..."
for cmd in ffmpeg ffprobe python3 node npm; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    if command -v apt-get >/dev/null 2>&1; then
      sudo apt-get update -y && sudo apt-get install -y ffmpeg python3 python3-pip nodejs npm || true
    fi
  fi
done

echo ">>> [2/5] Installing/upgrading LATEST yt-dlp, faster-whisper, and requests..."
python3 -m pip install --upgrade --quiet yt-dlp faster-whisper requests opencv-python-headless || \
  python3 -m pip install --upgrade --break-system-packages --quiet yt-dlp faster-whisper requests opencv-python-headless

echo ">>> [3/5] Initializing Full HD Remotion Studio at: $TARGET_STUDIO"
mkdir -p "$TARGET_STUDIO/src/components" "$TARGET_STUDIO/public/fonts" "$TARGET_STUDIO/public/sfx" "$TARGET_STUDIO/public/media"

cp "$SKILL_DIR/remotion_components/package.json.template" "$TARGET_STUDIO/package.json"
cp "$SKILL_DIR/remotion_components/remotion.config.ts" "$TARGET_STUDIO/remotion.config.ts"
cp "$SKILL_DIR/remotion_components/theme.ts" "$TARGET_STUDIO/src/theme.ts"
cp "$SKILL_DIR/remotion_components/fonts.ts" "$TARGET_STUDIO/src/fonts.ts"
cp "$SKILL_DIR/remotion_components/sfx.tsx" "$TARGET_STUDIO/src/sfx.tsx"
cp "$SKILL_DIR/remotion_components/QabasPrimitives.tsx" "$TARGET_STUDIO/src/components/QabasPrimitives.tsx"
cp "$SKILL_DIR/remotion_components/QabasSceneLibrary.tsx" "$TARGET_STUDIO/src/components/QabasSceneLibrary.tsx"
cp "$SKILL_DIR/remotion_components/EditorialCaption.tsx" "$TARGET_STUDIO/src/components/EditorialCaption.tsx"

if [ ! -f "$TARGET_STUDIO/tsconfig.json" ]; then
  cat << 'EOF' > "$TARGET_STUDIO/tsconfig.json"
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
fi

if [ ! -f "$TARGET_STUDIO/src/index.ts" ]; then
  cat << 'EOF' > "$TARGET_STUDIO/src/index.ts"
import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";

registerRoot(RemotionRoot);
EOF
fi

if [ ! -f "$TARGET_STUDIO/src/Root.tsx" ]; then
  cat << 'EOF' > "$TARGET_STUDIO/src/Root.tsx"
import React from "react";
import { Composition } from "remotion";

// Register your new Full HD (1080x1920 @ 30fps) Reel compositions here.
export const RemotionRoot: React.FC = () => {
  return <></>;
};
EOF
fi

echo ">>> [4/5] Copying ALL 16 bundled Arabic .ttf fonts & 11 organic .wav SFX..."
cp "$SKILL_DIR"/fonts/*.ttf "$TARGET_STUDIO/public/fonts/"
cp "$SKILL_DIR"/sfx/*.wav "$TARGET_STUDIO/public/sfx/"

echo ">>> [5/5] Installing LATEST Remotion packages & Chrome Headless Shell..."
cd "$TARGET_STUDIO"
export NODE_OPTIONS="--dns-result-order=ipv4first"
npm install --no-audit --no-fund
npx remotion browser ensure

echo "=============================================================================="
echo "SUCCESS! Qabas Full HD 1080x1920 Studio is ready at: $TARGET_STUDIO"
echo "Always run: export NODE_OPTIONS='--dns-result-order=ipv4first' before rendering."
echo "=============================================================================="
