import { db, auth } from "/src/firebaseConfig.js";
import { getDocs, collection, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const groupCollection = collection(db, "tbGroups");

// Wait for Firebase Auth to resolve before loading groups.
// Redirects to login if the user is not signed in
window.addEventListener("load", function () {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadMyGroups(user.uid);
    } else {
      window.location.href = "/index.html";
    }
  });
});

// Dates are parsed at midnight local time to avoid timezone shift bugs
// Returns empty string if either date is missing
// Returns a formatted date range.
function formatDates(group) {
  if (group.startDate && group.endDate) {
    var s = new Date(group.startDate + "T00:00:00");
    var e = new Date(group.endDate + "T00:00:00");
    var opts = { month: "short", day: "numeric" };
    return (
      "📅 " +
      s.toLocaleDateString([], opts) +
      " – " +
      e.toLocaleDateString([], opts) +
      ", " +
      e.getFullYear()
    );
  }
  return "";
}

// Builds and returns a single group card element.
// Separated into its own function to keep loadMyGroups clean and readable
function createGroupCard(group) {
  var card = document.createElement("div");
  card.className = "result-card";
  var info = document.createElement("div");
  //group name
  var name = document.createElement("h3");
  name.textContent = group.groupName || "Unnamed Group";
  //destination
  var dest = document.createElement("p");
  dest.textContent = "📍 " + (group.destination || "Unknown destination");
  //tags
  var tagsLine = document.createElement("p");
  tagsLine.textContent = group.tags ? "🏷 " + group.tags.join(", ") : "";
  //membes in group
  var memberCount = document.createElement("p");
  memberCount.textContent =
    "👥 " + (group.members ? group.members.length : 0) + " members";
  var dateLine = document.createElement("p");
  dateLine.textContent = formatDates(group);
  info.appendChild(name);
  info.appendChild(dest);
  info.appendChild(tagsLine);
  info.appendChild(memberCount);
  if (dateLine.textContent) info.appendChild(dateLine);

  // Open button — saves this group's ID to localStorage and goes to group.html
  var btn = document.createElement("button");
  btn.className = "join-btn";
  btn.textContent = "Open";
  btn.addEventListener("click", function () {
    localStorage.setItem("group", group.groupID);
    window.location.href = "/group.html";
  });
  card.appendChild(info);
  card.appendChild(btn);
  return card;
}

// Fetches all groups where the current user's UID is in the members array,
// then renders a card for each one
async function loadMyGroups(userID) {
  var container = document.getElementById("myGroupsList");
  container.innerHTML =
    "<p style='text-align:center;'>Loading your groups...</p>";
  try {
    // array-contains checks if the members array includes this exact UID
    var groupQuery = query(
      // User exists but isn't in any groups yet
      groupCollection,
      where("members", "array-contains", userID),
    );
    var groupSnap = await getDocs(groupQuery);

    if (groupSnap.empty) {
      container.innerHTML =
        "<p style='text-align:center;'>You are not in any groups yet.<br><a href='/JoinGroup.html'>Find a group</a> or <a href='/createGrpForm.html'>create one</a>.</p>";
      return;
    }

    container.innerHTML = "";

    //builds and applies a card for each group
    groupSnap.forEach(function (docSnap) {
      var group = docSnap.data();
      container.appendChild(createGroupCard(group));
    });
  } catch (error) {
    alert(
      "Error loading your groups:\n" +
        (error.code || "") +
        "\n" +
        (error.message || error),
    );
  }
}
