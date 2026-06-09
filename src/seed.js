import { db } from "./firebase";
import { doc, setDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

const TEST_USER_UID = "ejCEXQ6aIRcVRcofJXqKxUZTWsZ2"; // ⬅️ paste the UID from Step 1

export const seedDatabase = async () => {

  // ── Lookup tables ──────────────────────────────────────────

  // tbldaysofweek
  const days = [
    { dayId: 1, dayName: "Monday" },
    { dayId: 2, dayName: "Tuesday" },
    { dayId: 3, dayName: "Wednesday" },
    { dayId: 4, dayName: "Thursday" },
    { dayId: 5, dayName: "Friday" },
    { dayId: 6, dayName: "Saturday" },
    { dayId: 7, dayName: "Sunday" },
  ];
  for (const day of days) {
    await setDoc(doc(db, "tbldaysofweek", String(day.dayId)), day);
  }
  console.log("✅ tbldaysofweek seeded");

  // tblrole
  const roles = [
    { role_id: 1, role_description: "patient" },
    { role_id: 2, role_description: "doctor" },
    { role_id: 3, role_description: "nurse" },
    { role_id: 4, role_description: "admin" },
  ];
  for (const role of roles) {
    await setDoc(doc(db, "tblrole", String(role.role_id)), role);
  }
  console.log("✅ tblrole seeded");

  // tblsecurity_questions
  const questions = [
    { questionId: 1, question: "What is your mother's maiden name?" },
    { questionId: 2, question: "What was the name of your first pet?" },
    { questionId: 3, question: "What was the name of your elementary school?" },
    { questionId: 4, question: "What city were you born in?" },
    { questionId: 5, question: "What is your oldest sibling's middle name?" },
  ];
  for (const q of questions) {
    await setDoc(doc(db, "tblsecurity_questions", String(q.questionId)), q);
  }
  console.log("✅ tblsecurity_questions seeded");

  // tblreason_for_visit
  const reasons = [
    { reasonId: "R01", reasonDescription: "General Checkup", isActive: true },
    { reasonId: "R02", reasonDescription: "Follow-up Consultation", isActive: true },
    { reasonId: "R03", reasonDescription: "Vaccination", isActive: true },
    { reasonId: "R04", reasonDescription: "Lab Results Review", isActive: true },
    { reasonId: "R05", reasonDescription: "Emergency", isActive: true },
  ];
  for (const r of reasons) {
    await setDoc(doc(db, "tblreason_for_visit", r.reasonId), r);
  }
  console.log("✅ tblreason_for_visit seeded");

  // tbltreatments
  const treatments = [
    { treatmentId: "T01", treatmentDescription: "Medication Prescribed", isActive: true },
    { treatmentId: "T02", treatmentDescription: "Physical Therapy", isActive: true },
    { treatmentId: "T03", treatmentDescription: "Laboratory Tests", isActive: true },
    { treatmentId: "T04", treatmentDescription: "Wound Dressing", isActive: true },
    { treatmentId: "T05", treatmentDescription: "Referral to Specialist", isActive: true },
  ];
  for (const t of treatments) {
    await setDoc(doc(db, "tbltreatments", t.treatmentId), t);
  }
  console.log("✅ tbltreatments seeded");

  // ── Test user ──────────────────────────────────────────────

  // tblusers
  await setDoc(doc(db, "tblusers", TEST_USER_UID), {
    uid: "ejCEXQ6aIRcVRcofJXqKxUZTWsZ2",
    email: "Test_Account.3@gmail.com", // ⬅️ match what you entered in Auth
    role_id: 2, // doctor
    isActive: true,
    createdAt: serverTimestamp(),
  });
  console.log("✅ tblusers seeded");

  // tblstaff
  await setDoc(doc(db, "tblstaff", TEST_USER_UID), {
    staffId: "1234-5678",
    uid: "ejCEXQ6aIRcVRcofJXqKxUZTWsZ2",
    firstName: "Test",
    lastName: "Doctor",
    role: "doctor",
    specialization: "General Practice",
    licenseNumber: "LIC-0001",
    contactNumber: "09000000000",
    isActive: true,
  });
  console.log("✅ tblstaff seeded");

  console.log("🎉 All done! Database fully seeded.");
};