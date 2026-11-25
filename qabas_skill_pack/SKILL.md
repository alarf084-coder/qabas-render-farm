---
name: qabas-min-athar-reels-studio
description: Complete self-contained Full HD (1080x1920) Arabic Reels/Shorts production studio skill for «قَبسٌ مِنْ أَثر» using Remotion, Al-Riwaq identity, 16 bundled Arabic fonts, ALL 18 jitter-free CPU-fast typography scenes (QabasSceneLibrary.tsx), ALL 19 caption styles (C01-C19) with zero-overlap EditorialCaptionTrack + mandatory hideRanges for ALL scenes including overlays, automatic face-centered 9:16 smart crop (extract_and_transcribe.py), 0.000s drift sync trimmer (finalize_clip.py), 100% verbatim spoken-words-only pre-render auditor (audit_reel_text.py), 3-second transcript discovery (discover_clips.py), single-bundle fast QA (verify_render_qa.py), and SSL-safe Quran API fail-safe.
---

# مهارة استوديو «قَبسٌ مِنْ أَثر» المتكاملة لإنتاج الريلز العربية — الإصدار النهائي v4 (صفر تداخل، صفر هزة، صفر تأليف، توسيط تلقائي للوجه، وتزامن 0.000 ثانية)

هذه الحزمة **مكتفية ذاتيًا 100%**؛ مصممة لأي وكيل ذكاء اصطناعي يبدأ من الصفر، مع **حواجز برمجية وفحوصات آلية إلزامية قبل الريندر** تمنع تمامًا: الكابشن المزدوج، اختلال التزامن، تأليف الكلمات، انحراف المتحدث عن منتصف الكادر، اهتزاز النص، والبطء الشديد.

---

## 1. القواعد القطعية غير القابلة للكسر (Hard Non-Negotiable Guardrails)

### أ. قاعدة الصدق الحرفي ومنع التأليف نهائيًا (100% Spoken-Words-Only — ZERO Fabrication!)
1. **ممنوع منعًا باتًا تأليف أو إضافة أي كلمة لم ينطقها المتحدث حرفيًا — لا في الكابشن ولا في مشاهد التايبوجرافي!**
   - يُمنع إضافة كلمات ربط أو عناوين من عندك مثل: *"لكن"*، *"إذن"*، *"الدرس الأول"*، *"الخلاصة"*، *"القاعدة"* إذا لم ينطقها المتحدث بصوته في المقطع!
   - **ما المسموح به في الكابشن؟** يُسمح بـ **الاختصار الانتقائي (حذف كلمات حشو)** لإبراز أهم `2–4` كلمات نطقها المتحدث بتصميم تايبوجرافي قوي أثناء ظهوره في الكادر — **الحذف لتقوية التصميم مسموح، أما إضافة أي كلمة لم تُنطق فممنوع 100%!**
2. **فحص آلي إجباري قبل الريندر (`scripts/audit_reel_text.py`):** شغّل السكريبت على كل ملف `.tsx` قبل الريندر ليتحقق آليًا أن كل كلمة عربية مكتوبة على الشاشة موجودة فعلًا في `words_verified.json`.

### ب. قاعدة منع الكابشن المزدوج وتداخل الجمل (ONE Text System at a Time — ZERO Overlap!)
1. **ممنوع ظهور كابشنين في نفس اللحظة (أعلى وأسفل الشاشة معًا)!**
   - استخدم دائمًا **`<EditorialCaptionTrack phrases={...} defaultVariant="..." hideRanges={[...]} />`** (ممنوع عمل `.map()` مباشر لـ `<EditorialCaption />`).
   - **قاعدة `hideRanges` القطعية:** يجب إضافة نطاق `[startFrame, endFrame]` لكل مشهد تايبوجرافي بلا استثناء — **سواء كان مشهدًا كامل الشاشة أو مشهد Overlay فوق المتحدث (`01 SideNegativeStackScene`, `02 BehindSpeakerDepthScene`, `03 MinimalTopEditorialScene`, `15 LiquidGlassCardScene`)!**
   - بمجرد ظهور أي مشهد تايبوجرافي (أعلى أو جانب أو بطاقة)، **يختفي الكابشن السفلي تمامًا** فلا يظهر نصان في نفس اللحظة أبدًا.

