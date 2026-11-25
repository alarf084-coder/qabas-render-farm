import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile } from "remotion";
import { ARABIC_FONT_CSS } from "./fonts";
import { QABAS_COLORS as C } from "./theme";
import { CaptionMotionMode, EditorialCaption, EditorialWord, SeamlessBottomVignette } from "./components/EditorialCaption";
import {
  BurgundyTapeImpactScene,
  LiquidGlassCardScene,
  SplitCompareCardScene,
  TornPaperCollageScene,
  VoxHighlighterSweepScene,
} from "./components/QabasSceneLibrary";

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

// Proofread Arabic captions (IBM Plex Medium 500+ base, zero thin/faint text, zero dark halo, zero layout shift)
// Automatically suppressed during full-screen typography scenes!
const PHRASES = [
  buildPhrase(4, 108, "الزهد ده من أعلى درجات الدين", ["الزهد"], "TWO_BEAT_EDITORIAL", "حقيقة الزهد"),
  // [112 - 270] Scene 1: Style 04 BurgundyTapeImpactScene («أعقل الناس هم الزهاد»)
  buildPhrase(276, 365, "عرفوا إنها مش باقية لحد..", ["باقية"], "LINE_GLIDE"),
  buildPhrase(370, 465, "واحد معاه مليون جنيه استثمرها", ["مليون"], "WORD_FLOW_LOCKED"),
  // [470 - 930] Scene 2: Style 07 SplitCompareCardScene (100% vs 200% vs التجارة مع الله — wait, keep speaker visible in between!)
  // Actually let's keep Scene 2 compact [550 - 760] so speaker body language shines!
  buildPhrase(468, 545, "جابت له مكسب ١٠٠٪..", ["١٠٠٪.."], "LINE_GLIDE"),
  // [550 - 765] Scene 2: Style 07 SplitCompareCardScene (100% vs 200% مين أعقل؟)
  buildPhrase(770, 865, "بلغة الدنيا يقولوا ده أذكى من ده!", ["أذكى"], "WORD_FLOW_LOCKED"),
  buildPhrase(870, 1020, "واحد جاب ٢٠٠٪ والتاني ما جابش غير ١٠٠٪", ["٢٠٠٪"], "LINE_GLIDE"),
  buildPhrase(1045, 1165, "واحد تالت جت له المليون..", ["تالت"], "TWO_BEAT_EDITORIAL"),
  buildPhrase(1170, 1275, "لو أنفقتها كلها في سبيل الله", ["سبيل", "الله"], "WORD_FLOW_LOCKED"),
  buildPhrase(1280, 1365, "هبقى تاجرت مع ربنا سبحانه!", ["تاجرت"], "TWO_BEAT_EDITORIAL"),
  buildPhrase(1370, 1475, "صرفها كلها في سبيل الله.. فمن أعقل الثلاثة؟", ["الثلاثة؟"], "LINE_GLIDE"),
  // [1485 - 1755] Scene 3: Style 14 VoxHighlighterSweepScene (مسألة الإمام الشافعي والوصية)
  buildPhrase(1760, 1880, "وصية لازم ننفذها.. مات وسابها فزورة!", ["فزورة!"], "WORD_FLOW_LOCKED"),
  buildPhrase(1885, 2045, "كتب: هذا المال يُنفق في أعقل الناس!", ["أعقل", "الناس!"], "TWO_BEAT_EDITORIAL"),
  // [2055 - 2225] Scene 4: Style 16 TornPaperCollageScene (قال الشافعي: تُنفق في الزهاد!)
  // [2230 - 2318] Scene 5: Style 15 LiquidGlassCardScene (Floating over live speaker: «هم دول أعقل الناس!»)
];

/**
 * BRAND-NEW REEL 6 (1080x1920 Full HD): «من هم أعقل الناس؟ — قصة الإمام الشافعي والمليون جنيه»
 * Showcases 5 COMPLETELY DIFFERENT scene styles from QabasSceneLibrary.tsx (Zero repetition!):
 *   1. Style 04 BurgundyTapeImpactScene
 *   2. Style 07 SplitCompareCardScene
 *   3. Style 14 VoxHighlighterSweepScene
 *   4. Style 16 TornPaperCollageScene
 *   5. Style 15 LiquidGlassCardScene (floating over live speaker!)
 */
export const ReelAqalAlNasHD: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.obsidianCharcoal[900], direction: "rtl" }}>
      <style>{ARABIC_FONT_CSS}</style>

      {/* Layer 1: TRUE 1080p HD Speaker Video (1080x1920) + Untouched 192kbps Raw Audio */}
      <OffthreadVideo
        src={staticFile("media/r6_aqal_1080p_base.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Layer 2: Seamless Bottom Cinema Vignette (ZERO dark halo/box!) */}
      <SeamlessBottomVignette />

      {/* Layer 3: Silky Editorial Captions (Medium 500+ base weight, zero jump, smooth entry/exit) */}
      {PHRASES.map((ph, idx) => (
        <EditorialCaption key={idx} words={ph.words} mode={ph.mode} whisperTop={ph.whisperTop} />
      ))}

      {/* Layer 4: 5 Distinct Scene Styles from QabasSceneLibrary.tsx + Ultra-Quiet Organic SFX */}
      <Sequence from={112} durationInFrames={158}>
        <Audio src={staticFile("sfx/01_air_whoosh_soft.wav")} volume={0.12} />
        <BurgundyTapeImpactScene
          durFrames={158}
          eyebrow="قاعدة من ذهب"
          tapeText="أعقل الناس هم الزُهّاد!"
          subline="عرفوا إن الدنيا مش باقية لحد.."
        />
      </Sequence>

      <Sequence from={550} durationInFrames={215}>
        <Audio src={staticFile("sfx/09_subtle_camera_shutter.wav")} volume={0.12} />
        <SplitCompareCardScene
          durFrames={215}
          title="معاك مليون جنيه.. مين أعقل؟"
          cards={[
            { label: "الأول: استثمرها في الدنيا", badge: "١٠٠٪", delay: 8 },
            { label: "الثاني: ضاعف أرباحه", badge: "٢٠٠٪", delay: 42 },
            { label: "الثالث: تاجر بها مع الله", badge: "∞ الجنة", highlight: true, delay: 90 },
          ]}
        />
      </Sequence>

      <Sequence from={1485} durationInFrames={270}>
        <Audio src={staticFile("sfx/05_marker_glide_soft.wav")} volume={0.12} />
        <VoxHighlighterSweepScene
          durFrames={270}
          sourceLabel="مسألة فقهية رُفعت للإمام الشافعي"
          beforeText="رجلٌ مات وأوصى بجزءٍ من ماله"
          highlightedText="لأعقلِ الناس!"
          afterText="فاحتاروا فيمن يستحقها.."
          sweepDelay={34}
        />
      </Sequence>

      <Sequence from={2055} durationInFrames={170}>
        <Audio src={staticFile("sfx/11_soft_book_page_thud.wav")} volume={0.12} />
        <TornPaperCollageScene
          durFrames={170}
          eyebrow="فأفتى الإمام الشافعي قائلًا:"
          calligraphyMain="تُنفقُ في الزُهّاد!"
          footerNote="لأنهم استثمروا في الدار الباقية"
        />
      </Sequence>

      <Sequence from={2230} durationInFrames={88}>
        <Audio src={staticFile("sfx/03_warm_sub_swell.wav")} volume={0.12} />
        <LiquidGlassCardScene
          durFrames={88}
          eyebrow="الخلاصة"
          headline="هم دول أعقل الناس!"
          subline="الزُهد هو أذكى استثمار في الوجود"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
