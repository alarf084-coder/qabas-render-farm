# مكتبة الكابشن فوق المتحدث (19 أسلوبًا) + منع التداخل والتأليف + التقسيم النحوي + قواعد القرآن الكريم

> **جميع الـ 19 أسلوبًا (`C01` – `C19`) مبرمجة وجاهزة للاستدعاء داخل `EditorialCaption.tsx`، مع منسّق منع التداخل الإجباري `EditorialCaptionTrack` وفحص منع التأليف `scripts/audit_reel_text.py`.**

---

## 1. القواعد الصارمة غير القابلة للتنازل
1. **قاعدة الصدق الحرفي ومنع التأليف نهائيًا (`100% Spoken Words Only`):**
   - **يُمنع منعًا باتًا إضافة أو اختراع أي كلمة لم ينطقها المتحدث بصوته** — لا في الكابشن ولا في مشاهد التايبوجرافي (ممنوع إضافة كلمات مثل *"لكن"*، *"إذن"*، *"الخلاصة"*، *"الدرس الأول"* إذا لم تُنطق في الصوت!).
   - **الاختصار الانتقائي مسموح، الإضافة ممنوعة:** في بعض الجمل لتقوية تصميم الكابشن التايبوجرافي فوق المتحدث، يمكنك إبراز أهم `2–4` كلمات فقط مما نطقه المتحدث (حذف الحشو فقط)، دون إضافة أي كلمة من عندك.
   - يجب تمرير كل ريل على **`scripts/audit_reel_text.py`** قبل الريندر.
2. **منع الكابشن المزدوج وتداخل الجمل (`EditorialCaptionTrack` + `hideRanges` لكل المشاهد):**
   - استخدم دائمًا **`<EditorialCaptionTrack phrases={...} defaultVariant="..." hideRanges={[...]} />`**.
   - **قاعدة حاسمة:** يجب إدراج نطاق `[startFrame, endFrame]` لكل مشهد تايبوجرافي في `hideRanges` — **بما في ذلك مشاهد الـ Overlay فوق المتحدث (`01 SideNegativeStackScene`, `02 BehindSpeakerDepthScene`, `03 MinimalTopEditorialScene`, `15 LiquidGlassCardScene`)** حتى لا يظهر كابشن أعلى الشاشة وكابشن أسفل الشاشة في نفس اللحظة أبدًا!
3. **التزامن الصفري `0.000s`:**
   - استخدم `scripts/finalize_clip.py` لقص البداية المستقلة والنهاية المكتملة وتصفير توقيتات الكلمات تلقائيًا؛ يُمنع استخدام `startFrom=` على `<OffthreadVideo />`.
4. **التقسيم بالمعنى وليس بعدد كلمات آلي (`Semantic Arabic Chunking`):**
   - المدى المستهدف `3–5` كلمات (مرن `2–6`) عند فواصل المعنى فقط.
   - **ممنوع إنهاء السطر بـ:** حرف عطف (`و`، `أو`، `ثم`، `لكن`، `بل`)، أو حرف جر (`في`، `على`، `من`، `إلى`، `عن`)، أو أداة/فعل ناسخ (`كان`، `إن`، `أن`، `الذي`، `التي`)، أو فصل كلمة على سطرين.
5. **التدقيق الإملائي كفقرة عربية كاملة (`Paragraph-First ASR Proofreading`):**
   - اقرأ `transcript_paragraph_final.txt` كفقرة متصلة كاملة وصحّح أخطاء Whisper الشائعة قبل حفظ `words_verified.json`.
6. **ثبات النص والراحة للعين:** صفر هزة (إحداثيات بكسل صحيحة + `transform: "none"` عند الاستقرار)، وزن خط أساسي `>= 500`، صفر هالة سوداء (`SeamlessBottomVignette`)، صفر لوجو، عند `top: 71%`.
7. **قاعدة القرآن الكريم القطعية:** جلب حرفي عبر `scripts/fetch_quran_ayah.py --surah <S> --ayah <A> --out <path.json>` فقط (مع معالجة SSL التلقائية). إن تعذّر الـ API، يعيد `SafeQuranGoldFrameScene` القيمة `null` تلقائيًا ليظهر الفيديو الحقيقي للمتحدث كما هو.

---

## 2. الكتالوج الكامل لـ 19 أسلوب كابشن مبرمج في `EditorialCaption.tsx`

