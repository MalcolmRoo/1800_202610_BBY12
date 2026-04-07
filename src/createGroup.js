import { v4 as uuidv4 } from "uuid";
import { db } from "/src/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import { getSelectedTags } from "/src/tags.js";

const form = document.getElementById("createGroupForm");

// Listen for form submission
form.addEventListener("submit", function (event) {
  event.preventDefault();

  // Grab all form field values
  const formData = new FormData(form);
  const name = formData.get("group-name");
  const location = formData.get("destinations-list");
  const userID = localStorage.getItem("user");
  const maxBuddies = formData.get("maxBuddies");
  const method = formData.get("travel-method");
  const visibility = formData.get("visibility");
  const startDate = formData.get("start-date");
  const endDate = formData.get("end-date");
  const tagsArray = getSelectedTags();
  const membersArray = [userID]; // here creator is automatically the first member

  // Clear any previous date error message
  const errorEl = document.getElementById("date-error");
  if (errorEl) errorEl.textContent = "";

  //------------------------------------------------------------------------------------------
  // ── Date Validation ──

  // Make sure both dates are filled in
  if (!startDate || !endDate) {
    if (errorEl)
      errorEl.textContent = "Please select both start and end dates.";
    return;
  }

  // Strip time from today so we compare dates only, not times
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse dates at midnight local time to avoid timezone shift bugs
  var start = new Date(startDate + "T00:00:00");
  var end = new Date(endDate + "T00:00:00");

  // Start date must not be in the past
  if (start < today) {
    if (errorEl) errorEl.textContent = "Start date cannot be in the past.";
    return;
  }

  // End date must be same as or after start date
  if (end < start) {
    if (errorEl)
      errorEl.textContent = "End date must be on or after the start date.";
    return;
  }
  //--------------------------------------------------------------------------------------
  // All validation passed — create the group
  CreateGroup(
    name.toString(),
    tagsArray,
    userID,
    location.toString(),
    method,
    maxBuddies,
    membersArray,
    visibility.toString(),
    true,
    startDate,
    endDate,
  );
});

// Creates a new group document in Firestore with a random unique ID,
// saves that ID to localStorage, then redirects to the group page
export async function CreateGroup(
  name,
  tags,
  leader,
  destination,
  travelMethod,
  maxBuddies,
  members,
  joinType,
  status,
  startDate,
  endDate,
) {
  // Generate a unique group ID using UUID
  const randomGID = uuidv4();

  try {
    // Write the new group document to Firestore
    await setDoc(doc(db, "tbGroups", randomGID), {
      groupName: name,
      tags: tags,
      leader: leader,
      destination: destination,
      travelMethod: travelMethod,
      max: maxBuddies,
      members: members,
      joinType: joinType,
      status: status,
      groupID: randomGID, // stored inside the doc so queries can find it
      startDate: startDate || "",
      endDate: endDate || "",
    });

    // Save the groupID so group.html knows which group to load
    localStorage.setItem("group", randomGID);

    // Redirect to the group page
    window.location.href = "/group.html";
  } catch (error) {
    alert(
      `Error creating group:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}
