import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { QABAS_COLORS as C } from "../theme";

/**
 * 3 Harmonious Silky Motion Cadences (ZERO bounce, ZERO blur, ZERO horizontal layout shift):
 * - LINE_GLIDE: Whole phrase glides in smoothly as one composed unit, with soft active-word focus.
 * - WORD_FLOW_LOCKED: Words stay 100% locked in their exact RTL slots from frame 0 and glide into
 *   view smoothly word-by-word with Easing.out(Easing.cubic).
 * - TWO_BEAT_EDITORIAL: Setup line enters first, then bold/calligraphic hero words glide in on beat 2.
 */
export type CaptionMotionMode = "LINE_GLIDE" | "WORD_FLOW_LOCKED" | "TWO_BEAT_EDITORIAL";

/**
 * Complete 19-Style Approved Qabas Caption Library (C01 - C19) + Backwards-Compatible Aliases:
 * Pick ONE cohesive family per Reel (do NOT mix clashing surfaces inside a single Reel).
 * Every style enforces:
 *   - Base fontWeight >= 500 (never thin/faint Light 300 over live video)
 *   - Zero dark halo / smudge behind text (always pair with SeamlessBottomVignette)
 *   - Zero horizontal layout shift & silky cubic ease-out entry / ease-in exit
 *   - Zero Arabic clipping (overflow: visible + generous lineHeight & padding)
 *   - CPU-fast frosted glass styling (NO slow software backdropFilter Gaussian blur!)
 */
export type CaptionSurfaceVariant =
  | "EDITORIAL_CLEAN"        // Alias for C01_DUO_EDITORIAL
  | "CRISP_STROKED_GOLD"     // Alias for C19_CRISP_STROKED_GOLD
  | "C01_DUO_EDITORIAL"      // IBM Plex Medium 500 + Amiri Bold / Lalezar Honey Gold hero
  | "C02_ACTIVE_WORD_BOX"    // Burgundy/Emerald pill highlights ONLY the spoken word in place
  | "C03_SOFT_FOCUS_LYRIC"   // Calm translucent words illuminating to crisp 100% on speech
  | "C04_BURGUNDY_TAPE"      // Tilted Wine Burgundy 3D tape strip for 2-4 impact words
  | "C05_FROSTED_GLASS_PILL" // Clean frosted glass capsule (CPU-fast sheen, zero blur lag)
  | "C06_CINEMA_GOLDEN_SERIF"// Warm Amiri Bold creamy-gold serif with soft cinema shadow
  | "C07_RUQAH_SIDE_CASCADE" // Right-aligned ArefRuqaa Bold calligraphic cascade
  | "C08_HIGHLIGHTER_SWEEP"  // Animated Honey Gold / Burgundy marker bar under hero/active word
  | "C09_STACKED_HIERARCHY"  // Setup line stacked cleanly above bold Tajawal ExtraBold main line
  | "C10_PARCHMENT_STRIP"    // Tilted Cream Stone paper cutout strip with Obsidian + Burgundy ink
  | "C11_SINGLE_WORD_PUNCH"  // Oversized Lalezar/Almarai ExtraBold impact (silky cubic scale)
  | "C12_SCRIPT_SANS_POETIC" // Almarai Bold paired with poetic Gulzar golden hero word
  | "C13_TRI_FONT_LOCKUP"    // IBM Plex Medium + oversized Lalezar hero + Gulzar gold accent
  | "C14_OVERSIZED_ANCHOR"   // Dramatic size contrast: subtle whisperTop + massive Lalezar/Rakkas
  | "C15_CALLIGRAPHIC_SLASH" // Almarai ExtraBold white + tilted (-4deg) ArefRuqaa Gold hero
  | "C16_MAGAZINE_SPINE"     // Right-aligned pull-quote with vertical Gold/Burgundy editorial spine
  | "C17_CONTRAST_SANDWICH"  // Whisper top + bold Lalezar inside Emerald/Burgundy ribbon
  | "C18_EMERALD_GLASS_CARD" // Translucent Emerald Pine frosted card + thin Honey Gold hairline
  | "C19_CRISP_STROKED_GOLD";// Signature First-Video Favorite: paint-order stroke fill + Ruqaa/Amiri Gold

