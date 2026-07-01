import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC-eQTFgV_VsHrIWKxqp_txqNvFJOV8h_c",
  authDomain: "meditech-656be.firebaseapp.com",
  projectId: "meditech-656be",
  storageBucket: "meditech-656be.firebasestorage.app",
  messagingSenderId: "1070665745248",
  appId: "1:1070665745248:web:4f4d2d49fedeabbbad9405",
  measurementId: "G-LCR14W2LV8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function findEMRs() {
  const patientsSnap = await getDocs(collection(db, 'tblpatients'));
  console.log(`Found ${patientsSnap.size} patients. Scanning for EMR subcollections...`);
  
  let totalEMRs = 0;
  for (const doc of patientsSnap.docs) {
    const emrRef = collection(db, 'tblpatients', doc.id, 'emr_records');
    const emrSnap = await getDocs(emrRef);
    if (emrSnap.size > 0) {
      console.log(`👉 Patient: ${doc.id} (${doc.data().firstName} ${doc.data().lastName}) has ${emrSnap.size} EMRs!`);
      totalEMRs += emrSnap.size;
    }
  }
  console.log(`\nTotal EMRs found across all patients: ${totalEMRs}`);
  process.exit(0);
}

findEMRs().catch(console.error);
