import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SideNav({ children, open, onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    onClose?.();
    logout(); // rensa token + user i ditt AuthContext
    navigate("/login", { replace: true }); // skicka tillbaka till /login
  }

  //stäng med Esc
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape" && open) onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div className={`drawer drawer-end ${open ? "drawer-open" : ""}`}>
      <input
        id="app-drawer"
        type="checkbox"
        className="drawer-toggle"
        readOnly
        checked={open}
      />

      <div className="drawer-content h-[calc(100vh-4rem)] overflow-hidden">
        {children}
      </div>

      <div className="drawer-side z-40 h-[calc(100vh-4rem)]">
        {/* klick på overlay stänger */}
        <label
          className="drawer-overlay"
          aria-label="Stäng meny"
          onClick={onClose}
        />
        <aside className="menu p-4 w-72 h-full bg-base-100 border-l overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Meny</h2>
          <button
            className="btn text-white w-full bg-secondary"
            onClick={handleLogout}
          >
            Logga ut
          </button>
        </aside>
      </div>
    </div>
  );
}
