import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SideNav from "./components/SideNav";

//tillfällig "chatt-sida" tills jag bygger en riktig Chat.jsx
function ChatPlaceholder() {
  return <p>Här kommer chatten sen</p>;
}

export default function App() {
  const { user, token } = useAuth();
  const isAuthed = Boolean(token || user);

  return (
    <BrowserRouter>
      {isAuthed ? (
        // INLOGGAD → visa appen inne i SideNav och gå mot /chat
        <SideNav>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">ChatApp</h1>
            <p className="mb-6">Prata på</p>
            <Routes>
              <Route path="/chat" element={<ChatPlaceholder />} />
              {/* om någon går till / eller annat → skicka till /chat */}
              <Route path="/" element={<Navigate to="/chat" replace />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </SideNav>
      ) : (
        // UTLOGGAD → landa på /register, kunna byta till /login
        <div className="p-6">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-2">ChatApp</h1>
            <p className="mb-6">Välkommen</p>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              {/* root och allt annat → /register */}
              <Route path="/" element={<Navigate to="/register" replace />} />
              <Route path="*" element={<Navigate to="/register" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
