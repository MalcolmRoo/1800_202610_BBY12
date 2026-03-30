import { db } from "/src/firebaseConfig.js";
import {
  doc,
  deleteDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";

var THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Returns a Date object for midnight of the day AFTER the given endDate string.
 * Group stays active through the entire end date, archives the next day.
 */
function getArchiveDeadline(endDateStr) {
  var parts = endDateStr.split("-");
  var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Checks if a group should be archived (day after end date has started).
 * Updates Firestore if needed. Returns true if the group is archived.
 */
export async function checkAndArchive(groupData, docID) {
  if (groupData.archived) return true;
  if (!groupData.endDate) return false;

  var now = new Date();
  var deadline = getArchiveDeadline(groupData.endDate);

  if (now >= deadline) {
    try {
      var groupRef = doc(db, "tbGroups", docID);
      await updateDoc(groupRef, {
        archived: true,
        archiveDate: new Date().toISOString(),
      });
      return true;
    } catch (err) {
      console.error("Failed to archive group:", err);
      return false;
    }
  }
  return false;
}

/**
 * Deletes all documents in a group's chat subcollection.
 */
async function deleteChatSubcollection(groupID) {
  var chatRef = collection(db, "tbGroups", groupID, "chat");
  var chatSnap = await getDocs(chatRef);
  var promises = [];
  chatSnap.forEach(function (msgDoc) {
    promises.push(deleteDoc(msgDoc.ref));
  });
  await Promise.all(promises);
}

/**
 * Checks if an archived group has been in archive for 30+ days.
 * If so, deletes the chat subcollection and the group document.
 * Returns true if the group was deleted.
 */
export async function checkAndDeleteExpired(groupData, docID) {
  if (!groupData.archived || !groupData.archiveDate) return false;

  var archivedAt = new Date(groupData.archiveDate);
  var now = new Date();
  var elapsed = now.getTime() - archivedAt.getTime();

  if (elapsed >= THIRTY_DAYS_MS) {
    try {
      await deleteChatSubcollection(groupData.groupID);
      await deleteDoc(doc(db, "tbGroups", docID));
      return true;
    } catch (err) {
      console.error("Failed to delete expired group:", err);
      return false;
    }
  }
  return false;
}

/**
 * Processes a single group: checks for archive and deletion.
 * Returns:
 *   null   — if the group was deleted
 *   groupData with archived: true — if archived
 *   groupData — if still active
 */
export async function processGroup(groupData, docID) {
  var deleted = await checkAndDeleteExpired(groupData, docID);
  if (deleted) return null;

  var isArchived = await checkAndArchive(groupData, docID);
  if (isArchived) {
    groupData.archived = true;
  }
  return groupData;
}
