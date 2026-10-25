import type { Lang } from "./types";

/** Homepage + header/footer copy in all three languages. */
const en = {
  nav: { home: "Home", how: "How it works", features: "Features", about: "About" },
  getStarted: "Get started",
  openDashboard: "Open my dashboard",
  langLabel: "Language",
  themeLight: "Switch to light mode",
  themeDark: "Switch to dark mode",
  heroTitle1: "A health guide,",
  heroTitle2: "right by your side",
  heroText: "Understand your medical reports and prepare for doctor visits, in Gujarati, Hindi or English.",
  heroNote: "Free · Sign in with Google · Photos are never stored. Results are saved only on this device.",
  preview: {
    kicker: "Lab report · 24 Oct",
    tag: "Sample",
    summary: "Three results are outside the range printed by your lab.",
    tests: ["Fasting sugar", "Haemoglobin", "Creatinine"],
    status: { high: "High", low: "Low", normal: "Normal" },
    range: "range",
    question: "Question",
    chip: "6 questions ready for your doctor",
  },
  how: {
    kicker: "How it works",
    heading: "How ArogyaMitra works",
    sub: "Three simple steps to make your healthcare journey easier.",
    steps: [
      {
        title: "Share your health concerns",
        text: "Describe your symptoms or worries in your own words, in Gujarati, Hindi or English. You can also add a photo of a report or prescription.",
      },
      {
        title: "ArogyaMitra organises it",
        text: "Gemma, Google's open AI model, picks out symptoms, duration, age, medicines and allergies, and asks follow-up questions if something important is missing.",
      },
      {
        title: "Get a clear summary",
        text: "Receive an organised summary and questions for your doctor, ready to download and share with a qualified healthcare professional.",
      },
    ],
  },
  features: {
    kicker: "Features",
    heading: "What makes ArogyaMitra helpful",
    lang: { title: "Speaks your language", text: "Use it in Gujarati, Hindi or English. Explanations come back in the language you choose." },
    reports: {
      title: "Reads reports and prescriptions",
      text: "Photograph a lab report or prescription. Results outside your lab's range are highlighted, and medicines are laid out by time of day.",
    },
    questions: {
      title: "Questions for your doctor",
      text: "Personal questions based on what you shared, grouped by topic. Tick the ones you want to ask and add your own.",
    },
    pdf: { title: "Doctor-ready summary", text: "Download a one-page PDF to take to your appointment." },
    privacy: {
      title: "Private to you",
      text: "Your photos are never stored. Saved reports stay on your own phone, separate for each Google account.",
    },
  },
  safety: {
    heading: "Your health matters. Professional care comes first.",
    text: "ArogyaMitra helps you organise and understand your health information. It does not diagnose medical conditions, prescribe medicines or recommend treatments. Medical decisions should always be made by qualified healthcare professionals.",
  },
  final: {
    heading: "Take the first step towards understanding your health",
    text: "Share your concerns, organise your information and prepare for a more informed conversation with your doctor.",
  },
  footer: {
    about: "ArogyaMitra helps you understand your health information in Gujarati, Hindi or English and prepare clear summaries for your doctor. Powered by Gemma 4.",
    privacy: "Privacy policy",
    disclaimer: "Medical disclaimer",
    note: "Not a substitute for professional medical advice.",
  },
  auth: {
    SessionRequired: "Please sign in with Google to continue.",
    AccessDenied: "Sign-in was cancelled. You can try again whenever you're ready.",
    OAuthCallbackError: "Sign-in was cancelled or did not finish. Please try again.",
    Configuration: "Google sign-in is not set up yet on this server. Please try again later.",
    default: "Sign-in did not complete. Please try again.",
  },
};

export type HomeStrings = typeof en;

