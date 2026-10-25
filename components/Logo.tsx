/** Logo mark + two-colour wordmark, as in the brand board. Inline so the caregiver turns light in dark mode. */
export function LogoMark({ size = 46 }: { size?: number }) {
  return (
    <svg viewBox="20 6 166 196" width={size} height={(size * 196) / 166} className="logo-mark" aria-hidden="true">
      <circle cx="93" cy="30" r="19" fill="var(--logo-caregiver)" />
      <path d="M33.5 147 A70 70 0 0 1 137 65.6 L127.5 82.5 C110 72 70 74 55 100 C45 117 38 132 33.5 147 Z"
        fill="var(--logo-caregiver)" />
      <circle cx="151" cy="70" r="14" fill="#E76F51" />
      <path d="M137 93 C150 84 172 90 170 113 C168 131 158 146 139 157 C149 138 151 117 137 93 Z" fill="#E76F51" />
      <path d="M34 150 A70 70 0 0 0 96 195 Q88 158 34 150 Z" fill="#7BA89B" />
      <path d="M104 195 A70 70 0 0 0 168 145 Q118 150 104 195 Z" fill="#7BA89B" />
      <rect x="91" y="100" width="15" height="45" rx="2.5" fill="#E53935" />
      <rect x="76" y="115" width="45" height="15" rx="2.5" fill="#E53935" />
    </svg>
  );
}

export default function Logo() {
  return (
    <div className="logo">
      <LogoMark />
      <span className="logo-text">
        <span className="logo-word">
          <span className="logo-a">Aarogya</span>
          <span className="logo-b">Mitra</span>
        </span>
        <span className="logo-tag">Your health companion</span>
      </span>
    </div>
  );
}
