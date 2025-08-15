import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SideNav from "./components/SideNav";

export default function App() {
  const { user, token } = useAuth();
  const isAuthed = Boolean(token || user);

  return (
    <BrowserRouter>
      {isAuthed ? (
        <SideNav>
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">ChatApp</h1>
            <p className="mb-6">Välkommen</p>
            <Routes>
              <Route path="/" element={<p>Välkommen in</p>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SideNav>
      ) : (
        <div className="p-6">
          <div className="max-w-lg mx-auto">
            <h1 className="text-3xl font-bold mb-2">ChatApp</h1>
            <p className="mb-6">Välkommen</p>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      )}
    </BrowserRouter>
  );
}
