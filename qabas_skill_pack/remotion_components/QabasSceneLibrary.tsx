import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { QABAS_COLORS as C } from "../theme";
import { EmeraldNightBackground, ParchmentBackground, SceneEnvelope } from "./QabasPrimitives";

/**
 * ==============================================================================
 * QABAS MIN ATHAR — COMPLETE 18-STYLE FULL HD (1080x1920) SCENE LIBRARY
 * ==============================================================================
 * Every single one of the 18 approved visual styles is coded and ready to import
 * so NO agent ever falls back to repeating the same 3-4 plain text templates!
 *
 * Excluded permanently by brand rules:
 *   - Style 18 (KineticGridTicker) — BANNED
 *   - Style 20 (AudioReactiveWaveform) — BANNED
 *
 * All components enforce:
 *   - Native 1080x1920 Full HD typography scale
 *   - Silky Easing.out(Easing.cubic) entry & 12-frame SceneEnvelope cross-dissolves
 *   - Zero channel logo & zero Arabic text/tashkeel clipping (padding + overflow: visible)
 * ==============================================================================
 */

const EASE_OUT = Easing.out(Easing.cubic);

const SmoothReveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}> = ({ children, delay = 0, distance = 26 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <div style={{ padding: "18px 24px", margin: "-14px -20px", overflow: "visible" }}>
      <div style={{ opacity: t, transform: t >= 0.99 ? "none" : `translateY(${Math.round(interpolate(t, [0, 1], [distance, 0]))}px)` }}>
        {children}
      </div>
    </div>
  );
};

/** STYLE 01 — SideNegativeStackScene (Overlay in negative space beside speaker) */
export const SideNegativeStackScene: React.FC<{
  durFrames: number;
  lines: { text: string; hero?: boolean; delay: number }[];
  side?: "right" | "left";
}> = ({ durFrames, lines, side = "right" }) => (
  <SceneEnvelope durFrames={durFrames} fadeFrames={10}>
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: side === "right" ? "flex-start" : "flex-end",
        padding: side === "right" ? "0 130px 260px 64px" : "0 64px 260px 130px",
        direction: "rtl",
        gap: 14,
        pointerEvents: "none",
      }}
    >
      {lines.map((ln, idx) => (
        <SmoothReveal key={idx} delay={ln.delay} distance={20}>
          <div
            style={{
              fontFamily: ln.hero ? "Lalezar" : "Almarai",
              fontWeight: ln.hero ? 400 : 700,
              fontSize: ln.hero ? 84 : 46,
              color: ln.hero ? "#F5C842" : "#FFFFFF",
              WebkitTextStroke: "6px #12100E",
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,0.55)",
              lineHeight: 1.35,
            }}
          >
            {ln.text}
          </div>
        </SmoothReveal>
      ))}
    </AbsoluteFill>
  </SceneEnvelope>
);

/** STYLE 02 — BehindSpeakerDepthScene (Giant subtle architectural watermark behind speaker/upper third) */
export const BehindSpeakerDepthScene: React.FC<{
  durFrames: number;
  giantWord: string;
  subline: string;
}> = ({ durFrames, giantWord, subline }) => {
  const frame = useCurrentFrame();
  const scaleT = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const scale = scaleT >= 0.99 ? 1 : interpolate(scaleT, [0, 1], [0.95, 1]);
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <AbsoluteFill
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          paddingTop: 180,
          direction: "rtl",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontFamily: "Lalezar",
            fontSize: 180,
            color: "rgba(250, 246, 238, 0.24)",
            transform: scale === 1 ? "none" : `scale(${scale.toFixed(3)})`,
            lineHeight: 1.1,
            textShadow: "0 14px 40px rgba(0,0,0,0.28)",
          }}
        >
          {giantWord}
        </div>
        <SmoothReveal delay={10} distance={16}>
          <div
            style={{
              fontFamily: "Almarai",
              fontWeight: 800,
              fontSize: 44,
              color: C.honeyGold[300],
              marginTop: -24,
              WebkitTextStroke: "5px #12100E",
              paintOrder: "stroke fill",
            }}
          >
            {subline}
          </div>
        </SmoothReveal>
      </AbsoluteFill>
    </SceneEnvelope>
  );
};

