import { v4 as uuidv4 } from "uuid";
import { db } from "/src/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import { getSelectedTags } from "/src/tags.js"; // 👈 added this

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
  const tagsArray = getSelectedTags(); // 👈 replaced the old loop for tags
  const membersArray = [userID];

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
    });
    localStorage.setItem("group", randomGID);
    window.location.href = "group.html";
  } catch (error) {
    alert(
      `Error creating group:\n${error.code || ""}\n${error.message || error}`,
    );
  }
}

export async function DeleteGroup(groupID) {}
export async function MigrateGroup(newLeader, groupID) {}
