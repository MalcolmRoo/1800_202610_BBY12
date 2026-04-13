import { db, auth } from "/src/firebaseConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayRemove,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const userCollection = collection(db, "tbUsers");
const groupCollection = collection(db, "tbGroups");
const buddyList = document.getElementById("buddies");

// Cache for user profiles (uid -> {profilePicture, name})
const userProfileCache = new Map();

/* ── This helps Tab switching (Buddies ↔ Chat) ── */
// ─────────────────────────────────────────────────────────────────────────────
// document.getElementById("tabBuddies").addEventListener("click", ...)
// ─────────────────────────────────────────────────────────────────────────────
// Switches to the Buddies tab.
// 1. Shows buddy list, hides chat
// 2. Updates active tab styling
// 3. Loads buddy cards via fillBuddyCard()
//
// Parameters: None — reads from DOM
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
document.getElementById("tabBuddies").addEventListener("click", function () {
  document.getElementById("buddiesScrollable").style.display = "block";
  document.getElementById("chat").style.display = "none";
  this.classList.add("active");
  document.getElementById("tabChat").classList.remove("active");
  fillBuddyCard();
});

// ─────────────────────────────────────────────────────────────────────────────
// document.getElementById("tabChat").addEventListener("click", ...)
// ─────────────────────────────────────────────────────────────────────────────
// Switches to the Chat tab.
// 1. Shows chat, hides buddy list
// 2. Updates active tab styling
// 3. Loads/creates chat via createOrUpdateChat()
// 4. Scrolls to bottom and focuses input
//
// Parameters: None — reads from DOM
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
document.getElementById("tabChat").addEventListener("click", function () {
  document.getElementById("buddiesScrollable").style.display = "none";
  document.getElementById("chat").style.display = "flex";
  this.classList.add("active");
  document.getElementById("tabBuddies").classList.remove("active");
  createOrUpdateChat();
  setTimeout(function () {
    var msgs = document.getElementById("chatMessages");
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
    var input = document.getElementById("chatInput");
    if (input) input.focus();
  }, 50);
});

// ─────────────────────────────────────────────────────────────────────────────
// createOrUpdateChat()
// ─────────────────────────────────────────────────────────────────────────────
// Loads or creates the chat for the current group.
// 1. Checks for existing chat subcollection in Firestore
// 2. If empty, creates a welcome system message
// 3. Pre-fetches all user profiles for chat participants
// 4. Sets up a real-time listener (onSnapshot) for new messages
// 5. Appends each message as a chat bubble
// Uses userProfileCache to avoid redundant Firestore reads.
//
// Parameters: None — reads groupID from localStorage
// Returns: unsubscribe function (call to stop listening)
// ─────────────────────────────────────────────────────────────────────────────
/* This function checks to see if a chat sub-document
exists, if it does refreshes the existing chat box, if not
creates a new sub-document for the chat. */
async function createOrUpdateChat() {
  const chatDiv = document.getElementById("chatMessages");
  const groupID = localStorage.getItem("group");
  const subCollection = "chat";

  //Clear chat to remove dublicates
  chatDiv.innerHTML = "<div class='chat-date-divider'>Top</div>";

  // PRE-FETCH CURRENT USER'S PROFILE (Option A)
  // Get current user's profile immediately so it's available from the start
  const currentUser = auth.currentUser;
  if (currentUser && !userProfileCache.has(currentUser.uid)) {
    const currentUserDoc = await getDoc(doc(db, "tbUsers", currentUser.uid));
    if (currentUserDoc.exists()) {
      const userData = currentUserDoc.data();
      userProfileCache.set(currentUser.uid, {
        profilePicture: userData.profilePicture || "/images/account.png",
        name: userData.name || currentUser.displayName || "You",
      });
    }
  }

  const collectionRef = collection(db, "tbGroups", groupID, subCollection);
  const chatQuery = query(collectionRef, orderBy("timestamp", "asc"));

  // Create a Listener that watches the DB live and functions whenever
  // the db gets a new entry
  const unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
    // If the collection is empty, create the system message
    chatDiv.innerHTML = "<div class='chat-date-divider'>Top</div>";
    if (snapshot.empty) {
      const systemMessageRef = doc(
        db,
        "tbGroups",
        groupID,
        subCollection,
        "systemMessage",
      );
      setDoc(systemMessageRef, {
        user: "server",
        timestamp: Date.now(),
        message:
          "Welcome to the chat! You can chat here with your buddies in the group!",
      });
      return;
    }

    // Collect all unique UIDs from messages
    const uidList = [];
    for (const msgDoc of snapshot.docs) {
      const data = msgDoc.data();
      if (data.uid && !uidList.includes(data.uid) && data.user !== "server") {
        uidList.push(data.uid);
      }
    }

    // Fetch user profiles for all UIDs (sync - immediately available)
    for (const uid of uidList) {
      if (!userProfileCache.has(uid)) {
        // Use getDocs for immediate fetch instead of onSnapshot
        const userQuery = query(userCollection, where("userID", "==", uid));
        const userSnap = await getDocs(userQuery);
        if (!userSnap.empty) {
          const userData = userSnap.docs[0].data();
          userProfileCache.set(uid, {
            profilePicture: userData.profilePicture || "/images/account.png",
            name: userData.name || "Unknown",
          });
        }
      }
    }

    // Add messages from the DB that are not the server message
    for (const msgDoc of snapshot.docs) {
      const data = msgDoc.data();
      if (data.user === "server") continue;

      const currentUser = auth.currentUser;
      const isMine = data.uid === currentUser?.uid;

      // Get profile from cache or use defaults
      const cachedProfile = userProfileCache.get(data.uid);
      const profilePicture = cachedProfile?.profilePicture || "/images/account.png";
      const userName = cachedProfile?.name || data.user;

      appendChatBubble({
        text: data.message,
        senderName: userName,
        initials: userName.charAt(0).toUpperCase(),
        profilePicture: profilePicture,
        color: isMine ? "#7b5ea0" : "#e85d75",
        isMine,
        timestamp: data.timestamp,
      });
    }

    // Auto-scroll to bottom on new message!!!
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });

  // Return unsubscribe so you can stop listening when the user leaves the page
  return unsubscribe;
}

