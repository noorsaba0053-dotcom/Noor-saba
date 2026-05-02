import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorPatientView from './pages/DoctorPatientView';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function AnimatedRoutes({ user, role, loading, setRole }: { user: User | null, role: string | null, loading: boolean, setRole: (r: string) => void }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/login" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {user ? <Navigate to="/" /> : <Login />}
          </motion.div>
        } />
        
        <Route element={<ProtectedRoute user={user} loading={loading} />}>
          <Route path="/onboarding" element={
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Onboarding role={role} setRole={setRole} />
            </motion.div>
          } />
          
          <Route element={<Layout user={user} role={role} />}>
            <Route index element={
              role === 'patient' ? <Navigate to="/patient/dashboard" /> :
              role === 'doctor' ? <Navigate to="/doctor/dashboard" /> :
              <Navigate to="/onboarding" />
            } />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                {role === 'patient' ? <PatientDashboard user={user} /> : <Navigate to="/" />}
              </motion.div>
            } />
            <Route path="/patient/upload" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                {role === 'patient' ? <PatientUpload user={user} /> : <Navigate to="/" />}
              </motion.div>
            } />
            <Route path="/patient/timeline" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                {role === 'patient' ? <PatientTimeline user={user} /> : <Navigate to="/" />}
              </motion.div>
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                {role === 'doctor' ? <DoctorDashboard user={user} /> : <Navigate to="/" />}
              </motion.div>
            } />
            <Route path="/doctor/patient/:id" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                {role === 'doctor' ? <DoctorPatientView user={user} /> : <Navigate to="/" />}
              </motion.div>
            } />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        } else {
          setRole(null);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes user={user} role={role} loading={loading} setRole={setRole} />
    </BrowserRouter>
  );
}
