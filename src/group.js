import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import {
  doc,
  getDocs,
  updateDoc,
  arrayRemove,
  collection,
  query,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const userCollection = collection(db, "tbUsers");
const groupCollection = collection(db, "tbGroups");
const buddyList = document.getElementById("buddies");

//ADD FUNCTION TO INTAKE CHAT MESSAGES AND INPUT INTO SUB-DOCUMENT

/* Switch between Buddies list and Chat */
document.getElementById("openChat").addEventListener("click", function () {
  const memberDiv = document.getElementById("buddiesScrollable");
  const chatDiv = document.getElementById("chat");
  const button = document.getElementById("openChat");
  const headerText = document.getElementById("buddiesTitle");
  if (memberDiv.style.display === "none") {
    memberDiv.style.display = "block";
    chatDiv.style.display = "none";
    button.textContent = "Chat";
    headerText.textContent = "Buddies";
  } else {
    memberDiv.style.display = "none";
    chatDiv.style.display = "block";
    button.textContent = "Buddies";
    headerText.textContent = "Chat";
    //Refresh chat funtion here
  }
});

/* Leave group button — removes user from members array, clears localStorage, goes to main */
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
        await updateDoc(groupDocRef, {
          members: arrayRemove(user.uid),
        });
      }
      localStorage.removeItem("group");
      window.location.href = "main.html";
    } catch (error) {
      alert(
        `Error leaving group:\n${error.code || ""}\n${error.message || error}`,
      );
    }
  });

/* Wait for Firebase Auth to be ready before loading group data.
   This fixes the bug where members don't show because auth isn't
   resolved yet when the page loads. */
window.addEventListener("load", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fillBuddyCard();
    } else {
      window.location.href = "index.html";
    }
  });
});

// Fetches the group from Firestore using the groupID in localStorage,
// then loops through every member UID in the group's members array,
// looks up each user's info in tbUsers, and renders a buddy card for each.
async function fillBuddyCard() {
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

    // 1. Get the group document
    const groupQuery = query(groupCollection, where("groupID", "==", groupID));
    const groupSnap = await getDocs(groupQuery);

    if (groupSnap.empty) {
      alert("Group not found in database.");
      return;
    }

    const groupData = groupSnap.docs[0].data();

    // 2. Populate group header
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

    // 3. Loop through every member UID and fetch their user document
    for (const uid of members) {
      try {
        const userQuery = query(userCollection, where("userID", "==", uid));
        const userSnap = await getDocs(userQuery);

        if (userSnap.empty) {
          console.warn("No user document found for UID:", uid);
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
              ? " <span style='position: relative; top: -2px;'>👑</span>"
              : "") +
            "</p>" +
            "<p class='buddyStatus'>" +
            (data.statusMessage || "") +
            "</p>" +
            "</div>" +
            "</div>";
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
