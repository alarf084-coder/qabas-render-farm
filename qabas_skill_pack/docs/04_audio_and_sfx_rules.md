# قواعد هندسة الصوت والمؤثرات الصوتية الخفية (11 مؤثرًا عضويًا) — «قَبسٌ مِنْ أَثر»

## 1. القواعد الصارمة للصوت (غير قابلة للتنازل)
- **الحفاظ على نقاء صوت المتحدث الخام:** لا تُطبّق فلاتر `afftdn` أو EQ ثقيل يكتُم صوت المايك النظيف أصلًا. التصدير بجودة `192 kbps AAC Stereo`.
- **منع أي خلفية صوتية:** لا موسيقى، لا أناشيد، لا أدعية في الخلفية.
- **منع المؤثرات المزعجة تمامًا:** ممنوع استخدام أي صوت رنّة (`bell`/`chime`)، أو خبط حاد (`slam`/`bang`)، أو نقرات رقمية عالية، أو وضع مؤثرات على كل كلمة.
- **قانون المؤثر الخفي (Invisible SFX Law):**
  - المؤثر الصوتي دوره يعطي "روح ونَفَس" للمشهد **دون أن يشعر المشاهد بوجود مؤثر صوتي عالٍ**.
  - مستوى دمج الـ SFX داخل Remotion يكون منخفضًا جدًا: بين **`0.06` و `0.14`** (أي أقل من صوت المتحدث بـ **`-22 dB` إلى `-28 dB`**).
  - استخدم المكوّن الجاهز `QabasSfxCue` و `QABAS_SFX` من `src/sfx.tsx` لضمان اختيار الملف الصحيح وعدم تجاوز مستوى `0.14` أبدًا:
    ```tsx
    import { QabasSfxCue } from "./sfx";
    <QabasSfxCue sfx="paperBrushSoft" from={180} />
    ```

## 2. مكتبة الـ 11 مؤثرًا صوتيًا عضويًا المعتمدة (`public/sfx/` + `src/sfx.tsx`)
| المفتاح في `QABAS_SFX` | الملف | الوصف | مستوى الصوت | الأساليب المناسبة |
|---|---|---|---|---|
| `airWhooshSoft` | `01_air_whoosh_soft.wav` | نسمة هواء دافئة وناعمة جدًا | `0.10` | الانتقالات العادية بين المشاهد |
| `airWhooshDeep` | `02_air_whoosh_deep.wav` | نفس هوائي أعمق وأبطأ | `0.11` | `Camera3DFlyThroughScene`, `WordMatchCutZoomScene`, دخول الليلي |
| `warmSubSwell` | `03_warm_sub_swell.wav` | همسة Bass ناعمة بدون خبطة | `0.12` | `SingleWordShockScene`, `SafeQuranGoldFrameScene`, ذروة الريل |
| `paperBrushSoft` | `04_paper_brush_soft.wav` | حفيف ورق ناعم وخافت | `0.10` | `TornPaperCollageScene`, `BurgundyTapeImpactScene`, `SwissEditorialListScene` |
| `markerGlideSoft` | `05_marker_glide_soft.wav` | حركة قلم/ريشة ناعمة على الورق | `0.11` | `VoxHighlighterSweepScene`, `AnimatedPathMetaphorScene` |
| `clothSwipeShort` | `06_cloth_swipe_short.wav` | حركة سريعة وهادئة (بديل الخبط) | `0.09` | `RedactionStrikeFlipScene`, `SplitCompareCardScene` |
| `softMutedTap` | `07_soft_muted_tap.wav` | لمسة خشبية مكتومة بدون رنة | `0.08` | ظهور نقاط القوائم أو `LiquidGlassCardScene` |
| `gentleHeartbeat` | `08_gentle_heartbeat.wav` | نبضة قلب دافئة وخافتة جدًا | `0.12` | لحظات القلب والتأثر العميق (مرة واحدة فقط في الريل) |
| `subtleCameraShutter` | `09_subtle_camera_shutter.wav` | غالق كاميرا ميكانيكي ناعم جدًا | `0.09` | دخول تايبوغرافي حاد (`SingleWordShockScene`, `BehindSpeakerDepthScene`) |
| `pencilSketchWrite` | `10_pencil_sketch_write.wav` | قلم رصاص/طباشير طبيعي على ورق | `0.10` | `AnimatedPathMetaphorScene`, `TornPaperCollageScene` |
| `softBookPageThud` | `11_soft_book_page_thud.wav` | تقليب صفحة كتاب وإغلاق هادئ | `0.11` | `VoxHighlighterSweepScene`, `SafeQuranGoldFrameScene` |
