const WEBHOOK_URL = 'https://superconfident-hatable-bev.ngrok-free.dev/webhook/faithflow-subscribe';

export async function subscribe(name, email) {
  if (localStorage.getItem('faithflow_subscribed')) {
    return { success: false, reason: 'already_subscribed' };
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        timestamp: new Date().toISOString(),
        source: 'faithflow_landing'
      })
    });

    if (res.ok) {
      localStorage.setItem('faithflow_subscribed', email);
      return { success: true };
    }
    return { success: false, reason: 'server_error' };

  } catch (err) {
    console.error('Subscription error:', err);
    return { success: false, reason: 'network_error' };
  }
}
