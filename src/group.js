import { db } from "/src/firebaseConfig.js";
import { doc, getDocs, collection, query, where } from "firebase/firestore";

const userCollection = collection(db, "tbUsers");
const groupCollection = collection(db, "tbGroups");
const buddyList = document.getElementById("buddies");

const buddyDiv = "<div class='buddyCard'>";
const divEnd = "</div>";

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
  }
});

fillBuddyCard();
async function fillBuddyCard() {
  const userID = localStorage.getItem("user");
  GetUserInfo(userID);
}

async function GetUserInfo(userID) {
  try {
    const userQuery = query(userCollection, where("userID", "==", userID));
    const querySnapshot = await getDocs(userQuery);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      fillInfo(doc.data());
    });
  } catch (error) {
    alert(
      `Error searching for group documents: \n${error.code || ""}\n${error.message || error}`,
    );
  }
}

async function fillInfo(data) {
  let buddyListHTML = "";

  try {
    const groupID = localStorage.getItem("group");
    const groupQuery = query(groupCollection, where("groupID", "==", groupID));
    const groupQuerySnapshot = await getDocs(groupQuery);

    groupQuerySnapshot.forEach((doc) => {
      var counter = 0;
      do {
        var buddyCard =
          buddyDiv +
          "<img class='icon' src='" +
          data.profilePicture +
          "'/>" +
          "<p class='successfulGroups'>" +
          data.successfulGroups.toString() +
          "</p>" +
          "<p class='buddyCardName'>  " +
          data.name +
          "  </P>" +
          "<p class='buddyStatus'> " +
          data.statusMessage +
          "</p>" +
          divEnd;

        buddyListHTML += buddyCard;
        counter++;
      } while (counter < doc.data().members.length);
    });
  } catch (error) {
    alert(
      `Error searching for group document: \n${error.code || ""}\n${error.message || error}`,
    );
  }
  buddyList.innerHTML = buddyListHTML;
}
