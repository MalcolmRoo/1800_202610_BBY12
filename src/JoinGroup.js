import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
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

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(form);

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

export async function QueryGroups(location, tags) {
  console.log(location);
  console.log(tags);

  try {
    const groupQuery = query(
      travelGroups,
      where("destination", "==", location.toString()),
      where("tags", "array-contains-any", tags),
    );
    const querySnapshot = await getDocs(groupQuery);

    // Collect results into an array and pass to populateResults
    const groups = [];
    querySnapshot.forEach((docSnap) => {
      console.log("return docs");
      console.log(docSnap.id, " => ", docSnap.data());
      groups.push({ id: docSnap.id, ...docSnap.data() });
    });

    populateResults(groups);
  } catch (error) {
    alert(
      `Error searching for group documents: \n${error.code || ""}\n${error.message || error}`,
    );
  }
}

// Renders each group result card with a Join button
function populateResults(groups) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (groups.length === 0) {
    resultsDiv.innerHTML =
      "<p style='color:var(--muted); text-align:center;'>No groups found. Try a different destination or tags.</p>";
    return;
  }

  groups.forEach((group) => {
    const card = document.createElement("div");
    card.className = "result-card";

    // Left side: group info
    const info = document.createElement("div");

    const name = document.createElement("h3");
    name.textContent = group.groupName || "Unnamed Group";

    const dest = document.createElement("p");
    dest.textContent = "📍 " + (group.destination || "Unknown destination");

    const tagsLine = document.createElement("p");
    tagsLine.textContent = group.tags ? "🏷 " + group.tags.join(", ") : "";

    info.appendChild(name);
    info.appendChild(dest);
    info.appendChild(tagsLine);

    // Right side: Join button
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
    await updateDoc(groupDocRef, {
      members: arrayUnion(user.uid),
    });

    // Save the groupID in localStorage so group.html can load it
    localStorage.setItem("group", groupID);

    // Redirect to the group page
    window.location.href = "group.html";
  } catch (error) {
    alert(
      `Error joining group: \n${error.code || ""}\n${error.message || error}`,
    );
  }
}