### المجموعة الأساسية (`C01 – C12`) — مرجع بصري: `brand/caption_styles_board.png`
1. **`C01_DUO_EDITORIAL`** *(الاسم البديل: `EDITORIAL_CLEAN`)*: `IBMPlexArabic Medium 500` أبيض + كلمة بطل `Amiri Bold` أو `Lalezar` ذهبي.
2. **`C02_ACTIVE_WORD_BOX`**: كبسولة نبيتي/زمردي تضيء خلف الكلمة المنطوقة لحظيًا في مكانها الثابت.
3. **`C03_SOFT_FOCUS_LYRIC`**: كلمات هادئة الشفافية (`56%`) تضيء إلى `100%` لحظة نطقها.
4. **`C04_BURGUNDY_TAPE`**: شريط نبيتي/زمردي مجسّم مائل (`-1.5°`) بظل قطري حاد لـ 2–4 كلمات صادمة.
5. **`C05_FROSTED_GLASS_PILL`**: كبسولة زجاجية داكنة متدرجة بإطار مضيء ناعم (سريعة على CPU).
6. **`C06_CINEMA_GOLDEN_SERIF`**: خط `Amiri Bold` ذهبي كريمي دافئ بظل سينمائي ناعم بدون صندوق.
7. **`C07_RUQAH_SIDE_CASCADE`**: تدرج محاذى لليمين بخط `ArefRuqaa Bold` (`lineHeight: 1.66`).
8. **`C08_HIGHLIGHTER_SWEEP`**: شريط تظليل ماركر ذهبي/نبيتي يمتد بسلاسة تحت الكلمة المحورية.
9. **`C09_STACKED_HIERARCHY`**: سطر تمهيدي `Almarai Bold` فوق سطر أساسي عريض `Tajawal ExtraBold`.
10. **`C10_PARCHMENT_STRIP`**: شريط ورق كريمي مائل بحبر فحمي + كلمة نبيتي.
11. **`C11_SINGLE_WORD_PUNCH`**: كلمة أو كلمتان ضخمتان بخط `Lalezar` بتكبير سلس (`0.92 → 1.0`).
12. **`C12_SCRIPT_SANS_POETIC`**: مزج `Almarai Bold` مع كلمة روحانية بخط `Gulzar` الذهبي (`lineHeight: 1.66`).

### المجموعة المتقدمة متعددة الأوزان والخطوط (`C13 – C17`) — مرجع بصري: `brand/pro_5_captions_board.png`
13. **`C13_TRI_FONT_LOCKUP`**: ثلاثي الخطوط — `IBMPlexArabic Medium` + `Lalezar` + كلمة شاعرية (`poetic: true`) بخط `Gulzar`.
14. **`C14_OVERSIZED_ANCHOR`**: سطر تمهيدي هادئ (`whisperTop`) + مرساة ضخمة بخط `Lalezar` / `Rakkas`.
15. **`C15_CALLIGRAPHIC_SLASH`**: `Almarai ExtraBold` أبيض + كلمة `ArefRuqaa Bold` ذهبية مائلة (`-4°`).
16. **`C16_MAGAZINE_SPINE`**: محاذاة يمينية بجانب عمود رأسي ذهبي/نبيتي يجمع `ReemKufi` + `IBMPlexArabic Medium` + `Amiri Bold`.
17. **`C17_CONTRAST_SANDWICH`**: سطر علوي تمهيدي فوق شريط زمردي/نبيتي فاخر بإطار ذهبي رفيع وخط `Lalezar` / `Almarai`.

### أسلوبا التوقيع المعتمدان من الفيديو الأول (`C18 – C19`)
18. **`C18_EMERALD_GLASS_CARD`**: بطاقة زمردية متدرجة بإطار ذهبي رفيع (سريعة على CPU).
19. **`C19_CRISP_STROKED_GOLD`** *(الاسم البديل: `CRISP_STROKED_GOLD` — مراجع: `brand/ref_caption_c19_duo_stroked.png` و `brand/ref_caption_c19_ruqaa_gold.png`)*: `Almarai Bold` أبيض + `ArefRuqaa` / `Amiri Bold` بالذهبي `#F5C842` بحد فحمي خارجي (`paintOrder: "stroke fill"`, `6px–8px #12100E`).

---

## 3. العائلات الخمس المترابطة (اختر عائلة واحدة فقط لكل ريل!)

| العائلة | أسلوب السرد الأساسي (80%) | تنويعة الإبراز/الـ Hook الشقيقة (20%) | أنسب نوع فيديوهات |
|---|---|---|---|
| **العائلة A: التحريرية متعددة الأوزان** | `C01_DUO_EDITORIAL` | `C13_TRI_FONT_LOCKUP` أو `C14_OVERSIZED_ANCHOR` | مقاطع فكرية، دعوية قوية، تصحيح مفاهيم |
| **العائلة B: الروحانية الخطاطية الهادئة** | `C06_CINEMA_GOLDEN_SERIF` أو `C03_SOFT_FOCUS_LYRIC` | `C12_SCRIPT_SANS_POETIC` أو `C16_MAGAZINE_SPINE` أو `C07_RUQAH_SIDE_CASCADE` | تزكية، رقائق، قصص سيرة، تدبر هادئ |
| **العائلة C: الحركية عالية التباين** | `C02_ACTIVE_WORD_BOX` | `C11_SINGLE_WORD_PUNCH` أو `C17_CONTRAST_SANDWICH` أو `C04_BURGUNDY_TAPE` | إلقاء حماسي سريع، تحديات، نصائح عملية |
| **العائلة D: الوثائقية والزجاجية الدافئة** | `C08_HIGHLIGHTER_SWEEP` أو `C18_EMERALD_GLASS_CARD` | `C10_PARCHMENT_STRIP` أو `C15_CALLIGRAPHIC_SLASH` أو `C05_FROSTED_GLASS_PILL` | كشف تناقضات، قصص تاريخية، اقتباسات |
| **العائلة E: التوقيع الذهبي المحدّد (`C19`)** | `C19_CRISP_STROKED_GOLD` (`LINE_GLIDE` / `WORD_FLOW_LOCKED`) | `C19_CRISP_STROKED_GOLD` (`TWO_BEAT_EDITORIAL` بخط `ArefRuqaa`) أو `C09_STACKED_HIERARCHY` | مقاطع فوق ملابس فاتحة/بيضاء أو الريلز التوقيعية |
