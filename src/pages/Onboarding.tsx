import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { User, Stethoscope } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingProps {
  role: string | null;
  setRole: (role: string) => void;
}

export default function Onboarding({ role: currentRole, setRole }: OnboardingProps) {
  const [role, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    name: auth.currentUser?.displayName || '',
    age: '',
    gender: '',
    bloodGroup: '',
    address: '',
    degree: '',
  });

  useEffect(() => {
    if (currentRole) {
      navigate('/');
    }
  }, [currentRole, navigate]);

  const handleFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !role) return;

    setLoading(true);
    try {
      const userData = {
        role,
        name: formData.name,
        email: auth.currentUser.email,
        address: formData.address,
        ...(role === 'patient' ? {
          age: parseInt(formData.age),
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          isSharing: true,
        } : {
          degree: formData.degree,
        })
      };

      await setDoc(doc(db, 'users', auth.currentUser.uid), userData);
      setRole(role);
      navigate('/');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Welcome to MedVault</h1>
          <p className="mb-8 text-gray-500">To get started, please select your role.</p>

          <div className="grid gap-4">
            <button
              onClick={() => setSelectedRole('patient')}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all",
                role === 'patient' ? "border-blue-600 bg-blue-50" : "border-white bg-white hover:border-gray-200"
              )}
            >
              <div className={cn("rounded-full p-3", role === 'patient' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>
                <User size={32} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">I am a Patient</h3>
                <p className="text-xs text-gray-500 mt-1">Manage and share your medical history.</p>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('doctor')}
              className={cn(
                "flex flex-col items-center gap-3 rounded-2xl border-2 p-6 transition-all",
                role === 'doctor' ? "border-blue-600 bg-blue-50" : "border-white bg-white hover:border-gray-200"
              )}
            >
              <div className={cn("rounded-full p-3", role === 'doctor' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600")}>
                <Stethoscope size={32} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">I am a Doctor</h3>
                <p className="text-xs text-gray-500 mt-1">Access patient records with their consent.</p>
              </div>
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!role}
            className="mt-8 w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 p-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Complete Your Profile</h1>
        <p className="mb-8 text-gray-500">Help us personalize your MedVault experience.</p>

        <form onSubmit={handleFinish} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {role === 'patient' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Age</label>
                  <input
                    type="number"
                    required
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Blood Group</label>
                <select
                  required
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Medical Degree / Specialization</label>
              <input
                type="text"
                required
                placeholder="e.g. MBBS, MD Cardiology"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          )}

          <div className="pt-4 flex gap-3">
             <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 transition-colors hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] rounded-xl bg-blue-600 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Finish Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
