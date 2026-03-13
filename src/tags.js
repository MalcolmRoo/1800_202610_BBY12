import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

// ⭐ ONLY edit this list to add/remove tags
const MASTER_TAGS = [
  { id: "chatty", label: "Chatty", emoji: "💬" },
  { id: "quiet", label: "Quiet", emoji: "🤫" },
  { id: "family-oriented", label: "Family Oriented", emoji: "👨‍👩‍👧" },
  { id: "physical-impairment", label: "Physical Impairments", emoji: "♿" },
  { id: "mental-impairment", label: "Mental Impairments", emoji: "🧠" },
  { id: "culture", label: "Culture", emoji: "🏛️" },
];

// tracks which tags user clicked
let selectedTags = [];

// ---- upload tags to Firebase (run ONCE) ----
async function seedTags() {
  // delete all existing tags first
  const existing = await getDocs(collection(db, "tags"));
  for (const document of existing.docs) {
    await deleteDoc(doc(db, "tags", document.id));
    console.log("deleted: " + document.id);
  }
  // upload only new tags
  for (const tag of MASTER_TAGS) {
    await setDoc(doc(db, "tags", tag.id), {
      label: tag.label,
      emoji: tag.emoji,
    });
    console.log("uploaded: " + tag.emoji + " " + tag.label);
  }
  console.log("ALL TAGS UPLOADED!");
}

// ---- fetch from Firebase + show checkboxes ----
async function loadTags(containerID) {
  const container = document.getElementById(containerID);
  container.innerHTML = "<p>Loading tags...</p>";

  const snapshot = await getDocs(collection(db, "tags"));
  container.innerHTML = "";

  snapshot.docs.forEach((doc) => {
    const tagId = doc.id;
    const tag = doc.data();

    // create checkbox exactly like your original HTML
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "tag-option";
    input.id = "tag-" + tagId;
    input.name = "tags[]";
    input.value = tagId;

    // create label
    const label = document.createElement("label");
    label.className = "tag-label";
    label.htmlFor = "tag-" + tagId;
    label.textContent = `${tag.emoji} ${tag.label}`;

    // when checkbox is ticked → toggleTag
    input.addEventListener("change", () => toggleTag(tagId, input));

    container.appendChild(input);
    container.appendChild(label);
  });
}

// ---- select / deselect ----
function toggleTag(tagId, inputElement) {
  const isSelected = selectedTags.includes(tagId);

  if (isSelected) {
    selectedTags = selectedTags.filter((id) => id !== tagId);
    inputElement.checked = false;
  } else {
    selectedTags.push(tagId);
    inputElement.checked = true;
  }

  console.log("Selected:", selectedTags);
}

// ---- getters / reset ----
function getSelectedTags() {
  return selectedTags;
}

function resetTags(containerID) {
  selectedTags = [];
  document
    .getElementById(containerID)
    .querySelectorAll(".tag-option")
    .forEach((input) => (input.checked = false));
}

export { seedTags, loadTags, getSelectedTags, resetTags };
