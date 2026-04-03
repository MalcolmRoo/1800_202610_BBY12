// tags.js

// Add or remove tags here = this is the only place you need to edit
const MASTER_TAGS = [
  { id: "chatty", label: "Chatty", emoji: "💬" },
  { id: "quiet", label: "Quiet", emoji: "🤫" },
  { id: "family-oriented", label: "Family Oriented", emoji: "👨‍👩‍👧" },
  { id: "mobility-impairment", label: "mobility Impairments", emoji: "♿" },
  { id: "visually-impairment", label: "visually Impairments", emoji: "👀" },
  { id: "neuro-diverse", label: "neuro diverse", emoji: "🧠" },
  { id: "locals", label: "Locals", emoji: "🏠" },
  { id: "tourists", label: "tourists", emoji: "🏖️" },
];

// Tracks which tags the user currently has checked
let selectedTags = [];

// Shows checkboxes on the page — pass in the container div's id
export function loadTags(containerID) {
  const container = document.getElementById(containerID);
  container.innerHTML = "";

  MASTER_TAGS.forEach((tag) => {
    // Hidden checkbox — the label is what the user actually clicks
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "tag-option";
    input.id = "tag-" + tag.id;
    input.name = "tags[]";
    input.value = tag.id;

    const label = document.createElement("label");
    label.className = "tag-label";
    label.htmlFor = "tag-" + tag.id;
    label.textContent = `${tag.emoji} ${tag.label}`;

    // Keep selectedTags in sync whenever a checkbox is checked or unchecked
    input.addEventListener("change", () => {
      if (input.checked) {
        selectedTags.push(tag.id);
      } else {
        // Remove this tag from the array without affecting the others
        selectedTags = selectedTags.filter((id) => id !== tag.id);
      }
    });

    container.appendChild(input);
    container.appendChild(label);
  });
}

// Call this when the form submits to get the picked tags
export function getSelectedTags() {
  return selectedTags;
}

// Call this to uncheck everything (e.g. after form submits)
export function resetTags(containerID) {
  selectedTags = [];
  document
    .getElementById(containerID)
    .querySelectorAll(".tag-option")
    .forEach((input) => (input.checked = false));
}
