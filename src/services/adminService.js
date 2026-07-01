import { collection, getDocs, getDoc, doc, updateDoc, setDoc, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { db, firebaseConfig } from "../firebase";
import { logSystemAction } from "./auditService";

export const getAuditLogs = async () => {
  try {
    const q = query(collection(db, "tblauditlogs"), orderBy("time", "desc"));
    const snapshot = await getDocs(q);
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    return logs;
  } catch (error) {
    console.error("Failed to fetch logs", error);
    return [];
  }
};

export const getAllSystemUsers = async () => {
  try {
    // Fetch all collections
    const [usersSnap, patientsSnap, staffSnap] = await Promise.all([
      getDocs(collection(db, "tblusers")),
      getDocs(collection(db, "tblpatients")),
      getDocs(collection(db, "tblstaff"))
    ]);

    // Build lookup maps for faster joining
    const patientMap = {};
    patientsSnap.forEach(doc => patientMap[doc.id] = doc.data());

    const staffMap = {};
    staffSnap.forEach(doc => staffMap[doc.id] = doc.data());

    const allUsers = [];

    usersSnap.forEach(doc => {
      const u = doc.data();
      const uid = u.uid || doc.id;
      let name = "Unknown";
      let dept = "N/A";
      let roleLabel = "Unknown";

      if (u.role_id === 1) {
        roleLabel = "Patient";
        if (patientMap[uid]) {
          name = `${patientMap[uid].firstName} ${patientMap[uid].lastName}`;
        }
      } else if (u.role_id === 2 || u.role_id === 3) {
        roleLabel = "Staff";
        if (staffMap[uid]) {
          name = `${staffMap[uid].firstName} ${staffMap[uid].lastName}`;
          dept = staffMap[uid].specialization || "General";
        }
      } else if (u.role_id === 4) {
        roleLabel = "Admin";
        name = "System Admin";
        dept = "IT";
      }

      // Format date
      let joined = 'Unknown';
      if (u.createdAt && u.createdAt.toDate) {
        const d = u.createdAt.toDate();
        joined = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }

      allUsers.push({
        id: uid,
        email: u.email,
        role: roleLabel,
        name,
        dept,
        status: u.isActive ? "Active" : "Disabled",
        joined
      });
    });

    return allUsers;
  } catch (error) {
    console.error("Error fetching system users", error);
    throw error;
  }
};

export const toggleUserStatus = async (uid, currentStatus) => {
  try {
    const newStatus = !currentStatus;
    await updateDoc(doc(db, "tblusers", uid), {
      isActive: newStatus
    });
    
    // Synchronize isActive status to specific role collections
    const userSnap = await getDoc(doc(db, "tblusers", uid));
    if (userSnap.exists()) {
      const u = userSnap.data();
      if (u.role_id === 2 || u.role_id === 3) {
        await setDoc(doc(db, "tblstaff", uid), { isActive: newStatus }, { merge: true });
      } else if (u.role_id === 1) {
        await setDoc(doc(db, "tblpatients", uid), { isActive: newStatus }, { merge: true });
      }
    }
    
    await logSystemAction(newStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER", uid);
  } catch (error) {
    console.error("Failed to toggle user status", error);
    throw error;
  }
};

export const updateUserDetails = async (uid, roleLabel, fullName, department, email, password) => {
  try {
    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    // Update Firebase Auth credentials via our secure backend Admin SDK
    if (email || password) {
      const response = await fetch('/api/admin/update-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email, password })
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update auth credentials');
      }
    }

    if (email) {
      await setDoc(doc(db, "tblusers", uid), {
        email: email
      }, { merge: true });
    }

    if (roleLabel === "Staff") {
      await setDoc(doc(db, "tblstaff", uid), {
        firstName: firstName || "",
        lastName: lastName || "",
        specialization: department || "General",
        role: "doctor"
      }, { merge: true });
    } else if (roleLabel === "Patient") {
      await setDoc(doc(db, "tblpatients", uid), {
        firstName: firstName || "",
        lastName: lastName || ""
      }, { merge: true });
    }

    await logSystemAction("UPDATE_USER_DETAILS", uid);
  } catch (error) {
    console.error("Failed to update user details", error);
    throw error;
  }
};

export const provisionAccount = async (email, password, roleType, fullName, department) => {
  // Create a shadow Firebase app instance
  const shadowApp = initializeApp(firebaseConfig, "ShadowApp-" + Date.now());
  const shadowAuth = getAuth(shadowApp);

  try {
    // Create the user in Auth without affecting current session
    const { user } = await createUserWithEmailAndPassword(shadowAuth, email, password);

    const role_id = roleType === "Staff" ? 2 : 1;
    
    // Add to tblusers
    await setDoc(doc(db, "tblusers", user.uid), {
      uid: user.uid,
      email: user.email,
      role_id: role_id,
      isActive: true,
      createdAt: serverTimestamp()
    });

    const [firstName, ...lastNameParts] = fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    // Add to specific role table
    if (roleType === "Staff") {
      await setDoc(doc(db, "tblstaff", user.uid), {
        uid: user.uid,
        firstName: firstName || "",
        lastName: lastName || "",
        role: "doctor",
        specialization: department || "General",
        isActive: true
      });
    } else {
      await setDoc(doc(db, "tblpatients", user.uid), {
        uid: user.uid,
        firstName: firstName || "",
        lastName: lastName || "",
        isActive: true
      });
    }

    await logSystemAction("PROVISION_ACCOUNT", user.uid);

    return user.uid;
  } catch (error) {
    console.error("Provisioning failed", error);
    throw error;
  } finally {
    // Clean up shadow app
    await signOut(shadowAuth);
    await deleteApp(shadowApp);
  }
};
