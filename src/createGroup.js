import { v4 as uuidv4 } from "uuid";
import { db } from "/src/firebaseConfig.js";
import { doc, setDoc } from "firebase/firestore";
import { getCurrentUser } from "./authentication";

const form = document.getElementById("createGroupForm");
//Get form data and then use the create group function to store form variables
form.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(form);

  const name = formData.get("group-name");
  const location = formData.get("destinations-list");
  const currentUser = getCurrentUser();
  const maxBuddies = formData.get("maxBuddies");
  const tags = document.getElementsByName("tags[]");
  const method = formData.get("travel-method");
  const visibility = formData.get("visibility");
  const tagsArray = [];
  const membersArray = [];
  const groupStatus = true;
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].checked == true) {
      tagsArray.push(tags[i].value);
    }
  }

  CreateGroup(
    name.toString(),
    tagsArray,
    currentUser.toString(),
    location.toString(),
    method,
    maxBuddies,
    membersArray,
    visibility.toString(),
    groupStatus,
  );

  window.location.href = "group.html";
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
  //Generates a random group ID
  let randomGID = uuidv4();

  const group = {
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
  };

  /* this function will be used to create
       a new group from the entered variables */
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
  } catch (error) {
    alert(
      `Error creating user document:\n${error.code || ""}\n${error.message || error}`,
    );
  }

  return group;
}

export async function DeleteGroup(groupID) {
  /* this function will be used to delete a 
       group once it has concluded its needs */
}

export async function MigrateGroup(newLeader, groupID) {
  /* This function will be used to change the leader
       of an existing group */
}
