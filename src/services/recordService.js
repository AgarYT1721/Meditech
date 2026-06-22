import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export const getPatientRecords = async (patientUid) => {
  try {
    const q = query(
      collection(db, "tblrecords"),
      where("patientUid", "==", patientUid)
    );
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    // Sort by date descending
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    return records;
  } catch (error) {
    console.error("Error fetching patient records: ", error);
    throw error;
  }
};
