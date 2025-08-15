// src/components/SideNav.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Minimal egen SideNav med overlay (Tailwind + daisyUI):
 * - Desktop: smal "rail" till vänster + liten knapp som öppnar overlay-menyn
 * - Mobil: samma knapp flyter uppe till vänster (ingen topbar behövs)
 * - DaisyUI "drawer" använder en checkbox som state (togglar öppet/stängt)
 */
export default function SideNav({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout(); // rensa token + user i ditt AuthContext
    navigate("/login", { replace: true }); // skicka tillbaka till /login
  }

  return (
    // Drawer-rot (måste omsluta både toggle + side)
    <div className="drawer drawer-end">
      {/* Checkbox som styr öppet/stängt läge för overlayn */}
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Huvudinnehåll */}
      <div className="drawer-content">
        {/* Liten rail på desktop så det “känns” som en sidenav finns */}
        <div className="lg:block fixed right-0 top-0 h-screen w-12 bg-red-200 border-r z-40" />

        {/* Öppna-knappen (flyter uppe till vänster) */}
        <label
          htmlFor="app-drawer"
          aria-label="Öppna meny"
          className="btn btn-ghost btn-square fixed right-0 top-3 z-50"
          title="Öppna meny"
        >
          {/* enkel hamburger-ikon */}
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
        </label>

        {/* Själva sidans innehåll; ge plats för rail på desktop */}
        <div className="px-4 pb-8 lg:pl-16">{children}</div>
      </div>

      {/* Overlay + panel som glider in från vänster */}
      <div className="drawer-side z-50">
        {/* Klick på overlay stänger menyn */}
        <label
          htmlFor="app-drawer"
          className="drawer-overlay"
          aria-label="Stäng meny"
        ></label>

        <aside className="menu p-4 w-72 min-h-full bg-base-100 border-r">
          <h2 className="text-lg font-semibold mb-1">Meny</h2>
          <p className="text-sm opacity-70 mb-4">
            {user?.username ?? "Inloggad"}
          </p>

          {/* Enda knappen som krävs för G-nivå */}
          <button
            className="btn btn-error text-white w-full"
            onClick={handleLogout}
          >
            Logga ut
          </button>
        </aside>
      </div>
    </div>
  );
}
