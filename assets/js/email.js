const FORMSPREE_URL = 'https://formspree.io/f/xbdpzbww';

export async function subscribe(name, email) {
  // Check for duplicate submission
  if (localStorage.getItem('faithflow_subscribed')) {
    return { success: false, reason: 'already_subscribed' };
  }

  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('source', 'faithflow_landing');
    formData.append('timestamp', new Date().toISOString());

    const res = await fetch(FORMSPREE_URL, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
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
