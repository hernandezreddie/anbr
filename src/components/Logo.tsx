export function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="anbr-g" x1="8" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.55" stopColor="#14B8A6" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="12.5" fill="url(#anbr-g)" />
      <rect x="4.5" y="4.5" width="39" height="39" rx="12" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
      <circle cx="36.5" cy="11.5" r="4.2" stroke="white" strokeOpacity="0.55" strokeWidth="1.6" />
      <path
        d="M23 14 Q26.85 18.15 34 25 Q26.85 31.85 23 36 Q19.15 31.85 12 25 Q19.15 18.15 23 14 Z"
        fill="white"
      />
      <path
        d="M13 29.5 Q14.925 31.425 18.5 35 Q14.925 38.575 13 40.5 Q11.075 38.575 7.5 35 Q11.075 31.425 13 29.5 Z"
        fill="white"
        fillOpacity="0.7"
      />
    </svg>
  );
}