export interface EditorialWord {
  word: string;
  startFrame: number;
  endFrame: number;
  hero?: boolean;
  /** Optional secondary poetic/accent highlight (used in C13 Tri-Font Lockup) */
  poetic?: boolean;
}

export interface EditorialPhraseItem {
  words: EditorialWord[];
  mode: CaptionMotionMode;
  variant?: CaptionSurfaceVariant;
  whisperTop?: string;
  accentTone?: "burgundy" | "emerald" | "gold";
}

export interface EditorialCaptionProps {
  words: EditorialWord[];
  mode: CaptionMotionMode;
  variant?: CaptionSurfaceVariant;
  whisperTop?: string;
  /** Optional accent color override for pills/ribbons/spines ("burgundy" | "emerald" | "gold") */
  accentTone?: "burgundy" | "emerald" | "gold";
  /** Hard exclusive end frame (prevents overlap with next phrase; managed automatically by EditorialCaptionTrack) */
  hardEndFrame?: number;
}

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);

/**
 * Full-Frame Seamless Bottom Cinema Vignette:
 * Place ONCE over the speaker video layer (below captions).
 * Completely invisible as a box or halo — looks like natural studio lighting falloff.
 */
export const SeamlessBottomVignette: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      height: "46%",
      pointerEvents: "none",
      background:
        "linear-gradient(to top, rgba(8, 7, 6, 0.72) 0%, rgba(8, 7, 6, 0.42) 38%, rgba(8, 7, 6, 0.14) 68%, rgba(8, 7, 6, 0) 100%)",
    }}
  />
);

function normalizeVariant(v: CaptionSurfaceVariant): CaptionSurfaceVariant {
  if (v === "EDITORIAL_CLEAN") return "C01_DUO_EDITORIAL";
  if (v === "CRISP_STROKED_GOLD") return "C19_CRISP_STROKED_GOLD";
  return v;
}

/**
 * MANDATORY ZERO-OVERLAP CAPTION COORDINATOR:
 * Always use <EditorialCaptionTrack /> in every Reel instead of mapping <EditorialCaption /> directly!
 * Guarantees:
 *   1. MATHEMATICAL MUTUAL EXCLUSION: At most ONE phrase can ever render on any frame (ZERO double-text collision!).
 *   2. AUTOMATIC TYPOGRAPHY-SCENE SUPPRESSION: Pass `hideRanges={[[start1, end1], ...]}` for full-screen
 *      typography scenes so captions automatically hide during those frames.
 */
export const EditorialCaptionTrack: React.FC<{
  phrases: EditorialPhraseItem[];
  defaultVariant?: CaptionSurfaceVariant;
  defaultAccentTone?: "burgundy" | "emerald" | "gold";
  /** MANDATORY: Array of [startFrame, endFrame] ranges for ALL typography scenes (BOTH full-screen AND overlay scenes 01/02/03/15) so NEVER two captions appear at once! */
  hideRanges?: [number, number][];
}> = ({
  phrases,
  defaultVariant = "C01_DUO_EDITORIAL",
  defaultAccentTone = "burgundy",
  hideRanges = [],
}) => {
  const frame = useCurrentFrame();

  // Hide captions automatically during full-screen typography scenes
  for (const [hs, he] of hideRanges) {
    if (frame >= hs && frame < he) {
      return null;
    }
  }

  // Sort phrases by startFrame and compute strictly non-overlapping exclusive windows
  const sorted = phrases
    .filter((p) => p.words.length > 0)
    .slice()
    .sort((a, b) => a.words[0].startFrame - b.words[0].startFrame);

  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    const start = cur.words[0].startFrame;
    const rawEnd = cur.words[cur.words.length - 1].endFrame;
    const nextStart = i + 1 < sorted.length ? sorted[i + 1].words[0].startFrame : Infinity;

    // Hard clamp: current phrase MUST be completely gone BEFORE nextStart!
    const hardEnd = Math.min(rawEnd + 8, nextStart);

    if (frame >= start && frame < hardEnd) {
      return (
        <EditorialCaption
          words={cur.words}
          mode={cur.mode}
          variant={cur.variant ?? defaultVariant}
          whisperTop={cur.whisperTop}
          accentTone={cur.accentTone ?? defaultAccentTone}
          hardEndFrame={hardEnd}
        />
      );
    }
  }

  return null;
};