/** STYLE 03 — MinimalTopEditorialScene (Refined editorial chapter marker at upper safe zone) */
export const MinimalTopEditorialScene: React.FC<{
  durFrames: number;
  tag: string;
  headline: string;
}> = ({ durFrames, tag, headline }) => (
  <SceneEnvelope durFrames={durFrames} fadeFrames={10}>
    <AbsoluteFill
      style={{
        justifyContent: "flex-start",
        alignItems: "center",
        padding: "160px 80px 0",
        direction: "rtl",
        pointerEvents: "none",
      }}
    >
      <SmoothReveal delay={2} distance={14}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            padding: "14px 32px",
            borderRadius: 999,
            background: "linear-gradient(135deg, rgba(18, 16, 14, 0.86) 0%, rgba(12, 10, 9, 0.90) 100%)", boxShadow: "0 12px 32px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.14)",
            border: `2px solid ${C.honeyGold[500]}`,
          }}
        >
          <span style={{ fontFamily: "ReemKufi", fontWeight: 600, fontSize: 28, color: C.honeyGold[300] }}>{tag}</span>
          <span style={{ color: C.honeyGold[500] }}>•</span>
          <span style={{ fontFamily: "IBMPlexArabic", fontWeight: 700, fontSize: 32, color: C.creamStone[100] }}>{headline}</span>
        </div>
      </SmoothReveal>
    </AbsoluteFill>
  </SceneEnvelope>
);

/** STYLE 04 — BurgundyTapeImpactScene (Slanted 3D Wine Burgundy tape with golden edge & shadow) */
export const BurgundyTapeImpactScene: React.FC<{
  durFrames: number;
  eyebrow: string;
  tapeText: string;
  subline: string;
}> = ({ durFrames, eyebrow, tapeText, subline }) => {
  const frame = useCurrentFrame();
  const tapeT = interpolate(frame, [6, 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });

  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 76px", direction: "rtl", gap: 34 }}>
          <SmoothReveal delay={2} distance={18}>
            <div style={{ fontFamily: "ReemKufi", fontWeight: 600, fontSize: 38, color: C.emeraldPine[700] }}>{eyebrow}</div>
          </SmoothReveal>
          <div
            style={{
              backgroundColor: C.wineBurgundy[500],
              padding: "28px 56px",
              borderRadius: 12,
              transform: `rotate(-2.4deg) scale(${interpolate(tapeT, [0, 1], [0.92, 1])})`,
              opacity: tapeT,
              boxShadow: "14px 20px 44px rgba(43, 6, 14, 0.28), inset 0 2px 0 rgba(255,255,255,0.16)",
              borderBottom: `6px solid ${C.honeyGold[500]}`,
            }}
          >
            <div style={{ fontFamily: "Lalezar", fontSize: 96, color: C.creamStone[100], lineHeight: 1.32, textAlign: "center" }}>
              {tapeText}
            </div>
          </div>
          <SmoothReveal delay={18} distance={20}>
            <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 44, color: C.obsidianCharcoal[700], textAlign: "center", lineHeight: 1.48 }}>
              {subline}
            </div>
          </SmoothReveal>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** STYLE 05 — Clay3DHeroCaptionScene (Tactile clay-sculpted emblem card for concrete visual metaphors) */
