import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { User as UserIcon, Share2, Upload, Clock, Droplet, MapPin, Calendar, Bell, ShieldCheck, Zap, MoreHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface PatientDashboardProps {
  user: User | null;
}

export default function PatientDashboard({ user }: PatientDashboardProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      setProfile(doc.data());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const toggleSharing = async () => {
    if (!user || !profile) return;
    await updateDoc(doc(db, 'users', user.uid), {
      isSharing: !profile.isSharing
    });
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-4 border-blue-600 border-t-transparent"
        />
      </div>
    );
  }

  const patientUrl = `${window.location.origin}/doctor/patient/${user?.uid}`;

  const reminders = [
    { title: 'Annual Checkup', date: 'In 12 days', icon: Bell, color: 'text-blue-600 bg-blue-50' },
    { title: 'Upload Prescription', date: 'Pending', icon: Upload, color: 'text-amber-600 bg-amber-50' }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-24">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">Health Passport</h1>
          <p className="text-sm font-medium text-gray-400">Welcome back, {profile?.name?.split(' ')[0]}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
           <Bell className="text-gray-400" size={20} />
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Profile Stats Card */}
        <div className="col-span-1 md:col-span-2 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-gray-200">
           <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-100">
                 <UserIcon size={40} />
                 <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-green-500 ring-4 ring-white">
                    <ShieldCheck size={16} />
                 </div>
              </div>
              <div className="flex-1 space-y-4">
                 <div className="grid grid-cols-3 gap-4">
                    <div className="text-center sm:text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Blood</p>
                       <p className="text-lg font-black text-gray-900">{profile?.bloodGroup || 'N/A'}</p>
                    </div>
                    <div className="text-center sm:text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Age</p>
                       <p className="text-lg font-black text-gray-900">{profile?.age || '24'}</p>
                    </div>
                    <div className="text-center sm:text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gender</p>
                       <p className="text-lg font-black text-gray-900 capitalize">{profile?.gender || 'N/A'}</p>
                    </div>
                 </div>
                 <div className="h-px w-full bg-gray-50"></div>
                 <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{profile?.address}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Sharing Toggle Card */}
        <div className={cn(
          "flex flex-col justify-between rounded-[2.5rem] p-8 transition-all shadow-sm ring-1 ring-gray-200",
          profile?.isSharing ? "bg-blue-600 text-white shadow-blue-100" : "bg-white text-gray-900"
        )}>
           <div className="flex items-start justify-between">
              <div className={cn("rounded-2xl p-3", profile?.isSharing ? "bg-white/20" : "bg-blue-50 text-blue-600")}>
                 <Share2 size={24} />
              </div>
              <button
                onClick={toggleSharing}
                className={cn(
                  "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                  profile?.isSharing ? "bg-blue-400" : "bg-gray-200"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  profile?.isSharing ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
           </div>
           <div>
              <h3 className="text-xl font-black">Live Sharing</h3>
              <p className={cn("text-xs font-medium mt-1", profile?.isSharing ? "text-blue-100" : "text-gray-400")}>
                {profile?.isSharing ? "Doctors can view profile" : "Profile is private"}
              </p>
           </div>
        </div>

        {/* QR Code Pass */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-sm ring-1 ring-gray-200">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Medical Pass</h3>
              <MoreHorizontal size={20} className="text-gray-300" />
           </div>
           <div className="mx-auto flex aspect-square w-full max-w-[200px] items-center justify-center rounded-3xl bg-gray-50 p-6 ring-1 ring-gray-100">
              <QRCodeSVG value={patientUrl} size={150} level="H" />
           </div>
           <p className="mt-8 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
             Valid Medical Identification
           </p>
        </div>

        {/* Reminders & Actions */}
        <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
           {/* Actions */}
           <div className="grid grid-cols-2 gap-4">
              <Link to="/patient/upload" className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-blue-50 p-6 text-blue-600 transition-transform hover:scale-[1.02] active:scale-95 shadow-sm">
                 <div className="rounded-2xl bg-blue-600 p-3 text-white">
                    <Upload size={24} />
                 </div>
                 <span className="text-sm font-black uppercase tracking-tight">Upload</span>
              </Link>
              <Link to="/patient/timeline" className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-gray-900 p-6 text-white transition-transform hover:scale-[1.02] active:scale-95 shadow-lg">
                 <div className="rounded-2xl bg-white/10 p-3">
                    <Clock size={24} />
                 </div>
                 <span className="text-sm font-black uppercase tracking-tight">Timeline</span>
              </Link>
           </div>

           {/* Reminders */}
           <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 space-y-4">
              <h4 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest">
                 <Zap size={14} className="text-blue-600" />
                 Smart Log
              </h4>
              <div className="space-y-3">
                 {reminders.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
                       <div className={cn("rounded-xl p-2", r.color)}>
                          <r.icon size={16} />
                       </div>
                       <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900">{r.title}</p>
                          <p className="text-[10px] font-medium text-gray-400">{r.date}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
