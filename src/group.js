import { db } from "/src/firebaseConfig.js";
import { doc, getDocs, collection, query, where } from "firebase/firestore";
import { getCurrentUser } from "./authentication";

document.getElementById("openChat").addEventListener("click", function () {
  const memberDiv = document.getElementById("buddiesScrollable");
  const chatDiv = document.getElementById("chat");
  const button = document.getElementById("openChat");
  const leaderDiv = document.getElementById("leaderCard");
  const headerText = document.getElementById("buddiesTitle");
  if (memberDiv.style.display === "none") {
    leaderDiv.style.display = "block";
    memberDiv.style.display = "block";
    chatDiv.style.display = "none";
    button.textContent = "Chat";
    headerText.textContent = "Buddies";
  } else {
    leaderDiv.style.display = "none";
    memberDiv.style.display = "none";
    chatDiv.style.display = "block";
    button.textContent = "Buddies";
    headerText.textContent = "Chat";
  }
});

function fillBuddyCard() {}
