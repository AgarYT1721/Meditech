import { collection, getDocs, getDoc, doc, query, orderBy, updateDoc, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getPatients = async () => {
  try {
    const q = query(collection(db, "tblpatients"), orderBy("lastName"));
    const querySnapshot = await getDocs(q);
    const patients = [];
    querySnapshot.forEach((doc) => {
      patients.push({ id: doc.id, ...doc.data() });
    });
    return patients;
  } catch (error) {
    console.error("Error fetching patients: ", error);
    throw error;
  }
};

export const getPatientProfile = async (patientUid) => {
  try {
    const patientRef = doc(db, "tblpatients", patientUid);
    const userRef = doc(db, "tblusers", patientUid);
    const [patientSnap, userSnap] = await Promise.all([getDoc(patientRef), getDoc(userRef)]);
    
    if (patientSnap.exists()) {
      const patientData = patientSnap.data();
      const userData = userSnap.exists() ? userSnap.data() : {};
      return { id: patientSnap.id, ...patientData, email: userData.email };
    }
    return null;
  } catch (error) {
    console.error("Error fetching patient profile: ", error);
    throw error;
  }
};

export const uploadProfilePicture = async (file, patientUid) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = async () => {
          // Setup canvas for compression
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 256;
          const MAX_HEIGHT = 256;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          const base64String = canvas.toDataURL("image/jpeg", 0.7); // 70% quality JPEG

          // Save to Firestore
          try {
            const patientRef = doc(db, "tblpatients", patientUid);
            await updateDoc(patientRef, {
              profilePicture: base64String
            });
            resolve(base64String);
          } catch (dbError) {
            console.error("Firestore update failed:", dbError);
            reject(dbError);
          }
        };
        img.onerror = (err) => reject(err);
        img.src = event.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error compressing profile picture: ", error);
      reject(error);
    }
  });
};

export const addMedicalRecord = async (patientUid, recordData) => {
  try {
    const emrRef = collection(db, "tblpatients", patientUid, "emr_records");
    const docRef = await addDoc(emrRef, {
      ...recordData,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding medical record:", error);
    throw error;
  }
};

export const getMedicalRecords = async (patientUid) => {
  try {
    const emrRef = collection(db, "tblpatients", patientUid, "emr_records");
    const q = query(emrRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      records.push({ id: doc.id, ...doc.data() });
    });
    return records;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    throw error;
  }
};
