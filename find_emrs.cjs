const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('./server/meditech-fd422-firebase-adminsdk-fbsvc-9e8472a079.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

async function findEMRs() {
  const patientsSnap = await db.collection('tblpatients').get();
  console.log(`Found ${patientsSnap.size} patients. Scanning for EMR subcollections...`);
  
  let totalEMRs = 0;
  for (const doc of patientsSnap.docs) {
    const emrSnap = await doc.ref.collection('emr_records').get();
    if (emrSnap.size > 0) {
      console.log(`👉 Patient: ${doc.id} (${doc.data().firstName} ${doc.data().lastName}) has ${emrSnap.size} EMRs!`);
      totalEMRs += emrSnap.size;
    }
  }
  console.log(`\nTotal EMRs found across all patients: ${totalEMRs}`);
}

findEMRs().catch(console.error);
