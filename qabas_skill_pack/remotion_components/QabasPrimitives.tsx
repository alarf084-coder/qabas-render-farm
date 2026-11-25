import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { QABAS_COLORS as C } from "../theme";

const EASE_OUT = Easing.out(Easing.cubic);

/**
 * ZERO-CLIPPING, ZERO-JITTER MaskedRise:
 * Uses silky Easing.out(cubic) with integer-rounded pixel translation (snaps to transform: "none"
 * once settled so Arabic glyphs NEVER shiver/jitter on software renderers).
 */
export const MaskedRise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, distance = 36, style }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const y = p >= 0.99 ? 0 : Math.round(interpolate(p, [0, 1], [distance, 0]));
  const opacity = interpolate(p, [0, 0.45], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        overflow: "visible",
        padding: "28px 36px",
        margin: "-22px -30px",
        ...style,
      }}
    >
      <div style={{ transform: y === 0 ? "none" : `translateY(${y}px)`, opacity }}>{children}</div>
    </div>
  );
};

/**
 * Smooth SceneEnvelope:
 * Prevents harsh visual cuts between typography scenes and raw speaker footage.
 */
export const SceneEnvelope: React.FC<{
  children: React.ReactNode;
  durFrames: number;
  fadeFrames?: number;
}> = ({ children, durFrames, fadeFrames = 10 }) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [Math.max(fadeFrames, durFrames - fadeFrames), durFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>{children}</AbsoluteFill>;
};

export interface KineticWordToken {
  word: string;
  delayFrames: number;
  hero?: boolean;
  fontFamily?: string;
  color?: string;
  fontSize?: number;
}

/**
 * WordByWordFlow (For Arabic Typography Scenes — Zero Jitter, Zero Blur, Zero Bounce):
 * Animates Arabic words individually in locked RTL slots with integer-pixel cubic ease-out.
 */
export const WordByWordFlow: React.FC<{
  words: KineticWordToken[];
  baseFontFamily?: string;
  baseFontSize?: number;
  baseColor?: string;
  heroColor?: string;
  align?: "center" | "right";
}> = ({
  words,
  baseFontFamily = "IBMPlexArabic",
  baseFontSize = 54,
  baseColor = C.obsidianCharcoal[900],
  heroColor = C.wineBurgundy[500],
  align = "center",
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "baseline",
        gap: "14px 18px",
        direction: "rtl",
        lineHeight: 1.48,
        padding: "16px 20px",
        overflow: "visible",
      }}
    >
      {words.map((token, idx) => {
        const p = interpolate(frame, [token.delayFrames, token.delayFrames + 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: EASE_OUT,
        });
        const settled = p >= 0.99;
        const y = settled ? 0 : Math.round(interpolate(p, [0, 1], [22, 0]));

        return (
          <span
            key={`${token.word}-${idx}`}
            style={{
              display: "inline-block",
              fontFamily: token.fontFamily || (token.hero ? "Lalezar" : baseFontFamily),
              fontWeight: token.hero ? 400 : 500,
              fontSize: token.fontSize || (token.hero ? Math.round(baseFontSize * 1.45) : baseFontSize),
              color: token.color || (token.hero ? heroColor : baseColor),
              transform: settled ? "none" : `translateY(${y}px)`,
              opacity: p,
              padding: "4px 6px",
            }}
          >
            {token.word}
          </span>
        );
      })}
    </div>
  );
};

/**
 * ParchmentBackground (ZERO TEXT JITTER + CPU-Fast):
 * CRITICAL FIX: Background texture is a SIBLING layer behind {children} — NEVER apply
 * continuous `transform: scale()` to a parent wrapping Arabic text (which causes subpixel
 * glyph shivering on every frame in Chromium swangle!).
 */
export const ParchmentBackground: React.FC<{ children?: React.ReactNode; durFrames: number }> = ({
  children,
}) => {
  return (
    <AbsoluteFill style={{ direction: "rtl", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 22% 16%, ${C.creamStone[100]} 0%, ${C.creamStone[300]} 42%, ${C.creamStone[500]} 78%, ${C.creamStone[700]} 100%)`,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: "none",
          backgroundImage:
            "radial-gradient(rgba(82, 54, 37, 0.032) 1px, transparent 0), radial-gradient(circle at 82% 85%, rgba(196, 154, 128, 0.14) 0%, rgba(196, 154, 128, 0) 55%)",
          backgroundSize: "18px 18px, 100% 100%",
        }}
      />
      {/* Text/content sits on a rock-solid 1:1 unscaled integer-pixel layer = ZERO jitter! */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/**
 * EmeraldNightBackground (ZERO TEXT JITTER + CPU-Fast):
 * Background glow uses pure CSS radial-gradient on a sibling layer; {children} stays at
 * exact 1:1 integer pixel coordinates with ZERO subpixel text jitter!
 */
export const EmeraldNightBackground: React.FC<{ children?: React.ReactNode; durFrames: number }> = ({
  children,
}) => {
  return (
    <AbsoluteFill style={{ direction: "rtl", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 42%, ${C.emeraldPine[700]} 0%, ${C.emeraldPine[900]} 65%, ${C.obsidianCharcoal[900]} 100%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 960,
          height: 960,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(214, 159, 52, 0.14) 0%, rgba(214, 159, 52, 0.05) 42%, rgba(214, 159, 52, 0) 70%)",
          top: "18%",
          left: "4%",
          pointerEvents: "none",
        }}
      />
      {/* Text/content sits on a rock-solid 1:1 unscaled integer-pixel layer = ZERO jitter! */}
      <AbsoluteFill>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
