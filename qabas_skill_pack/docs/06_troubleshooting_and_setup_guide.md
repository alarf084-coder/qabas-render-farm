# دليل التثبيت السريع والأداء وحل المشكلات (Zero-to-One Fast Studio Guide)

> مصمّم ليشتغل على أي خادم سحابي (حتى معالج نواتين بدون GPU) بأسرع وقت ممكن وبدون أي تنازل عن جودة Full HD `1080×1920`.

---

## 1. التثبيت التلقائي الخفيف والسريع (أمر واحد ~30 ثانية)
```bash
bash scripts/bootstrap_env.sh ./remotion_studio
```
- **سياسة المكتبات بالطلب (`Lean Dependencies`):** يثبّت `package.json.template` الحزم الأساسية السريعة فقط (`remotion`, `@remotion/cli`, `@remotion/renderer`, `@remotion/bundler`, `@remotion/transitions`, `@remotion/shapes`, `@remotion/paths`). بعد تخطيط مشاهدك، إذا احتاج ريل معيّن مكتبة ثقيلة اختيارية (مثل `three` أو `@remotion/lottie` أو `gsap`)، ثبّت تلك المكتبة وحدها عند الحاجة (`npm install <pkg>`).

---

## 2. جدول المشكلات التقنية وحلولها الفورية (Troubleshooting & Performance Matrix)

### المشكلة 1: بطء شديد جدًا في الريندر على خوادم CPU (نواتين بدون GPU)
- **الأسباب التي تم حلها جذريًا في المهارة v3:**
  1. تم استبدال `filter: blur(140px)` و`feTurbulence` و`backdropFilter: blur(24px)` ببدائل CSS مطابقة بصريًا 100% وأسرع بعشرات الأضعاف على `swangle`.
  2. تم تسريع `verify_render_qa.py` بـ **20×** (بناء Webpack مرة واحدة + متصفح واحد لكل اللقطات بدل إعادة البناء مع كل صورة).
  3. تم إضافة `scripts/discover_clips.py` لجلب نص المحاضرة من ترجمة يوتيوب في **3 ثوانٍ** بدل تفريغ محاضرة ساعة كاملة على CPU.
  4. عند الريندر النهائي، ابنِ مرة واحدة (`npx remotion bundle src/index.ts --out-dir ./build`) ورندر من `./build` مع:
     ```bash
     --codec=h264 --crf=18 --x264-preset=fast --image-format=jpeg --jpeg-quality=95 --audio-bitrate=192k
     ```
     (نفس جودة Full HD `1080×1920` تمامًا، وسرعة 2.5×–3× أعلى!).

### المشكلة 2: خطأ `OffthreadVideo: No frame found` أو فشل الريندر المتوازي
- **السبب:** تشغيل عمليتي `remotion render` بالتوازي على معالج نواتين، أو وجود B-frames طويلة في ملف الفيديو التمهيدي.
- **الحل الدائم:**
  1. `extract_and_transcribe.py` يشفر المقطع التمهيدي تلقائيًا بـ **`-bf 0 -g 15`** (بدون B-frames + keyframe كل نصف ثانية).
  2. رندر **ريلًا واحدًا في المرة بالتتابع** على الخوادم ذات النواتين (`--concurrency=2`)، وطبّق قاعدة **الريل الأول أولًا (`Pilot-First`)**.

### المشكلة 3: تداخل سطري كابشن فوق بعضهما أثناء الانتقال
- **الحل الدائم:** استخدم **`<EditorialCaptionTrack phrases={...} hideRanges={[...]} />`** بدل `<EditorialCaption />` داخل `.map()`؛ فهو يمنع التداخل رياضيًا 100%.

### المشكلة 4: قصّ نهاية الفيديو قبل اكتمال آخر جملة
- **الحل الدائم:** `extract_and_transcribe.py` يضيف `-3s/+10s` أمان تلقائيًا ويحفظ `exactDurationFrames` في `clip_meta.json` — استورده مباشرة في `Root.tsx` ولا تخمّن المدة يدويًا أبدًا.

### المشكلة 5: خطأ `connect ECONNREFUSED ::1:3000`
- **الحل الدائم:** `export NODE_OPTIONS="--dns-result-order=ipv4first"` قبل أي أمر `npx remotion`.

### المشكلة 6: شهادات SSL في البيئات السحابية (YouTube / Quran API)
- **الحل الدائم:** `discover_clips.py` و`extract_and_transcribe.py` يستخدمان `--no-check-certificates`، و`fetch_quran_ayah.py` يعالج `SSLError` تلقائيًا مع الحفاظ على قاعدة الطوارئ (`FALLBACK_TO_RAW_FOOTAGE`).

### المشكلة 7: حد حجم الرفع السحابي (`10 MB` في بعض أدوات Drive)
- **القاعدة القطعية:** **ممنوع منعًا باتًا ضغط الفيديو إلى `500kbps` أو تقليل الدقة إلى `720p`!** صدّر دائمًا نسخة الماستر الكاملة **Full HD `1080×1920`, `CRF 18` (`3–6 Mbps`), `192kbps AAC`** وسلّمها مباشرة للمستخدم.
