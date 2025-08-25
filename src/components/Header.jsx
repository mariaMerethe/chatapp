import { useAuth } from "../context/AuthContext";
import { avatarUrlFor } from "../utils/avatar";

export default function Header({ onToggleMenu }) {
  const { user } = useAuth();
  const displayName = user?.user ?? "Inloggad";

  return (
    <div className="navbar bg-base-200 sticky top-0 z-[60]">
      <div className="flex-1">
        <span className="text-xl font-bold">ChatApp</span>
      </div>
      <div className="flex-none flex items-center gap-3">
        <span className="hidden sm:inline opacity-80">{displayName}</span>
        <div className="avatar">
          <div className="w-9 rounded-full">
            <img src={avatarUrlFor(user)} alt="avatar" />
          </div>
        </div>
        {/* Hamburgare i headern som öppnar sidenav */}
        <button
          className="btn btn-ghost btn-square"
          onClick={onToggleMenu}
          title="Meny"
          aria-label="öppna/stäng meny"
        >
          {/* enkel ikon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
