export function LogoBall({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      aria-hidden
      className="logo-ball"
    >
      <circle cx="24" cy="24" r="22" fill="#fff" />
      <circle cx="24" cy="24" r="18" fill="none" stroke="#0b2a5c" strokeWidth="1.2" />
      <path
        fill="none"
        stroke="#0b2a5c"
        strokeWidth="1.2"
        d="M24 6c8 6 8 30 0 36M8 18h32M8 30h32M14 12l20 24M34 12L14 36"
      />
      <path fill="#0b2a5c" d="M8 8l2 2-2 2-2-2zm30 0l2 2-2 2-2-2zm0 28l2 2-2 2-2-2zm-30 0l2 2-2 2-2-2z" />
    </svg>
  )
}
