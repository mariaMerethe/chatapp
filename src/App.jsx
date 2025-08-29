import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { useState } from "react";
import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SideNav from "./components/SideNav";
import Chat from "./pages/Chat";

export default function App() {
  const { user, token, ready } = useAuth();
  const isAuthed = Boolean(token || user);
  const [navOpen, setNavOpen] = useState(false);

  if (!ready) return null; //undvik blink innan rehydrering

  return (
    <BrowserRouter>
      {isAuthed ? (
        // INLOGGAD: först header sen sidenav
        <>
          <Header onToggleMenu={() => setNavOpen((v) => !v)} />
          <SideNav open={navOpen} onClose={() => setNavOpen(false)}>
            <div className="max-w-3xl mx-auto">
              <Routes>
                <Route path="/chat" element={<Chat />} />
                {/* om någon går till / eller annat → skicka till /chat */}
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="*" element={<Navigate to="/chat" replace />} />
              </Routes>
            </div>
          </SideNav>
        </>
      ) : (
        // UTLOGGAD → landa på /register, kunna byta till /login
        <div className="p-6">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-2">ChatApp</h1>
            <p className="mb-6">Välkommen</p>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
