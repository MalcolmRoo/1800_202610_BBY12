import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import { getDocs, collection, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const groupCollection = collection(db, "tbGroups");

window.addEventListener("load", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadMyGroups(user.uid);
    } else {
      window.location.href = "index.html";
    }
  });
});

async function loadMyGroups(userID) {
  const container = document.getElementById("myGroupsList");
  container.innerHTML = "<p style='text-align:center;'>Loading your groups...</p>";

  try {
    // Find all groups where this user's UID is in the members array
    const groupQuery = query(
      groupCollection,
      where("members", "array-contains", userID)
    );
    const groupSnap = await getDocs(groupQuery);

    if (groupSnap.empty) {
      container.innerHTML = "<p style='text-align:center; color:var(--muted);'>You are not in any groups yet.<br><a href='JoinGroup.html'>Find a group</a> or <a href='createGrpForm.html'>create one</a>.</p>";
      return;
    }

    container.innerHTML = "";

    groupSnap.forEach((docSnap) => {
      const group = docSnap.data();

      const card = document.createElement("div");
      card.className = "result-card";
      card.style.cursor = "pointer";

      const info = document.createElement("div");

      const name = document.createElement("h3");
      name.textContent = group.groupName || "Unnamed Group";

      const dest = document.createElement("p");
      dest.textContent = "📍 " + (group.destination || "Unknown destination");

      const tagsLine = document.createElement("p");
      tagsLine.textContent = group.tags ? "🏷 " + group.tags.join(", ") : "";

      const memberCount = document.createElement("p");
      memberCount.textContent = "👥 " + (group.members ? group.members.length : 0) + " members";

      info.appendChild(name);
      info.appendChild(dest);
      info.appendChild(tagsLine);
      info.appendChild(memberCount);

      const openBtn = document.createElement("button");
      openBtn.className = "join-btn";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", () => {
        localStorage.setItem("group", group.groupID);
        window.location.href = "group.html";
      });

      card.appendChild(info);
      card.appendChild(openBtn);
      container.appendChild(card);
    });

  } catch (error) {
    alert(`Error loading your groups:\n${error.code || ""}\n${error.message || error}`);
  }
}