### ج. قاعدة التزامن الصفري `0.000s` + البداية المستقلة والنهاية المكتملة
1. **استخدم `scripts/finalize_clip.py` دائمًا بعد `extract_and_transcribe.py`:**
   - المرحلة 1 (`extract_and_transcribe.py`) تحمّل المقطع بهامش أمان `-3s` قبل البداية و`+10s` بعد النهاية.
   - المرحلة 2 (`finalize_clip.py`) تقص `reel_1080p_final.mp4` على **أول كلمة مستقلة** و**آخر كلمة مكتملة (+0.40s هدوء)** وتُصفّر توقيتات كل كلمة تلقائيًا في `words_synced.json` وتكتب `exactDurationFrames` في `clip_meta_final.json`.
2. **ممنوع استخدام `startFrom=` على `<OffthreadVideo />`** (لأنه يُحدث ترحيلًا بين الصوت والكابشن!)، وممنوع تخمين أرقام فريمات المشاهد يدويًا: بداية ونهاية كل مشهد تايبوجرافي تُؤخذ حرفيًا من `startFrame` لأول كلمة و`endFrame` لآخر كلمة في `words_verified.json`.

### د. قاعدة توسيط المتحدث في منتصف الكادر (`Face-Centered 9:16 Framing`)
1. `extract_and_transcribe.py` يكتشف تلقائيًا منتصف وجه المتحدث عبر OpenCV على 14 إطارًا ويضبط `crop_x` ليبقى المتحدث **في منتصف كادر `9:16` تمامًا**، ويحفظ صورة **`crop_check.png`**.
2. **فحص إجباري:** افتح `crop_check.png` وتأكد أن وجه المتحدث في المنتصف؛ وإن احتاج تعديلًا في لقطة جانبية خاصة، مرّر `--crop-x-pct <0.0-1.0>` (مثل `0.42`).

### هـ. قاعدة ثبات النص التام (`Zero Text Jitter`) + الكابشن المريح للعين
1. **صفر هزة للنص:** جميع المكونات (`QabasPrimitives.tsx`, `QabasSceneLibrary.tsx`, `EditorialCaption.tsx`) تفصل الخلفية عن النص (ممنوع `scale()` مستمر على حاوية فيها نص وممنوع `Math.sin`) وتقرّب كل حركة لأقرب بكسل صحيح وتثبّتها على `transform: "none"` فور الاستقرار.
2. **الكابشن (`C01`–`C19`):** وزن أساسي `>= 500`، صفر هالة سوداء (`SeamlessBottomVignette`)، صفر اهتزاز أفقي، تقسيم نحوي بالمعنى (ممنوع إنهاء السطر بحرف عطف/جر/فعل ناسخ أو شطر كلمة)، وتدقيق إملائي كفقرة عربية كاملة (`transcript_paragraph_final.txt`).

### و. قاعدة الجودة القصوى + السرعة (Full HD `1080×1920` بدون فلاتر ثقيلة)
1. **بناء Webpack مرة واحدة + ريندر سريع بنفس الجودة القصوى:**
   - `npx remotion bundle src/index.ts --out-dir ./build`
   - `npx remotion render ./build <CompId> ../output_1080p.mp4 --codec=h264 --crf=18 --x264-preset=fast --image-format=jpeg --jpeg-quality=95 --audio-bitrate=192k --concurrency=2`
   - ممنوع تشغيل عمليتي ريندر بالتوازي على معالج نواتين، وممنوع ضغط البتريت لـ `500kbps`!
2. **نظام الريل الأول أولًا (`Pilot-First`):** أنجز وافحص الريل الأول كاملًا أولًا، ثم نفّذ باقي الريلز من نفس الـ bundle.
3. **صفر لوجو + صفر قصّ + قرآن من API فقط (`fetch_quran_ayah.py`) + تنويع 4–6 مشاهد من الـ 18 أسلوبًا بدون نسخ الأمثلة + صوت خام `192kbps` + مؤثرات عبر `<QabasSfxCue />` (`<= 0.14`).**

