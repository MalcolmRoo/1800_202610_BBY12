import { db } from "/src/firebaseConfig.js";
import { doc, getDocs, collection, query, where } from "firebase/firestore";

const userCollection = collection(db, "tbUsers");
const buddyList = document.getElementById("buddies");

const buddyDiv = "<div class='buddyCard'>";
const divEnd = "</div>";

document.getElementById("openChat").addEventListener("click", function () {
  const memberDiv = document.getElementById("buddiesScrollable");
  const chatDiv = document.getElementById("chat");
  const button = document.getElementById("openChat");
  //   const leaderDiv = document.getElementById("leaderCard");
  const headerText = document.getElementById("buddiesTitle");
  if (memberDiv.style.display === "none") {
    // leaderDiv.style.display = "block";
    memberDiv.style.display = "block";
    chatDiv.style.display = "none";
    button.textContent = "Chat";
    headerText.textContent = "Buddies";
  } else {
    // leaderDiv.style.display = "none";
    memberDiv.style.display = "none";
    chatDiv.style.display = "block";
    button.textContent = "Buddies";
    headerText.textContent = "Chat";
  }
});

async function fillLeaderCard() {
  //await fillBuddyCard();
  //same functionality of fillBuddyCard but for leader card
  //might combine later this is easiest curreny implementation
}
fillBuddyCard();
async function fillBuddyCard() {
  //Get user information
  //store in variables
  //create innerHtml function and template to put into form
  const userID = localStorage.getItem("user");
  //   console.log(userID);

  buddyList.innerHTML = buddyDiv;
  GetUserInfo(userID);
}

async function GetUserInfo(userID) {
  try {
    const userQuery = query(userCollection, where("userID", "==", userID));
    const querySnapshot = await getDocs(userQuery);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      //   console.log("return docs");
      console.log(doc.id, " => ", doc.data());
      fillInfo(doc.data());

      //   return doc.data();
    });
  } catch (error) {
    alert(
      `Error searching for group documents: \n${error.code || ""}\n${error.message || error}`,
    );
  }
}

function fillInfo(data) {
  buddyList.innerHTML =
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
}
