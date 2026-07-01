import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export const subscribeToNotifications = (userId, callback) => {
  if (!userId) return () => {};

  let staffNotifs = [];
  let patientNotifs = [];

  const updateCallback = () => {
    const all = [...staffNotifs, ...patientNotifs];
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values());
    unique.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Merge with local read status to bypass strict DB rules
    const readNotifs = JSON.parse(localStorage.getItem('readNotifs') || '[]');
    const finalUnique = unique.map(n => {
      if (readNotifs.includes(n.id)) {
        return { ...n, read: true };
      }
      return n;
    });
    
    callback(finalUnique);
  };

  const qStaff = query(collection(db, "tblappointments"), where("staffUid", "==", userId));
  const unsubStaff = onSnapshot(qStaff, (snapshot) => {
    staffNotifs = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.notifications) {
        staffNotifs.push(...data.notifications.filter(n => n.userId === userId).map(n => ({...n, docId: doc.id})));
      }
    });
    updateCallback();
  }, (err) => console.log(err));

  const qPatient = query(collection(db, "tblappointments"), where("patientUid", "==", userId));
  const unsubPatient = onSnapshot(qPatient, (snapshot) => {
    patientNotifs = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.notifications) {
        patientNotifs.push(...data.notifications.filter(n => n.userId === userId).map(n => ({...n, docId: doc.id})));
      }
    });
    updateCallback();
  }, (err) => console.log(err));

  return () => {
    unsubStaff();
    unsubPatient();
  };
};

export const markNotificationAsRead = async (notificationId, appointmentId) => {
  // Store locally to guarantee UI consistency regardless of DB permissions
  try {
    const readNotifs = JSON.parse(localStorage.getItem('readNotifs') || '[]');
    if (!readNotifs.includes(notificationId)) {
      readNotifs.push(notificationId);
      if (readNotifs.length > 200) readNotifs.shift(); // Prevent bloat
      localStorage.setItem('readNotifs', JSON.stringify(readNotifs));
    }
  } catch (e) {
    console.error("Local storage error:", e);
  }

  // Attempt to save to DB (may fail due to strict security rules on cancelled/completed appointments)
  try {
    const ref = doc(db, "tblappointments", appointmentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data();
    if (!data.notifications) return;
    
    const updated = data.notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    await updateDoc(ref, { notifications: updated });
  } catch (error) {
    console.warn("DB blocked mark as read, but local storage will remember it.");
  }
};

export const createNotification = async (userId, text, appointmentId) => {
  if (!userId || !appointmentId) {
    console.warn("createNotification called with invalid args");
    return;
  }
  try {
    const ref = doc(db, "tblappointments", appointmentId);
    await updateDoc(ref, {
      notifications: arrayUnion({
        id: Date.now().toString() + Math.random(),
        userId,
        text,
        read: false,
        createdAt: new Date().toISOString()
      })
    });
  } catch (error) {
    console.error("Error creating notification: ", error);
  }
};
