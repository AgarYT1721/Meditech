import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, FileText, Plus, X, ChevronLeft, Calendar, Activity, Loader2 } from 'lucide-react';
import { getPatients, getMedicalRecords, addMedicalRecord } from '../services/patientService';

const StaffPatientsView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [emrRecords, setEmrRecords] = useState([]);
  const [loadingEmr, setLoadingEmr] = useState(false);
  const [emrForm, setEmrForm] = useState({ diagnosis: '', notes: '', prescription: '' });

  useEffect(() => {
    if (selectedPatient) {
      fetchEMRs();
    }
  }, [selectedPatient]);

  const fetchEMRs = async () => {
    setLoadingEmr(true);
    try {
      const records = await getMedicalRecords(selectedPatient.uid);
      setEmrRecords(records);
    } catch (error) {
      console.error("Failed to fetch EMRs", error);
    } finally {
      setLoadingEmr(false);
    }
  };

  const handleAddEMR = async (e) => {
    e.preventDefault();
    try {
      await addMedicalRecord(selectedPatient.uid, emrForm);
      setShowAddEntry(false);
      setEmrForm({ diagnosis: '', notes: '', prescription: '' });
      fetchEMRs();
    } catch (error) {
      console.error("Failed to save record", error);
      alert("Failed to save record");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error) {
      console.error("Failed to fetch patients", error);
    } finally {
      setLoading(false);
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

  const filteredPatients = patients.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.uid.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '0', width: '100%', boxSizing: 'border-box', display: 'block' }}
    >
      <AnimatePresence mode="wait">
        {!selectedPatient ? (
          <motion.div key="list" variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0 }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', marginBottom: '30px' }}>
              <input 
                type="text" 
                placeholder="Search by name or ID (e.g. P-1001)..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '15px 45px', borderRadius: '16px', border: 'none', background: '#fff', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', fontSize: '0.9rem', color: '#181818', boxSizing: 'border-box' }}
              />
              <Search size={20} color="#888" style={{ position: 'absolute', left: '15px', top: '15px' }} />
            </div>

            {/* Patient List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {loading ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px 20px', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Loader2 size={48} color="#0ea5e9" className="spinner" style={{ marginBottom: '10px', animation: 'spin 1s linear infinite' }} />
                  <div>Loading patients...</div>
                </motion.div>
              ) : filteredPatients.map((patient) => {
                const age = patient.dateOfBirth ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear() : 'N/A';
                return (
                <motion.div 
                  key={patient.id} 
                  variants={itemVariants}
                  onClick={() => setSelectedPatient({ ...patient, name: `${patient.firstName} ${patient.lastName}`, age: age, seed: patient.uid, id: patient.uid })}
                  style={{ background: '#fff', borderRadius: '20px', padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', cursor: 'pointer' }}
                >
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f0f2f5', padding: '2px', flexShrink: 0 }}>
                    <img src={patient.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.uid}&backgroundColor=e2e8f0`} alt={`${patient.firstName} ${patient.lastName}`} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#181818', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {patient.firstName} {patient.lastName}
                    </h4>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '2px' }}>
                      ID: {patient.uid.substring(0, 8)} • {age} yrs • {patient.gender}
                    </div>
                  </div>
                  <div style={{ color: '#0ea5e9', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                    <ChevronRight size={20} />
                    <div style={{ fontSize: '0.65rem', color: '#adb5bd' }}>Phone: {patient.contactNumber}</div>
                  </div>
                </motion.div>
              )})}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%', fontFamily: "'Inter', sans-serif" }}
          >
            {/* Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <button onClick={() => { setSelectedPatient(null); setShowAddEntry(false); }} style={{ background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#181818', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                <ChevronLeft size={20} />
              </button>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#181818' }}>Medical Record</h2>
              <button onClick={() => setShowAddEntry(true)} style={{ background: '#0ea5e9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)', cursor: 'pointer' }}>
                <Plus size={20} />
              </button>
            </div>

            {/* Patient Header Card */}
            <div style={{ background: '#fff', borderRadius: '24px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f2f5', padding: '3px', flexShrink: 0 }}>
                <img src={selectedPatient.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPatient.uid}&backgroundColor=c0aede`} alt="Patient" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#181818' }}>{selectedPatient.name}</h3>
                <div style={{ color: '#0ea5e9', fontSize: '0.85rem', fontWeight: 700, marginTop: '2px', background: 'rgba(14, 165, 233, 0.1)', display: 'inline-block', padding: '2px 8px', borderRadius: '6px' }}>
                  {selectedPatient.id}
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}><strong>Age:</strong> {selectedPatient.age}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}><strong>Sex:</strong> {selectedPatient.gender}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}><strong>Blood:</strong> O+</div>
                </div>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#181818', marginBottom: '15px' }}>EMR History</h3>

            {/* EMR Timeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {loadingEmr ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>Loading records...</div>
              ) : emrRecords.length === 0 ? (
                <div style={{ background: '#fff', borderRadius: '16px', padding: '30px', textAlign: 'center', color: '#888', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  <FileText size={40} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                  <div>No medical records found for this patient.</div>
                </div>
              ) : (
                emrRecords.map((record, index) => {
                  const dateObj = new Date(record.createdAt);
                  const dateStr = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                  const colors = ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981'];
                  const color = colors[index % colors.length];
                  return (
                    <div key={record.id} style={{ background: '#fff', borderRadius: '16px', padding: '20px', borderLeft: `4px solid ${color}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#181818' }}>{record.diagnosis}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12}/> {dateStr}
                        </div>
                      </div>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#666', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {record.notes}
                      </p>
                      {record.prescription && (
                        <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#181818' }}>
                          <strong>Rx:</strong> {record.prescription}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add EMR Entry Overlay */}
      <AnimatePresence>
        {showAddEntry && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '24px' }}
            onClick={() => setShowAddEntry(false)}
          >
            <motion.div 
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ background: '#fff', width: '90%', maxWidth: '500px', borderRadius: '24px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxSizing: 'border-box', boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>New EMR Entry</h3>
                <button onClick={() => setShowAddEntry(false)} style={{ background: '#f0f2f5', border: 'none', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', cursor: 'pointer' }}>
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddEMR}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Diagnosis / Reason for Visit</label>
                  <input type="text" required value={emrForm.diagnosis} onChange={(e) => setEmrForm({...emrForm, diagnosis: e.target.value})} placeholder="e.g. Acute Migraine" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', boxSizing: 'border-box' }} />
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Clinical Notes</label>
                  <textarea required rows="4" value={emrForm.notes} onChange={(e) => setEmrForm({...emrForm, notes: e.target.value})} placeholder="Enter detailed observation notes..." style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}></textarea>
                </div>

                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#181818', marginBottom: '8px' }}>Prescription / Recommendations</label>
                  <textarea rows="2" value={emrForm.prescription} onChange={(e) => setEmrForm({...emrForm, prescription: e.target.value})} placeholder="e.g. Ibuprofen 400mg" style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'none', boxSizing: 'border-box' }}></textarea>
                </div>

                <button type="submit" style={{ width: '100%', background: '#0ea5e9', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 10px 25px rgba(14, 165, 233, 0.3)', cursor: 'pointer' }}>
                  Save Record
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StaffPatientsView;
