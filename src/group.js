import { db } from "/src/firebaseConfig.js";
import { doc, getDocs, collection, query, where } from "firebase/firestore";

const userCollection = collection(db, "tbUsers");
const groupCollection = collection(db, "tbGroups");
const buddyList = document.getElementById("buddies");
let buddyListHTML = "";
const buddyDiv = "<div class='buddyCard'>";
const divEnd = "</div>";

/* Callback function to allow the button at bottom
    of the screen to switch between a chat interface
    and the group list.
*/
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

//gets the userID stored in local storage at login
//passes it into the GetUserInfo function
fillBuddyCard();
async function fillBuddyCard() {
  const userID = localStorage.getItem("user");
  GetUserInfo(userID);
}

//Finds the user document in tbUsers and sends the info
//to the fillInfo function
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

//Gets the group info from tbGroups and
// assigns the user info based on the group ans userid and adds it
//to the html of "buddies"
async function fillInfo(data) {
  const groupTitle = document.getElementById("groupTitle");
  const destinationText = document.getElementById("destination-text");
  try {
    const groupID = localStorage.getItem("group");
    const groupQuery = query(groupCollection, where("groupID", "==", groupID));
    const groupQuerySnapshot = await getDocs(groupQuery);

    groupQuerySnapshot.forEach((doc) => {
      groupTitle.textContent = doc.data().groupName;
      destinationText.textContent = doc.data().destination;
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
    });
  } catch (error) {
    alert(
      `Error searching for group document: \n${error.code || ""}\n${error.message || error}`,
    );
  }
  buddyList.innerHTML = buddyListHTML;
}
