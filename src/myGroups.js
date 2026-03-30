import { db } from "/src/firebaseConfig.js";
import { auth } from "/src/firebaseConfig.js";
import { getDocs, collection, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { processGroup } from "/src/archiveUtils.js";

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

function formatDates(group) {
  if (group.startDate && group.endDate) {
    var s = new Date(group.startDate + "T00:00:00");
    var e = new Date(group.endDate + "T00:00:00");
    var opts = { month: "short", day: "numeric" };
    return "📅 " + s.toLocaleDateString([], opts) + " – " + e.toLocaleDateString([], opts) + ", " + e.getFullYear();
  }
  return "";
}

function createGroupCard(group, isArchived) {
  var card = document.createElement("div");
  card.className = "result-card" + (isArchived ? " archived-card" : "");

  var info = document.createElement("div");

  var name = document.createElement("h3");
  name.textContent = group.groupName || "Unnamed Group";

  var dest = document.createElement("p");
  dest.textContent = "📍 " + (group.destination || "Unknown destination");

  var tagsLine = document.createElement("p");
  tagsLine.textContent = group.tags ? "🏷 " + group.tags.join(", ") : "";

  var memberCount = document.createElement("p");
  memberCount.textContent = "👥 " + (group.members ? group.members.length : 0) + " members";

  var dateLine = document.createElement("p");
  dateLine.textContent = formatDates(group);

  info.appendChild(name);
  info.appendChild(dest);
  info.appendChild(tagsLine);
  info.appendChild(memberCount);
  if (dateLine.textContent) info.appendChild(dateLine);

  if (isArchived) {
    var archivedLabel = document.createElement("p");
    archivedLabel.className = "archived-label";
    archivedLabel.textContent = "📦 Archived";
    info.appendChild(archivedLabel);
  }

  var btn = document.createElement("button");
  btn.className = "join-btn";
  btn.textContent = isArchived ? "View" : "Open";
  btn.addEventListener("click", function () {
    localStorage.setItem("group", group.groupID);
    window.location.href = "group.html";
  });

  card.appendChild(info);
  card.appendChild(btn);
  return card;
}

async function loadMyGroups(userID) {
  var container = document.getElementById("myGroupsList");
  container.innerHTML = "<p style='text-align:center;'>Loading your groups...</p>";

  try {
    var groupQuery = query(
      groupCollection,
      where("members", "array-contains", userID)
    );
    var groupSnap = await getDocs(groupQuery);

    if (groupSnap.empty) {
      container.innerHTML = "<p style='text-align:center; color:var(--muted);'>You are not in any groups yet.<br><a href='JoinGroup.html'>Find a group</a> or <a href='createGrpForm.html'>create one</a>.</p>";
      return;
    }

    // Process each group (archive check + delete check)
    var activeGroups = [];
    var archivedGroups = [];

    for (var docSnap of groupSnap.docs) {
      var group = docSnap.data();
      var result = await processGroup(group, docSnap.id);
      if (result === null) continue; // deleted
      if (result.archived) {
        archivedGroups.push(result);
      } else {
        activeGroups.push(result);
      }
    }

    container.innerHTML = "";

    // Active groups
    if (activeGroups.length > 0) {
      activeGroups.forEach(function (group) {
        container.appendChild(createGroupCard(group, false));
      });
    } else if (archivedGroups.length === 0) {
      container.innerHTML = "<p style='text-align:center; color:var(--muted);'>You are not in any groups yet.<br><a href='JoinGroup.html'>Find a group</a> or <a href='createGrpForm.html'>create one</a>.</p>";
      return;
    }

    // Archived section
    if (archivedGroups.length > 0) {
      var archiveHeader = document.createElement("div");
      archiveHeader.className = "archive-section-header";
      archiveHeader.textContent = "Archived Trips";
      container.appendChild(archiveHeader);

      archivedGroups.forEach(function (group) {
        container.appendChild(createGroupCard(group, true));
      });
    }

  } catch (error) {
    alert("Error loading your groups:\n" + (error.code || "") + "\n" + (error.message || error));
  }
}
