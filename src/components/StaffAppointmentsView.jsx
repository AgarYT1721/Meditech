import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Filter, Check, X, CalendarDays, Loader2, Plus } from 'lucide-react';
import { getStaffAppointments, updateAppointmentStatus, createAppointment, cancelAppointment } from '../services/appointmentService';
import { getPatients } from '../services/patientService';

const StaffAppointmentsView = ({ staffUser }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Appointment Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ patientUid: '', reasonDescription: '', date: '', time: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchData();
  }, [staffUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (!staffUser?.uid) return;
      const [aptsData, patientsData] = await Promise.all([
        getStaffAppointments(staffUser.uid),
        getPatients()
      ]);
      
      const enhancedApts = aptsData.map(apt => {
        const patient = patientsData.find(p => p.uid === apt.patientUid);
        return { ...apt, patientProfilePicture: patient?.profilePicture || null };
      });
      
      setAppointments(enhancedApts);
      setPatients(patientsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        await cancelAppointment(appointmentId);
      } else {
        await updateAppointmentStatus(appointmentId, newStatus);
      }
      fetchData(); // Refresh the list
    } catch (error) {
      console.error(`Failed to update status to ${newStatus}`, error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const selectedPatient = patients.find(p => p.uid === addForm.patientUid);
      if (!selectedPatient) return;
      
      await createAppointment({
        patientUid: selectedPatient.uid,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        staffUid: staffUser.uid,
        reasonId: "CUSTOM",
        reasonDescription: addForm.reasonDescription,
        date: addForm.date,
        time: addForm.time,
        status: "confirmed" // Staff-created apps skip pending
      });
      
      setShowAddModal(false);
      setAddForm({ patientUid: '', reasonDescription: '', date: '', time: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to create appointment", error);
      alert("Failed to create appointment");
    } finally {
      setAdding(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.status === activeTab && 
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '0', width: '100%', boxSizing: 'border-box', display: 'block', position: 'relative' }}
    >
      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Search patient name..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '15px 45px', borderRadius: '16px', border: 'none', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', fontSize: '0.9rem', color: '#181818', boxSizing: 'border-box' }}
        />
        <Search size={20} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
        <Filter size={20} color="#0ea5e9" style={{ position: 'absolute', right: '15px', top: '15px' }} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', background: '#f0f2f5', borderRadius: '40px', padding: '4px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'pending' ? '#fff' : 'transparent', color: activeTab === 'pending' ? '#0ea5e9' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'pending' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveTab('confirmed')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'confirmed' ? '#fff' : 'transparent', color: activeTab === 'confirmed' ? '#181818' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'confirmed' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Confirmed
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'completed' ? '#fff' : 'transparent', color: activeTab === 'completed' ? '#181818' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'completed' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Completed
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px 20px', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Loader2 size={48} color="#0ea5e9" className="spinner" style={{ marginBottom: '10px', animation: 'spin 1s linear infinite' }} />
              <div>Loading appointments...</div>
            </motion.div>
          ) : filteredAppointments.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px 20px', color: '#888' }}>
              <CalendarDays size={48} color="#cbd5e1" style={{ marginBottom: '10px' }} />
              <div>No {activeTab} appointments found.</div>
            </motion.div>
          ) : (
            filteredAppointments.map((apt) => (
              <motion.div key={apt.id} layout variants={itemVariants} initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} style={{ background: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
                
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '15px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#181818', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar size={14} color="#0ea5e9" /> {apt.date} - {apt.time}
                  </div>
                  <div style={{ background: apt.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : apt.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0,0,0,0.05)', color: apt.status === 'pending' ? '#f59e0b' : apt.status === 'confirmed' ? '#10b981' : '#666', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>
                    {apt.status}
                  </div>
                </div>
                
                {/* Middle Row (Patient Info) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0f2f5', padding: '2px', flexShrink: 0 }}>
                    <img src={apt.patientProfilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.patientUid}&backgroundColor=e2e8f0`} alt="Patient" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>{apt.patientName}</h4>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px', marginBottom: '6px' }}>{apt.reasonDescription}</div>
                  </div>
                </div>

                {/* Bottom Row (Actions) */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeTab === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} style={{ flex: 1, background: '#0ea5e9', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)', cursor: 'pointer' }}>
                        <Check size={16} /> Approve
                      </button>
                      <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                        <X size={16} /> Decline
                      </button>
                    </>
                  )}
                  {activeTab === 'confirmed' && (
                    <>
                      <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                        <X size={16} /> Cancel
                      </button>
                      <button onClick={() => handleStatusUpdate(apt.id, 'completed')} style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)', cursor: 'pointer' }}>
                        <Check size={16} /> Mark Completed
                      </button>
                    </>
                  )}
                  {activeTab === 'completed' && (
                    <button style={{ width: '100%', background: '#f8fafc', border: 'none', color: '#0ea5e9', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>View Visit Summary</button>
                  )}
                </div>
                
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for New Appointment */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddModal(true)}
        style={{ position: 'fixed', bottom: '40px', right: '50px', width: '60px', height: '60px', borderRadius: '30px', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.4)', cursor: 'pointer', zIndex: 100 }}
      >
        <Plus size={28} />
      </motion.button>

      {/* Add Appointment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Book Appointment</h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Select Patient</label>
                  <select required value={addForm.patientUid} onChange={(e) => setAddForm({...addForm, patientUid: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }}>
                    <option value="">-- Choose Patient --</option>
                    {patients.map(p => (
                      <option key={p.uid} value={p.uid}>{p.firstName} {p.lastName}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Reason for Visit</label>
                  <input type="text" required value={addForm.reasonDescription} onChange={(e) => setAddForm({...addForm, reasonDescription: e.target.value})} placeholder="e.g. Annual Checkup" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Date</label>
                    <input type="date" required value={addForm.date} onChange={(e) => setAddForm({...addForm, date: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Time</label>
                    <input type="time" required value={addForm.time} onChange={(e) => setAddForm({...addForm, time: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                </div>

                <button type="submit" disabled={adding} style={{ width: '100%', background: '#0ea5e9', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)', cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}>
                  {adding ? 'Booking...' : 'Book Appointment'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default StaffAppointmentsView;
