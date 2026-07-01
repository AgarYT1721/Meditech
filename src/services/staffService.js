import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getDoctors = async () => {
  try {
    const q = query(
      collection(db, "tblstaff"),
      where("role", "==", "doctor")
    );
    const querySnapshot = await getDocs(q);
    
    // Cross-reference with tblusers to get the master active switch
    const activeUsersQuery = query(collection(db, "tblusers"), where("isActive", "==", true));
    const activeUsersSnap = await getDocs(activeUsersQuery);
    const activeUserIds = new Set();
    activeUsersSnap.forEach(userDoc => activeUserIds.add(userDoc.id));

    const doctors = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Only include doctors who are explicitly marked active in tblusers
      if (activeUserIds.has(doc.id) || activeUserIds.has(data.uid)) {
        doctors.push({ id: doc.id, ...data });
      }
    });
    return doctors;
  } catch (error) {
    console.error("Error fetching doctors: ", error);
    throw error;
  }
};
