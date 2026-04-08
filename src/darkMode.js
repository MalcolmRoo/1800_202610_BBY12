// Dark mode utility - saves to Firestore for logged-in users, localStorage for guests

let darkModeInitialized = false;

// Initialize dark mode - call this on every page
export async function initDarkMode() {
  if (darkModeInitialized) return;
  darkModeInitialized = true;

  const { db, auth } = await import("/src/firebaseConfig.js");
  const { doc, getDoc, setDoc } = await import("firebase/firestore");
  const { onAuthStateChanged } = await import("firebase/auth");

  async function loadAndApplyDarkMode() {
    const user = auth.currentUser;
    let isDarkMode = false;

    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "tbUsers", user.uid));
        if (userDoc.exists() && userDoc.data().darkMode !== undefined) {
          isDarkMode = userDoc.data().darkMode;
          localStorage.setItem('darkMode', isDarkMode);
        } else {
          isDarkMode = localStorage.getItem('darkMode') === 'true';
        }
      } catch (e) {
        isDarkMode = localStorage.getItem('darkMode') === 'true';
      }
    } else {
      isDarkMode = localStorage.getItem('darkMode') === 'true';
    }

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    return isDarkMode;
  }

  await loadAndApplyDarkMode();

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "tbUsers", user.uid));
        if (userDoc.exists() && userDoc.data().darkMode !== undefined) {
          const firestoreDarkMode = userDoc.data().darkMode;
          localStorage.setItem('darkMode', firestoreDarkMode);
          if (firestoreDarkMode) {
            document.body.classList.add('dark-mode');
          } else {
            document.body.classList.remove('dark-mode');
          }
          window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: firestoreDarkMode }));
        }
      } catch (e) {}
    }
  });
}

export async function saveDarkMode(isDark) {
  const { db, auth } = await import("/src/firebaseConfig.js");
  const { doc, setDoc } = await import("firebase/firestore");

  localStorage.setItem('darkMode', isDark);

  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "tbUsers", user.uid), { darkMode: isDark }, { merge: true });
    } catch (e) {}
  }

  window.dispatchEvent(new CustomEvent('darkModeChanged', { detail: isDark }));
}

export function getDarkModeState() {
  return localStorage.getItem('darkMode') === 'true';
}