import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';

const cfg = window.CROPULSE_FIREBASE_CONFIG || {};

if (cfg.apiKey && cfg.apiKey !== 'REPLACE_ME') {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  const db = getFirestore(app);

  onAuthStateChanged(auth, async (u) => {
    // Overview is a protected page. Never leave an unauthenticated visitor
    // sitting on the dashboard.
    if (!u) {
      window.location.replace('login.html');
      return;
    }

    let username = u.displayName || u.email?.split('@')[0] || 'Farmer';

    try {
      const s = await getDoc(doc(db, 'users', u.uid));
      if (s.exists() && s.data().username) {
        username = s.data().username;
      }
    } catch (e) {
      console.warn('Unable to load user profile:', e);
    }

    const parts = new Intl.DateTimeFormat('en-IN', {
      hour: 'numeric',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    }).formatToParts(new Date());
    const hour = Number(parts.find(p => p.type === 'hour')?.value || new Date().getHours());
    const greeting =
      hour >= 5 && hour < 12
        ? 'Good morning'
        : hour >= 12 && hour < 17
          ? 'Good afternoon'
          : 'Good evening';

    document.querySelectorAll('[data-user-greeting]').forEach((el) => {
      el.textContent = `${greeting}, ${username}`;
    });

    document.querySelectorAll('[data-username]').forEach((el) => {
      el.textContent = username;
    });

    document.querySelectorAll('.profile-mini b').forEach((el) => {
      el.textContent = username;
    });
  });
}
