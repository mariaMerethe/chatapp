export default function Register() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        alert("Register (test)");
      }}
    >
      <input placeholder="username" />
      <input placeholder="email" />
      <input placeholder="password" type="password" />
      <button type="submit">Registrera (test)</button>
    </form>
  );
}
