import { db, auth } from "/src/firebaseConfig.js";
import {
  doc,
  getDocs,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
} from "firebase/firestore";

const travelGroups = collection(db, "tbGroups");

const form = document.getElementById("joinGroupForm");

// Listen for form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(form);

  // Get the typed/selected destination and any checked tags
  const location = formData.get("destination-input");
  const tags = document.getElementsByName("tags[]");
  const tagsArray = [];
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].checked == true) {
      tagsArray.push(tags[i].value);
    }
  }
  QueryGroups(location, tagsArray);
});

// Queries Firestore for groups matching the destination.
// If tags are selected, also filters by those tags.
// If no tags are selected, returns all groups at that destination !!
export async function QueryGroups(location, tags) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p style='text-align:center;'>Searching...</p>";
  try {
    let groupQuery;

    if (tags.length === 0) {
      // No tags selected — search by destination only
      groupQuery = query(
        travelGroups,
        where("destination", "==", location.toString()),
      );
    } else {
      // Tags selected — search by destination AND at least one matching tag
      groupQuery = query(
        travelGroups,
        where("destination", "==", location.toString()),
        where("tags", "array-contains-any", tags),
      );
    }

    const querySnapshot = await getDocs(groupQuery);
    const groups = [];
    querySnapshot.forEach((docSnap) => {
      var data = docSnap.data();
      groups.push({ id: docSnap.id, ...data });
    });

    populateResults(groups);
  } catch (error) {
    alert(`Error searching: ${error.message}`);
  }
}

// Renders each group result card with a Join button
function populateResults(groups) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (groups.length === 0) {
    resultsDiv.innerHTML =
      "<p style='text-align:center;'>No groups found for that destination. Try different tags or a different location.</p>";
    return;
  }

  groups.forEach((group) => {
    const card = document.createElement("div");
    card.className = "result-card";

    // Left side: group info
    const info = document.createElement("div");

    //group name
    const name = document.createElement("h3");
    name.textContent = group.groupName || "Unnamed Group";

    //destination.
    const dest = document.createElement("p");
    dest.textContent = "📍 " + (group.destination || "Unknown destination");
    //the Tagss.
    const tagsLine = document.createElement("p");
    tagsLine.textContent = group.tags ? "🏷 " + group.tags.join(", ") : "";

    info.appendChild(name);
    info.appendChild(dest);
    info.appendChild(tagsLine);

    // How many people are already in the group
    const members = document.createElement("p");
    members.textContent =
      "Members: " + (group.members ? group.members.length : 0);
    info.appendChild(members);

    //travel method
    const method = document.createElement("p");
    method.textContent = "Travel: " + (group.travelMethod || "Not specified");
    info.appendChild(method);

    // Trip dates = only shown if both start and end date exist
    // Dates are parsed at midnight local time to avoid timezone shift bugs
    const dateLine = document.createElement("p");
    if (group.startDate && group.endDate) {
      var s = new Date(group.startDate + "T00:00:00");
      var e = new Date(group.endDate + "T00:00:00");
      var opts = { month: "short", day: "numeric" };
      dateLine.textContent =
        "📅 " +
        s.toLocaleDateString([], opts) +
        " – " +
        e.toLocaleDateString([], opts) +
        ", " +
        e.getFullYear();
      info.appendChild(dateLine);
    }

    // Join button - adds user to this group's members array in Firestore
    const joinBtn = document.createElement("button");
    joinBtn.className = "join-btn";
    joinBtn.textContent = "Join";
    joinBtn.addEventListener("click", () => joinGroup(group.id, group.groupID));

    card.appendChild(info);
    card.appendChild(joinBtn);
    resultsDiv.appendChild(card);
  });
}

// Adds the current user to the group's members array in Firestore,
// saves the groupID to localStorage, then redirects to group.html
async function joinGroup(firestoreDocID, groupID) {
  const user = auth.currentUser;

  if (!user) {
    alert("You must be logged in to join a group.");
    return;
  }

  try {
    // Update the group document: add userID to a "members" array field
    const groupDocRef = doc(db, "tbGroups", firestoreDocID);

    // arrayUnion safely adds the UID only if it isn't already in the array,
    // so a user can never be added to the same group twice
    await updateDoc(groupDocRef, {
      members: arrayUnion(user.uid),
    });

    // Save the groupID in localStorage so group.html can load it
    localStorage.setItem("group", groupID);

    // Redirect to the group page
    window.location.href = "/group.html";
  } catch (error) {
    alert(
      `Error joining group: \n${error.code || ""}\n${error.message || error}`,
    );
  }
}
