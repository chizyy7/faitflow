const N8N_WEBHOOK = 'YOUR_N8N_WEBHOOK_URL_HERE';

export async function subscribe(name, email) {
  if (localStorage.getItem('faithflow_subscribed')) {
    return { success: false, reason: 'already_subscribed' };
  }

  try {
    if (N8N_WEBHOOK !== 'YOUR_N8N_WEBHOOK_URL_HERE') {
      await fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          timestamp: new Date().toISOString(),
          source: 'faithflow_landing'
        })
      });
    }
    localStorage.setItem('faithflow_subscribed', email);
    return { success: true };
  } catch (err) {
    return { success: false, reason: 'network_error' };
  }
}
