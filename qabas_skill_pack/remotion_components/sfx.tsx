import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

/**
 * Typed catalog of ALL 11 bundled organic SFX files in public/sfx/ (copied from skill/sfx/).
 * Each entry includes its exact filename and its approved subtle mix volume (0.08 - 0.12).
 */
export const QABAS_SFX = {
  airWhooshSoft: { file: "sfx/01_air_whoosh_soft.wav", volume: 0.1 },
  airWhooshDeep: { file: "sfx/02_air_whoosh_deep.wav", volume: 0.11 },
  warmSubSwell: { file: "sfx/03_warm_sub_swell.wav", volume: 0.12 },
  paperBrushSoft: { file: "sfx/04_paper_brush_soft.wav", volume: 0.1 },
  markerGlideSoft: { file: "sfx/05_marker_glide_soft.wav", volume: 0.11 },
  clothSwipeShort: { file: "sfx/06_cloth_swipe_short.wav", volume: 0.09 },
  softMutedTap: { file: "sfx/07_soft_muted_tap.wav", volume: 0.08 },
  gentleHeartbeat: { file: "sfx/08_gentle_heartbeat.wav", volume: 0.12 },
  subtleCameraShutter: { file: "sfx/09_subtle_camera_shutter.wav", volume: 0.09 },
  pencilSketchWrite: { file: "sfx/10_pencil_sketch_write.wav", volume: 0.1 },
  softBookPageThud: { file: "sfx/11_soft_book_page_thud.wav", volume: 0.11 },
} as const;

export type QabasSfxKey = keyof typeof QABAS_SFX;

/**
 * Drop-in subtle SFX cue helper.
 * Automatically enforces the Invisible SFX Law (volume capped <= 0.14).
 */
export const QabasSfxCue: React.FC<{
  sfx: QabasSfxKey;
  from: number;
  durationInFrames?: number;
  volume?: number;
}> = ({ sfx, from, durationInFrames = 45, volume }) => {
  const entry = QABAS_SFX[sfx];
  const safeVolume = Math.min(volume ?? entry.volume, 0.14);
  return (
    <Sequence from={from} durationInFrames={durationInFrames}>
      <Audio src={staticFile(entry.file)} volume={safeVolume} />
    </Sequence>
  );
};
