import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
const cfg = window.CROPULSE_FIREBASE_CONFIG || {};
if (cfg.apiKey && cfg.apiKey !== 'REPLACE_ME') {
 const app=initializeApp(cfg); const auth=getAuth(app); const db=getFirestore(app);
 onAuthStateChanged(auth, async u => {
   if(!u) return;
   let username=u.displayName || u.email?.split('@')[0] || 'Farmer';
   try { const s=await getDoc(doc(db,'users',u.uid)); if(s.exists() && s.data().username) username=s.data().username; } catch(e){}
   const h=new Date().getHours();
   const greeting=h>=5&&h<12?'Good morning':h>=12&&h<17?'Good afternoon':'Good evening';
   document.querySelectorAll('[data-user-greeting]').forEach(el=>el.textContent=`${greeting}, ${username}`);
   document.querySelectorAll('[data-username]').forEach(el=>el.textContent=username);
 });
}
