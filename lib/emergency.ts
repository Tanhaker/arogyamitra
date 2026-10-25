/**
 * Fixed (non-model) emergency detection in English, Hindi, Gujarati and Hinglish/Gujlish.
 * When it matches, the UI shows a hard-coded "call 112" card before any model text.
 */
export const EMERGENCY = new RegExp(
  [
    "chest pain", "pain in (my )?chest", "can'?t breathe", "cannot breathe", "difficulty breathing", "short(ness)? of breath",
    "stroke", "face (is )?droop", "slurred speech", "severe bleeding", "bleeding heavily", "suicid", "kill myself", "end my life",
    "overdose", "poison", "seene (me|mein) dard", "chhati (me|mein) dard", "saans (nahi|lene)", "sans nahi",
    "सीने में दर्द", "छाती में दर्द", "सांस (नहीं|लेने)", "साँस (नहीं|लेने)", "लकवा", "खून बह", "आत्महत्या", "ज़हर", "जहर", "ओवरडोज",
    "છાતીમાં દુખ", "શ્વાસ (નથી|લેવામાં)", "લકવો", "લોહી વહે", "આત્મહત્યા", "ઝેર",
  ].join("|"),
  "i",
);

export const isEmergency = (text: string) => EMERGENCY.test(text);
