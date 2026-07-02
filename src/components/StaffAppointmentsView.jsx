import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Filter, Check, X, CalendarDays, Loader2, Plus } from 'lucide-react';
import { getStaffAppointments, subscribeToStaffAppointments, updateAppointmentStatus, createAppointment, cancelAppointment, updateAppointmentDate } from '../services/appointmentService';
import { getPatients, addMedicalRecord } from '../services/patientService';

const StaffAppointmentsView = ({ staffUser }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Appointment Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ patientUid: '', reasonDescription: '', date: '', time: '' });
  const [adding, setAdding] = useState(false);
  
  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ id: '', date: '', time: '', reason: '' });
  const [selectedRescheduleApt, setSelectedRescheduleApt] = useState(null);
  
  // Complete Appointment Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeApt, setCompleteApt] = useState(null);
  const [emrForm, setEmrForm] = useState({ diagnosis: '', notes: '', prescription: '' });
  const [completing, setCompleting] = useState(false);
  
  const now = new Date();
  const minDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({ id: '', reason: '' });

  // Summary Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedSummaryApt, setSelectedSummaryApt] = useState(null);

  const times = [
    '09:00 AM', '10:30 AM', '11:45 AM',
    '12:45 PM', '01:30 PM', '02:45 PM',
    '03:15 PM', '04:45 PM', '05:30 PM'
  ];

  useEffect(() => {
    let unsubscribe = () => {};
    const initData = async () => {
      setLoading(true);
      try {
        if (!staffUser?.uid) return;
        const patientsData = await getPatients();
        setPatients(patientsData);
        
        unsubscribe = subscribeToStaffAppointments(staffUser.uid, (aptsData) => {
          const enhancedApts = aptsData.map(apt => {
            const patient = patientsData.find(p => p.uid === apt.patientUid);
            return { ...apt, patientProfilePicture: patient?.profilePicture || null };
          });
          setAppointments(enhancedApts);
          setLoading(false);
        });
      } catch (error) {
        console.error("Failed to fetch data", error);
        setLoading(false);
      }
    };
    
    initData();
    return () => unsubscribe();
  }, [staffUser]);

  // Keep fetchData stub to avoid breaking anything that calls it (e.g. handleCancel)
  const fetchData = async () => {};

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        setCancelForm({ id: appointmentId, reason: '' });
        setShowCancelModal(true);
        return; // Wait for modal submission
      } else if (newStatus === 'completed') {
        const apt = appointments.find(a => a.id === appointmentId);
        if (apt) {
          setCompleteApt(apt);
          setShowCompleteModal(true);
        }
        return;
      } else {
        await updateAppointmentStatus(appointmentId, newStatus);
      }
      fetchData(); // Refresh the list
    } catch (error) {
      console.error(`Failed to update status to ${newStatus}`, error);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!emrForm.diagnosis || !emrForm.notes) return alert("Diagnosis and notes are required.");
    setCompleting(true);
    try {
      const docName = staffUser ? `Dr. ${staffUser.firstName} ${staffUser.lastName}`.replace('Dr. Dr.', 'Dr.') : 'MediTech Provider';
      // 1. Add the medical record, linked to the appointment
      await addMedicalRecord(completeApt.patientUid, {
        ...emrForm,
        doctorName: docName,
        appointmentId: completeApt.id
      });
      // 2. Update appointment status
      await updateAppointmentStatus(completeApt.id, 'completed');
      
      setShowCompleteModal(false);
      setEmrForm({ diagnosis: '', notes: '', prescription: '' });
      setCompleteApt(null);
      fetchData();
    } catch (error) {
      console.error("Failed to complete appointment", error);
      alert("Failed to complete appointment and save record.");
    } finally {
      setCompleting(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelForm.reason) return alert("Please provide a reason for cancellation");
    setAdding(true);
    try {
      await cancelAppointment(cancelForm.id, cancelForm.reason);
      setShowCancelModal(false);
      setCancelForm({ id: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to cancel", error);
      alert("Failed to cancel appointment");
    } finally {
      setAdding(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!rescheduleForm.date || !rescheduleForm.time || !rescheduleForm.reason) return alert("Please fill all fields");
    setAdding(true);
    try {
      await updateAppointmentDate(rescheduleForm.id, rescheduleForm.date, rescheduleForm.time, rescheduleForm.reason, true);
      setShowRescheduleModal(false);
      setRescheduleForm({ id: '', date: '', time: '', reason: '' });
      fetchData();
    } catch (error) {
      console.error("Failed to reschedule", error);
      alert(error.message || "Failed to reschedule appointment");
    } finally {
      setAdding(false);
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
    apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filterDate === '' || apt.date === filterDate)
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
        
        <div style={{ position: 'absolute', right: '15px', top: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {filterDate && (
             <span style={{ fontSize: '0.8rem', color: '#0ea5e9', background: 'rgba(14, 165, 233, 0.1)', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                {new Date(filterDate).toLocaleDateString()}
                <X size={12} style={{ cursor: 'pointer', marginLeft: '5px' }} onClick={() => setFilterDate('')} />
             </span>
          )}
          <Filter size={20} color={filterDate ? "#0ea5e9" : "#888"} style={{ cursor: 'pointer' }} onClick={() => setShowDatePicker(!showDatePicker)} />
        </div>
        
        <AnimatePresence>
          {showDatePicker && (
             <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               style={{ position: 'absolute', right: '0', top: '55px', background: '#fff', padding: '15px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, border: '1px solid #e2e8f0' }}
             >
               <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>Filter by Date</div>
               <input 
                 type="date" 
                 value={filterDate}
                 onChange={(e) => { setFilterDate(e.target.value); setShowDatePicker(false); }}
                 style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', color: '#181818', width: '100%', boxSizing: 'border-box' }}
               />
               {filterDate && (
                 <button onClick={() => { setFilterDate(''); setShowDatePicker(false); }} style={{ width: '100%', marginTop: '10px', padding: '8px', background: '#f1f5f9', color: '#64748b', border: 'none', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                   Clear Filter
                 </button>
               )}
             </motion.div>
          )}
        </AnimatePresence>
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
        <button 
          onClick={() => setActiveTab('cancelled')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'cancelled' ? '#fff' : 'transparent', color: activeTab === 'cancelled' ? '#ef4444' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'cancelled' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Cancelled
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
                  <div style={{ background: apt.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : apt.status === 'confirmed' ? 'rgba(16, 185, 129, 0.1)' : apt.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.05)', color: apt.status === 'pending' ? '#f59e0b' : apt.status === 'confirmed' ? '#10b981' : apt.status === 'cancelled' ? '#ef4444' : '#666', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'capitalize' }}>
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
                    {apt.cancelReason && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>
                        <strong style={{ fontWeight: 600 }}>Cancel Reason:</strong> {apt.cancelReason}
                      </div>
                    )}
                    {apt.rescheduleReason && (
                      <div style={{ background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.1)', padding: '8px', borderRadius: '8px', color: '#0ea5e9', fontSize: '0.8rem', marginTop: '5px' }}>
                        <strong style={{ fontWeight: 600 }}>Reschedule Reason:</strong> {apt.rescheduleReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Row (Actions) */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {activeTab === 'pending' && (
                    <>
                      <button onClick={() => handleStatusUpdate(apt.id, 'confirmed')} style={{ flex: 1, background: '#0ea5e9', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.2)', cursor: 'pointer' }}>
                        <Check size={16} /> Approve
                      </button>
                      <button onClick={() => { setRescheduleForm({ id: apt.id, date: '', time: '', reason: '' }); setSelectedRescheduleApt(apt); setShowRescheduleModal(true); }} style={{ flex: 1, background: 'rgba(14, 165, 233, 0.1)', border: 'none', color: '#0ea5e9', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                        <Clock size={16} /> Reschedule
                      </button>
                      <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                        <X size={16} /> Decline
                      </button>
                    </>
                  )}
                  {activeTab === 'confirmed' && (
                    <>
                      <button onClick={() => handleStatusUpdate(apt.id, 'completed')} style={{ flex: 1, background: '#10b981', border: 'none', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.2)', cursor: 'pointer' }}>
                        <Check size={16} /> Mark Completed
                      </button>
                      <button onClick={() => { setRescheduleForm({ id: apt.id, date: '', time: '', reason: '' }); setSelectedRescheduleApt(apt); setShowRescheduleModal(true); }} style={{ flex: 1, background: 'rgba(14, 165, 233, 0.1)', border: 'none', color: '#0ea5e9', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                        <Clock size={16} /> Reschedule
                      </button>
                      <button onClick={() => handleStatusUpdate(apt.id, 'cancelled')} style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', cursor: 'pointer' }}>
                        <X size={16} /> Cancel
                      </button>
                    </>
                  )}
                  {activeTab === 'completed' && (
                    <button onClick={() => { setSelectedSummaryApt(apt); setShowSummaryModal(true); }} style={{ width: '100%', background: '#f8fafc', border: 'none', color: '#0ea5e9', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>View Visit Summary</button>
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
                    <input type="date" min={minDate} required value={addForm.date} onChange={(e) => setAddForm({...addForm, date: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Time</label>
                    <select required value={addForm.time} onChange={(e) => setAddForm({...addForm, time: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }}>
                      <option value="">-- Select Time --</option>
                      {times.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                    </select>
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

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowRescheduleModal(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Reschedule Appointment</h3>
                <button onClick={() => setShowRescheduleModal(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              {selectedRescheduleApt && (
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '16px', marginBottom: '20px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Original Appointment Details</div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0', padding: '2px', flexShrink: 0 }}>
                      <img src={selectedRescheduleApt.patientProfilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedRescheduleApt.patientUid}&backgroundColor=cbd5e1`} alt="Patient" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#181818', fontSize: '0.95rem' }}>{selectedRescheduleApt.patientName}</div>
                      <div style={{ color: '#888', fontSize: '0.8rem' }}>{selectedRescheduleApt.reasonDescription}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={14} color="#0ea5e9" /> {selectedRescheduleApt.date}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} color="#0ea5e9" /> {selectedRescheduleApt.time}</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleRescheduleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Reason for Rescheduling</label>
                  <input type="text" required value={rescheduleForm.reason} onChange={(e) => setRescheduleForm({...rescheduleForm, reason: e.target.value})} placeholder="e.g. Doctor is unavailable" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>New Date</label>
                    <input type="date" min={minDate} required value={rescheduleForm.date} onChange={(e) => setRescheduleForm({...rescheduleForm, date: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>New Time</label>
                    <select required value={rescheduleForm.time} onChange={(e) => setRescheduleForm({...rescheduleForm, time: e.target.value})} style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', fontFamily: 'inherit' }}>
                      <option value="">-- Select Time --</option>
                      {times.map((t, idx) => <option key={idx} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={adding} style={{ width: '100%', background: '#0ea5e9', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)', cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}>
                  {adding ? 'Processing...' : 'Confirm Reschedule'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCancelModal(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Cancel Appointment</h3>
                <button onClick={() => setShowCancelModal(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCancelSubmit}>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Reason for Cancellation</label>
                  <input type="text" required value={cancelForm.reason} onChange={(e) => setCancelForm({...cancelForm, reason: e.target.value})} placeholder="e.g. Schedule conflict" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>

                <button type="submit" disabled={adding} style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)', cursor: adding ? 'not-allowed' : 'pointer', opacity: adding ? 0.7 : 1 }}>
                  {adding ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && selectedSummaryApt && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowSummaryModal(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Visit Summary</h3>
                <button onClick={() => setShowSummaryModal(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', padding: '2px', flexShrink: 0 }}>
                    <img src={selectedSummaryApt.patientProfilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSummaryApt.patientUid}&backgroundColor=cbd5e1`} alt="Patient" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#181818' }}>{selectedSummaryApt.patientName}</h4>
                    <div style={{ color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Patient UID: {selectedSummaryApt.patientUid.substring(0, 8)}...</div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Date</div>
                    <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 500 }}>{selectedSummaryApt.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Time</div>
                    <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 500 }}>{selectedSummaryApt.time}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Reason for Visit</div>
                    <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 500 }}>{selectedSummaryApt.reasonDescription || 'Not specified'}</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '15px', borderRadius: '16px', color: '#059669', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
                <Check size={20} color="#10b981" />
                This appointment has been marked as completed. To view detailed medical records from this visit, navigate to the Patients tab.
              </div>

              <button onClick={() => setShowSummaryModal(false)} style={{ width: '100%', marginTop: '20px', background: '#0ea5e9', color: 'white', border: 'none', padding: '15px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer' }}>
                Close Summary
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Complete Appointment EMR Modal */}
      <AnimatePresence>
        {showCompleteModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowCompleteModal(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', width: '90%', maxWidth: '600px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Complete Appointment</h3>
                <button onClick={() => setShowCompleteModal(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
                Please write the Consultation Note and Prescription to officially complete this appointment.
              </div>

              <form onSubmit={handleCompleteSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Diagnosis / Title</label>
                  <input type="text" required value={emrForm.diagnosis} onChange={(e) => setEmrForm({...emrForm, diagnosis: e.target.value})} placeholder="e.g. Acute Bronchitis" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Consultation Notes</label>
                  <textarea required rows={4} value={emrForm.notes} onChange={(e) => setEmrForm({...emrForm, notes: e.target.value})} placeholder="Patient presented with..." style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Prescription (Optional)</label>
                  <textarea rows={3} value={emrForm.prescription} onChange={(e) => setEmrForm({...emrForm, prescription: e.target.value})} placeholder="Medications..." style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                
                <button type="submit" disabled={completing} style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)', cursor: completing ? 'not-allowed' : 'pointer', opacity: completing ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  {completing ? <Loader2 size={20} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={20} />}
                  {completing ? 'Completing...' : 'Save Record & Complete'}
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
