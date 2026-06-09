import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const loginUser = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);

  const userSnap = await getDoc(doc(db, "tblusers", user.uid));
  if (!userSnap.exists()) throw new Error("User record not found.");

  const userData = userSnap.data();
  if (!userData.isActive) throw new Error("This account has been deactivated.");

  console.log("✅ Login successful:", userData);

  return {
    uid: user.uid,
    email: user.email,
    role_id: userData.role_id,
  };
};