(async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password' }),
    });
    const login = await loginRes.json();
    console.log('logged in', login);
    const token = login.data.accessToken;
    const verifyRes = await fetch('http://localhost:3000/api/auth/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ password: 'password' }),
    });
    const verify = await verifyRes.json();
    console.log('verify response', verify, 'status', verifyRes.status);
  } catch (e) {
    console.error('error', e);
  }
})();