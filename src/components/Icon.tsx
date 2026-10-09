/* Port partials/icon.blade.php */

const paths: Record<string, React.ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  leaf: (
    <>
      <path d="M4 20c0-8 6-14 16-15 0 10-5 15-12 15H4z" />
      <path d="M8.5 15.5 18 6" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
      <path d="M12 14v2" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-9.2A4 4 0 0 1 12 8a4 4 0 0 1 7 2.8C19 15.6 12 20 12 20z" />
  ),
  circle: <circle cx="12" cy="12" r="8.5" />,
};

export default function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="20"
      height="20"
    >
      {paths[name] ?? paths.circle}
    </svg>
  );
}