export const Clay3DHeroCaptionScene: React.FC<{
  durFrames: number;
  iconGlyph: string;
  headline: string;
  subline: string;
}> = ({ durFrames, iconGlyph, headline, subline }) => {
  const frame = useCurrentFrame();
  const floatY = Math.sin(frame / 14) * 8;
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px", direction: "rtl", gap: 32 }}>
          <div
            style={{
              width: 220,
              height: 220,
              borderRadius: 56,
              background: `linear-gradient(145deg, ${C.desertClay[100]} 0%, ${C.desertClay[300]} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 108,
              transform: `translateY(${floatY}px)`,
              boxShadow: "20px 26px 50px rgba(82, 54, 37, 0.22), inset -8px -10px 20px rgba(82,54,37,0.16), inset 8px 10px 18px rgba(255,255,255,0.7)",
            }}
          >
            {iconGlyph}
          </div>
          <SmoothReveal delay={8} distance={22}>
            <div style={{ fontFamily: "Lalezar", fontSize: 88, color: C.emeraldPine[700], textAlign: "center", lineHeight: 1.35 }}>
              {headline}
            </div>
          </SmoothReveal>
          <SmoothReveal delay={18} distance={18}>
            <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 42, color: C.obsidianCharcoal[700], textAlign: "center", lineHeight: 1.48 }}>
              {subline}
            </div>
          </SmoothReveal>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** STYLE 06 — SwissEditorialListScene (Structured numbered list with emerald spine) */
export const SwissEditorialListScene: React.FC<{
  durFrames: number;
  title: string;
  items: readonly string[];
}> = ({ durFrames, title, items }) => (
  <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
    <ParchmentBackground durFrames={durFrames}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "flex-start", padding: "0 86px", direction: "rtl", gap: 28 }}>
        <SmoothReveal delay={2} distance={20}>
          <div style={{ fontFamily: "Almarai", fontWeight: 800, fontSize: 54, color: C.wineBurgundy[500], lineHeight: 1.4 }}>
            {title}
          </div>
        </SmoothReveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
          {items.map((item, idx) => (
            <SmoothReveal key={item} delay={12 + idx * 16} distance={24}>
              <div
                style={{
                  fontFamily: "IBMPlexArabic",
                  fontWeight: 700,
                  fontSize: 46,
                  color: C.obsidianCharcoal[900],
                  borderRight: `8px solid ${C.emeraldPine[500]}`,
                  paddingRight: 26,
                  lineHeight: 1.45,
                }}
              >
                {item}
              </div>
            </SmoothReveal>
          ))}
        </div>
      </AbsoluteFill>
    </ParchmentBackground>
  </SceneEnvelope>
);

/** STYLE 07 — SplitCompareCardScene (Architectural comparison cards with metric badges) */
export const SplitCompareCardScene: React.FC<{
  durFrames: number;
  title: string;
  cards: { badge: string; label: string; highlight?: boolean; delay: number }[];
}> = ({ durFrames, title, cards }) => {
  const frame = useCurrentFrame();
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 76px", direction: "rtl", gap: 28 }}>
          <SmoothReveal delay={2} distance={18}>
            <div style={{ fontFamily: "Almarai", fontWeight: 800, fontSize: 48, color: C.obsidianCharcoal[900], marginBottom: 12, textAlign: "center" }}>
              {title}
            </div>
          </SmoothReveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, width: "100%" }}>
            {cards.map((card, idx) => {
              const t = interpolate(frame, [card.delay, card.delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
              const isHi = Boolean(card.highlight);
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "30px 38px",
                    borderRadius: 22,
                    backgroundColor: isHi ? C.emeraldPine[900] : C.creamStone[100],
                    border: isHi ? `3px solid ${C.honeyGold[500]}` : `2px solid ${C.creamStone[700]}`,
                    boxShadow: isHi ? "0 22px 48px rgba(7, 31, 24, 0.28)" : "0 10px 28px rgba(31, 28, 26, 0.08)",
                    opacity: t,
                    transform: `translateX(${interpolate(t, [0, 1], [36, 0])}px)`,
                  }}
                >
                  <div style={{ fontFamily: isHi ? "Almarai" : "IBMPlexArabic", fontWeight: isHi ? 800 : 700, fontSize: isHi ? 44 : 40, color: isHi ? C.creamStone[100] : C.obsidianCharcoal[900], lineHeight: 1.4 }}>
                    {card.label}
                  </div>
                  <div style={{ fontFamily: "Lalezar", fontSize: isHi ? 54 : 46, color: isHi ? C.obsidianCharcoal[900] : C.creamStone[100], backgroundColor: isHi ? C.honeyGold[500] : C.wineBurgundy[500], padding: "10px 26px", borderRadius: 14, minWidth: 160, textAlign: "center" }}>
                    {card.badge}
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** STYLE 08 — MultiFontPosterBuildScene (Locked-slot word-by-word multi-font poster on Parchment or Emerald) */
export const MultiFontPosterBuildScene: React.FC<{
  durFrames: number;
  label: string;
  words: { word: string; delay: number; hero?: boolean }[];
  dark?: boolean;
}> = ({ durFrames, label, words, dark = false }) => {
  const frame = useCurrentFrame();
  const Bg = dark ? EmeraldNightBackground : ParchmentBackground;
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <Bg durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 90px", direction: "rtl", gap: 28 }}>
          <SmoothReveal delay={2} distance={18}>
            <div style={{ fontFamily: "ReemKufi", fontWeight: 600, fontSize: 36, color: dark ? C.honeyGold[300] : C.emeraldPine[500] }}>{label}</div>
          </SmoothReveal>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "18px 26px", lineHeight: 1.48 }}>
            {words.map((w, idx) => {
              const t = interpolate(frame, [w.delay, w.delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
              return (
                <span
                  key={`${w.word}-${idx}`}
                  style={{
                    display: "inline-block",
                    fontFamily: w.hero ? "Lalezar" : "IBMPlexArabic",
                    fontWeight: w.hero ? 400 : 500,
                    fontSize: w.hero ? 104 : 68,
                    color: w.hero ? (dark ? C.honeyGold[300] : C.wineBurgundy[500]) : dark ? C.creamStone[100] : C.obsidianCharcoal[900],
                    opacity: t,
                    transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)`,
                    padding: "4px 6px",
                  }}
                >
                  {w.word}
                </span>
              );
            })}
          </div>
        </AbsoluteFill>
      </Bg>
    </SceneEnvelope>
  );
};

