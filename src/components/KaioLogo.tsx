export function KaioLogo({
  dark = false,
  showTagline = false,
  className = '',
}: {
  dark?: boolean;
  showTagline?: boolean;
  className?: string;
}) {
  const text = dark ? '#F8FAFC' : '#08244A';
  const tagline = dark ? '#44D06B' : '#169947';

  return (
    <svg
      className={className}
      viewBox="0 0 720 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Kaio"
    >
      <path d="M111.6 156V55.2H139.4V97.9L179.8 55.2H214.5L172.8 98.8L216.2 156H182.7L153.7 117.1L139.4 132V156H111.6Z" fill={text} />
      <path d="M253.9 157.6C247.4 157.6 241.6 156.4 236.6 154C231.7 151.6 227.8 148.2 225 143.9C222.2 139.6 220.8 134.7 220.8 129.1C220.8 120.1 224.2 113.2 231 108.3C237.9 103.4 247.8 101 260.7 101H279.5V98.8C279.5 93.5 277.9 89.5 274.6 86.8C271.3 84.1 266.7 82.8 260.8 82.8C255.5 82.8 250.9 84 247 86.4C243.1 88.8 240.7 92.2 239.8 96.6H224.3C225 89.8 227.3 83.9 231.3 78.9C235.4 73.9 240.6 70.1 247 67.4C253.4 64.7 260.5 63.4 268.3 63.4C281.8 63.4 292.4 66.7 300.2 73.3C308 79.9 311.9 89.2 311.9 101.2V156H284.8L282.2 142.2C279.5 146.8 275.8 150.5 271.1 153.4C266.5 156.2 260.8 157.6 253.9 157.6ZM261.6 137.4C267.1 137.4 271.5 135.6 274.8 132C278.1 128.4 280 123.8 280.6 118.2H263.9C258.9 118.2 255.3 119.1 253.1 120.9C250.9 122.7 249.8 125 249.8 127.8C249.8 130.7 250.9 133 253 134.7C255.2 136.5 258.1 137.4 261.6 137.4Z" fill={text} />
      <path d="M337.5 156V65H365.9V156H337.5Z" fill={text} />
      <path d="M433.1 157.6C424.2 157.6 416.1 155.6 408.8 151.7C401.6 147.7 395.9 142.1 391.8 134.8C387.6 127.4 385.5 118.9 385.5 109.2C385.5 99.5 387.6 91.1 391.9 83.9C396.2 76.6 401.9 71 409.2 67.1C416.5 63.2 424.6 61.2 433.5 61.2C442.5 61.2 450.6 63.2 457.8 67.1C465 71 470.7 76.6 474.9 83.9C479.1 91.1 481.2 99.5 481.2 109.2C481.2 118.9 479.1 127.4 474.8 134.8C470.6 142.1 464.8 147.7 457.5 151.7C450.3 155.6 442.1 157.6 433.1 157.6ZM433.1 133.2C438.4 133.2 443 131.3 446.7 127.4C450.5 123.5 452.4 117.5 452.4 109.2C452.4 100.9 450.5 95 446.8 91.2C443.1 87.3 438.6 85.4 433.3 85.4C428 85.4 423.5 87.3 419.8 91.2C416.1 95 414.3 100.9 414.3 109.2C414.3 117.5 416.1 123.5 419.7 127.4C423.4 131.3 427.8 133.2 433.1 133.2Z" fill={text} />
      {/* Green checkmark accent over the i — brand element, same green in both themes */}
      <path d="M339 45 L349 55 L368 30" stroke="#22C55E" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {showTagline && (
        <text x="112" y="190" fontFamily="Poppins, Inter, Arial, sans-serif" fontSize="24" fontWeight="700" fill={tagline}>Food Safety. Made Simple.</text>
      )}
    </svg>
  );
}

export function KaioMark({ className = '', size = 40 }: { className?: string; size?: number }) {
  return (
    <img
      className={className}
      src={`${import.meta.env.BASE_URL}kaio-mark.svg`}
      alt="Kaio"
      width={size}
      height={size}
    />
  );
}
