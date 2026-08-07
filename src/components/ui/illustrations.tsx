/**
 * Hand-drawn SVG illustrations.
 *
 * Every shape is painted with Tailwind palette utilities plus a `dark:` variant
 * rather than hard-coded hex, so the artwork re-tones with the theme instead of
 * being swapped for a second asset.
 */

/** Hero: a freelance profile page with portfolio tiles and the two contact routes. */
export function ProfileShowcaseIllustration({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 420 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      // Named when it carries meaning, hidden when it is pure decoration.
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {/* Warm backdrop blobs */}
      <ellipse cx="330" cy="70" rx="82" ry="66" className="fill-accent-200/60 dark:fill-accent-900/40" />
      <circle cx="62" cy="255" r="52" className="fill-highlight-200/70 dark:fill-highlight-900/35" />

      {/* Back card, offset for depth */}
      <rect
        x="52"
        y="42"
        width="286"
        height="252"
        rx="26"
        className="fill-sand-200 dark:fill-ink-800"
      />

      {/* Main profile card */}
      <rect
        x="38"
        y="28"
        width="286"
        height="252"
        rx="26"
        className="fill-white stroke-sand-300 dark:fill-ink-900 dark:stroke-ink-700"
        strokeWidth="1.5"
      />

      {/* Cover band */}
      <path
        d="M38 54a26 26 0 0 1 26-26h234a26 26 0 0 1 26 26v38H38V54Z"
        className="fill-brand-500"
      />

      {/* Avatar */}
      <circle cx="86" cy="96" r="27" className="fill-white dark:fill-ink-900" />
      <circle cx="86" cy="96" r="22" className="fill-accent-400" />
      <circle cx="86" cy="89" r="8" className="fill-white/90" />
      <path d="M72 108a14.5 14.5 0 0 1 28 0Z" className="fill-white/90" />

      {/* Name + handle */}
      <rect x="124" y="86" width="104" height="11" rx="5.5" className="fill-ink-800 dark:fill-sand-200" />
      <rect x="124" y="104" width="66" height="8" rx="4" className="fill-ink-300 dark:fill-ink-600" />

      {/* Availability pill */}
      <rect x="248" y="86" width="58" height="22" rx="11" className="fill-success-100 dark:fill-success-900" />
      <circle cx="261" cy="97" r="4" className="fill-success-500 dark:fill-success-300" />
      <rect x="270" y="93" width="26" height="7" rx="3.5" className="fill-success-600 dark:fill-success-300" />

      {/* Discipline chips */}
      <rect x="62" y="138" width="62" height="20" rx="10" className="fill-brand-100 dark:fill-brand-900/60" />
      <rect x="132" y="138" width="48" height="20" rx="10" className="fill-sand-200 dark:fill-ink-800" />
      <rect x="188" y="138" width="56" height="20" rx="10" className="fill-sand-200 dark:fill-ink-800" />

      {/* Portfolio tiles */}
      <rect x="62" y="174" width="86" height="66" rx="14" className="fill-highlight-300 dark:fill-highlight-800" />
      <circle cx="84" cy="196" r="7" className="fill-white/80" />
      <path d="M66 232l20-18a7 7 0 0 1 9.5 0L124 240H66v-8Z" className="fill-accent-500/80" />

      <rect x="158" y="174" width="86" height="66" rx="14" className="fill-brand-200 dark:fill-brand-900/70" />
      <path d="M180 214l14-14 16 16 10-9v33h-40v-26Z" className="fill-brand-500/70" />

      <rect x="254" y="174" width="56" height="66" rx="14" className="fill-sand-200 dark:fill-ink-800" />
      <rect x="266" y="188" width="32" height="6" rx="3" className="fill-ink-300 dark:fill-ink-600" />
      <rect x="266" y="202" width="32" height="6" rx="3" className="fill-ink-300 dark:fill-ink-600" />
      <rect x="266" y="216" width="20" height="6" rx="3" className="fill-ink-300 dark:fill-ink-600" />

      {/* Floating link chip */}
      <g>
        <rect
          x="228"
          y="16"
          width="164"
          height="46"
          rx="23"
          className="fill-white stroke-sand-300 dark:fill-ink-800 dark:stroke-ink-700"
          strokeWidth="1.5"
        />
        <circle cx="252" cy="39" r="12" className="fill-brand-500" />
        <path
          d="M248 39a3.6 3.6 0 0 1 3.6-3.6h1.8M256 39a3.6 3.6 0 0 1-3.6 3.6h-1.8"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M250 39h5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="272" y="34" width="96" height="10" rx="5" className="fill-ink-300 dark:fill-ink-600" />
      </g>

      {/* Floating contact chips: phone + chat */}
      <g>
        <rect
          x="16"
          y="286"
          width="122"
          height="44"
          rx="22"
          className="fill-white stroke-sand-300 dark:fill-ink-800 dark:stroke-ink-700"
          strokeWidth="1.5"
        />
        <circle cx="40" cy="308" r="12" className="fill-success-500" />
        <path
          d="M35.5 303.5h2.6l1.3 3.2-1.8 1.3a10 10 0 0 0 4.4 4.4l1.3-1.8 3.2 1.3v2.6a1.6 1.6 0 0 1-1.8 1.6 13.4 13.4 0 0 1-11-11 1.6 1.6 0 0 1 1.8-1.6Z"
          fill="white"
        />
        <rect x="60" y="303" width="60" height="10" rx="5" className="fill-ink-300 dark:fill-ink-600" />
      </g>

      <g>
        <rect
          x="256"
          y="266"
          width="146"
          height="52"
          rx="24"
          className="fill-brand-500"
        />
        <path
          d="M292 284.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.3-.7l-4.2 1.2 1.2-4.2a7.5 7.5 0 1 1 13.8-3.8Z"
          fill="white"
          fillOpacity="0.95"
        />
        <rect x="302" y="281" width="80" height="9" rx="4.5" fill="white" fillOpacity="0.9" />
        <rect x="302" y="296" width="52" height="7" rx="3.5" fill="white" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

/**
 * Sign-in: a profile card whose lock springs open as its owner returns.
 * The shackle draws itself on mount; the orbiting chips drift continuously.
 */
export function AuthUnlockIllustration({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 320 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <circle cx="160" cy="150" r="112" className="fill-brand-100/60 dark:fill-brand-950/50" />
      <circle cx="160" cy="150" r="78" className="fill-brand-200/50 dark:fill-brand-900/40" />

      {/* Orbiting accents */}
      <g className="animate-float">
        <circle cx="52" cy="86" r="13" className="fill-accent-400" />
      </g>
      <g className="animate-float-slow">
        <rect x="248" y="52" width="26" height="26" rx="9" className="fill-highlight-400" />
      </g>
      <g className="animate-sway">
        <circle cx="266" cy="228" r="10" className="fill-brand-500" />
      </g>

      {/* Card */}
      <rect
        x="72"
        y="82"
        width="176"
        height="140"
        rx="26"
        className="fill-white stroke-sand-300 dark:fill-ink-900 dark:stroke-ink-700"
        strokeWidth="1.5"
      />

      {/* Lock body */}
      <rect x="128" y="146" width="64" height="50" rx="14" className="fill-brand-500" />
      <circle cx="160" cy="167" r="6" fill="white" />
      <rect x="157" y="171" width="6" height="12" rx="3" fill="white" />

      {/* Shackle — open, hinged to one side, drawn on mount */}
      <path
        d="M140 146v-14a20 20 0 0 1 36-12"
        className="animate-draw stroke-ink-400 dark:stroke-ink-500"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray="400"
      />

      {/* Avatar + name lines */}
      <circle cx="104" cy="112" r="14" className="fill-accent-400" />
      <circle cx="104" cy="107" r="5" className="fill-white/90" />
      <path d="M95 120a9.5 9.5 0 0 1 18 0Z" className="fill-white/90" />
      <rect x="128" y="104" width="72" height="8" rx="4" className="fill-ink-800 dark:fill-sand-200" />
      <rect x="128" y="118" width="46" height="6" rx="3" className="fill-ink-300 dark:fill-ink-600" />
    </svg>
  );
}

/**
 * Sign-up: the pieces of a profile — work, links, contact — settling into place.
 * Each tile floats on its own phase so the group never pulses in lockstep.
 */
export function AuthAssembleIllustration({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 320 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <ellipse cx="160" cy="160" rx="118" ry="108" className="fill-highlight-200/50 dark:fill-highlight-950/40" />

      {/* Spine the pieces attach to */}
      <path
        d="M160 66v168"
        className="animate-draw stroke-sand-300 dark:stroke-ink-700"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="400"
      />

      {/* Base card */}
      <rect
        x="94"
        y="104"
        width="132"
        height="118"
        rx="24"
        className="fill-white stroke-sand-300 dark:fill-ink-900 dark:stroke-ink-700"
        strokeWidth="1.5"
      />
      <path d="M94 128a24 24 0 0 1 24-24h84a24 24 0 0 1 24 24v10H94v-10Z" className="fill-brand-500" />
      <circle cx="122" cy="150" r="16" className="fill-white dark:fill-ink-900" />
      <circle cx="122" cy="150" r="12" className="fill-accent-400" />
      <rect x="146" y="144" width="56" height="7" rx="3.5" className="fill-ink-800 dark:fill-sand-200" />
      <rect x="146" y="156" width="34" height="5" rx="2.5" className="fill-ink-300 dark:fill-ink-600" />
      <rect x="110" y="182" width="44" height="26" rx="9" className="fill-highlight-300 dark:fill-highlight-800" />
      <rect x="162" y="182" width="52" height="26" rx="9" className="fill-brand-200 dark:fill-brand-900/70" />

      {/* Floating pieces */}
      <g className="animate-float">
        <rect
          x="28"
          y="70"
          width="84"
          height="38"
          rx="19"
          className="fill-white stroke-sand-300 dark:fill-ink-800 dark:stroke-ink-700"
          strokeWidth="1.5"
        />
        <circle cx="48" cy="89" r="10" className="fill-success-500" />
        <path d="M44 89l3 3 5.5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="64" y="85" width="34" height="8" rx="4" className="fill-ink-300 dark:fill-ink-600" />
      </g>

      <g className="animate-float-slow">
        <rect
          x="212"
          y="48"
          width="82"
          height="38"
          rx="19"
          className="fill-white stroke-sand-300 dark:fill-ink-800 dark:stroke-ink-700"
          strokeWidth="1.5"
        />
        <circle cx="232" cy="67" r="10" className="fill-brand-500" />
        <path
          d="M228.5 67a2.8 2.8 0 0 1 2.8-2.8h1.4M235.5 67a2.8 2.8 0 0 1-2.8 2.8h-1.4M230 67h4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect x="248" y="63" width="34" height="8" rx="4" className="fill-ink-300 dark:fill-ink-600" />
      </g>

      <g className="animate-sway">
        <rect x="222" y="212" width="72" height="40" rx="18" className="fill-brand-500" />
        <path
          d="M252 232a6 6 0 0 1-6 6 6.4 6.4 0 0 1-2.6-.6l-3.4 1 1-3.4A6 6 0 1 1 252 232Z"
          fill="white"
          fillOpacity="0.95"
        />
        <rect x="260" y="228" width="26" height="7" rx="3.5" fill="white" fillOpacity="0.85" />
      </g>

      <g className="animate-float">
        <rect x="24" y="196" width="66" height="40" rx="18" className="fill-accent-500" />
        <path d="M40 216l7-7 6 6 5-4.5V226H40v-10Z" fill="white" fillOpacity="0.9" />
        <rect x="66" y="212" width="16" height="7" rx="3.5" fill="white" fillOpacity="0.85" />
      </g>
    </svg>
  );
}

/** Empty inbox: a paper plane leaving a tray that has nothing in it yet. */
export function EmptyInboxIllustration({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 260 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <ellipse cx="130" cy="126" rx="98" ry="62" className="fill-sand-200/60 dark:fill-ink-800/60" />

      {/* Flight path */}
      <path
        d="M40 150c26-8 44-26 58-52s28-46 48-56"
        className="animate-draw stroke-brand-300 dark:stroke-brand-800"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="400"
        strokeDashoffset="0"
        fill="none"
      />

      {/* Tray */}
      <path
        d="M56 132h148l-14 34a8 8 0 0 1-7.4 5H77.4a8 8 0 0 1-7.4-5L56 132Z"
        className="fill-white stroke-sand-300 dark:fill-ink-900 dark:stroke-ink-700"
        strokeWidth="1.5"
      />
      <path d="M56 132l16-22h116l16 22" className="stroke-sand-300 dark:stroke-ink-700" strokeWidth="1.5" fill="none" />

      {/* Paper plane */}
      <g className="animate-float">
        <path d="M196 34l-52 34 22 8 6 22 24-64Z" className="fill-brand-500" />
        <path d="M196 34l-30 42 4 22" className="stroke-white/70" strokeWidth="2" fill="none" strokeLinejoin="round" />
      </g>

      <circle cx="74" cy="60" r="7" className="animate-sway fill-accent-400" />
      <circle cx="214" cy="112" r="5" className="animate-float-slow fill-highlight-400" />
    </svg>
  );
}

/** Empty search: a lens over a grid whose cards have drifted out of frame. */
export function EmptySearchIllustration({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 260 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <ellipse cx="130" cy="108" rx="104" ry="82" className="fill-sand-200/60 dark:fill-ink-800/60" />

      {/* Cards that did not match, drifting */}
      <g className="animate-float-slow">
        <rect x="34" y="56" width="52" height="40" rx="12" className="fill-white stroke-sand-300 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth="1.5" />
        <circle cx="48" cy="70" r="6" className="fill-sand-300 dark:fill-ink-700" />
        <rect x="60" y="66" width="18" height="4" rx="2" className="fill-sand-300 dark:fill-ink-700" />
        <rect x="42" y="84" width="34" height="4" rx="2" className="fill-sand-300 dark:fill-ink-700" />
      </g>

      <g className="animate-sway">
        <rect x="178" y="112" width="52" height="40" rx="12" className="fill-white stroke-sand-300 dark:fill-ink-900 dark:stroke-ink-700" strokeWidth="1.5" />
        <circle cx="192" cy="126" r="6" className="fill-sand-300 dark:fill-ink-700" />
        <rect x="204" y="122" width="18" height="4" rx="2" className="fill-sand-300 dark:fill-ink-700" />
        <rect x="186" y="140" width="34" height="4" rx="2" className="fill-sand-300 dark:fill-ink-700" />
      </g>

      {/* The lens */}
      <circle cx="124" cy="94" r="38" className="fill-brand-100/70 dark:fill-brand-950/60" />
      <circle
        cx="124"
        cy="94"
        r="38"
        className="animate-draw stroke-brand-500"
        strokeWidth="7"
        strokeDasharray="400"
        fill="none"
      />
      <path d="M152 122l24 24" className="stroke-brand-500" strokeWidth="10" strokeLinecap="round" />
      <path d="M112 94h24" className="stroke-brand-400/70" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/** Empty/404 state: a detached link, drawn as two halves that no longer meet. */
export function BrokenLinkIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="120" cy="92" r="66" className="fill-sand-200/70 dark:fill-ink-800/70" />

      <path
        d="M96 66 79 83a24 24 0 0 0 34 34l8-8"
        className="stroke-brand-500"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        d="M144 118l17-17a24 24 0 0 0-34-34l-8 8"
        className="stroke-ink-400 dark:stroke-ink-500"
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* Break marks */}
      <path
        d="M118 78l-7-9M132 92l10-5M124 104l-4 11"
        className="stroke-accent-500"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
