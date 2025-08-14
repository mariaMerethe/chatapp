import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <>
      <main style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <h1>ChatApp</h1>
        <p>Välkommen! 👋</p>

        {/* Tillfälligt: visa både Login och Register */}
        <section style={{ marginTop: "20px" }}>
          <h2>Logga in</h2>
          <Login />

          <h2>Registrera dig</h2>
          <Register />
        </section>
      </main>
    </>
  );
}

export default App;
