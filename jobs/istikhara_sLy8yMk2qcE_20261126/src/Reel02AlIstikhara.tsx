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
  LiquidGlassCardScene,
  PureTypographicClosingScene,
  RedactionStrikeFlipScene,
  TornPaperCollageScene,
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
  [130, 315],   // Scene 1: BurgundyTapeImpactScene (الملك جل جلاله فتح لك هذا الباب)
  [975, 1185],  // Scene 2: LiquidGlassCardScene overlay (خايف تزهقه — مرة والتانية والتالتة)
  [1495, 1720], // Scene 3: RedactionStrikeFlipScene (لو ما جيتليش أغضب / ولو جيتلي أفرح بك)
  [1950, 2175], // Scene 4: TornPaperCollageScene (الله يغضب إن تركت سؤاله وبني آدم حين يسأل يغضب)
  [2360, 2481], // Scene 5: PureTypographicClosingScene (إنك شايف نفسك ومستغني عنه)
];

const PHRASES: EditorialPhraseItem[] = [
  buildPhrase(7, 125, "تقولي بستخير بس في الحاجات الكبيرة", ["الكبيرة"], "TWO_BEAT_EDITORIAL"),
  // [130 - 315] Scene 1: BurgundyTapeImpactScene
  buildPhrase(325, 480, "والله عجيبة جداً.. لو تخيلنا ملك من ملوك الدنيا", ["ملك", "الدنيا"], "WORD_FLOW_LOCKED"),
  buildPhrase(485, 625, "وكل حاجة تحت إيده وتحت سيطرته", ["سيطرته"], "LINE_GLIDE"),
  buildPhrase(630, 795, "قال لك قبل ما تعمل أي حاجة تعالى استشيرني", ["استشيرني"], "TWO_BEAT_EDITORIAL"),
  buildPhrase(800, 968, "إيه اللي يخليك ما تروحش تستشيره في الصغيرة والكبيرة؟", ["الصغيرة", "والكبيرة؟"], "WORD_FLOW_LOCKED"),
  // [975 - 1185] Scene 2: LiquidGlassCardScene (overlay over speaker)
  buildPhrase(1195, 1385, "المعنى العقلي الوحيد اللي يخليك ما تروحلوش في كل حاجة", ["الوحيد"], "LINE_GLIDE"),
  buildPhrase(1390, 1488, "تخيل بقى هو بيقولك خلي بالك بقى", ["تخيل"], "TWO_BEAT_EDITORIAL"),
  // [1495 - 1720] Scene 3: RedactionStrikeFlipScene
  buildPhrase(1735, 1940, "فروحت أنت كبرت دماغك وما رحت لوش", ["كبرت", "دماغك"], "WORD_FLOW_LOCKED"),
  // [1950 - 2175] Scene 4: TornPaperCollageScene
  buildPhrase(2185, 2350, "ربنا لو تركت سؤاله يغضب.. ليه يغضب؟", ["ليه", "يغضب؟"], "TWO_BEAT_EDITORIAL"),
  // [2360 - 2481] Scene 5: PureTypographicClosingScene
];

export const Reel02AlIstikhara: React.FC = () => {
  const xPct = facePos.reel_02 ?? 46.0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.obsidianCharcoal[900], direction: "rtl" }}>
      <style>{ARABIC_FONT_CSS}</style>

      {/* Layer 1: Raw 1080p Speaker Video with 1-Frame Face-Centered CSS objectPosition (ZERO re-encode!) */}
      <OffthreadVideo
        src={staticFile("media/reel_02_raw.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: `${xPct}% center`,
        }}
      />

      {/* Layer 2: Seamless Bottom Cinema Vignette */}
      <SeamlessBottomVignette />

      {/* Layer 3: Zero-Overlap Editorial Captions (C01 Duo Editorial) */}
      <EditorialCaptionTrack
        phrases={PHRASES}
        defaultVariant="C01_DUO_EDITORIAL"
        hideRanges={HIDE_RANGES}
      />

      {/* Layer 4: 5 Distinct Qabas Typography Scenes + Subtle Organic SFX */}
      <QabasSfxCue sfx="airWhooshSoft" from={130} />
      <Sequence from={130} durationInFrames={185}>
        <BurgundyTapeImpactScene
          durFrames={185}
          eyebrow="والحاجات الصغيرة ما بتستخيرش فيها"
          tapeText="الملك جل جلاله"
          subline="فتح لك هذا الباب"
        />
      </Sequence>

      <QabasSfxCue sfx="clothSwipeShort" from={975} />
      <Sequence from={975} durationInFrames={210}>
        <LiquidGlassCardScene
          durFrames={210}
          eyebrow="حاجة واحدة ممكن تخليك تعمل كده"
          headline="إنك خايف تزهقه"
          subline="مرة والتانية والثالثة هيقول كل شوية يقرفني ويجيلي"
        />
      </Sequence>

      <QabasSfxCue sfx="markerGlideSoft" from={1495} />
      <Sequence from={1495} durationInFrames={225}>
        <RedactionStrikeFlipScene
          durFrames={225}
          falseIdea="لو ما جيتليش أغضب"
          trueIdea="ولو جيتلي أفرح بك"
          strikeAt={95}
        />
      </Sequence>

      <QabasSfxCue sfx="softBookPageThud" from={1950} />
      <Sequence from={1950} durationInFrames={225}>
        <TornPaperCollageScene
          durFrames={225}
          eyebrow="الله يغضب إن تركت سؤاله"
          calligraphyMain="وبني آدم حين يسأل يغضب"
          footerNote="ربنا لو تركت سؤاله يغضب"
        />
      </Sequence>

      <QabasSfxCue sfx="warmSubSwell" from={2360} />
      <Sequence from={2360} durationInFrames={121}>
        <PureTypographicClosingScene
          durFrames={121}
          top="معنى كده إنك شايف نفسك"
          headline="مش محتاج له"
          subline="وإنك مستغني عنه"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
