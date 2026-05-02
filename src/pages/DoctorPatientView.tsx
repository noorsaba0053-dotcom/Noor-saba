import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User as UserIcon, Calendar, Droplet, MapPin, FileText, ExternalLink, ShieldAlert, ChevronLeft, Lock } from 'lucide-react';
import { cn } from '../lib/utils';

interface DoctorPatientViewProps {
  user: any;
}

export default function DoctorPatientView({ user }: DoctorPatientViewProps) {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessible, setAccessible] = useState(true);

  useEffect(() => {
    if (!id) return;

    // 1. Fetch Profile and check sharing status
    const unsubscribeProfile = onSnapshot(doc(db, 'users', id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        if (!data.isSharing) {
          setAccessible(false);
          setLoading(false);
        } else {
          setAccessible(true);
        }
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeProfile();
  }, [id]);

  useEffect(() => {
    if (!id || !accessible) return;

    // 2. Fetch Records if accessible
    const q = query(
      collection(db, 'records'),
      where('patientId', '==', id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeRecords = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setRecords(docs);
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribeRecords();
  }, [id, accessible]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert size={48} className="mb-4 text-red-500" />
        <h2 className="text-xl font-bold">Patient Not Found</h2>
        <p className="text-gray-500">The patient ID you are looking for does not exist.</p>
        <Link to="/" className="mt-6 text-blue-600 font-bold">Go Back</Link>
      </div>
    );
  }

  if (!accessible) {
    return (
      <div className="mx-auto max-w-md mt-12 overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-100">
        <div className="bg-red-50 to-white px-8 py-12 text-center">
           <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600">
             <Lock size={40} />
           </div>
           <h2 className="text-2xl font-black text-gray-900">Access Restricted</h2>
           <p className="mt-3 text-gray-500">
             <span className="font-bold text-gray-900">{profile.name}</span> has disabled profile sharing. 
             Consent is required to view medical records.
           </p>
           <Link 
            to="/" 
            className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-8 py-4 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
           >
             <ChevronLeft size={16} />
             Return to Dashboard
           </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Button */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600">
        <ChevronLeft size={16} />
        Patient Overview
      </Link>

      {/* Header Profile */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
           <div className="mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 sm:mx-0">
             <UserIcon size={48} />
           </div>
           <div className="text-center sm:text-left">
             <h1 className="text-3xl font-black text-gray-900">{profile.name}</h1>
             <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm text-gray-500 sm:justify-start">
               <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400"/> {profile.age} Years</span>
               <span className="flex items-center gap-1.5"><Droplet size={14} className="text-red-500"/> {profile.bloodGroup}</span>
               <span className="flex items-center gap-1.5 capitalize"><UserIcon size={14} className="text-gray-400"/> {profile.gender}</span>
             </div>
           </div>
        </div>
        <div className="border-t bg-gray-50/50 p-6">
           <div className="flex items-start gap-3">
             <MapPin size={18} className="mt-0.5 text-gray-400" />
             <p className="text-sm font-medium text-gray-600">{profile.address}</p>
           </div>
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 px-2 text-lg font-bold text-gray-900">
          <FileText className="text-blue-600" size={20} />
          Verified Records
        </h3>

        {records.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center ring-1 ring-gray-200">
             <p className="text-sm text-gray-400">No records have been uploaded yet.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {records.map((record) => (
              <div key={record.id} className="group relative overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      record.type === 'prescription' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                    )}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{record.type}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                        <span className="text-xs font-semibold text-gray-500">
                          {record.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{record.fileName}</h4>
                    </div>
                  </div>
                  <a 
                    href={record.fileURL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex aspect-square h-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