export interface VerifiedQuranAyah {
  status: "OK" | "FALLBACK_TO_RAW_FOOTAGE";
  text?: string;
  surahName?: string;
  ayahNumberArabic?: string;
}

/**
 * STYLE 09 — SafeQuranGoldFrameScene (API-Only with Mandatory Raw-Footage Fail-Safe)
 * If ayah.status !== "OK", returns NULL immediately so the real speaker footage plays untouched!
 */
export const SafeQuranGoldFrameScene: React.FC<{
  durFrames: number;
  ayah: VerifiedQuranAyah;
}> = ({ durFrames, ayah }) => {
  if (ayah.status !== "OK" || !ayah.text || !ayah.surahName) return null;
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <EmeraldNightBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 76px", direction: "rtl" }}>
          <div
            style={{
              border: `3px solid ${C.honeyGold[500]}`,
              borderRadius: 28,
              padding: "60px 56px",
              background: "rgba(7, 31, 24, 0.76)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.48)",
              textAlign: "center",
            }}
          >
            <SmoothReveal delay={4} distance={22}>
              <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 72, color: C.creamStone[100], lineHeight: 1.72 }}>
                ﴿{ayah.text}﴾
              </div>
            </SmoothReveal>
            <SmoothReveal delay={16} distance={16}>
              <div style={{ fontFamily: "ReemKufi", fontWeight: 500, fontSize: 34, color: C.honeyGold[300], marginTop: 28 }}>
                {ayah.surahName}{ayah.ayahNumberArabic ? ` • آية ${ayah.ayahNumberArabic}` : ""}
              </div>
            </SmoothReveal>
          </div>
        </AbsoluteFill>
      </EmeraldNightBackground>
    </SceneEnvelope>
  );
};

