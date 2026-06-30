import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const getStaffAppointments = async (staffUid) => {
  try {
    const q = query(
      collection(db, "tblappointments"),
      where("staffUid", "==", staffUid)
    );
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    // Sort by date/time (simple sort, you might want more robust sorting)
    appointments.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
    return appointments;
  } catch (error) {
    console.error("Error fetching appointments: ", error);
    throw error;
  }
};

export const getPatientAppointments = async (patientUid) => {
  try {
    const q = query(
      collection(db, "tblappointments"),
      where("patientUid", "==", patientUid)
    );
    const querySnapshot = await getDocs(q);
    const appointments = [];
    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    // Sort by date/time
    appointments.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
    return appointments;
  } catch (error) {
    console.error("Error fetching patient appointments: ", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (appointmentId, newStatus) => {
  try {
    const appointmentRef = doc(db, "tblappointments", appointmentId);
    await updateDoc(appointmentRef, {
      status: newStatus
    });
    console.log(`Appointment ${appointmentId} updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating appointment status: ", error);
    throw error;
  }
};

export const updateAppointmentDate = async (appointmentId, newDate, newTime) => {
  try {
    const appointmentRef = doc(db, "tblappointments", appointmentId);
    await updateDoc(appointmentRef, {
      date: newDate,
      time: newTime,
      status: "pending"
    });
  } catch (error) {
    console.error("Error updating appointment date: ", error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    // Generate a simple ID or use Firebase addDoc
    const { addDoc, serverTimestamp } = await import("firebase/firestore");
    const docRef = await addDoc(collection(db, "tblappointments"), {
      ...appointmentData,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating appointment: ", error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId) => {
  return updateAppointmentStatus(appointmentId, "cancelled");
};
