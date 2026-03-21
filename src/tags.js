// tags.js

// ⭐ Add or remove tags here — this is the only place you need to edit
const MASTER_TAGS = [
  { id: "chatty", label: "Chatty", emoji: "💬" },
  { id: "quiet", label: "Quiet", emoji: "🤫" },
  { id: "family-oriented", label: "Family Oriented", emoji: "👨‍👩‍👧" },
  { id: "physical-impairment", label: "Physical Impairments", emoji: "♿" },
  { id: "mental-impairment", label: "Mental Impairments", emoji: "🧠" },
  { id: "culture", label: "Culture", emoji: "🏛️" },
];

let selectedTags = [];

// Shows checkboxes on the page — pass in the container div's id
export function loadTags(containerID) {
  const container = document.getElementById(containerID);
  container.innerHTML = "";

  MASTER_TAGS.forEach((tag) => {
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

    input.addEventListener("change", () => {
      if (input.checked) {
        selectedTags.push(tag.id);
      } else {
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
