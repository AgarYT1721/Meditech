import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export const getPatientRecords = async (patientUid) => {
  try {
    const emrRef = collection(db, "tblpatients", patientUid, "emr_records");
    const q = query(emrRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      records.push({ 
        id: doc.id, 
        title: data.diagnosis || "Medical Review",
        type: "Consultation Notes",
        status: "Available",
        date: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Unknown",
        doctorName: "MediTech Provider",
        ...data 
      });
    });
    return records;
  } catch (error) {
    console.error("Error fetching patient records: ", error);
    throw error;
  }
};
