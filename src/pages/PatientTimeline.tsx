import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FileText, Calendar, ExternalLink, Filter, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface PatientTimelineProps {
  user: User | null;
}

export default function PatientTimeline({ user }: PatientTimelineProps) {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'prescription' | 'report'>('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredRecords = records.filter(r => filter === 'all' || r.type === filter);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medical Timeline</h1>
          <p className="text-sm text-gray-500">Your complete medical history in one place.</p>
        </div>
        
        <div className="flex gap-2">
           {(['all', 'prescription', 'report'] as const).map((t) => (
             <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-all",
                filter === t ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-500 ring-1 ring-gray-200 hover:ring-gray-300"
              )}
             >
               {t}
             </button>
           ))}
        </div>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-200">
          <div className="mb-4 rounded-full bg-gray-50 p-6 text-gray-300">
            <Search size={48} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No records found</h3>
          <p className="mt-1 text-sm text-gray-400">Try changing your filters or upload a new record.</p>
        </div>
      ) : (
        <div className="relative space-y-4 before:absolute before:left-[19px] before:top-2 before:h-full before:w-0.5 before:bg-gray-100 sm:before:left-6">
          {filteredRecords.map((record) => (
            <div key={record.id} className="relative flex items-start gap-4 sm:gap-6">
              {/* Icon Circle */}
              <div className={cn(
                "z-10 mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-gray-50 shadow-sm sm:h-12 sm:w-12",
                record.type === 'prescription' ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
              )}>
                <FileText size={record.type === 'prescription' ? 20 : 24} />
              </div>

              {/* Card */}
              <div className="flex-1 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md">
                <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                         "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                         record.type === 'prescription' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
                       )}>
                         {record.type}
                       </span>
                       <span className="text-xs text-gray-400">•</span>
                       <span className="flex items-center gap-1 text-xs text-gray-400">
                         <Calendar size={12} />
                         {record.createdAt?.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                       </span>
                    </div>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{record.fileName}</h4>
                  </div>
                  <a 
                    href={record.fileURL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-blue-600 hover:text-white"
                  >
                    View File
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
