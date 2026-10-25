/** Small custom line-icon set (24px grid, 1.75 stroke) so the UI doesn't lean on emoji. */
type P = { size?: number; className?: string };

function Svg({ size = 24, className, children }: P & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

export const IconCamera = (p: P) => (
  <Svg {...p}><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.4-2h6.2l1.4 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" /><circle cx="12" cy="12.75" r="3.25" /></Svg>
);
export const IconImage = (p: P) => (
  <Svg {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="m4 17 4.5-4.5 3.5 3.5 2.5-2.5 5.5 5" /></Svg>
);
export const IconFolder = (p: P) => (
  <Svg {...p}><path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z" /></Svg>
);
export const IconChat = (p: P) => (
  <Svg {...p}><path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.3-4.4A7.5 7.5 0 1 1 20 12z" /><path d="M9 11h6M9 14h3.5" /></Svg>
);
export const IconDownload = (p: P) => (
  <Svg {...p}><path d="M14 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z" /><path d="M14 3.5V8h4.5M12 11v6M9.5 14.5 12 17l2.5-2.5" /></Svg>
);
export const IconStethoscope = (p: P) => (
  <Svg {...p}><path d="M6 3.5v5a4 4 0 0 0 8 0v-5" /><path d="M10 12.5v2a4.5 4.5 0 0 0 9 0v-1.5" /><circle cx="19" cy="11" r="2" /></Svg>
);
export const IconChart = (p: P) => (
  <Svg {...p}><path d="M4 4v16h16" /><path d="m7.5 15 3.5-4 3 2.5 5-6" /></Svg>
);
export const IconGlobe = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5z" /></Svg>
);
export const IconScan = (p: P) => (
  <Svg {...p}><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><path d="M8 9.5h8M8 12.5h8M8 15.5h5" /></Svg>
);
export const IconSpark = (p: P) => (
  <Svg {...p}><path d="M12 3.5 13.8 9l5.7 1.5-5.7 1.6L12 17.5l-1.8-5.4L4.5 10.5 10.2 9z" /><path d="M18.5 16.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></Svg>
);
export const IconQuestion = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.8c0 1.7-2.4 2.2-2.4 3.7" /><path d="M12 17h.01" /></Svg>
);
export const IconLock = (p: P) => (
  <Svg {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5M12 14.5v2" /></Svg>
);
export const IconSpeech = (p: P) => (
  <Svg {...p}><path d="M4.5 6.5A2 2 0 0 1 6.5 4.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H10l-4 3.5v-3.5h0a2 2 0 0 1-1.5-2z" /><path d="M8.5 9.5h7M8.5 12h4" /></Svg>
);
export const IconListCheck = (p: P) => (
  <Svg {...p}><path d="M10 6.5h10M10 12h10M10 17.5h10" /><path d="m3.5 6.5 1.5 1.5 2.5-3M3.5 12l1.5 1.5 2.5-3M3.5 17.5 5 19l2.5-3" /></Svg>
);
export const IconArrowRight = (p: P) => (
  <Svg {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Svg>
);
export const IconShieldHeart = (p: P) => (
  <Svg {...p}><path d="M12 3.5 5 6v5.5c0 4.3 3 7.6 7 9 4-1.4 7-4.7 7-9V6z" /><path d="M12 15.5s-3-1.8-3-4a1.7 1.7 0 0 1 3-1.1 1.7 1.7 0 0 1 3 1.1c0 2.2-3 4-3 4z" /></Svg>
);
export const IconPill = (p: P) => (
  <Svg {...p}><rect x="3.2" y="8.6" width="17.6" height="6.8" rx="3.4" transform="rotate(-45 12 12)" /><path d="m9.6 9.6 4.8 4.8" /></Svg>
);
export const IconCheck = (p: P) => (
  <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
);
export const IconAlert = (p: P) => (
  <Svg {...p}><path d="M12 4 2.8 19.5h18.4z" /><path d="M12 10v4.5M12 17.2h.01" /></Svg>
);
export const IconInfo = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></Svg>
);
export const IconHome = (p: P) => (
  <Svg {...p}><path d="m4 11 8-6.5 8 6.5" /><path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" /><path d="M10 20v-5h4v5" /></Svg>
);
export const IconCopy = (p: P) => (
  <Svg {...p}><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5" /></Svg>
);
export const IconSpeaker = (p: P) => (
  <Svg {...p}><path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></Svg>
);
export const IconStop = (p: P) => (
  <Svg {...p}><rect x="6.5" y="6.5" width="11" height="11" rx="2" /></Svg>
);
export const IconPlus = (p: P) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconX = (p: P) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
);
export const IconSend = (p: P) => (
  <Svg {...p}><path d="M4 12 20 4l-5 16-3-7z" /><path d="m12 13 8-9" /></Svg>
);
export const IconRotate = (p: P) => (
  <Svg {...p}><path d="M4 12a8 8 0 0 1 14-5.3L20 9" /><path d="M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15" /><path d="M4 20v-5h5" /></Svg>
);
export const IconBolt = (p: P) => (
  <Svg {...p}><path d="M13 3 5 13.5h6L10 21l8-10.5h-6z" /></Svg>
);
export const IconTrash = (p: P) => (
  <Svg {...p}><path d="M4.5 7h15M10 11v6M14 11v6" /><path d="M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></Svg>
);
export const IconShare = (p: P) => (
  <Svg {...p}><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1" /></Svg>
);
export const IconPrint = (p: P) => (
  <Svg {...p}><path d="M7 9V3.5h10V9" /><rect x="3.5" y="9" width="17" height="8" rx="1.5" /><path d="M7 14h10v6.5H7z" /></Svg>
);
export const IconLogout = (p: P) => (
  <Svg {...p}><path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" /><path d="M10 12h10M16.5 8.5 20 12l-3.5 3.5" /></Svg>
);
export const IconPhone = (p: P) => (
  <Svg {...p}><path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L16 14l4 1.5V19a1.5 1.5 0 0 1-1.5 1.5A15.5 15.5 0 0 1 3.5 5.5 1.5 1.5 0 0 1 5 4z" /></Svg>
);
export const IconSun = (p: P) => (
  <Svg {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></Svg>
);
export const IconSunHigh = (p: P) => (
  <Svg {...p}><circle cx="12" cy="13" r="4" /><path d="M12 4v2M5.6 7.6 7 9M18.4 7.6 17 9M3.5 19.5h17" /></Svg>
);
export const IconSunset = (p: P) => (
  <Svg {...p}><path d="M7 17a5 5 0 0 1 10 0" /><path d="M3 17h18M12 5v4M5.6 10.6 7 12M18.4 10.6 17 12M9.5 7.5 12 5l2.5 2.5" /><path d="M7 20.5h10" /></Svg>
);
export const IconMoon = (p: P) => (
  <Svg {...p}><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" /></Svg>
);
export const IconFlask = (p: P) => (
  <Svg {...p}><path d="M9.5 3.5h5M10.5 3.5v6L5 18.5A1.5 1.5 0 0 0 6.3 20.5h11.4a1.5 1.5 0 0 0 1.3-2L13.5 9.5v-6" /><path d="M7.5 15h9" /></Svg>
);
export const IconChevronDown = (p: P) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
);
export const IconGlobeSmall = IconGlobe;
export const IconMic = (p: P) => (
  <Svg {...p}><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v3M8.5 20.5h7" /></Svg>
);
