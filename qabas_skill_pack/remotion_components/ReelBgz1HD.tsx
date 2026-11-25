import React from "react";
import { AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { ARABIC_FONT_CSS } from "./fonts";
import { QABAS_COLORS as C } from "./theme";
import { EmeraldNightBackground, ParchmentBackground, SceneEnvelope } from "./components/QabasPrimitives";
import { CaptionMotionMode, EditorialCaption, EditorialWord, SeamlessBottomVignette } from "./components/EditorialCaption";

const EASE_OUT = Easing.out(Easing.cubic);

/** Smooth ease-out rise with generous zero-clipping padding */
const SilkyRise: React.FC<{
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}> = ({ children, delay = 0, distance = 28 }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [delay, delay + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <div style={{ padding: "24px 32px", margin: "-20px -28px", overflow: "visible" }}>
      <div style={{ opacity: t, transform: `translateY(${interpolate(t, [0, 1], [distance, 0])}px)` }}>
        {children}
      </div>
    </div>
  );
};

/** Full-HD 1080x1920 Word-by-Word Locked Editorial Typography Scene */
const HDWordFlowParchment: React.FC<{
  durFrames: number;
  label: string;
  words: { word: string; delay: number; hero?: boolean }[];
}> = ({ durFrames, label, words }) => {
  const frame = useCurrentFrame();
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 92px",
            direction: "rtl",
            gap: 28,
          }}
        >
          <SilkyRise delay={3} distance={20}>
            <div style={{ fontFamily: "ReemKufi", fontWeight: 600, fontSize: 36, color: C.emeraldPine[500] }}>
              {label}
            </div>
          </SilkyRise>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "baseline",
              gap: "18px 26px",
              lineHeight: 1.48,
            }}
          >
            {words.map((w, idx) => {
              const t = interpolate(frame, [w.delay, w.delay + 12], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: EASE_OUT,
              });
              return (
                <span
                  key={`${w.word}-${idx}`}
                  style={{
                    display: "inline-block",
                    fontFamily: w.hero ? "Lalezar" : "IBMPlexArabic",
                    fontWeight: w.hero ? 400 : 500,
                    fontSize: w.hero ? 104 : 68,
                    color: w.hero ? C.wineBurgundy[500] : C.obsidianCharcoal[900],
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
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** Full-HD 1080x1920 Redaction Strike & Flip Scene */
const HDRedactionFlip: React.FC<{
  durFrames: number;
  falseIdea: string;
  trueIdea: string;
  strikeAt: number;
}> = ({ durFrames, falseIdea, trueIdea, strikeAt }) => {
  const frame = useCurrentFrame();
  const strikeW = interpolate(frame, [strikeAt, strikeAt + 14], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  const flipT = interpolate(frame, [strikeAt + 10, strikeAt + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: EASE_OUT,
  });
  return (
    <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
      <ParchmentBackground durFrames={durFrames}>
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 86px",
            gap: 44,
            direction: "rtl",
          }}
        >
          <SilkyRise delay={3} distance={20}>
            <div style={{ position: "relative", display: "inline-block", padding: "12px 24px" }}>
              <span
                style={{
                  fontFamily: "IBMPlexArabic",
                  fontWeight: 500,
                  fontSize: 64,
                  color: C.obsidianCharcoal[700],
                  opacity: frame >= strikeAt ? 0.46 : 0.95,
                }}
              >
                {falseIdea}
              </span>
              <div
                style={{
                  position: "absolute",
                  top: "52%",
                  right: 0,
                  height: 8,
                  width: `${strikeW}%`,
                  backgroundColor: C.wineBurgundy[500],
                  borderRadius: 4,
                }}
              />
            </div>
          </SilkyRise>
          <div
            style={{
              opacity: flipT,
              transform: `translateY(${interpolate(flipT, [0, 1], [26, 0])}px)`,
              fontFamily: "Lalezar",
              fontSize: 108,
              color: C.emeraldPine[700],
              lineHeight: 1.35,
              textAlign: "center",
            }}
          >
            {trueIdea}
          </div>
        </AbsoluteFill>
      </ParchmentBackground>
    </SceneEnvelope>
  );
};

/** Full-HD 1080x1920 Emerald Poster Scene */
const HDEmeraldPoster: React.FC<{
  durFrames: number;
  top: string;
  hero: string;
  sub: string;
}> = ({ durFrames, top, hero, sub }) => (
  <SceneEnvelope durFrames={durFrames} fadeFrames={12}>
    <EmeraldNightBackground durFrames={durFrames}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: "0 84px",
          direction: "rtl",
          textAlign: "center",
          gap: 22,
        }}
      >
        <SilkyRise delay={3} distance={20}>
          <div style={{ fontFamily: "IBMPlexArabic", fontWeight: 300, fontSize: 50, color: C.creamStone[300], lineHeight: 1.45 }}>
            {top}
          </div>
        </SilkyRise>
        <SilkyRise delay={14} distance={28}>
          <div style={{ fontFamily: "Lalezar", fontSize: 108, color: C.honeyGold[300], lineHeight: 1.32, textShadow: "0 12px 36px rgba(0,0,0,0.42)" }}>
            {hero}
          </div>
        </SilkyRise>
        <SilkyRise delay={26} distance={22}>
          <div style={{ fontFamily: "Amiri", fontWeight: 700, fontSize: 58, color: C.creamStone[100], lineHeight: 1.5 }}>
            {sub}
          </div>
        </SilkyRise>
      </AbsoluteFill>
    </EmeraldNightBackground>
  </SceneEnvelope>
);

/** Helper to distribute proofread Arabic words evenly across a phrase's exact spoken window */
function buildPhrase(
  startFrame: number,
  endFrame: number,
  text: string,
  heroes: string[],
  mode: CaptionMotionMode,
  whisperTop?: string
): { words: EditorialWord[]; mode: CaptionMotionMode; whisperTop?: string } {
  const parts = text.split(" ");
  const step = Math.max(4, (endFrame - startFrame) / parts.length);
  return {
    mode,
    whisperTop,
    words: parts.map((w, i) => ({
      word: w,
      startFrame: Math.round(startFrame + i * step),
      endFrame: Math.round(startFrame + (i + 1) * step),
      hero: heroes.includes(w),
    })),
  };
}

// Carefully choreographed mix of 3 harmonious editorial cadences (LINE_GLIDE, WORD_FLOW_LOCKED, TWO_BEAT_EDITORIAL)
// all sharing ONE cohesive Al-Riwaq visual look — zero jumping, zero dark halo, zero logo!
const PHRASES = [
  buildPhrase(12, 84, "ثم أسلم أبو ذر", ["أبو", "ذر"], "TWO_BEAT_EDITORIAL", "بداية التحوّل"),
  buildPhrase(88, 154, "وده أول درس يا شباب", ["درس"], "LINE_GLIDE"),
  buildPhrase(158, 224, "درس للدعاة وللناس المتدينة", ["للدعاة"], "WORD_FLOW_LOCKED"),
  buildPhrase(228, 290, "ودرس للناس البعيدة", ["البعيدة"], "TWO_BEAT_EDITORIAL"),
  // [295 - 495] Full-screen Typography Scene 1 (lower captions hidden)
  buildPhrase(500, 574, "فأنت مهما كنت بعيد", ["بعيد"], "TWO_BEAT_EDITORIAL"),
  buildPhrase(578, 654, "عملت إيه يعني في حياتك؟", ["حياتك؟"], "LINE_GLIDE"),
  buildPhrase(658, 736, "ما أظنش إن في حد هنا", ["هنا"], "LINE_GLIDE"),
  buildPhrase(740, 814, "بعيد لدرجة إنه كفر بالله!", ["كفر"], "WORD_FLOW_LOCKED"),
  buildPhrase(818, 884, "أصل يا شيخ ده أنا..", ["شيخ"], "LINE_GLIDE"),
  buildPhrase(888, 940, "مخدرات وزنا.. قول زي ما تقول!", ["مخدرات", "وزنا.."], "WORD_FLOW_LOCKED"),
  // [945 - 1110] Full-screen Typography Scene 2 (Redaction Strike & Flip)
  buildPhrase(1115, 1185, "مين صحابي ما كانش كافرًا بالله؟", ["صحابي"], "TWO_BEAT_EDITORIAL"),
  // [1190 - 1345] Full-screen Typography Scene 3 (Emerald Poster)
  buildPhrase(1348, 1372, "فمهما كان ذنبك..", ["ذنبك.."], "LINE_GLIDE"),
  // [1375 - 1508] Full-screen Typography Scene 4 (Pure Typographic Closing — ZERO LOGO)
];

export const ReelBgz1HD: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.obsidianCharcoal[900], direction: "rtl" }}>
      <style>{ARABIC_FONT_CSS}</style>

      {/* Layer 1: TRUE 1080p HD Speaker Video (1080x1920) + Untouched 192kbps Raw Audio */}
      <OffthreadVideo
        src={staticFile("media/r1_1080p_base.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Layer 2: Full-Frame Seamless Bottom Cinema Vignette (ZERO dark halo/blob!) */}
      <SeamlessBottomVignette />

      {/* Layer 3: Silky Editorial Captions (3 harmonious cadences, zero layout-shift, zero bounce) */}
      {PHRASES.map((ph, idx) => (
        <EditorialCaption key={idx} words={ph.words} mode={ph.mode} whisperTop={ph.whisperTop} />
      ))}

      {/* Layer 4: 4 Full-HD Typography Scenes with 12-frame silky cross-dissolves + ultra-quiet SFX */}
      <Sequence from={295} durationInFrames={200}>
        <Audio src={staticFile("sfx/04_paper_brush_soft.wav")} volume={0.12} />
        <HDWordFlowParchment
          durFrames={200}
          label="الدرس الأول"
          words={[
            { word: "الإنسان", delay: 6 },
            { word: "مهما", delay: 16 },
            { word: "كان..", delay: 26 },
            { word: "الله", delay: 44, hero: true },
            { word: "يفتح", delay: 60 },
            { word: "قلبه", delay: 74 },
            { word: "لهذا", delay: 88 },
            { word: "الدين", delay: 100, hero: true },
            { word: "في", delay: 118 },
            { word: "لحظة!", delay: 128, hero: true },
          ]}
        />
      </Sequence>

      <Sequence from={945} durationInFrames={165}>
        <Audio src={staticFile("sfx/01_air_whoosh_soft.wav")} volume={0.12} />
        <HDRedactionFlip
          durFrames={165}
          falseIdea="ذنوبي أعظم من المغفرة؟"
          trueIdea="الكفر بالله أعظم!"
          strikeAt={36}
        />
      </Sequence>

      <Sequence from={1190} durationInFrames={155}>
        <Audio src={staticFile("sfx/03_warm_sub_swell.wav")} volume={0.12} />
        <HDEmeraldPoster
          durFrames={155}
          top="كانوا كفارًا وأسلموا"
          hero="فصاروا سادات الأمة"
          sub="وسادات الأولياء"
        />
      </Sequence>

      <Sequence from={1375} durationInFrames={133}>
        <Audio src={staticFile("sfx/11_soft_book_page_thud.wav")} volume={0.12} />
        <HDEmeraldPoster
          durFrames={133}
          top="مهما كان ذنبك.."
          hero="لا تستعظم ذنبك على ربك"
          sub="باب الله مفتوحٌ في كل لحظة"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
