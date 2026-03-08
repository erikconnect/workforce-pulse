import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>

function BaseIcon({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  )
}

export function WorkforcePulseMark(props: IconProps) {
  return (
    <BaseIcon viewBox="0 0 48 48" {...props}>
      <rect x="7" y="7" width="34" height="34" rx="13" opacity="0.12" />
      <circle cx="24" cy="24" r="15.5" opacity="0.26" />
      <path d="M12.5 26h6.2l3.4-8.2 4.3 15.2 4-9.4h5.1" />
      <path d="M17.5 15.5a13.8 13.8 0 0 1 13-.5" opacity="0.4" />
    </BaseIcon>
  )
}

export function DashboardPulseIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4" opacity="0.18" />
      <path d="M6.5 13h3.4l1.6-3.6 2.2 7 1.9-4.4h2.9" />
      <path d="M8 7.5h8" opacity="0.45" />
    </BaseIcon>
  )
}

export function BeaconMapIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 20.5s5-5.2 5-9A5 5 0 1 0 7 11.5c0 3.8 5 9 5 9Z" />
      <circle cx="12" cy="11.5" r="1.8" />
      <path d="M4 18.5c2-1.4 4.4-2.1 8-2.1s6 .7 8 2.1" opacity="0.45" />
    </BaseIcon>
  )
}

export function SectorFieldIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="3.5" y="4" width="17" height="16" rx="3" />
      <path d="M9.25 4v16" opacity="0.5" />
      <path d="M14.75 4v16" opacity="0.5" />
      <path d="M3.5 10h17" opacity="0.5" />
      <path d="M3.5 14.5h17" opacity="0.5" />
    </BaseIcon>
  )
}

export function WorkStackIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M7 8.5h10a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6.5a2 2 0 0 1 2-2Z" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8" />
      <path d="M5 12.5h14" opacity="0.45" />
    </BaseIcon>
  )
}

export function SkillOrbitIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="2.2" />
      <path d="M6 12c0-3.5 2.7-6.3 6-6.3s6 2.8 6 6.3-2.7 6.3-6 6.3-6-2.8-6-6.3Z" opacity="0.18" />
      <path d="M5.5 8.5c2-1.3 4.1-2 6.5-2 3.1 0 5.3 1 7.2 2.8" />
      <path d="M6.2 16c1.7 1 3.7 1.5 5.8 1.5 2.3 0 4.3-.6 6.2-1.8" opacity="0.5" />
    </BaseIcon>
  )
}

export function MissionRouteIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="6.5" cy="16.5" r="1.5" />
      <circle cx="17.5" cy="7.5" r="1.5" />
      <path d="M8 15.5c1.5-.2 2.5-.8 3.4-1.8l1.6-1.8c1.1-1.2 2.1-1.9 3.8-2.4" />
      <path d="M15 5.5h4v4" />
    </BaseIcon>
  )
}

export function PlaybookTilesIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <rect x="5" y="4.5" width="11" height="14" rx="2" />
      <path d="M8 8h5" />
      <path d="M8 11.5h5" opacity="0.55" />
      <path d="M8 15h3.5" opacity="0.4" />
      <path d="M16 7.5h3a1.5 1.5 0 0 1 1.5 1.5V18" opacity="0.5" />
    </BaseIcon>
  )
}

export function RadarSweepIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="4" opacity="0.4" />
      <path d="M12 12 18 8" />
      <path d="M12 5v2" opacity="0.45" />
      <path d="M5 12h2" opacity="0.45" />
    </BaseIcon>
  )
}

export function CivicSignalIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M12 4.5 6 7.2v4.1c0 4 2.3 6.8 6 8.2 3.7-1.4 6-4.2 6-8.2V7.2L12 4.5Z" />
      <path d="M9 12h2.4l1.2-2.8 1.5 5 1.2-2.7H17" />
    </BaseIcon>
  )
}

export function PathwaysIcon(props: IconProps) {
  return (
    <BaseIcon {...props}>
      <path d="M6 18.5c2.4-1.7 4.3-5.8 6-12 1.5 5.2 3.3 9.1 6 12" />
      <circle cx="12" cy="7" r="1.4" />
      <path d="M8 15h8" opacity="0.45" />
    </BaseIcon>
  )
}