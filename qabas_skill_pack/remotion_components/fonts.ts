import { staticFile } from "remotion";

/**
 * Loads ALL 16 bundled Arabic .ttf fonts from public/fonts/ (copied from skill/fonts/).
 * Inject via <style>{ARABIC_FONT_CSS}</style> inside your root Reel composition.
 */
export const ARABIC_FONT_CSS = `
@font-face { font-family: 'IBMPlexArabic'; src: url('${staticFile("fonts/IBMPlexSansArabic-Light.ttf")}') format('truetype'); font-weight: 300; }
@font-face { font-family: 'IBMPlexArabic'; src: url('${staticFile("fonts/IBMPlexSansArabic-Medium.ttf")}') format('truetype'); font-weight: 500; }
@font-face { font-family: 'IBMPlexArabic'; src: url('${staticFile("fonts/IBMPlexSansArabic-Bold.ttf")}') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Almarai'; src: url('${staticFile("fonts/Almarai-Bold.ttf")}') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Almarai'; src: url('${staticFile("fonts/Almarai-ExtraBold.ttf")}') format('truetype'); font-weight: 800; }
@font-face { font-family: 'Tajawal'; src: url('${staticFile("fonts/Tajawal-Regular.ttf")}') format('truetype'); font-weight: 400; }
@font-face { font-family: 'Tajawal'; src: url('${staticFile("fonts/Tajawal-Bold.ttf")}') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Tajawal'; src: url('${staticFile("fonts/Tajawal-ExtraBold.ttf")}') format('truetype'); font-weight: 800; }
@font-face { font-family: 'Lalezar'; src: url('${staticFile("fonts/Lalezar-Regular.ttf")}') format('truetype'); font-weight: 400; }
@font-face { font-family: 'Rakkas'; src: url('${staticFile("fonts/Rakkas-Regular.ttf")}') format('truetype'); font-weight: 400; }
@font-face { font-family: 'Amiri'; src: url('${staticFile("fonts/Amiri-Regular.ttf")}') format('truetype'); font-weight: 400; }
@font-face { font-family: 'Amiri'; src: url('${staticFile("fonts/Amiri-Bold.ttf")}') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Amiri'; src: url('${staticFile("fonts/Amiri-Italic.ttf")}') format('truetype'); font-weight: 400; font-style: italic; }
@font-face { font-family: 'ArefRuqaa'; src: url('${staticFile("fonts/ArefRuqaa-Bold.ttf")}') format('truetype'); font-weight: 700; }
@font-face { font-family: 'Gulzar'; src: url('${staticFile("fonts/Gulzar-Regular.ttf")}') format('truetype'); font-weight: 400; }
@font-face { font-family: 'ReemKufi'; src: url('${staticFile("fonts/ReemKufi-Variable.ttf")}') format('truetype'); font-weight: 400 700; }
`;