export const EditorialCaption: React.FC<EditorialCaptionProps> = ({
  words,
  mode,
  variant = "C01_DUO_EDITORIAL",
  whisperTop,
  accentTone = "burgundy",
  hardEndFrame,
}) => {
  const frame = useCurrentFrame();
  if (!words.length) return null;

  const styleId = normalizeVariant(variant);
  const phraseStart = words[0].startFrame;
  const phraseEnd = words[words.length - 1].endFrame;

  const ENTRY_DUR = 9;
  const DEFAULT_EXIT_DUR = 7;

  const effectiveEnd = hardEndFrame !== undefined ? hardEndFrame : phraseEnd + DEFAULT_EXIT_DUR;

  // Strict exclusive bounds: [phraseStart, effectiveEnd) — never bleeds into previous/next phrase!
  if (frame < phraseStart || frame >= effectiveEnd) {
    return null;
  }

  const availableTail = Math.max(0, effectiveEnd - phraseStart);
  const actualExitDur = Math.min(DEFAULT_EXIT_DUR, Math.max(2, Math.floor(availableTail / 3)));
  const exitStart = Math.max(phraseStart, effectiveEnd - actualExitDur);

  const enterT = interpolate(frame, [phraseStart, phraseStart + ENTRY_DUR], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });

  const exitT = interpolate(frame, [exitStart, effectiveEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_IN,
  });

  const phraseOpacity = (mode === "LINE_GLIDE" ? enterT : 1) * (1 - exitT);
  const rawPhraseY =
    (mode === "LINE_GLIDE" ? interpolate(enterT, [0, 1], [16, 0]) : 0) +
    interpolate(exitT, [0, 1], [0, -10]);
  const phraseY = Math.abs(rawPhraseY) < 0.5 ? 0 : Math.round(rawPhraseY);

  const whisperOpacity =
    interpolate(frame, [phraseStart, phraseStart + 8], [0, 0.96], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_OUT,
    }) *
    (1 - exitT);
  const rawWhisperY =
    interpolate(frame, [phraseStart, phraseStart + 8], [10, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: EASE_OUT,
    }) + interpolate(exitT, [0, 1], [0, -8]);
  const whisperY = Math.abs(rawWhisperY) < 0.5 ? 0 : Math.round(rawWhisperY);

  const isStroked = styleId === "C19_CRISP_STROKED_GOLD";
  const isRightAligned =
    styleId === "C07_RUQAH_SIDE_CASCADE" ||
    styleId === "C16_MAGAZINE_SPINE" ||
    (isStroked && mode === "TWO_BEAT_EDITORIAL");

  const accentHex =
    accentTone === "emerald"
      ? C.emeraldPine[500]
      : accentTone === "gold"
        ? C.honeyGold[500]
        : C.wineBurgundy[500];

  // Container surface styles (all CPU-fast — ZERO heavy backdropFilter Gaussian blur!)
  const getSurfaceBoxStyle = (): React.CSSProperties => {
    switch (styleId) {
      case "C04_BURGUNDY_TAPE":
        return {
          backgroundColor: accentTone === "emerald" ? C.emeraldPine[700] : C.wineBurgundy[700],
          padding: "16px 36px",
          borderRadius: 8,
          transform: `translateY(${phraseY}px) rotate(-1.5deg)`,
          boxShadow: "10px 12px 0px rgba(18, 16, 14, 0.45)",
        };
      case "C05_FROSTED_GLASS_PILL":
        return {
          background:
            "linear-gradient(135deg, rgba(28, 25, 22, 0.78) 0%, rgba(18, 16, 14, 0.86) 100%)",
          border: "1.5px solid rgba(250, 246, 238, 0.34)",
          padding: "16px 34px",
          borderRadius: 28,
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
          transform: `translateY(${phraseY}px)`,
        };
      case "C10_PARCHMENT_STRIP":
        return {
          backgroundColor: C.creamStone[100],
          padding: "16px 36px",
          borderRadius: 6,
          border: `1.5px solid ${C.creamStone[300]}`,
          transform: `translateY(${phraseY}px) rotate(1.1deg)`,
          boxShadow: "0 14px 32px rgba(18, 16, 14, 0.36)",
        };
      case "C16_MAGAZINE_SPINE":
        return {
          borderRight: `6px solid ${accentTone === "burgundy" ? C.wineBurgundy[500] : C.honeyGold[500]}`,
          paddingRight: 24,
          paddingLeft: 12,
          paddingTop: 6,
          paddingBottom: 6,
          transform: `translateY(${phraseY}px)`,
        };
      case "C17_CONTRAST_SANDWICH":
        return {
          backgroundColor: accentTone === "burgundy" ? C.wineBurgundy[700] : C.emeraldPine[700],
          padding: "12px 34px",
          borderRadius: 12,
          border: `1.5px solid rgba(240, 213, 138, 0.45)`,
          boxShadow: "0 10px 26px rgba(0, 0, 0, 0.34)",
          transform: `translateY(${phraseY}px)`,
        };
      case "C18_EMERALD_GLASS_CARD":
        return {
          background:
            "linear-gradient(145deg, rgba(24, 78, 63, 0.90) 0%, rgba(11, 41, 32, 0.93) 100%)",
          border: `1.5px solid rgba(240, 213, 138, 0.48)`,
          padding: "18px 34px",
          borderRadius: 22,
          boxShadow: "0 14px 36px rgba(7, 31, 24, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.14)",
          transform: `translateY(${phraseY}px)`,
        };
      default:
        return {
          transform: `translateY(${phraseY}px)`,
        };
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "71%",
        left: "7%",
        right: "13%", // Keeps right 12%+ clear for Reels/Shorts action icons
        display: "flex",
        flexDirection: "column",
        alignItems: isRightAligned ? "flex-start" : "center",
        justifyContent: "center",
        direction: "rtl",
        pointerEvents: "none",
        overflow: "visible",
      }}
    >
      {whisperTop && (
        <div
          style={{
            fontFamily:
              styleId === "C16_MAGAZINE_SPINE"
                ? "ReemKufi"
                : isStroked || styleId === "C09_STACKED_HIERARCHY"
                  ? "Almarai"
                  : "IBMPlexArabic",
            fontWeight: isStroked || styleId === "C09_STACKED_HIERARCHY" ? 700 : 500,
            fontSize: isStroked ? 44 : styleId === "C14_OVERSIZED_ANCHOR" ? 36 : 38,
            color:
              styleId === "C16_MAGAZINE_SPINE"
                ? C.honeyGold[300]
                : isStroked
                  ? "#FFFFFF"
                  : C.creamStone[300],
            opacity: whisperOpacity,
            transform: whisperY === 0 ? "none" : `translateY(${whisperY}px)`,
            marginBottom: 10,
            WebkitTextStroke: isStroked ? "5px #12100E" : undefined,
            paintOrder: isStroked ? "stroke fill" : undefined,
            textShadow: isStroked
              ? "0 4px 14px rgba(0, 0, 0, 0.55)"
              : "0 2px 10px rgba(0, 0, 0, 0.52)",
          }}
        >
          {whisperTop}
        </div>
      )}

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: isRightAligned ? "flex-start" : "center",
          alignItems: "baseline",
          gap: "10px 20px",
          lineHeight:
            styleId === "C07_RUQAH_SIDE_CASCADE" ||
            styleId === "C12_SCRIPT_SANS_POETIC" ||
            styleId === "C13_TRI_FONT_LOCKUP" ||
            styleId === "C15_CALLIGRAPHIC_SLASH"
              ? 1.66
              : 1.48,
          opacity: phraseOpacity,
          overflow: "visible",
          ...getSurfaceBoxStyle(),
        }}
      >
        {words.map((item, idx) => {
          const isHero = Boolean(item.hero);
          const isPoetic = Boolean(item.poetic);
          const isSpoken = frame >= item.startFrame;
          const isCurrentlyActive = frame >= item.startFrame && frame <= item.endFrame + 2;

          const wordEnterT =
            mode === "WORD_FLOW_LOCKED"
              ? interpolate(frame, [item.startFrame, item.startFrame + 8], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE_OUT,
                })
              : mode === "TWO_BEAT_EDITORIAL"
                ? interpolate(
                    frame,
                    [
                      isHero ? phraseStart + 7 : phraseStart,
                      (isHero ? phraseStart + 7 : phraseStart) + 9,
                    ],
                    [0, 1],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT }
                  )
                : 1;

          const rawWordY =
            mode === "WORD_FLOW_LOCKED" || mode === "TWO_BEAT_EDITORIAL"
              ? interpolate(wordEnterT, [0, 1], [12, 0])
              : 0;
          const wordY = Math.abs(rawWordY) < 0.5 ? 0 : Math.round(rawWordY);

          const punchScale =
            styleId === "C11_SINGLE_WORD_PUNCH"
              ? interpolate(wordEnterT, [0, 1], [0.92, 1])
              : 1;

          const highlightT =
            styleId === "C08_HIGHLIGHTER_SWEEP" && (isHero || isCurrentlyActive)
              ? interpolate(frame, [item.startFrame, item.startFrame + 9], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: EASE_OUT,
                })
              : 0;

          const focusOpacity =
            styleId === "C03_SOFT_FOCUS_LYRIC"
              ? isSpoken
                ? 1
                : 0.56
              : mode === "LINE_GLIDE"
                ? isSpoken
                  ? 1
                  : 0.8
                : wordEnterT;

          let fontFamily = "IBMPlexArabic";
          let fontWeight: number = 500;
          let fontSize = 52;
          let color = "#FFFFFF";
          let extraTransform = "";

          switch (styleId) {
            case "C01_DUO_EDITORIAL":
              fontFamily = isHero
                ? mode === "TWO_BEAT_EDITORIAL"
                  ? "Lalezar"
                  : "Amiri"
                : "IBMPlexArabic";
              fontWeight = isHero ? (mode === "TWO_BEAT_EDITORIAL" ? 400 : 700) : 500;
              fontSize = isHero ? (mode === "TWO_BEAT_EDITORIAL" ? 84 : 68) : 52;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C02_ACTIVE_WORD_BOX":
              fontFamily = "Tajawal";
              fontWeight = isCurrentlyActive || isHero ? 800 : 700;
              fontSize = 54;
              color = isCurrentlyActive ? "#FFFFFF" : C.creamStone[100];
              break;

            case "C03_SOFT_FOCUS_LYRIC":
              fontFamily = isHero ? "Amiri" : "IBMPlexArabic";
              fontWeight = isHero ? 700 : 500;
              fontSize = isHero ? 64 : 52;
              color = isSpoken ? (isHero ? C.honeyGold[300] : "#FFFFFF") : C.creamStone[300];
              break;

            case "C04_BURGUNDY_TAPE":
              fontFamily = "Almarai";
              fontWeight = 800;
              fontSize = isHero ? 64 : 56;
              color = isHero ? C.honeyGold[300] : C.creamStone[100];
              break;

            case "C05_FROSTED_GLASS_PILL":
              fontFamily = isHero ? "Almarai" : "IBMPlexArabic";
              fontWeight = isHero ? 800 : 500;
              fontSize = isHero ? 58 : 50;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C06_CINEMA_GOLDEN_SERIF":
              fontFamily = "Amiri";
              fontWeight = 700;
              fontSize = isHero ? 74 : 60;
              color = isHero ? C.honeyGold[300] : C.creamStone[100];
              break;

            case "C07_RUQAH_SIDE_CASCADE":
              fontFamily = "ArefRuqaa";
              fontWeight = 700;
              fontSize = isHero ? 78 : 62;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C08_HIGHLIGHTER_SWEEP":
              fontFamily = isHero ? "Almarai" : "Tajawal";
              fontWeight = isHero ? 800 : 700;
              fontSize = isHero ? 60 : 52;
              color = "#FFFFFF";
              break;

            case "C09_STACKED_HIERARCHY":
              fontFamily = "Tajawal";
              fontWeight = 800;
              fontSize = isHero ? 72 : 60;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C10_PARCHMENT_STRIP":
              fontFamily = isHero ? "Almarai" : "IBMPlexArabic";
              fontWeight = isHero ? 800 : 700;
              fontSize = isHero ? 60 : 52;
              color = isHero ? C.wineBurgundy[500] : C.obsidianCharcoal[700];
              break;

            case "C11_SINGLE_WORD_PUNCH":
              fontFamily = "Lalezar";
              fontWeight = 400;
              fontSize = isHero ? 96 : 82;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C12_SCRIPT_SANS_POETIC":
              fontFamily = isHero ? "Gulzar" : "Almarai";
              fontWeight = isHero ? 400 : 700;
              fontSize = isHero ? 74 : 52;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C13_TRI_FONT_LOCKUP":
              fontFamily = isHero ? "Lalezar" : isPoetic ? "Gulzar" : "IBMPlexArabic";
              fontWeight = isHero || isPoetic ? 400 : 500;
              fontSize = isHero ? 84 : isPoetic ? 68 : 50;
              color = isHero ? C.honeyGold[300] : isPoetic ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C14_OVERSIZED_ANCHOR":
              fontFamily = isHero ? "Lalezar" : "Rakkas";
              fontWeight = 400;
              fontSize = isHero ? 92 : 76;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C15_CALLIGRAPHIC_SLASH":
              fontFamily = isHero ? "ArefRuqaa" : "Almarai";
              fontWeight = isHero ? 700 : 800;
              fontSize = isHero ? 76 : 54;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              if (isHero) extraTransform = " rotate(-4deg)";
              break;

            case "C16_MAGAZINE_SPINE":
              fontFamily = isHero ? "Amiri" : "IBMPlexArabic";
              fontWeight = isHero ? 700 : 500;
              fontSize = isHero ? 68 : 52;
              color = isHero ? C.honeyGold[300] : "#FFFFFF";
              break;

            case "C17_CONTRAST_SANDWICH":
              fontFamily = isHero ? "Lalezar" : "Almarai";
              fontWeight = isHero ? 400 : 700;
              fontSize = isHero ? 74 : 54;
              color = isHero ? C.honeyGold[300] : C.creamStone[100];
              break;

            case "C18_EMERALD_GLASS_CARD":
              fontFamily = isHero ? "Amiri" : "IBMPlexArabic";
              fontWeight = isHero ? 700 : 500;
              fontSize = isHero ? 64 : 50;
              color = isHero ? C.honeyGold[300] : C.creamStone[100];
              break;

            case "C19_CRISP_STROKED_GOLD":
              fontFamily = isHero
                ? mode === "TWO_BEAT_EDITORIAL"
                  ? "ArefRuqaa"
                  : "Amiri"
                : "Almarai";
              fontWeight = 700;
              fontSize = isHero ? (mode === "TWO_BEAT_EDITORIAL" ? 92 : 74) : 58;
              color = isHero ? "#F5C842" : "#FFFFFF";
              break;
          }

          const isLightSurface = styleId === "C10_PARCHMENT_STRIP";

          return (
            <span
              key={`${item.word}-${idx}`}
              style={{
                position: "relative",
                display: "inline-block",
                fontFamily,
                fontWeight,
                fontSize,
                color,
                opacity: focusOpacity,
                transform: wordY === 0 && punchScale === 1 && !extraTransform ? "none" : `translateY(${wordY}px)${punchScale !== 1 ? ` scale(${punchScale.toFixed(3)})` : ""}${extraTransform}`,
                WebkitTextStroke: isStroked ? (isHero ? "8px #12100E" : "6px #12100E") : undefined,
                paintOrder: isStroked ? "stroke fill" : undefined,
                textShadow: isLightSurface
                  ? "none"
                  : isStroked
                    ? "0 5px 16px rgba(0, 0, 0, 0.55)"
                    : "0 3px 12px rgba(0, 0, 0, 0.50)",
                padding: styleId === "C02_ACTIVE_WORD_BOX" ? "4px 16px" : "4px 6px",
                borderRadius: styleId === "C02_ACTIVE_WORD_BOX" ? 12 : undefined,
                backgroundColor:
                  styleId === "C02_ACTIVE_WORD_BOX" && isCurrentlyActive
                    ? accentHex
                    : "transparent",
                transition: "none",
              }}
            >
              {styleId === "C08_HIGHLIGHTER_SWEEP" && highlightT > 0 && (
                <span
                  style={{
                    position: "absolute",
                    right: 2,
                    bottom: 8,
                    height: 12,
                    width: `${highlightT * 96}%`,
                    backgroundColor:
                      accentTone === "burgundy"
                        ? "rgba(126, 31, 50, 0.82)"
                        : "rgba(214, 159, 52, 0.72)",
                    borderRadius: 4,
                    zIndex: -1,
                  }}
                />
              )}
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
