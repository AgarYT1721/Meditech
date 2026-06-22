import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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

export const registerPatient = async (email, password, patientData) => {
  // 1. Create user in Firebase Auth
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  
  // 2. Add to tblusers
  await setDoc(doc(db, "tblusers", user.uid), {
    uid: user.uid,
    email: user.email,
    role_id: 1, // 1 for patient
    isActive: true,
    createdAt: serverTimestamp(),
  });

  // 3. Add to tblpatients
  await setDoc(doc(db, "tblpatients", user.uid), {
    uid: user.uid,
    firstName: patientData.firstName,
    lastName: patientData.lastName,
    contactNumber: patientData.phone || "",
    dateOfBirth: patientData.dob || "",
    gender: "", // Optional, can be updated later
    bloodType: "", // Optional, can be updated later
    isActive: true,
  });

  console.log("✅ Patient registration successful:", user.uid);
  return {
    uid: user.uid,
    email: user.email,
    role_id: 1,
  };
};

export const logoutUser = async () => {
  await signOut(auth);
  console.log("✅ User logged out");
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  console.log("✅ Password reset email sent to:", email);
};