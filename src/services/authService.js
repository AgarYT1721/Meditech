import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { logSystemAction } from "./auditService";

export const fetchUserDetails = async (user) => {
  const userSnap = await getDoc(doc(db, "tblusers", user.uid));
  if (!userSnap.exists()) throw new Error("User record not found.");

  const userData = userSnap.data();
  if (!userData.isActive) throw new Error("This account has been deactivated.");

  let userDetails = {};
  if (userData.role_id === 1) {
    const patientSnap = await getDoc(doc(db, "tblpatients", user.uid));
    if (patientSnap.exists()) userDetails = patientSnap.data();
  } else {
    const staffSnap = await getDoc(doc(db, "tblstaff", user.uid));
    if (staffSnap.exists()) userDetails = staffSnap.data();
  }

  return {
    uid: user.uid,
    email: user.email,
    role_id: userData.role_id,
    firstName: userDetails.firstName || "Unknown",
    lastName: userDetails.lastName ?? "User",
    specialization: userDetails.specialization || "Staff",
    phone: userDetails.phone || "",
    office: userDetails.office || "",
    profilePicture: userDetails.profilePicture || null,
  };
};

export const loginUser = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const data = await fetchUserDetails(user);
  
  await logSystemAction("LOGIN_USER", user.uid, user.uid);
  
  console.log("✅ Login successful:", data);
  return data;
};

export const updateStaffProfile = async (uid, phone, office) => {
  const staffRef = doc(db, "tblstaff", uid);
  await updateDoc(staffRef, {
    phone,
    office
  });
  
  const userUid = auth.currentUser ? auth.currentUser.uid : uid;
  await logSystemAction("UPDATE_STAFF_PROFILE", uid, userUid, { phone, office });
  
  console.log("✅ Staff profile updated");
};

export const updateStaffProfilePicture = async (uid, base64String) => {
  const staffRef = doc(db, "tblstaff", uid);
  await updateDoc(staffRef, {
    profilePicture: base64String
  });
  
  const userUid = auth.currentUser ? auth.currentUser.uid : uid;
  await logSystemAction("UPDATE_STAFF_PROFILE_PICTURE", uid, userUid);
  
  console.log("✅ Staff profile picture updated");
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

  await logSystemAction("REGISTER_PATIENT", user.uid, user.uid);

  console.log("✅ Patient registration successful:", user.uid);
  return {
    uid: user.uid,
    email: user.email,
    role_id: 1,
  };
};

export const logoutUser = async () => {
  const userUid = auth.currentUser ? auth.currentUser.uid : "System";
  await signOut(auth);
  
  await logSystemAction("LOGOUT_USER", userUid, userUid);
  
  console.log("✅ User logged out");
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
  await logSystemAction("RESET_PASSWORD", email, "System");
  console.log("✅ Password reset email sent to:", email);
};

export const updateUserPassword = async (newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  
  await updatePassword(user, newPassword);
  await logSystemAction("UPDATE_PASSWORD", user.uid, user.uid);
  console.log("✅ Password updated directly");
};