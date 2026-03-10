import { db } from "/src/firebaseConfig.js";
import { doc, getDocs, collection, query, where } from "firebase/firestore";
import { getCurrentUser } from "./authentication";

const travelGroups = collection(db, "tbGroups");

const form = document.getElementById("joinGroupForm");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(form);

  const location = formData.get("destination-input");
  const tags = document.getElementsByName("tags[]");
  const tagsArray = [];
  for (var i = 0; i < tags.length; i++) {
    if (tags[i].checked == true) {
      tagsArray.push(tags[i].value);
    }
  }
  QueryGroups(location, tagsArray);
});

export async function QueryGroups(location, tags) {
  console.log(location);
  console.log(tags);

  try {
    const groupQuery = query(
      travelGroups,
      where("destination", "==", location.toString()),
      where("tags", "array-contains-any", tags),
    );
    const querySnapshot = await getDocs(groupQuery);
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log("return docs");
      console.log(doc.id, " => ", doc.data());
    });
  } catch (error) {
    alert(
      `Error searching for group documents: \n${error.code || ""}\n${error.message || error}`,
    );
  }
}

function JoinGroup() {
  /* This function will be used to Join a group once implemented. */
}
