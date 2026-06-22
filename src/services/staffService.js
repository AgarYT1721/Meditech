import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export const getDoctors = async () => {
  try {
    const q = query(
      collection(db, "tblstaff"),
      where("role", "==", "doctor")
    );
    const querySnapshot = await getDocs(q);
    const doctors = [];
    querySnapshot.forEach((doc) => {
      doctors.push({ id: doc.id, ...doc.data() });
    });
    return doctors;
  } catch (error) {
    console.error("Error fetching doctors: ", error);
    throw error;
  }
};
