import { db, auth } from "/src/firebaseConfig.js";
import {
  doc,
  setDoc,
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

/* ── This helps Tab switching (Buddies ↔ Chat) ── */
document.getElementById("tabBuddies").addEventListener("click", function () {
  document.getElementById("buddiesScrollable").style.display = "block";
  document.getElementById("chat").style.display = "none";
  this.classList.add("active");
  document.getElementById("tabChat").classList.remove("active");
  fillBuddyCard();
});

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

/* This function checks to see if a chat sub-document
exists, if it does refreshes the existing chat box, if not
creates a new sub-document for the chat. */
function createOrUpdateChat() {
  const chatDiv = document.getElementById("chatMessages");
  const groupID = localStorage.getItem("group");
  const subCollection = "chat";

  //Clear chat to remove dublicates
  chatDiv.innerHTML = "<div class='chat-date-divider'>Top</div>";

  const collectionRef = collection(db, "tbGroups", groupID, subCollection);
  const chatQuery = query(collectionRef, orderBy("timestamp", "asc"));

  // Create a Listener that watches the DB live and functions whenever
  // the db gets a new entry
  const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
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

    //Add messages from the DB that are not the server message
    snapshot.forEach((msgDoc) => {
      const data = msgDoc.data();
      if (data.user === "server") return;

      const currentUser = auth.currentUser;
      const isMine = data.uid === currentUser?.uid;

      appendChatBubble({
        text: data.message,
        senderName: data.user,
        initials: data.user.charAt(0).toUpperCase(),
        color: isMine ? "#7b5ea0" : "#e85d75",
        isMine,
        timestamp: data.timestamp,
      });
    });

    // Auto-scroll to bottom on new message!!!
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });

  // Return unsubscribe so you can stop listening when the user leaves the page
  return unsubscribe;
}

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
window.addEventListener("load", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fillBuddyCard();
    } else {
      window.location.href = "/index.html";
    }
  });
});

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

// Returns the current time formatted as HH:MM for chat bubble timestamps
function getTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

// Builds and appends a single chat bubble to the chat window.
// "mine" bubbles appear on the right, others on the left
function appendChatBubble({
  text,
  senderName,
  initials,
  color,
  isMine,
  timestamp,
}) {
  const chatMessages = document.getElementById("chatMessages");
  if (!chatMessages) return;

  if (timestamp) addDateDividerIfNeeded(timestamp); // for the chat day bubble

  const row = document.createElement("div");
  row.className = "chat-msg-row" + (isMine ? " mine" : "");

  // Avatar circle showing the sender's initial
  const avatarEl = document.createElement("div");
  avatarEl.className = "chat-avatar-msg";
  avatarEl.style.background = color || "#7b5ea0";
  avatarEl.textContent = initials || "?";

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
