import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { FileText, FileUp, CheckCircle, AlertCircle, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface PatientUploadProps {
  user: User | null;
}

export default function PatientUpload({ user }: PatientUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report' | ''>('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file || !type) return;

    setLoading(true);
    setStatus('idle');

    try {
      // 1. Upload to Firebase Storage
      const storageRef = ref(storage, `records/${user.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 2. Save to Firestore
      await addDoc(collection(db, 'records'), {
        patientId: user.uid,
        fileURL: downloadURL,
        type,
        fileName: file.name,
        createdAt: serverTimestamp(),
      });

      setStatus('success');
      setTimeout(() => navigate('/patient/timeline'), 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Upload Record</h1>
        <p className="text-sm text-gray-500">Securely add your medical documents to MedVault.</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-6">
        {/* File Select */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Medical Document</label>
          <div 
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors",
              file ? "border-green-200 bg-green-50" : "border-gray-300 bg-white hover:bg-gray-50"
            )}
          >
            <input
              type="file"
              accept=".pdf,image/*"
              className="absolute inset-0 cursor-pointer opacity-0"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center">
                <FileText className="mb-2 text-green-600" size={40} />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  type="button"
                  onClick={() => setFile(null)}
                  className="mt-3 rounded-full bg-white p-1 text-gray-400 shadow-sm hover:text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <FileUp className="mb-2 text-gray-400" size={40} />
                <p className="text-sm font-medium text-gray-900">Tap to browse or drop file</p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG up to 10MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Type Select */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Document Category</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('prescription')}
              className={cn(
                "rounded-xl border py-3 text-sm font-medium transition-all",
                type === 'prescription' ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"
              )}
            >
              Prescription
            </button>
            <button
              type="button"
              onClick={() => setType('report')}
              className={cn(
                "rounded-xl border py-3 text-sm font-medium transition-all",
                type === 'report' ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" : "border-gray-200 bg-white text-gray-600 hover:border-blue-200"
              )}
            >
              Medical Report
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading || !file || !type}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
          ) : status === 'success' ? (
            <>
              <CheckCircle size={20} />
              Uploaded Successfully
            </>
          ) : status === 'error' ? (
            <>
              <AlertCircle size={20} />
              Try Again
            </>
          ) : (
            'Upload to Vault'
          )}
        </button>
      </form>
    </div>
  );
}
