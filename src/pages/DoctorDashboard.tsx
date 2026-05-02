import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Search, User as UserIcon, QrCode, ArrowRight, Camera, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface DoctorDashboardProps {
  user: User | null;
}

export default function DoctorDashboard({ user }: DoctorDashboardProps) {
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner: Html5QrcodeScanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        // Handle the scanned QR code
        // Expecting a URL like: https://.../doctor/patient/PATIENT_ID
        try {
          const parts = decodedText.split('/');
          const scannedId = parts[parts.length - 1];
          if (scannedId) {
            scanner.clear();
            setIsScanning(false);
            navigate(`/doctor/patient/${scannedId}`);
          }
        } catch (err) {
          setError('Invalid QR code format.');
        }
      }, (err) => {
        // Errors are frequent during scanning, ignore them
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning, navigate]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    setLoading(true);
    setError('');

    try {
      const patientDoc = await getDoc(doc(db, 'users', patientId.trim()));
      if (patientDoc.exists() && patientDoc.data().role === 'patient') {
        navigate(`/doctor/patient/${patientId.trim()}`);
      } else {
        setError('Patient not found. Please check the ID.');
      }
    } catch (err) {
      setError('An error occurred while searching.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">Physician's Hub</h1>
        <p className="text-sm font-medium text-gray-400">Access patient records by ID or QR scan.</p>
      </div>

      {isScanning ? (
        <div className="rounded-3xl bg-black p-6 shadow-2xl">
          <div className="mb-4 flex items-center justify-between text-white">
            <h3 className="font-bold">Scanning Medical Pass...</h3>
            <button 
              onClick={() => setIsScanning(false)}
              className="rounded-full bg-white/10 p-2"
            >
              <X size={20} />
            </button>
          </div>
          <div id="qr-reader" className="overflow-hidden rounded-2xl bg-white"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* QR Scan Action */}
          <button
            onClick={() => setIsScanning(true)}
            className="group flex flex-col items-center justify-center gap-4 rounded-3xl bg-blue-600 p-12 text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95"
          >
            <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-md transition-transform group-hover:scale-110">
              <Camera size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Start QR Scan</h3>
              <p className="text-sm opacity-80 mt-1 uppercase tracking-widest font-black">Scan Patient's Medical Pass</p>
            </div>
          </button>

          {/* Direct Search */}
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                <Search size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Manual Entry</h3>
                <p className="text-xs text-gray-500">Search via unique Patient ID</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Paste Patient ID here..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-2xl border-2 border-gray-100 bg-gray-50 px-6 py-4 pr-12 text-sm font-bold focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                />
                <button 
                  type="submit"
                  disabled={loading || !patientId}
                  className="absolute right-2 top-2 rounded-xl bg-blue-600 p-3 text-white transition-colors hover:bg-blue-700 disabled:opacity-50 shadow-md"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <ArrowRight size={20} />
                  )}
                </button>
              </div>
              {error && (
                <p className="flex items-center justify-center gap-2 text-center text-sm font-bold text-red-500 bg-red-50 py-3 rounded-xl animate-pulse">
                  <X size={16} />
                  {error}
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Physician Info / Tips */}
      <div className="grid grid-cols-2 gap-4">
         <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-xl">
           <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
              <UserIcon size={20} />
           </div>
           <h4 className="font-bold">Verified Physician</h4>
           <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-400">MedVault Node #422</p>
         </div>
         <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h4 className="font-bold text-gray-900">Privacy Policy</h4>
            <p className="mt-1 text-xs text-gray-400">Always obtain verbal consent before scanning.</p>
         </div>
      </div>
    </div>
  );
}
