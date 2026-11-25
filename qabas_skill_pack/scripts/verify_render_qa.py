#!/usr/bin/env python3
"""
Ultra-Fast Single-Bundle Visual QA Frame Extractor for Qabas Remotion Studio.

SPEED FIX (20x faster than looping `npx remotion still src/index.ts`):
- Reuses a pre-built Webpack bundle (`--bundle-dir ./build`, or builds ONCE automatically).
- Launches ONE browser instance via `@remotion/renderer` (`selectComposition` + `renderStill`)
  to capture ALL QA stills in ~5-10 seconds total instead of re-bundling per frame!
"""
import argparse
import json
import os
import subprocess
from pathlib import Path

NODE_STILL_RUNNER = r"""
const path = require("path");
const { selectComposition, renderStill, openBrowser } = require("@remotion/renderer");

(async () => {
  const bundleDir = process.argv[2];
  const compId = process.argv[3];
  const outDir = process.argv[4];
  const frames = JSON.parse(process.argv[5]);

  const browser = await openBrowser("chrome", {
    chromiumOptions: { gl: "swangle" },
  });

  try {
    const composition = await selectComposition({
      serveUrl: bundleDir,
      id: compId,
      puppeteerInstance: browser,
    });

    for (let i = 0; i < frames.length; i++) {
      const f = Number(frames[i]);
      const outPng = path.join(outDir, `qa_${String(i + 1).padStart(2, "0")}_f${f}.png`);
      console.log(`>>> Capturing QA frame ${f} -> ${path.basename(outPng)}`);
      await renderStill({
        composition,
        serveUrl: bundleDir,
        output: outPng,
        frame: f,
        imageFormat: "png",
        puppeteerInstance: browser,
      });
    }
  } finally {
    await browser.close({ silent: false });
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Capture multiple QA stills from a SINGLE Remotion bundle + browser.")
    parser.add_argument("--studio", required=True, help="Path to remotion_studio directory")
    parser.add_argument("--comp", required=True, help="Remotion Composition ID")
    parser.add_argument("--frames", required=True, help="Comma-separated frame numbers (e.g. 15,240,600,1100,1500)")
    parser.add_argument("--out-dir", required=True, help="Output directory for PNG stills")
    parser.add_argument("--bundle-dir", default="", help="Optional existing Remotion bundle dir (default: <studio>/build)")
    parser.add_argument("--rebuild", action="store_true", help="Force rebuilding Webpack bundle even if bundle-dir exists")
    args = parser.parse_args()

    studio = Path(args.studio).resolve()
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    bundle_dir = Path(args.bundle_dir).resolve() if args.bundle_dir else (studio / "build")

    env = os.environ.copy()
    env["NODE_OPTIONS"] = "--dns-result-order=ipv4first"

    if args.rebuild or not (bundle_dir / "index.html").exists():
        print(f">>> Building Remotion bundle ONCE -> {bundle_dir}")
        subprocess.run(
            ["npx", "remotion", "bundle", "src/index.ts", "--out-dir", str(bundle_dir)],
            cwd=str(studio),
            env=env,
            check=True,
        )

    frames = [int(f.strip()) for f in args.frames.split(",") if f.strip()]
    subprocess.run(
        ["node", "-e", NODE_STILL_RUNNER, str(bundle_dir), args.comp, str(out_dir), json.dumps(frames)],
        cwd=str(studio),
        env=env,
        check=True,
    )

    print(f"\n[QA STILLS READY] Captured {len(frames)} PNGs in ONE pass -> {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
