import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export function Logo({
  compact = false,
  asLink = true,
}: {
  compact?: boolean;
  asLink?: boolean;
}) {
  const content = (
    <div className="logo">
      <span className="logo-mark" aria-hidden="true">
        <svg
          width="22"
          height="22"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 42L32 20L45 34L30 46L20 42ZM32 20L30 46M20 42L45 34"
            stroke="currentColor"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.92"
          />
          <circle cx="32" cy="20" r="5.2" fill="currentColor" />
          <circle cx="20" cy="42" r="4.8" fill="currentColor" />
          <circle cx="45" cy="34" r="4.8" fill="currentColor" />
          <circle cx="30" cy="46" r="4.2" fill="currentColor" />
        </svg>
      </span>
      {!compact && <strong>LearnGraph</strong>}
    </div>
  );

  if (asLink) {
    return (
      <Link to={ROUTES.HOME} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }

  return content;
}