/** STYLE 10 — SingleWordShockScene (High-impact monumental single word on Emerald Night) */
export const SingleWordShockScene: React.FC<{
  durFrames: number;
  word: string;
  subline: string;
}> = ({ durFrames, word, subline }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={10}>
      <EmeraldNightBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 72px", direction: "rtl", textAlign: "center", gap: 24 }}>
          <div style={{ fontFamily: "Lalezar", fontSize: 156, color: C.honeyGold[300], transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`, opacity: t, lineHeight: 1.25, textShadow: "0 16px 44px rgba(0,0,0,0.5)" }}>
            {word}
          </div>
          <SmoothReveal delay={10} distance={18}>
            <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 44, color: C.creamStone[300], lineHeight: 1.45 }}>
              {subline}
            </div>
          </SmoothReveal>
        </AbsoluteFill>
      </EmeraldNightBackground>
    </SceneEnvelope>
  );
};

/** STYLE 11 — AnimatedPathMetaphorScene (Hand-drawn SVG golden path/arc drawing live with headline) */
export const AnimatedPathMetaphorScene: React.FC<{
  durFrames: number;
  eyebrow: string;
  headline: string;
}> = ({ durFrames, eyebrow, headline }) => {
  const frame = useCurrentFrame();
  const drawT = interpolate(frame, [8, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const pathLen = 780;
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 80px", direction: "rtl", gap: 24 }}>
          <SmoothReveal delay={2} distance={16}>
            <div style={{ fontFamily: "ReemKufi", fontWeight: 600, fontSize: 36, color: C.wineBurgundy[500] }}>{eyebrow}</div>
          </SmoothReveal>
          <SmoothReveal delay={10} distance={22}>
            <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 82, color: C.obsidianCharcoal[900], textAlign: "center", lineHeight: 1.45 }}>
              {headline}
            </div>
          </SmoothReveal>
          <svg width="760" height="72" viewBox="0 0 760 72" fill="none">
            <path
              d="M 20 48 Q 220 8, 380 38 T 740 24"
              stroke={C.emeraldPine[500]}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={pathLen}
              strokeDashoffset={pathLen * (1 - drawT)}
            />
          </svg>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** STYLE 12 — PureTypographicClosingScene (ZERO CHANNEL LOGO — pure closing statement) */
export const PureTypographicClosingScene: React.FC<{
  durFrames: number;
  top: string;
  headline: string;
  subline: string;
}> = ({ durFrames, top, headline, subline }) => (
  <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
    <EmeraldNightBackground durFrames={durFrames}>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 84px", direction: "rtl", textAlign: "center", gap: 22 }}>
        <SmoothReveal delay={2} distance={18}>
          <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 300, fontSize: 48, color: C.creamStone[300], lineHeight: 1.45 }}>{top}</div>
        </SmoothReveal>
        <SmoothReveal delay={12} distance={26}>
          <div style={{ fontFamily: "Lalezar", fontSize: 108, color: C.honeyGold[300], lineHeight: 1.32, textShadow: "0 12px 36px rgba(0,0,0,0.42)" }}>{headline}</div>
        </SmoothReveal>
        <SmoothReveal delay={22} distance={20}>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 56, color: C.creamStone[100], lineHeight: 1.5 }}>{subline}</div>
        </SmoothReveal>
      </AbsoluteFill>
    </EmeraldNightBackground>
  </SceneEnvelope>
);

/** STYLE 13 — Camera3DFlyThroughScene (Multi-plane perspective depth glide) */
export const Camera3DFlyThroughScene: React.FC<{
  durFrames: number;
  stages: { text: string; startAt: number; hero?: boolean }[];
}> = ({ durFrames, stages }) => {
  const frame = useCurrentFrame();
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <EmeraldNightBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: 1100, direction: "rtl" }}>
          {stages.map((st, idx) => {
            const t = interpolate(frame, [st.startAt, st.startAt + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
            const outT = idx < stages.length - 1 ? interpolate(frame, [stages[idx + 1].startAt - 4, stages[idx + 1].startAt + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
            const z = interpolate(t, [0, 1], [-420, 0]);
            const op = interpolate(t, [0, 0.35], [0, 1], { extrapolateRight: "clamp" }) * outT;
            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  fontFamily: st.hero ? "Lalezar" : "Almarai",
                  fontWeight: st.hero ? 400 : 800,
                  fontSize: st.hero ? 116 : 82,
                  color: st.hero ? C.honeyGold[300] : C.creamStone[100],
                  opacity: op,
                  transform: `translateZ(${z}px)`,
                  textAlign: "center",
                  padding: "0 80px",
                  lineHeight: 1.38,
                }}
              >
                {st.text}
              </div>
            );
          })}
        </AbsoluteFill>
      </EmeraldNightBackground>
    </SceneEnvelope>
  );
};

/** STYLE 14 — VoxHighlighterSweepScene (Documentary quote card with animated Honey Gold marker sweep) */
export const VoxHighlighterSweepScene: React.FC<{
  durFrames: number;
  sourceLabel: string;
  beforeText: string;
  highlightedText: string;
  afterText?: string;
  sweepDelay?: number;
}> = ({ durFrames, sourceLabel, beforeText, highlightedText, afterText, sweepDelay = 20 }) => {
  const frame = useCurrentFrame();
  const sweepW = interpolate(frame, [sweepDelay, sweepDelay + 22], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 76px", direction: "rtl" }}>
          <div style={{ width: "100%", backgroundColor: C.creamStone[100], borderRadius: 20, padding: "56px 52px", borderRight: `10px solid ${C.wineBurgundy[500]}`, boxShadow: "0 24px 60px rgba(31, 28, 26, 0.14)" }}>
            <SmoothReveal delay={2} distance={14}>
              <div style={{ fontFamily: "ReemKufi", fontWeight: 600, fontSize: 32, color: C.wineBurgundy[500], marginBottom: 24 }}>{sourceLabel}</div>
            </SmoothReveal>
            <SmoothReveal delay={8} distance={20}>
              <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 58, color: C.obsidianCharcoal[900], lineHeight: 1.72 }}>
                {beforeText}{" "}
                <span style={{ position: "relative", display: "inline-block", padding: "0 12px" }}>
                  <span style={{ position: "absolute", right: 0, bottom: 10, height: "56%", width: `${sweepW}%`, backgroundColor: "rgba(214, 159, 52, 0.42)", borderRadius: 6, zIndex: 0 }} />
                  <span style={{ position: "relative", zIndex: 1, color: C.obsidianCharcoal[900] }}>{highlightedText}</span>
                </span>
                {afterText ? ` ${afterText}` : ""}
              </div>
            </SmoothReveal>
          </div>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** STYLE 15 — LiquidGlassCardScene (Translucent frosted emerald glass card floating OVER live speaker) */
export const LiquidGlassCardScene: React.FC<{
  durFrames: number;
  eyebrow: string;
  headline: string;
  subline: string;
}> = ({ durFrames, eyebrow, headline, subline }) => {
  const frame = useCurrentFrame();
  const cardT = interpolate(frame, [4, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: "0 68px 260px", direction: "rtl", background: "linear-gradient(to top, rgba(7, 31, 24, 0.72) 0%, rgba(7, 31, 24, 0.18) 55%, rgba(7, 31, 24, 0) 100%)" }}>
        <div
          style={{
            width: "100%",
            background: "linear-gradient(145deg, rgba(17, 59, 47, 0.90) 0%, rgba(10, 32, 26, 0.94) 100%)",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
            border: "2px solid rgba(214, 159, 52, 0.55)",
            borderRadius: 28,
            padding: "42px 48px",
            textAlign: "center",
            opacity: cardT,
            transform: `translateY(${interpolate(cardT, [0, 1], [32, 0])}px)`,
          }}
        >
          <div style={{ fontFamily: "ReemKufi", fontWeight: 500, fontSize: 32, color: C.honeyGold[300], marginBottom: 12 }}>{eyebrow}</div>
          <div style={{ fontFamily: "Lalezar", fontSize: 82, color: C.creamStone[100], lineHeight: 1.32 }}>{headline}</div>
          <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 38, color: C.creamStone[300], marginTop: 14, lineHeight: 1.45 }}>{subline}</div>
        </div>
      </AbsoluteFill>
    </SceneEnvelope>
  );
};

/** STYLE 16 — TornPaperCollageScene (Realistic torn parchment cutout over Emerald Night) */
export const TornPaperCollageScene: React.FC<{
  durFrames: number;
  eyebrow: string;
  calligraphyMain: string;
  footerNote: string;
}> = ({ durFrames, eyebrow, calligraphyMain, footerNote }) => {
  const frame = useCurrentFrame();
  const cardT = interpolate(frame, [4, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <EmeraldNightBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 72px", direction: "rtl" }}>
          <div style={{ width: "100%", opacity: cardT, transform: `translateY(${interpolate(cardT, [0, 1], [34, 0])}px) rotate(-1.6deg)`, filter: "drop-shadow(0 28px 50px rgba(0, 0, 0, 0.55))" }}>
            <svg viewBox="0 0 900 28" width="100%" height="24" preserveAspectRatio="none" style={{ display: "block", marginBottom: -1 }}>
              <path d="M0,28 L0,14 L30,4 L65,18 L105,6 L145,20 L190,5 L240,17 L285,3 L335,19 L385,6 L435,16 L485,4 L535,20 L585,6 L635,18 L690,4 L745,19 L800,7 L850,18 L900,8 L900,28 Z" fill={C.creamStone[300]} />
            </svg>
            <div style={{ backgroundColor: C.creamStone[300], padding: "46px 52px", textAlign: "center" }}>
              <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 34, color: C.emeraldPine[700], marginBottom: 16 }}>{eyebrow}</div>
              <div style={{ fontFamily: "ArefRuqaa", fontWeight: 700, fontSize: 98, color: C.wineBurgundy[500], lineHeight: 1.48 }}>{calligraphyMain}</div>
              <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 40, color: C.obsidianCharcoal[700], marginTop: 18 }}>{footerNote}</div>
            </div>
            <svg viewBox="0 0 900 28" width="100%" height="24" preserveAspectRatio="none" style={{ display: "block", marginTop: -1 }}>
              <path d="M0,0 L900,0 L900,14 L860,24 L815,10 L765,22 L715,8 L665,23 L610,11 L560,25 L505,9 L450,22 L395,8 L340,24 L285,11 L230,22 L175,9 L120,23 L65,10 L25,22 L0,12 Z" fill={C.creamStone[300]} />
            </svg>
          </div>
        </AbsoluteFill>
      </EmeraldNightBackground>
    </SceneEnvelope>
  );
};

/** STYLE 17 — WordMatchCutZoomScene (Smooth zoom escalation through a central anchor word) */
export const WordMatchCutZoomScene: React.FC<{
  durFrames: number;
  anchorWord: string;
  contextTop: string;
}> = ({ durFrames, anchorWord, contextTop }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, durFrames], [0.92, 1.18], { extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={10}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 76px", direction: "rtl", textAlign: "center", gap: 18 }}>
          <SmoothReveal delay={2} distance={14}>
            <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 42, color: C.obsidianCharcoal[700] }}>{contextTop}</div>
          </SmoothReveal>
          <div style={{ fontFamily: "Rakkas", fontSize: 136, color: C.wineBurgundy[500], transform: `scale(${zoom})`, lineHeight: 1.32 }}>
            {anchorWord}
          </div>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** STYLE 19 — RedactionStrikeFlipScene (Animated Burgundy strike-through + Emerald truth reveal) */
export const RedactionStrikeFlipScene: React.FC<{
  durFrames: number;
  falseIdea: string;
  trueIdea: string;
  strikeAt?: number;
}> = ({ durFrames, falseIdea, trueIdea, strikeAt = 32 }) => {
  const frame = useCurrentFrame();
  const strikeW = interpolate(frame, [strikeAt, strikeAt + 14], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  const flipT = interpolate(frame, [strikeAt + 10, strikeAt + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_OUT });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: "0 86px", gap: 44, direction: "rtl" }}>
          <SmoothReveal delay={3} distance={20}>
            <div style={{ position: "relative", display: "inline-block", padding: "12px 24px" }}>
              <span style={{ fontFamily: "IBMPlexArabic", fontWeight: 500, fontSize: 64, color: C.obsidianCharcoal[700], opacity: frame >= strikeAt ? 0.46 : 0.95 }}>
                {falseIdea}
              </span>
              <div style={{ position: "absolute", top: "52%", right: 0, height: 8, width: `${strikeW}%`, backgroundColor: C.wineBurgundy[500], borderRadius: 4 }} />
            </div>
          </SmoothReveal>
          <div style={{ opacity: flipT, transform: `translateY(${interpolate(flipT, [0, 1], [26, 0])}px)`, fontFamily: "Lalezar", fontSize: 108, color: C.emeraldPine[700], lineHeight: 1.35, textAlign: "center" }}>
            {trueIdea}
          </div>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};
