import { collection, query, where, getDocs, doc, updateDoc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import { logSystemAction } from "./auditService";
import { createNotification } from "./notificationService";

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

export const subscribeToStaffAppointments = (staffUid, callback) => {
  const q = query(
    collection(db, "tblappointments"),
    where("staffUid", "==", staffUid)
  );
  return onSnapshot(q, (snapshot) => {
    const appointments = [];
    snapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() });
    });
    appointments.sort((a, b) => {
      if (a.date === b.date) {
        return a.time.localeCompare(b.time);
      }
      return a.date.localeCompare(b.date);
    });
    callback(appointments);
  }, (error) => {
    console.error("Error subscribing to appointments:", error);
  });
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

export const updateAppointmentStatus = async (appointmentId, newStatus, reason = "") => {
  try {
    const appointmentRef = doc(db, "tblappointments", appointmentId);
    
    // Get existing appointment to find patient and staff UIDs
    const snap = await getDoc(appointmentRef);
    if (!snap.exists()) throw new Error("Appointment not found");
    const data = snap.data();
    
    const updateData = { status: newStatus };
    if (newStatus === 'cancelled') {
      updateData.cancelReason = reason;
    }
    
    await updateDoc(appointmentRef, updateData);
    
    const userUid = auth.currentUser ? auth.currentUser.uid : "System";
    await logSystemAction("UPDATE_APPOINTMENT_STATUS", appointmentId, userUid, { newStatus });
    
    // Notifications
    const isStaff = userUid === data.staffUid;
    if (newStatus === 'cancelled') {
      const reasonText = reason ? ` Reason: ${reason}` : "";
      if (isStaff) {
        await createNotification(data.patientUid, `Your appointment on ${data.date} at ${data.time} was cancelled by the clinic.${reasonText}`, appointmentId);
      } else {
        await createNotification(data.staffUid, `Patient ${data.patientName} cancelled their appointment on ${data.date} at ${data.time}.${reasonText}`, appointmentId);
      }
    } else if (newStatus === 'confirmed') {
      await createNotification(data.patientUid, `Your appointment on ${data.date} at ${data.time} has been confirmed.`, appointmentId);
    } else if (newStatus === 'completed') {
      await createNotification(data.patientUid, `Your appointment on ${data.date} is completed. Check your records for updates.`, appointmentId);
    }
    
    console.log(`Appointment ${appointmentId} updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating appointment status: ", error);
    throw error;
  }
};

export const updateAppointmentDate = async (appointmentId, newDate, newTime, reason = "", isStaff = false) => {
  try {
    const { runTransaction, doc } = await import("firebase/firestore");
    let newApptIdStr = "";
    
    await runTransaction(db, async (transaction) => {
      const oldDocRef = doc(db, "tblappointments", appointmentId);
      const oldDocSnap = await transaction.get(oldDocRef);
      
      if (!oldDocSnap.exists()) {
        throw new Error("Appointment not found");
      }
      
      const data = oldDocSnap.data();
      
      // Construct the new slot ID
      const timeFormatted = newTime.replace(/\s+/g, '');
      const newAppointmentId = `${data.staffUid}_${newDate}_${timeFormatted}`;
      newApptIdStr = newAppointmentId;
      const newDocRef = doc(db, "tblappointments", newAppointmentId);
      
      // Prevent overwriting if the new slot is already taken by someone else
      const newDocSnap = await transaction.get(newDocRef);
      if (newDocSnap.exists() && newDocSnap.data().status !== 'cancelled') {
        throw new Error("The selected time slot is already booked.");
      }
      
      // Create the new document in the new slot
      transaction.set(newDocRef, {
        ...data,
        date: newDate,
        time: newTime,
        status: isStaff ? "confirmed" : "pending",
        appointmentId: newAppointmentId,
        rescheduleReason: reason
      });
      
      // Delete the old document to free up the old slot for other patients
      transaction.delete(oldDocRef);
    });
    
    const userUid = auth.currentUser ? auth.currentUser.uid : "System";
    await logSystemAction("RESCHEDULE_APPOINTMENT", appointmentId, userUid, { newDate, newTime, newAppointmentId: newApptIdStr });
    
    // Notifications
    const snap = await getDoc(doc(db, "tblappointments", newApptIdStr));
    if (snap.exists()) {
      const data = snap.data();
      const isStaff = userUid === data.staffUid;
      const reasonText = reason ? ` Reason: ${reason}` : "";
      if (isStaff) {
        await createNotification(data.patientUid, `Your appointment was rescheduled by the clinic to ${newDate} at ${newTime}.${reasonText}`, newApptIdStr);
      } else {
        await createNotification(data.staffUid, `Patient ${data.patientName} rescheduled their appointment to ${newDate} at ${newTime}.${reasonText}`, newApptIdStr);
      }
    }
    
  } catch (error) {
    console.error("Error updating appointment date: ", error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const { setDoc, doc, serverTimestamp } = await import("firebase/firestore");
    
    // Construct deterministic ID: staffUid_date_time to prevent double-booking
    // Ensure time doesn't have weird spaces that might break IDs
    const timeFormatted = appointmentData.time.replace(/\s+/g, '');
    const appointmentId = `${appointmentData.staffUid}_${appointmentData.date}_${timeFormatted}`;
    
    const docRef = doc(db, "tblappointments", appointmentId);
    
    await setDoc(docRef, {
      ...appointmentData,
      appointmentId: appointmentId, // Store the ID inside the document as well
      createdAt: serverTimestamp(),
    });
    
    const userUid = auth.currentUser ? auth.currentUser.uid : "System";
    await logSystemAction("CREATE_APPOINTMENT", appointmentId, userUid, { date: appointmentData.date, time: appointmentData.time, patient: appointmentData.patientUid });
    
    // Notifications
    const isStaff = userUid === appointmentData.staffUid;
    if (isStaff) {
      await createNotification(appointmentData.patientUid, `An appointment has been booked for you on ${appointmentData.date} at ${appointmentData.time}.`, appointmentId);
    } else {
      await createNotification(appointmentData.staffUid, `New appointment booked by ${appointmentData.patientName} for ${appointmentData.date} at ${appointmentData.time}.`, appointmentId);
    }
    
    return appointmentId;
  } catch (error) {
    console.error("Error creating appointment: ", error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId, reason = "") => {
  return updateAppointmentStatus(appointmentId, "cancelled", reason);
};
