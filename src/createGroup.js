import { v4 as uuidv4 } from "uuid";
import { db } from "/src/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import { getSelectedTags } from "/src/tags.js";

const form = document.getElementById("createGroupForm");

form.addEventListener("submit", function (event) {
  event.preventDefault();
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
  const membersArray = [userID];

  // Date validation
  const errorEl = document.getElementById("date-error");
  if (errorEl) errorEl.textContent = "";

  if (!startDate || !endDate) {
    if (errorEl) errorEl.textContent = "Please select both start and end dates.";
    return;
  }

  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var start = new Date(startDate + "T00:00:00");
  var end = new Date(endDate + "T00:00:00");

  if (start < today) {
    if (errorEl) errorEl.textContent = "Start date cannot be in the past.";
    return;
  }

  if (end < start) {
    if (errorEl) errorEl.textContent = "End date must be on or after the start date.";
    return;
  }

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
  const randomGID = uuidv4();

  try {
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
      groupID: randomGID,
      startDate: startDate || "",
      endDate: endDate || "",
    });
    localStorage.setItem("group", randomGID);
    window.location.href = "group.html";
  } catch (error) {
    alert(
      `Error creating group:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}
