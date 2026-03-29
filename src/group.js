import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayRemove,
  collection,
  query,
  limit,
  where,
  addDoc,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const userCollection = collection(db, "tbUsers");
const groupCollection = collection(db, "tbGroups");
const buddyList = document.getElementById("buddies");

/* Switch between Buddies list and Chat */
document.getElementById("openChat").addEventListener("click", function () {
  const memberDiv = document.getElementById("buddiesScrollable");
  const chatDiv = document.getElementById("chat");
  const button = document.getElementById("openChat");
  const sectionTitle = document.getElementById("sectionTitle");

  if (memberDiv.style.display === "none") {
    memberDiv.style.display = "block";
    chatDiv.style.display = "none";
    button.textContent = "Chat";
    sectionTitle.textContent = "Buddies";
    fillBuddyCard();
  } else {
    memberDiv.style.display = "none";
    chatDiv.style.display = "flex";
    button.textContent = "Buddies";
    sectionTitle.textContent = "Chat";
    createOrUpdateChat();
    setTimeout(() => {
      const msgs = document.getElementById("chatMessages");
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      const input = document.getElementById("chatInput");
      if (input) input.focus();
    }, 50);
  }
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

    // Auto-scroll to bottom on new message
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
    console.log("[Chat] Saved to Firestore:", { groupID, message: text });
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
        await updateDoc(groupDocRef, { members: arrayRemove(user.uid) });
      }
      localStorage.removeItem("group");
      window.location.href = "main.html";
    } catch (error) {
      alert(
        `Error leaving group:\n${error.code || ""}\n${error.message || error}`,
      );
    }
  });

/* ── Auth guard ── */
window.addEventListener("load", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fillBuddyCard();
    } else {
      window.location.href = "index.html";
    }
  });
});

/* ── Load group data and buddy cards ── */
async function fillBuddyCard() {
  buddyList.innerHTML = "";
  try {
    const groupID = localStorage.getItem("group");

    if (!groupID) {
      document.getElementById("groupTitle").textContent = "No group found";
      document.getElementById("destination-text").textContent =
        "Go join or create a group!";
      buddyList.innerHTML =
        "<p style='text-align:center; padding:1rem;'>You are not in a group. <a href='JoinGroup.html'>Find one here.</a></p>";
      return;
    }

    const groupQuery = query(groupCollection, where("groupID", "==", groupID));
    const groupSnap = await getDocs(groupQuery);

    if (groupSnap.empty) {
      alert("Group not found in database.");
      return;
    }

    const groupData = groupSnap.docs[0].data();
    document.getElementById("groupTitle").textContent = groupData.groupName;
    document.getElementById("destination-text").textContent =
      groupData.destination;

    const members = groupData.members || [];
    const leaderID = groupData.leader;

    if (members.length === 0) {
      buddyList.innerHTML = "<p style='text-align:center;'>No members yet.</p>";
      return;
    }

    let buddyListHTML = "";

    for (const uid of members) {
      try {
        const userQuery = query(userCollection, where("userID", "==", uid));
        const userSnap = await getDocs(userQuery);

        if (userSnap.empty) {
          console.warn("No user found for UID:", uid);
          continue;
        }

        userSnap.forEach((userDoc) => {
          const data = userDoc.data();
          const isLeader = uid === leaderID;

          buddyListHTML +=
            "<div class='buddyCard'>" +
            "<img class='icon' src='" +
            (data.profilePicture || "/images/account.png") +
            "' alt='Buddy profile picture' />" +
            "<div class='buddyText'>" +
            "<p class='buddyCardName'>" +
            (data.name || "Unknown") +
            (isLeader
              ? " <span style='position:relative;top:-2px;'>👑</span>"
              : "") +
            "</p>" +
            "<p class='buddyStatus'>" +
            (data.statusMessage || "") +
            "</p>" +
            "</div></div>";
        });
      } catch (userError) {
        console.error("Error fetching user:", uid, userError);
      }
    }

    buddyList.innerHTML = buddyListHTML;
  } catch (error) {
    alert(
      `Error loading group:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}

/* ── Chat UI helpers ── */
function getTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// this function gives the date of chats on top of em
function addDateDividerIfNeeded(timestamp) {
  const chatMessages = document.getElementById("chatMessages");
  const msgDate = new Date(timestamp);
  const dateKey = msgDate.toDateString();

  const dividers = chatMessages.querySelectorAll(".chat-date-divider");
  const last = dividers[dividers.length - 1];
  if (last && last.dataset.date === dateKey) return;

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

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

document
  .getElementById("chatSendBtn")
  ?.addEventListener("click", sendChatMessage);

document.getElementById("chatInput")?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

document.getElementById("chatInput")?.addEventListener("input", function () {
  this.style.height = "auto";
  this.style.height = Math.min(this.scrollHeight, 90) + "px";
});
