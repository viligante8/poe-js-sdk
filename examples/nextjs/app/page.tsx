export default function Page() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>PoE OAuth (Next.js Example)</h1>
      <p>
        <a href="/api/auth/login">Login with PoE</a>
      </p>
      <p>
        After login, try <a href="/api/profile">/api/profile</a> to see your profile JSON.
      </p>
    </main>
  );
}

