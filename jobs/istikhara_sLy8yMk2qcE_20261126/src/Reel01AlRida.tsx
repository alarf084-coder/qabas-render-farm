import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile } from "remotion";
import { ARABIC_FONT_CSS } from "./fonts";
import { QABAS_COLORS as C } from "./theme";
import { QabasSfxCue } from "./sfx";
import facePos from "./face_pos.json";
import {
  CaptionMotionMode,
  EditorialCaptionTrack,
  EditorialPhraseItem,
  SeamlessBottomVignette,
} from "./components/EditorialCaption";
import {
  BurgundyTapeImpactScene,
  PureTypographicClosingScene,
  SingleWordShockScene,
  SplitCompareCardScene,
  SwissEditorialListScene,
} from "./components/QabasSceneLibrary";

function buildPhrase(
  startFrame: number,
  endFrame: number,
  text: string,
  heroes: string[],
  mode: CaptionMotionMode
): EditorialPhraseItem {
  const parts = text.split(" ");
  const step = Math.max(4, (endFrame - startFrame) / parts.length);
  return {
    mode,
    words: parts.map((w, i) => ({
      word: w,
      startFrame: Math.round(startFrame + i * step),
      endFrame: Math.round(startFrame + (i + 1) * step),
      hero: heroes.includes(w),
    })),
  };
}

// 5 Typography Scenes — exact spoken frame windows (ALL suppressed in hideRanges!)
const HIDE_RANGES: [number, number][] = [
  [145, 290],   // Scene 1: BurgundyTapeImpactScene (آلة زمن — عشر سنين لورا)
  [650, 760],   // Scene 2: SingleWordShockScene (اللي حصل!)
  [930, 1460],  // Scene 3: SwissEditorialListScene (الصفقة تخسر / القطر / الحادثة / بالسرطان)
  [1640, 1980], // Scene 4: SplitCompareCardScene (اختيار الله vs اختيار عقلك)
  [2250, 2490], // Scene 5: PureTypographicClosingScene (لأن الله يعلم وأنتم لا تعلمون)
];

const PHRASES: EditorialPhraseItem[] = [
  buildPhrase(8, 138, "معنى الرضا أن لو تخيلنا", ["معنى", "الرضا"], "TWO_BEAT_EDITORIAL"),
  // [145 - 290] Scene 1: BurgundyTapeImpactScene
  buildPhrase(298, 435, "وبعدين اديتك اللوح المحفوظ والقلم", ["اللوح", "المحفوظ"], "WORD_FLOW_LOCKED"),
  buildPhrase(440, 565, "وقلت لك اكتب اللي أنت عايزه", ["اكتب"], "LINE_GLIDE"),
  buildPhrase(570, 645, "العشر سنين اللي جاية هتلاقي نفسك بتكتب إيه؟", ["بتكتب", "إيه؟"], "WORD_FLOW_LOCKED"),
  // [650 - 760] Scene 2: SingleWordShockScene
  buildPhrase(770, 915, "تلاقي نفسك بتكتب إني ما أتجوز فلانة", ["بتكتب"], "LINE_GLIDE"),
  // [930 - 1460] Scene 3: SwissEditorialListScene
  buildPhrase(1465, 1630, "وتكتب اللي حصل.. ليه؟", ["اللي", "حصل.."], "TWO_BEAT_EDITORIAL"),
  // [1640 - 1980] Scene 4: SplitCompareCardScene
  buildPhrase(1990, 2190, "فأنت أبداً لا تقدم اختيار عقلك على اختيار ربك", ["اختيار", "ربك"], "WORD_FLOW_LOCKED"),
  buildPhrase(2195, 2245, "ليه؟ في جملة..", ["جملة.."], "LINE_GLIDE"),
  // [2250 - 2490] Scene 5: PureTypographicClosingScene
];

export const Reel01AlRida: React.FC = () => {
  const xPct = facePos.reel_01 ?? 54.4;
  return (
    <AbsoluteFill style={{ backgroundColor: C.obsidianCharcoal[900], direction: "rtl" }}>
      <style>{ARABIC_FONT_CSS}</style>

      {/* Layer 1: Raw 1080p Speaker Video with 1-Frame Face-Centered CSS objectPosition (ZERO re-encode!) */}
      <OffthreadVideo
        src={staticFile("media/reel_01_raw.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${xPct}% center`,
        }}
      />

      {/* Layer 2: Seamless Bottom Cinema Vignette */}
      <SeamlessBottomVignette />

      {/* Layer 3: Zero-Overlap Editorial Captions (C19 Stroked Gold) */}
      <EditorialCaptionTrack
        phrases={PHRASES}
        defaultVariant="C19_CRISP_STROKED_GOLD"
        hideRanges={HIDE_RANGES}
      />

      {/* Layer 4: 5 Distinct Qabas Typography Scenes + Subtle Organic SFX */}
      <QabasSfxCue sfx="airWhooshSoft" from={145} />
      <Sequence from={145} durationInFrames={145}>
        <BurgundyTapeImpactScene
          durFrames={145}
          eyebrow="لو تخيلنا"
          tapeText="آلة زمن"
          subline="تركبها ونرجعك عشر سنين لورا"
        />
      </Sequence>

      <QabasSfxCue sfx="warmSubSwell" from={650} />
      <Sequence from={650} durationInFrames={110}>
        <SingleWordShockScene
          durFrames={110}
          word="اللي حصل"
          subline="هتلاقي نفسك بتكتب اللي حصل"
        />
      </Sequence>

      <QabasSfxCue sfx="pencilSketchWrite" from={930} />
      <Sequence from={930} durationInFrames={530}>
        <SwissEditorialListScene
          durFrames={530}
          title="تلاقي نفسك بتكتب"
          items={[
            "الصفقة الفلانية تخسر",
            "يفوتني القطر اليوم الفلاني",
            "الحادثة بتاعة العربية تحصل",
            "أصاب بالسرطان • أبويا يموت في حادثة",
          ]}
        />
      </Sequence>

      <QabasSfxCue sfx="subtleCameraShutter" from={1640} />
      <Sequence from={1640} durationInFrames={340}>
        <SplitCompareCardScene
          durFrames={340}
          title="لأن اللي حصل"
          cards={[
            { label: "اللي حصل", badge: "اختيار الله", highlight: true, delay: 10 },
            { label: "اللي كان نفسك يحصل", badge: "اختيار عقلك", delay: 145 },
          ]}
        />
      </Sequence>

      <QabasSfxCue sfx="softBookPageThud" from={2250} />
      <Sequence from={2250} durationInFrames={240}>
        <PureTypographicClosingScene
          durFrames={240}
          top="لأن الله يعلم"
          headline="وأنتم لا تعلمون"
          subline="أنت ما تعرفش حاجة"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
