import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const getCurrentUser = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userSnap = await getDoc(doc(db, "tblusers", user.uid));
      callback({ uid: user.uid, ...userSnap.data() });
    } else {
      callback(null);
    }
  });
};