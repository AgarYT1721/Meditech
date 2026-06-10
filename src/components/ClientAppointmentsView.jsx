import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, ChevronRight, X, Plus, ChevronLeft, Heart, Globe, Briefcase, ChevronsRight, Trash2 } from 'lucide-react';

const ClientAppointmentsView = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showBooking, setShowBooking] = useState(false);
  const [showDoctorList, setShowDoctorList] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(9);
  const [selectedTime, setSelectedTime] = useState('04:45 PM');

  const dates = [
    { d: 6, day: 'Fri' }, { d: 7, day: 'Sat' }, { d: 8, day: 'Sun' },
    { d: 9, day: 'Mon' }, { d: 10, day: 'Tue' }, { d: 11, day: 'Wed' }, { d: 12, day: 'Thu' }
  ];

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

  const upcomingMock = [
    { id: 1, doctor: 'Dr. Elena Mikaelson', specialty: 'Neurologist', date: 'Oct 31, 2025', time: '10:00 AM', bookingId: '#A61138', seed: 'Elena', duration: '45 minute', languages: 'EN / ES', exp: '10 Years' },
    { id: 2, doctor: 'Dr. Caroline Forbes', specialty: 'Cardiologist', date: 'Oct 16, 2025', time: '01:15 PM', bookingId: '#A59961', seed: 'Caroline', duration: '60 minute', languages: 'EN / FR', exp: '12 Years' },
  ];

  const completedMock = [
    { id: 3, doctor: 'Dr. Sarah Williams', specialty: 'Neurologist', date: 'Sep 19, 2025', time: '02:30 PM', bookingId: '#A59961', seed: 'Sarah', duration: '30 minute', languages: 'EN', exp: '8 Years' },
    { id: 4, doctor: 'Dr. Damon Salvatore', specialty: 'Cardiologist', date: 'Sep 1, 2025', time: '10:30 AM', bookingId: '#A59961', seed: 'Damon', duration: '45 minute', languages: 'EN / IT', exp: '15 Years' },
  ];

  const cancelledMock = [
    { id: 5, doctor: 'Dr. Stefan Salvatore', specialty: 'Cardiologist', date: 'Aug 19, 2025', time: '09:00 AM', bookingId: '#A59961', seed: 'Stefan', duration: '60 minute', languages: 'EN / DE', exp: '14 Years' },
    { id: 6, doctor: 'Dr. Rebekah Bella', specialty: 'Neurologist', date: 'Jul 16, 2025', time: '01:45 PM', bookingId: '#A59961', seed: 'Rebekah', duration: '45 minute', languages: 'EN / RU', exp: '9 Years' },
  ];

  const doctorsList = [
    { id: 101, doctor: 'Dr. Klaus Gilbert', specialty: 'Dentist', seed: 'Klaus', duration: '45 minute', languages: 'EN / RU', exp: '8 Years' },
    { id: 102, doctor: 'Dr. Sarah Jenkins', specialty: 'Cardiologist', seed: 'Sarah', duration: '60 minute', languages: 'EN / FR', exp: '12 Years' },
    { id: 103, doctor: 'Dr. Marcus Webb', specialty: 'Dermatologist', seed: 'Marcus', duration: '30 minute', languages: 'EN / ES', exp: '5 Years' },
    { id: 104, doctor: 'Dr. Emily Chen', specialty: 'Optometrist', seed: 'Emily', duration: '40 minute', languages: 'EN / ZH', exp: '10 Years' },
  ];

  const currentList = activeTab === 'upcoming' ? upcomingMock : activeTab === 'completed' ? completedMock : cancelledMock;

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
        {currentList.map((apt) => (
          <motion.div key={apt.id} variants={itemVariants} style={{ background: '#fff', borderRadius: '24px', padding: '20px', boxShadow: '0 8px 25px rgba(0,0,0,0.04)' }}>
            
            {/* Top Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '15px' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#181818' }}>{apt.date} - {apt.time}</div>
              
              {activeTab === 'upcoming' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: 500 }}>Remind me</span>
                  <div style={{ width: '36px', height: '20px', background: '#0066ff', borderRadius: '20px', display: 'flex', alignItems: 'center', padding: '2px', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', background: '#fff', borderRadius: '50%', transform: 'translateX(16px)' }}></div>
                  </div>
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
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${apt.seed}&backgroundColor=e2e8f0`} alt="Doctor" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>{apt.doctor}</h4>
                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px', marginBottom: '6px' }}>{apt.specialty}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{ background: 'rgba(0,102,255,0.1)', color: '#0066ff', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center' }}>
                    <MapPin size={12} /> {/* Placeholder for booking ID icon */}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 600 }}>Booking ID: <span style={{ color: '#0066ff' }}>{apt.bookingId}</span></span>
                </div>
              </div>
            </div>

            {/* Bottom Row (Actions) */}
            <div style={{ display: 'flex', gap: '15px' }}>
              {activeTab === 'upcoming' && (
                <>
                  <button style={{ flex: 1, background: 'transparent', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={() => { setSelectedDoctor(apt); setShowBooking(true); }} style={{ flex: 1, background: '#0066ff', border: 'none', color: '#fff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,102,255,0.2)', cursor: 'pointer' }}>Reschedule</button>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <button onClick={() => { setSelectedDoctor(apt); setShowBooking(true); }} style={{ flex: 1, background: 'rgba(0,102,255,0.05)', border: 'none', color: '#0066ff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Re-book</button>
                  <button style={{ flex: 1, background: '#0066ff', border: 'none', color: '#fff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(0,102,255,0.2)', cursor: 'pointer' }}>Visit summary</button>
                </>
              )}
              {activeTab === 'cancelled' && (
                <button style={{ width: '100%', background: 'rgba(0,102,255,0.05)', border: 'none', color: '#0066ff', padding: '14px', borderRadius: '40px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Cancellation details</button>
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
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.seed}&backgroundColor=e2e8f0`} alt={doc.doctor} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818' }}>{doc.doctor}</h4>
                    <div style={{ color: '#888', fontSize: '0.85rem', marginTop: '2px' }}>{doc.specialty}</div>
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
              <button onClick={() => { setShowBooking(false); if(showDoctorList === false) setSelectedDoctor(null); }} style={{ background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Doctor Details</h2>
              <button style={{ background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <Heart size={20} />
              </button>
            </div>

            {/* Doctor Profile Card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.doctor}</h3>
              <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: '20px' }}>{selectedDoctor.specialty}</div>

              <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '20px' }}>
                {/* Photo */}
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#f0f2f5', padding: '5px', flexShrink: 0 }}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedDoctor.seed}&backgroundColor=c0aede`} alt="Doctor" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                </div>
                
                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#0066ff', background: 'rgba(0,102,255,0.1)', padding: '6px', borderRadius: '50%' }}><Clock size={14} /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Consultation time</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.duration}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#0066ff', background: 'rgba(0,102,255,0.1)', padding: '6px', borderRadius: '50%' }}><Globe size={14} /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Languages</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.languages}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{ color: '#0066ff', background: 'rgba(0,102,255,0.1)', padding: '6px', borderRadius: '50%' }}><Briefcase size={14} /></div>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#888', textTransform: 'uppercase', fontWeight: 700 }}>Experience</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#181818' }}>{selectedDoctor.exp}</div>
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
                  onClick={() => setSelectedDate(item.d)}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minWidth: '55px', 
                    height: '80px', 
                    borderRadius: '40px', 
                    background: selectedDate === item.d ? '#0066ff' : '#fff',
                    color: selectedDate === item.d ? '#fff' : '#181818',
                    boxShadow: selectedDate === item.d ? '0 10px 20px rgba(0,102,255,0.3)' : '0 4px 10px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{item.d}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: selectedDate === item.d ? 'rgba(255,255,255,0.8)' : '#888' }}>{item.day}</span>
                </div>
              ))}
            </div>

            {/* Choose Time Card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <h4 style={{ margin: 0, marginBottom: '20px', fontSize: '1rem', fontWeight: 800, color: '#181818' }}>Choose time</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                {times.map((time, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setSelectedTime(time)}
                    style={{ 
                      padding: '12px 5px', 
                      textAlign: 'center', 
                      borderRadius: '16px', 
                      background: selectedTime === time ? '#0066ff' : '#f4f7fa', 
                      color: selectedTime === time ? '#fff' : '#666', 
                      fontSize: '0.75rem', 
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedTime === time ? '0 8px 15px rgba(0,102,255,0.2)' : 'none'
                    }}
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>

            {/* Book Button */}
            <button 
              onClick={() => setShowBooking(false)}
              style={{ 
                width: '100%', 
                padding: '20px', 
                background: '#0066ff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '100px', 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                boxShadow: '0 10px 25px rgba(0, 102, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px',
                cursor: 'pointer',
                marginBottom: '20px'
              }}
            >
              <div style={{ background: '#fff', color: '#0066ff', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronsRight size={16} />
              </div>
              Book Consultation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ClientAppointmentsView;