---

## 2. خط الإنتاج الكامل الموحّد (خطوة بخطوة — صفر أخطاء)

1. **تهيئة الاستوديو السريعة (~30 ثانية):**
   ```bash
   bash scripts/bootstrap_env.sh ./remotion_studio
   ```
2. **اكتشاف أفضل المقاطع في 3 ثوانٍ (من ترجمة يوتيوب بدون تفريغ الساعة كلها):**
   ```bash
   python3 scripts/discover_clips.py --url "<YOUTUBE_URL>" --out-dir ./lecture_discovery
   ```
3. **المرحلة 1 — استخراج `1080p` + توسيط تلقائي للوجه + هامش `-3s/+10s`:**
   ```bash
   python3 scripts/extract_and_transcribe.py \
     --url "<YOUTUBE_URL>" --start "<HH:MM:SS>" --end "<HH:MM:SS>" \
     --out-dir "./work_reel_1"
   ```
   *(افحص `work_reel_1/crop_check.png` للتأكد من توسيط وجه المتحدث!)*
4. **المرحلة 2 — قصّ البداية المستقلة والنهاية المكتملة + تصفير التوقيتات بتزامن `0.000s`:**
   ```bash
   python3 scripts/finalize_clip.py \
     --work-dir "./work_reel_1" --start-sec <EXACT_START> --end-sec <EXACT_END_PLUS_0.40>
   ```
5. **التدقيق الإملائي كفقرة كاملة + توثيق أي آية قرآنية:**
   - راجع `work_reel_1/transcript_paragraph_final.txt` كفقرة متصلة كاملة ← احفظ `words_verified.json`.
   - للآيات القرآنية: `python3 scripts/fetch_quran_ayah.py --surah <S> --ayah <A> --out ./work_reel_1/ayah.json`.
6. **بناء الريل + الفحص الآلي الإجباري قبل الريندر (يكشف أي كلمة مؤلّفة أو كابشن مزدوج!):**
   ```bash
   python3 scripts/audit_reel_text.py --tsx ./remotion_studio/src/<Reel>.tsx --verified-words ./work_reel_1/words_verified.json
   ```
7. **الفحص البصري السريع (باندل واحد + متصفح واحد ~10 ثوانٍ):**
   ```bash
   export NODE_OPTIONS="--dns-result-order=ipv4first"
   python3 scripts/verify_render_qa.py \
     --studio ./remotion_studio --comp <CompId> \
     --frames 15,240,600,1100,1500 --out-dir ./qa_stills --rebuild
   ```
8. **ريندر الماستر Full HD من الباندل الجاهز `./build`:**
   ```bash
   export NODE_OPTIONS="--dns-result-order=ipv4first"
   cd remotion_studio && npx remotion render ./build <CompId> ../output_1080p.mp4 \
     --codec=h264 --crf=18 --x264-preset=fast \
     --image-format=jpeg --jpeg-quality=95 \
     --audio-bitrate=192k --concurrency=2
   ```

---

## 3. قائمة الفحص القطعية قبل التسليم (Pre-Delivery QA Checklist)
- [ ] **توسيط الوجه:** تم فحص `crop_check.png` والوجه في منتصف كادر `9:16`.
- [ ] **صفر كلمات مؤلفة:** نجح `scripts/audit_reel_text.py` بنسبة 100% (كل كلمة في الكابشن والتايبوجرافي منطوقة فعليًا في الصوت).
- [ ] **صفر كابشن مزدوج وصفر تداخل:** استخدام `EditorialCaptionTrack` مع `hideRanges` شاملة لكل المشاهد (كاملة الشاشة وOverlays `01/02/03/15`).
- [ ] **تزامن `0.000s` وبداية/نهاية مكتملة:** استخدام `reel_1080p_final.mp4` و`words_synced.json` و`exactDurationFrames` من `finalize_clip.py` بدون `startFrom=`.
- [ ] **صفر هزة + صفر لوجو + جودة Full HD `1080×1920` (`CRF 18`, `3–6 Mbps`, `192kbps AAC`).**
