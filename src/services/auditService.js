import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const logSystemAction = async (action, targetRecord, executingUser = "System", additionalDetails = null) => {
  try {
    const payload = {
      action,
      targetRecord,
      user: executingUser,
      time: new Date().toISOString(),
      timestamp: serverTimestamp()
    };
    
    if (additionalDetails) {
      payload.details = additionalDetails;
    }

    await addDoc(collection(db, "tblauditlogs"), payload);
  } catch (error) {
    console.error("Failed to log system action", error);
  }
};