// ─────────────────────────────────────────────────────────────────────────────
// postChatMessage(text)
// ─────────────────────────────────────────────────────────────────────────────
// Saves a chat message to Firestore.
// 1. Gets current groupID and user from localStorage/auth
// 2. Creates a unique subdocument ID using timestamp
// 3. Saves message with user info and timestamp to Firestore
//
// Parameters:
//   text (string) - The message content to send
//
// Returns: Nothing — shows alert on error
// ─────────────────────────────────────────────────────────────────────────────
/* This is a function to post chat messages */
/* ── Post a chat message to Firestore ── */
async function postChatMessage(text) {
  const groupID = localStorage.getItem("group");
  const user = auth.currentUser;
  const subDocID = Date.now() + "_chat";

  const chatMessageRef = doc(db, "tbGroups", groupID, "chat", subDocID);

  try {
    await setDoc(chatMessageRef, {
      user: user ? user.displayName || user.email || "unknown" : "unknown",
      uid: user ? user.uid : "unknown",
      timestamp: Date.now(),
      message: text,
    });
  } catch (error) {
    alert(
      `Error posting message:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}

/* ── Leave group ── */
document
  .getElementById("leaveGroup")
  .addEventListener("click", async function () {
    const confirmed = confirm("Are you sure you want to leave this group?");
    if (!confirmed) return;

    const user = auth.currentUser;
    if (!user) {
      alert("Not logged in.");
      return;
    }

    const groupID = localStorage.getItem("group");
    try {
      const groupQuery = query(
        groupCollection,
        where("groupID", "==", groupID),
      );
      const groupSnap = await getDocs(groupQuery);
      if (!groupSnap.empty) {
        const groupDocRef = doc(db, "tbGroups", groupSnap.docs[0].id);
        // arrayRemove safely removes only this user's UID from the members array
        await updateDoc(groupDocRef, { members: arrayRemove(user.uid) });
      }
      localStorage.removeItem("group");
      window.location.href = "/main.html";
    } catch (error) {
      alert(
        `Error leaving group:\n${error.code || ""}\n${error.message || error}`,
      );
    }
  });

/* ── Auth guard ──
   Waits for Firebase Auth to resolve before loading the page.
   This prevents a race condition where group data loads before
   the user is confirmed as logged in */
// ─────────────────────────────────────────────────────────────────────────────
// window.addEventListener("load", ...)
// ─────────────────────────────────────────────────────────────────────────────
// Security check: waits for Firebase auth to initialize.
// If user is logged in, loads buddy cards. If not, redirects to login.
//
// Parameters: None
// Returns: Nothing — navigates on failure
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener("load", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fillBuddyCard();
    } else {
      window.location.href = "/index.html";
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fillBuddyCard()
// ─────────────────────────────────────────────────────────────────────────────
// Loads and displays the buddy list for the current group.
// 1. Gets groupID from localStorage
// 2. Sets up real-time listener (onSnapshot) on the group document
// 3. Fetches each member's user profile via their own onSnapshot listener
// 4. Renders buddy cards with profile picture, name, status
// 5. Shows leader crown icon for the group creator
//
// Parameters: None — reads groupID from localStorage
// Returns: Nothing — updates DOM directly
// ─────────────────────────────────────────────────────────────────────────────
async function fillBuddyCard() {
  const groupID = localStorage.getItem("group");
  const buddyList = document.getElementById("buddies");

  if (!groupID) {
    document.getElementById("groupTitle").textContent = "No group found";
    document.getElementById("destination-text").textContent =
      "Go join or create a group!";
    buddyList.innerHTML =
      "<p style='text-align:center; padding:1rem;'>You are not in a group. <a href='JoinGroup.html'>Find one here.</a></p>";
    return;
  }

  //Listen to the GROUP document first
  const groupQuery = query(groupCollection, where("groupID", "==", groupID));

  // ── onSnapshot on the GROUP document ──
  // Unlike getDocs (one-time fetch), onSnapshot listens in real time.
  // So if someone joins or leaves, the buddy list updates automatically
  onSnapshot(groupQuery, async (groupSnapshot) => {
    if (groupSnapshot.empty) {
      alert("Group not found in database.");
      return;
    }

    const groupDoc = groupSnapshot.docs[0];
    const groupData = groupDoc.data();
    const members = groupData.members || [];
    const leaderID = groupData.leader;

    // Update UI elements that might change (Member Count, Group Name)
    document.getElementById("groupTitle").textContent = groupData.groupName;
    const countEl = document.getElementById("memberCountText");
    if (countEl) countEl.textContent = members.length + " Buddies";

    if (members.length === 0) {
      buddyList.innerHTML = "<p style='text-align:center;'>No members yet.</p>";
      return;
    }

    //Create a default card for info to be loaded into
    const buddyDataMap = new Map();
    const renderBuddyList = () => {
      // Render cards in the same order as the members array.
      // Shows "Loading..." placeholder until that user's data arrives
      buddyList.innerHTML = members
        .map(
          (uid) =>
            buddyDataMap.get(uid) || `<div class='buddyCard'>Loading...</div>`,
        )
        .join("");
    };

    //Listen to each member in the UPDATED members array
    // ── onSnapshot on each MEMBER's user document ──
    // Each member gets their own real-time listener so if someone
    // updates their name/picture/status, it reflects instantly
    members.forEach((uid) => {
      const userQuery = query(userCollection, where("userID", "==", uid));

      onSnapshot(userQuery, (userSnap) => {
        userSnap.forEach((userDoc) => {
          const data = userDoc.data();
          const isLeader = uid === leaderID;

          const html = `
            <div class='buddyCard'>
              <img class='icon' src='${data.profilePicture || "/images/account.png"}' />
              <div class='buddyText'>
                <p class='buddyCardName'>${data.name || "Unknown"}${isLeader ? " 👑" : ""}</p>
                <p class='buddyStatus'>${data.statusMessage || ""}</p>
              </div>
            </div>`;

          buddyDataMap.set(uid, html);
        });
        renderBuddyList();
      });
    });
  });
  //onSnapshot end
}

/* ── Chat UI helpers ── */
// ─────────────────────────────────────────────────────────────────────────────
// getTimeLabel()
// ─────────────────────────────────────────────────────────────────────────────
// Returns the current time formatted as HH:MM (e.g., "2:30 PM").
// Used for chat bubble timestamps.
//
// Parameters: None
// Returns: string - formatted time
// ─────────────────────────────────────────────────────────────────────────────
// Returns the current time formatted as HH:MM for chat bubble timestamps
function getTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// addDateDividerIfNeeded(timestamp)
// ─────────────────────────────────────────────────────────────────────────────
// Adds a date divider above chat messages when the date changes.
// Shows "Today", "Yesterday", or the date for new days.
// Prevents duplicate dividers by checking the last divider's date.
//
// Parameters:
//   timestamp (number) - Unix timestamp in milliseconds
//
// Returns: Nothing — appends divider to DOM
// ─────────────────────────────────────────────────────────────────────────────
// this function gives the date of chats on top of em
// when the date changes between messages
function addDateDividerIfNeeded(timestamp) {
  const chatMessages = document.getElementById("chatMessages");
  const msgDate = new Date(timestamp);
  const dateKey = msgDate.toDateString();

  // Check if the last divider already matches this date — if so, skip
  const dividers = chatMessages.querySelectorAll(".chat-date-divider");
  const last = dividers[dividers.length - 1];
  if (last && last.dataset.date === dateKey) return;

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  // Pick a today and yesterday label instead of showing a raw date
  let label;
  if (dateKey === now.toDateString()) label = "Today";
  else if (dateKey === yesterday.toDateString()) label = "Yesterday";
  else
    label = msgDate.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const divider = document.createElement("div");
  divider.className = "chat-date-divider";
  divider.dataset.date = dateKey;
  divider.textContent = label;
  chatMessages.appendChild(divider);
}

// ─────────────────────────────────────────────────────────────────────────────
// appendChatBubble({ text, senderName, initials, profilePicture, color, isMine, timestamp })
// ─────────────────────────────────────────────────────────────────────────────
// Builds and appends a single chat bubble to the chat window.
// 1. Adds date divider if timestamp is on a new day
// 2. Creates avatar (profile picture or colored initials)
// 3. Creates message body with sender name, bubble, and timestamp
// 4. "mine" bubbles appear on the right, others on the left
// 5. Auto-scrolls to the latest message
//
// Parameters:
//   text (string) - Message content
//   senderName (string) - Display name of sender
//   initials (string) - First letter of name for avatar fallback
//   profilePicture (string) - URL to profile image
//   color (string) - Hex color for avatar background
//   isMine (boolean) - true if sent by current user
//   timestamp (number) - Unix timestamp in ms
//
// Returns: Nothing — appends bubble to DOM
// ─────────────────────────────────────────────────────────────────────────────
// Builds and appends a single chat bubble to the chat window.
// "mine" bubbles appear on the right, others on the left
function appendChatBubble({
  text,
  senderName,
  initials,
  profilePicture,
  color,
  isMine,
  timestamp,
}) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  if (timestamp) addDateDividerIfNeeded(timestamp); // for the chat day bubble

  const row = document.createElement("div");
  row.className = "chat-msg-row" + (isMine ? " mine" : "");

  // Avatar - show profile picture if set, otherwise show initials
  const avatarEl = document.createElement("div");
  avatarEl.className = "chat-avatar-msg";
  // Show picture if profilePicture exists and is not the default placeholder
  const showPfp = profilePicture && profilePicture !== "/images/account.png";
  if (showPfp) {
    const img = document.createElement("img");
    img.src = profilePicture;
    img.className = "chat-avatar-img";
    avatarEl.appendChild(img);
  } else {
    avatarEl.style.background = color || "#7b5ea0";
    avatarEl.textContent = initials || "?";
  }

  const body = document.createElement("div");
  body.className = "chat-msg-body";

  if (!isMine) {
    const nameEl = document.createElement("div");
    nameEl.className = "chat-sender-name";
    nameEl.textContent = senderName;
    body.appendChild(nameEl);
  }

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble bubble-new " + (isMine ? "mine" : "theirs");
  bubble.textContent = text;

  const time = document.createElement("div");
  time.className = "chat-bubble-time";
  time.textContent = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : getTimeLabel();
  body.appendChild(bubble);
  body.appendChild(time);
  row.appendChild(avatarEl);
  row.appendChild(body);
  chatMessages.appendChild(row);

  // Auto-scroll to the latest message
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ─────────────────────────────────────────────────────────────────────────────
// sendChatMessage()
// ─────────────────────────────────────────────────────────────────────────────
// Handles the send button click and Enter key press.
// 1. Gets text from input, trims whitespace
// 2. Calls postChatMessage() to save to Firestore
// 3. Clears input and resets height
// Called by both button click and Enter key press.
//
// Parameters: None — reads from DOM
// Returns: Nothing
// ─────────────────────────────────────────────────────────────────────────────
/* ── Send message — saves to Firestore + shows bubble ── */
function sendChatMessage() {
  const input = document.getElementById("chatInput");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  const initials = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : "?";

  postChatMessage(text); // saves to Firebase

  input.value = "";
  input.style.height = "auto";
}
//send on button click
document
  .getElementById("chatSendBtn")
  ?.addEventListener("click", sendChatMessage);

//sends on key (Shift +enter adds a new line instead !)
document.getElementById("chatInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// Auto-grow the textarea as the user types, up to a max height of 90px
document.getElementById("chatInput")?.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 90) + "px";
});
