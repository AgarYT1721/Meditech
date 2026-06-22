import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Activity, Loader2 } from 'lucide-react';
import { getPatientRecords } from '../services/recordService';

const ClientRecordsView = ({ clientUid }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const data = await getPatientRecords(clientUid);
        setRecords(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };



  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ padding: '20px', width: '100%', boxSizing: 'border-box', display: 'block' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#181818' }}>Medical Records</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
        <div style={{ background: 'linear-gradient(135deg, #0066ff, #00bfff)', borderRadius: '16px', padding: '15px', color: 'white', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{records.length < 10 ? `0${records.length}` : records.length}</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, opacity: 0.9 }}>Total Records</div>
        </div>
        <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderRadius: '16px', padding: '15px', color: '#181818', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>02</div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>New Results</div>
        </div>
      </div>

      <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', fontWeight: 700, color: '#181818' }}>Recent Documents</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {loading ? (
          <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
            <Loader2 size={32} color="#0066ff" className="spinner" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : records.length === 0 ? (
          <div style={{ color: '#888', fontSize: '0.9rem', textAlign: 'center', padding: '40px 0' }}>No medical records found.</div>
        ) : records.map((record) => (
          <motion.div key={record.id} variants={itemVariants} style={{ background: '#fff', borderRadius: '16px', padding: '15px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(0, 102, 255, 0.1)', color: '#0066ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#181818' }}>{record.title}</h4>
                  <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '2px' }}>{record.type} &bull; {record.date}</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', paddingTop: '15px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '0.75rem', color: '#666' }}>By {record.doctorName}</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#181818', fontSize: '0.75rem', fontWeight: 600 }}>
                  <Eye size={14} /> View
                </button>
                <button style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '5px', color: '#181818', fontSize: '0.75rem', fontWeight: 600 }}>
                  <Download size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
};

export default ClientRecordsView;