const hi: HomeStrings = {
  nav: { home: "होम", how: "यह कैसे काम करता है", features: "सुविधाएँ", about: "हमारे बारे में" },
  getStarted: "शुरू करें",
  openDashboard: "मेरा डैशबोर्ड खोलें",
  langLabel: "भाषा",
  themeLight: "लाइट मोड चालू करें",
  themeDark: "डार्क मोड चालू करें",
  heroTitle1: "सेहत का साथी,",
  heroTitle2: "हमेशा आपके साथ",
  heroText: "अपनी मेडिकल रिपोर्ट समझें और डॉक्टर से मिलने की तैयारी करें, गुजराती, हिंदी या अंग्रेज़ी में।",
  heroNote: "मुफ़्त · Google से साइन इन करें · फोटो कभी सेव नहीं होती। नतीजे सिर्फ़ इसी डिवाइस पर सेव होते हैं।",
  preview: {
    kicker: "जाँच रिपोर्ट · 24 अक्टूबर",
    tag: "नमूना",
    summary: "तीन नतीजे आपकी लैब की दी गई सीमा से बाहर हैं।",
    tests: ["खाली पेट शुगर", "हीमोग्लोबिन", "क्रिएटिनिन"],
    status: { high: "ज़्यादा", low: "कम", normal: "सामान्य" },
    range: "सीमा",
    question: "सवाल",
    chip: "डॉक्टर के लिए 6 सवाल तैयार",
  },
  how: {
    kicker: "यह कैसे काम करता है",
    heading: "आरोग्यमित्र कैसे काम करता है",
    sub: "तीन आसान कदम, जिनसे इलाज की राह आसान हो।",
    steps: [
      {
        title: "अपनी परेशानी बताएँ",
        text: "अपने लक्षण या चिंता अपने शब्दों में लिखें, गुजराती, हिंदी या अंग्रेज़ी में। आप रिपोर्ट या दवा की पर्ची की फोटो भी जोड़ सकते हैं।",
      },
      {
        title: "आरोग्यमित्र इसे व्यवस्थित करता है",
        text: "Google का ओपन AI मॉडल Gemma लक्षण, कब से है, उम्र, दवाइयाँ और एलर्जी पहचानता है, और कोई ज़रूरी जानकारी छूटी हो तो सवाल पूछता है।",
      },
      {
        title: "साफ़ सारांश पाएँ",
        text: "एक व्यवस्थित सारांश और डॉक्टर के लिए सवाल पाएँ, जिन्हें डाउनलोड करके योग्य डॉक्टर को दिखा सकते हैं।",
      },
    ],
  },
  features: {
    kicker: "सुविधाएँ",
    heading: "आरोग्यमित्र क्यों मददगार है",
    lang: { title: "आपकी भाषा में", text: "गुजराती, हिंदी या अंग्रेज़ी में इस्तेमाल करें। जवाब उसी भाषा में मिलता है जो आप चुनते हैं।" },
    reports: {
      title: "रिपोर्ट और पर्ची पढ़ता है",
      text: "जाँच रिपोर्ट या दवा की पर्ची की फोटो लें। लैब की सीमा से बाहर के नतीजे हाइलाइट होते हैं, और दवाइयाँ सुबह-दोपहर-रात के हिसाब से दिखती हैं।",
    },
    questions: {
      title: "डॉक्टर के लिए सवाल",
      text: "आपकी बताई बातों पर आधारित सवाल, विषय के हिसाब से। जो पूछने हैं उन पर टिक करें और अपने सवाल जोड़ें।",
    },
    pdf: { title: "डॉक्टर के लिए सारांश", text: "डॉक्टर के पास ले जाने के लिए एक पेज की PDF डाउनलोड करें।" },
    privacy: {
      title: "सिर्फ़ आपके लिए",
      text: "आपकी फोटो कभी सेव नहीं होती। सेव की गई रिपोर्ट सिर्फ़ आपके फ़ोन में रहती हैं, हर Google खाते के लिए अलग।",
    },
  },
  safety: {
    heading: "आपकी सेहत ज़रूरी है। डॉक्टर की सलाह सबसे पहले।",
    text: "आरोग्यमित्र आपकी सेहत की जानकारी को व्यवस्थित करने और समझने में मदद करता है। यह बीमारी का निदान नहीं करता, दवा नहीं लिखता और इलाज की सलाह नहीं देता। इलाज के फ़ैसले हमेशा योग्य डॉक्टर ही लें।",
  },
  final: {
    heading: "अपनी सेहत को समझने की ओर पहला कदम उठाएँ",
    text: "अपनी परेशानी बताएँ, जानकारी व्यवस्थित करें और डॉक्टर से बेहतर बातचीत के लिए तैयार रहें।",
  },
  footer: {
    about: "आरोग्यमित्र गुजराती, हिंदी या अंग्रेज़ी में आपकी सेहत की जानकारी समझने और डॉक्टर के लिए साफ़ सारांश बनाने में मदद करता है। Gemma 4 द्वारा संचालित।",
    privacy: "गोपनीयता नीति",
    disclaimer: "चिकित्सा अस्वीकरण",
    note: "यह डॉक्टर की सलाह का विकल्प नहीं है।",
  },
  auth: {
    SessionRequired: "आगे बढ़ने के लिए कृपया Google से साइन इन करें।",
    AccessDenied: "साइन इन रद्द हो गया। जब चाहें फिर से कोशिश करें।",
    OAuthCallbackError: "साइन इन रद्द हुआ या पूरा नहीं हुआ। कृपया फिर से कोशिश करें।",
    Configuration: "इस सर्वर पर अभी Google साइन इन सेट नहीं है। कृपया बाद में कोशिश करें।",
    default: "साइन इन पूरा नहीं हुआ। कृपया फिर से कोशिश करें।",
  },
};

