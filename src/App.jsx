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
        <>
          <Header
            onToggleMenu={() => setNavOpen((v) => !v)}
            showUser={true}
            showMenu={true}
          />
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
        <>
          <Header showUser={false} showMenu={false} />
          <div className="max-w-md mx-auto px-4 py-6">
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </div>
        </>
      )}
    </BrowserRouter>
  );
}
