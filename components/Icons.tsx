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