const gu: HomeStrings = {
  nav: { home: "હોમ", how: "આ કેવી રીતે કામ કરે છે", features: "સુવિધાઓ", about: "અમારા વિશે" },
  getStarted: "શરૂ કરો",
  openDashboard: "મારું ડેશબોર્ડ ખોલો",
  langLabel: "ભાષા",
  themeLight: "લાઇટ મોડ ચાલુ કરો",
  themeDark: "ડાર્ક મોડ ચાલુ કરો",
  heroTitle1: "આરોગ્યનો સાથી,",
  heroTitle2: "હંમેશા તમારી સાથે",
  heroText: "તમારા મેડિકલ રિપોર્ટ સમજો અને ડૉક્ટરની મુલાકાતની તૈયારી કરો, ગુજરાતી, હિંદી કે અંગ્રેજીમાં.",
  heroNote: "મફત · Google થી સાઇન ઇન કરો · ફોટા ક્યારેય સાચવાતા નથી. પરિણામો ફક્ત આ ડિવાઇસ પર સચવાય છે.",
  preview: {
    kicker: "લેબ રિપોર્ટ · 24 ઑક્ટોબર",
    tag: "નમૂનો",
    summary: "ત્રણ પરિણામો તમારી લેબે આપેલી મર્યાદાની બહાર છે.",
    tests: ["ખાલી પેટ શુગર", "હિમોગ્લોબિન", "ક્રિએટિનિન"],
    status: { high: "વધારે", low: "ઓછું", normal: "સામાન્ય" },
    range: "મર્યાદા",
    question: "પ્રશ્ન",
    chip: "ડૉક્ટર માટે 6 પ્રશ્નો તૈયાર",
  },
  how: {
    kicker: "આ કેવી રીતે કામ કરે છે",
    heading: "આરોગ્યમિત્ર કેવી રીતે કામ કરે છે",
    sub: "ત્રણ સરળ પગલાં, જેથી સારવારની સફર સરળ બને.",
    steps: [
      {
        title: "તમારી તકલીફ જણાવો",
        text: "તમારા લક્ષણો કે ચિંતા તમારા શબ્દોમાં લખો, ગુજરાતી, હિંદી કે અંગ્રેજીમાં. તમે રિપોર્ટ કે દવાની ચિઠ્ઠીનો ફોટો પણ ઉમેરી શકો છો.",
      },
      {
        title: "આરોગ્યમિત્ર તેને ગોઠવે છે",
        text: "Google નું ઓપન AI મોડેલ Gemma લક્ષણો, ક્યારથી છે, ઉંમર, દવાઓ અને એલર્જી ઓળખે છે, અને કોઈ જરૂરી માહિતી ખૂટે તો પ્રશ્ન પૂછે છે.",
      },
      {
        title: "સ્પષ્ટ સારાંશ મેળવો",
        text: "ગોઠવાયેલો સારાંશ અને ડૉક્ટર માટે પ્રશ્નો મેળવો, જે ડાઉનલોડ કરીને લાયક ડૉક્ટરને બતાવી શકાય.",
      },
    ],
  },
  features: {
    kicker: "સુવિધાઓ",
    heading: "આરોગ્યમિત્ર કેમ મદદરૂપ છે",
    lang: { title: "તમારી ભાષામાં", text: "ગુજરાતી, હિંદી કે અંગ્રેજીમાં વાપરો. જવાબ તમે પસંદ કરેલી ભાષામાં મળે છે." },
    reports: {
      title: "રિપોર્ટ અને ચિઠ્ઠી વાંચે છે",
      text: "લેબ રિપોર્ટ કે દવાની ચિઠ્ઠીનો ફોટો પાડો. લેબની મર્યાદાની બહારના પરિણામો હાઇલાઇટ થાય છે, અને દવાઓ સવાર-બપોર-રાત પ્રમાણે દેખાય છે.",
    },
    questions: {
      title: "ડૉક્ટર માટે પ્રશ્નો",
      text: "તમે જણાવેલી વાતો પર આધારિત પ્રશ્નો, વિષય પ્રમાણે. જે પૂછવા છે તેના પર ટિક કરો અને તમારા પ્રશ્નો ઉમેરો.",
    },
    pdf: { title: "ડૉક્ટર માટે સારાંશ", text: "મુલાકાત વખતે લઈ જવા માટે એક પાનાની PDF ડાઉનલોડ કરો." },
    privacy: {
      title: "ફક્ત તમારા માટે",
      text: "તમારા ફોટા ક્યારેય સાચવાતા નથી. સાચવેલા રિપોર્ટ ફક્ત તમારા ફોનમાં રહે છે, દરેક Google એકાઉન્ટ માટે અલગ.",
    },
  },
  safety: {
    heading: "તમારું આરોગ્ય મહત્વનું છે. ડૉક્ટરની સલાહ સૌથી પહેલાં.",
    text: "આરોગ્યમિત્ર તમારી આરોગ્ય માહિતી ગોઠવવામાં અને સમજવામાં મદદ કરે છે. તે રોગનું નિદાન કરતું નથી, દવા લખતું નથી અને સારવારની સલાહ આપતું નથી. સારવારના નિર્ણયો હંમેશા લાયક ડૉક્ટરે જ લેવા જોઈએ.",
  },
  final: {
    heading: "તમારા આરોગ્યને સમજવા તરફ પહેલું પગલું ભરો",
    text: "તમારી તકલીફ જણાવો, માહિતી ગોઠવો અને ડૉક્ટર સાથે વધુ સારી વાતચીત માટે તૈયાર રહો.",
  },
  footer: {
    about: "આરોગ્યમિત્ર ગુજરાતી, હિંદી કે અંગ્રેજીમાં તમારી આરોગ્ય માહિતી સમજવામાં અને ડૉક્ટર માટે સ્પષ્ટ સારાંશ બનાવવામાં મદદ કરે છે. Gemma 4 દ્વારા સંચાલિત.",
    privacy: "ગોપનીયતા નીતિ",
    disclaimer: "તબીબી અસ્વીકરણ",
    note: "આ ડૉક્ટરની સલાહનો વિકલ્પ નથી.",
  },
  auth: {
    SessionRequired: "આગળ વધવા કૃપા કરીને Google થી સાઇન ઇન કરો.",
    AccessDenied: "સાઇન ઇન રદ થયું. જ્યારે ઇચ્છો ત્યારે ફરી પ્રયાસ કરો.",
    OAuthCallbackError: "સાઇન ઇન રદ થયું અથવા પૂરું ન થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
    Configuration: "આ સર્વર પર હજી Google સાઇન ઇન સેટ નથી. કૃપા કરીને પછી પ્રયાસ કરો.",
    default: "સાઇન ઇન પૂરું ન થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
  },
};

export const HOME: Record<Lang, HomeStrings> = { en, hi, gu };

export { pickLang } from "./lang";
