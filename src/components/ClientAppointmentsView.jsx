import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, X, Plus, ChevronLeft, Heart, Globe, Briefcase, ChevronsRight, Trash2, Loader2 } from 'lucide-react';
import { getPatientAppointments, createAppointment, cancelAppointment, updateAppointmentDate, getStaffAppointments } from '../services/appointmentService';
import { getDoctors } from '../services/staffService';
import { getRecordByAppointmentId } from '../services/recordService';

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) return timeStr;
  const [h, m] = timeStr.split(':');
  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${ampm}`;
};

const ClientAppointmentsView = ({ clientUid, patientData, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showBooking, setShowBooking] = useState(false);
  const [showDoctorList, setShowDoctorList] = useState(false);
  
  // Visit Summary Modal State
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryRecord, setSummaryRecord] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [selectedTime, setSelectedTime] = useState('04:45 PM');
  const [reasonDescription, setReasonDescription] = useState('General Checkup');
  const [rescheduleAptId, setRescheduleAptId] = useState(null);
  const [bookedTimes, setBookedTimes] = useState([]);
  const [isBooking, setIsBooking] = useState(false);

  // Helper to get today's date string
  const getTodayDateStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const dates = React.useMemo(() => {
    const result = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      result.push({ d: d.getDate(), day: days[d.getDay()], dateStr });
    }
    return result;
  }, []);

  const times = [
    '09:00 AM', '10:30 AM', '11:45 AM',
    '12:45 PM', '01:30 PM', '02:45 PM',
    '03:15 PM', '04:45 PM', '05:30 PM'
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const [appointments, setAppointments] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [aptsData, docsData] = await Promise.all([
        getPatientAppointments(clientUid),
        getDoctors()
      ]);
      
      const enhancedApts = aptsData.map(apt => {
        const doctor = docsData.find(d => d.uid === apt.staffUid || d.id === apt.staffUid);
        return { 
          ...apt, 
          staffName: doctor ? `${doctor.firstName} ${doctor.lastName}` : apt.staffUid.substring(0,6),
          staffProfilePicture: doctor?.profilePicture || null
        };
      });

      setAppointments(enhancedApts);
      setDoctorsList(docsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBookedTimes = async () => {
      if (!selectedDoctor || !selectedDate) {
        setBookedTimes([]);
        return;
      }
      try {
        const staffUid = selectedDoctor.uid || selectedDoctor.id;
        const staffApts = await getStaffAppointments(staffUid);
        // Filter appointments on the selected date that are not cancelled or declined
        const booked = staffApts
          .filter(apt => apt.date === selectedDate && apt.status !== 'cancelled' && apt.status !== 'declined')
          .map(apt => apt.time);
        setBookedTimes(booked);
        
        // If currently selected time is now booked, unselect it
        if (booked.includes(selectedTime)) {
          setSelectedTime('');
        }
      } catch (error) {
        console.error("Failed to fetch booked times", error);
      }
    };
    fetchBookedTimes();
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    if (!selectedDoctor) return;
    try {
      setIsBooking(true);
      const dateStr = selectedDate;
      if (rescheduleAptId) {
        await updateAppointmentDate(rescheduleAptId, dateStr, selectedTime, reasonDescription);
      } else {
        const aptData = {
          patientUid: clientUid,
          patientName: patientData ? `${patientData.firstName} ${patientData.lastName}` : "Unknown Patient",
          staffUid: selectedDoctor.uid || selectedDoctor.id,
          reasonId: "R01",
          reasonDescription: reasonDescription || "General Checkup",
          date: dateStr,
          time: selectedTime,
          status: "pending"
        };
        await createAppointment(aptData);
      }
      setShowBooking(false);
      setRescheduleAptId(null);
      if(showDoctorList === false) {
        setSelectedDoctor(null);
      }
      fetchData(); // refresh list
      setActiveTab('upcoming');
    } catch (error) {
      console.error(error);
      alert("Failed to save appointment. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelAppointment(id);
      fetchData(); // refresh list
    } catch (error) {
      console.error(error);
    }
  };

  const upcomingList = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed');
  const completedList = appointments.filter(a => a.status === 'completed');
  const cancelledList = appointments.filter(a => a.status === 'cancelled');

  const currentList = activeTab === 'upcoming' ? upcomingList : activeTab === 'completed' ? completedList : cancelledList;

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '20px', width: '100%', boxSizing: 'border-box', display: 'block' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#181818' }}>Schedule</h2>
        <button 
          onClick={() => setShowDoctorList(true)}
          style={{ background: '#0066ff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 4px 15px rgba(0,102,255,0.3)', cursor: 'pointer' }}
        >
          <Plus size={24} />
        </button>
      </div>

      <div style={{ display: 'flex', background: '#f0f2f5', borderRadius: '40px', padding: '4px', marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('upcoming')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'upcoming' ? '#fff' : 'transparent', color: activeTab === 'upcoming' ? '#0066ff' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'upcoming' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Upcoming
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'completed' ? '#fff' : 'transparent', color: activeTab === 'completed' ? '#181818' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'completed' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Completed
        </button>
        <button 
          onClick={() => setActiveTab('cancelled')}
          style={{ flex: 1, padding: '12px', borderRadius: '40px', border: 'none', background: activeTab === 'cancelled' ? '#fff' : 'transparent', color: activeTab === 'cancelled' ? '#181818' : '#666', fontSize: '0.85rem', fontWeight: 700, boxShadow: activeTab === 'cancelled' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
        >
          Cancelled
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={32} color="#0066ff" className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : currentList.length === 0 ? (
          <div style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>No {activeTab} appointments found.</div>
        ) : currentList.map((apt) => (
          <motion.div key={apt.id} variants={itemVariants} style={{ background: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
            
            {/* Top Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '15px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#181818' }}>{apt.date} - {formatTime(apt.time)}</div>
              
              {activeTab === 'upcoming' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500, textTransform: 'capitalize' }}>{apt.status}</span>
                </div>
              ) : (
                <div style={{ color: '#888', cursor: 'pointer' }}>
                  <Trash2 size={16} />
                </div>
              )}
            </div>
            
            {/* Middle Row (Doctor Info) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0f2f5', padding: '3px', flexShrink: 0 }}>
                <img src={apt.staffProfilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.staffUid}&backgroundColor=e2e8f0`} alt="Doctor" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>Dr. {apt.staffName}</h4>
                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px', marginBottom: '6px' }}>{apt.reasonDescription}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ background: 'rgba(0,102,255,0.1)', color: '#0066ff', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={12} /> {/* Placeholder for booking ID icon */}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>ID: <span style={{ color: '#0066ff' }}>{apt.id.substring(0,6)}</span></span>
                </div>
              </div>
            </div>

            {/* Bottom Row (Actions) */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {activeTab === 'upcoming' && (
                <>
                  <button onClick={() => handleCancel(apt.id)} style={{ flex: 1, background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => {
                    setRescheduleAptId(apt.id);
                    const doctor = doctorsList.find(d => d.uid === apt.staffUid || d.id === apt.staffUid);
                    if (doctor) {
                      setSelectedDoctor(doctor);
                      setShowBooking(true);
                    }
                  }} style={{ flex: 1, background: '#0066ff', border: 'none', color: '#fff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,102,255,0.2)', cursor: 'pointer' }}>Reschedule</button>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <button onClick={() => {
                    const doctor = doctorsList.find(d => d.uid === apt.staffUid || d.id === apt.staffUid);
                    if (doctor) {
                      setSelectedDoctor(doctor);
                      setShowBooking(true);
                      setRescheduleAptId(null);
                    }
                  }} style={{ flex: 1, background: 'rgba(0,102,255,0.05)', border: 'none', color: '#0066ff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Re-book</button>
                  <button onClick={async () => {
                    setLoadingSummary(true);
                    try {
                      const record = await getRecordByAppointmentId(clientUid, apt.id);
                      if (record) {
                        setSummaryRecord({ ...record, appointmentDetails: apt });
                        setShowSummaryModal(true);
                      } else {
                        // Fallback if no specific record is found for this appointment
                        if (onNavigate) onNavigate('records');
                        else alert("Your visit summary is securely filed in your Medical Records.");
                      }
                    } catch (e) {
                      if (onNavigate) onNavigate('records');
                    } finally {
                      setLoadingSummary(false);
                    }
                  }} style={{ flex: 1, background: '#0066ff', border: 'none', color: '#fff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,102,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {loadingSummary ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    Visit summary
                  </button>
                </>
              )}
              {activeTab === 'cancelled' && (
                <button onClick={() => alert(`Appointment cancelled.\n\nReason: ${apt.reasonDescription || 'Patient requested cancellation'}\nPlease contact support if you need further assistance.`)} style={{ width: '100%', background: 'rgba(0,102,255,0.05)', border: 'none', color: '#0066ff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Cancellation details</button>
              )}
            </div>
            
          </motion.div>
        ))}
      </div>

      {/* Select Doctor Overlay */}
      <AnimatePresence>
        {showDoctorList && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: '#f4f7fa', 
              zIndex: 100, 
              padding: '20px', 
              paddingTop: 'env(safe-area-inset-top)', 
              overflowY: 'auto',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', marginTop: '10px' }}>
              <button onClick={() => setShowDoctorList(false)} style={{ background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Select Doctor</h2>
              <div style={{ width: '40px' }}></div> {/* Spacer */}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {doctorsList.map((doc) => (
                <motion.div 
                  key={doc.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  onClick={() => {
                    setSelectedDoctor(doc);
                    setShowDoctorList(false);
                    setShowBooking(true);
                  }}
                  style={{ background: '#fff', borderRadius: '24px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)', cursor: 'pointer' }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#f0f2f5', padding: '3px', flexShrink: 0 }}>
                    <img src={doc.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.uid}&backgroundColor=e2e8f0`} alt={doc.firstName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>Dr. {doc.firstName} {doc.lastName}</h4>
                    <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '2px' }}>{doc.specialization || "General Practice"}</div>
                  </div>
                  <div style={{ color: '#0066ff' }}>
                    <ChevronRight size={20} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Overlay (Redesigned Doctor Details) */}
      <AnimatePresence>
        {showBooking && selectedDoctor && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: '#f4f7fa', 
              zIndex: 100, 
              padding: '20px', 
              paddingTop: 'env(safe-area-inset-top)', 
              overflowY: 'auto',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', marginTop: '10px' }}>
              <button onClick={() => { setShowBooking(false); setRescheduleAptId(null); if(showDoctorList === false) setSelectedDoctor(null); }} style={{ background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Doctor Details</h2>
              <button style={{ background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <Heart size={20} />
              </button>
            </div>

            {/* Doctor Profile Card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#181818' }}>Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}</h3>
              <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>{selectedDoctor.specialization}</div>

              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '20px' }}>
                {/* Photo */}
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f0f2f5', padding: '5px', flexShrink: 0 }}>
                  <img src={selectedDoctor.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.uid}&backgroundColor=c0aede`} alt="Doctor" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                
                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#0066ff', background: 'rgba(0,102,255,0.1)', padding: '6px', borderRadius: '50%' }}><Clock size={14} /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Consultation time</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.duration || "30 Mins"}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#0066ff', background: 'rgba(0,102,255,0.1)', padding: '6px', borderRadius: '50%' }}><Globe size={14} /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Languages</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.languages || "English"}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#0066ff', background: 'rgba(0,102,255,0.1)', padding: '6px', borderRadius: '50%' }}><Briefcase size={14} /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Experience</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.exp || '10 Years'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Date Horizontal Scroll */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '15px', marginBottom: '15px', margin: '0 -20px', paddingLeft: '20px', paddingRight: '20px', scrollbarWidth: 'none' }}>
              {dates.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedDate(item.dateStr)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    minWidth: '60px', 
                    padding: '12px 0', 
                    borderRadius: '40px', 
                    background: selectedDate === item.dateStr ? '#0066ff' : '#fff',
                    color: selectedDate === item.dateStr ? '#fff' : '#181818',
                    boxShadow: selectedDate === item.dateStr ? '0 10px 20px rgba(0,102,255,0.3)' : '0 4px 10px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{item.d}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedDate === item.dateStr ? 'rgba(255,255,255,0.8)' : '#888' }}>{item.day}</span>
                </div>
              ))}
            </div>

            {/* Choose Time Card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontSize: '1rem', fontWeight: 800, color: '#181818' }}>Choose time</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {times.map((time, idx) => {
                  const isBookedByDoctor = bookedTimes.includes(time);
                  const isBookedByPatient = appointments
                    .filter(apt => apt.date === selectedDate && apt.status !== 'cancelled' && apt.status !== 'declined')
                    .map(apt => apt.time)
                    .includes(time);
                  
                  // Past time check
                  let isPastTime = false;
                  if (selectedDate === getTodayDateStr()) {
                    const [timeStr, modifier] = time.split(' ');
                    let [hours, minutes] = timeStr.split(':');
                    hours = parseInt(hours, 10);
                    if (modifier === 'PM' && hours < 12) hours += 12;
                    if (modifier === 'AM' && hours === 12) hours = 0;
                    
                    const slotTime = new Date();
                    slotTime.setHours(hours, parseInt(minutes, 10), 0, 0);
                    if (slotTime < new Date()) {
                      isPastTime = true;
                    }
                  }

                  const isBooked = isBookedByDoctor || isBookedByPatient || isPastTime;
                  
                  let tooltip = "";
                  if (isPastTime) tooltip = "This time has already passed";
                  else if (isBookedByPatient) tooltip = "You already have an appointment at this time";
                  else if (isBookedByDoctor) tooltip = "Doctor is unavailable";

                  return (
                    <div 
                      key={idx}
                      onClick={() => !isBooked && setSelectedTime(time)}
                      style={{ 
                        padding: '12px 5px', 
                        textAlign: 'center', 
                        borderRadius: '16px', 
                        background: isBooked ? '#e2e8f0' : (selectedTime === time ? '#0066ff' : '#f4f7fa'), 
                        color: isBooked ? '#94a3b8' : (selectedTime === time ? '#fff' : '#666'), 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedTime === time && !isBooked ? '0 8px 15px rgba(0,102,255,0.2)' : 'none',
                        textDecoration: isBooked ? 'line-through' : 'none',
                        opacity: isBooked ? 0.6 : 1
                      }}
                      title={tooltip}
                    >
                      {time}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reason Input */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h4 style={{ margin: 0, marginBottom: '15px', fontSize: '1rem', fontWeight: 800, color: '#181818' }}>Reason for Visit</h4>
              <input 
                type="text" 
                value={reasonDescription}
                onChange={(e) => setReasonDescription(e.target.value)}
                placeholder="e.g. Annual Checkup, Headache..."
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', color: '#181818', boxSizing: 'border-box' }}
              />
            </div>

            {/* Book Button */}
            <button 
              onClick={handleBook}
              disabled={isBooking}
              style={{ 
                width: '100%', 
                padding: '20px', 
                background: isBooking ? '#94a3b8' : '#0066ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '100px', 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                boxShadow: isBooking ? 'none' : '0 10px 25px rgba(0,102,255,0.3)',
                cursor: isBooking ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                marginBottom: '20px'
              }}
            >
              {isBooking ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : (
                <div style={{ background: '#fff', color: '#0066ff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ChevronsRight size={16} />
                </div>
              )}
              {isBooking ? (rescheduleAptId ? "Rescheduling..." : "Booking...") : (rescheduleAptId ? "Confirm Reschedule" : "Book Consultation")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visit Summary Modal */}
      <AnimatePresence>
        {showSummaryModal && summaryRecord && (
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
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Visit Summary</h3>
                <button onClick={() => setShowSummaryModal(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', padding: '2px', flexShrink: 0 }}>
                    <img src={summaryRecord.appointmentDetails?.staffProfilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${summaryRecord.appointmentDetails?.staffUid}&backgroundColor=cbd5e1`} alt="Doctor" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#181818' }}>Dr. {summaryRecord.appointmentDetails?.staffName}</h4>
                    <div style={{ color: '#0066ff', fontSize: '0.85rem', fontWeight: 600, marginTop: '4px' }}>Date: {summaryRecord.appointmentDetails?.date}</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Diagnosis / Reason</div>
                    <div style={{ fontSize: '0.95rem', color: '#181818', fontWeight: 500 }}>{summaryRecord.diagnosis || summaryRecord.title}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Consultation Notes</div>
                    <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{summaryRecord.notes || "No additional notes provided."}</div>
                  </div>
                  {summaryRecord.prescription && (
                    <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Prescription</div>
                      <div style={{ fontSize: '0.9rem', color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{summaryRecord.prescription}</div>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={() => setShowSummaryModal(false)} style={{ width: '100%', background: '#0066ff', color: 'white', border: 'none', padding: '16px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(0, 102, 255, 0.3)', cursor: 'pointer' }}>
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientAppointmentsView;
