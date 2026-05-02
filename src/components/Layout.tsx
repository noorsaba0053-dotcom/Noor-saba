import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Home, Upload, Clock, LogOut, User as UserIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import Chatbot from './Chatbot';

interface LayoutProps {
  user: User | null;
  role: string | null;
}

export default function Layout({ user, role }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const isPatient = role === 'patient';
  const isDoctor = role === 'doctor';

  const navItems = isPatient ? [
    { name: 'Dashboard', path: '/patient/dashboard', icon: Home },
    { name: 'Upload', path: '/patient/upload', icon: Upload },
    { name: 'Timeline', path: '/patient/timeline', icon: Clock },
  ] : isDoctor ? [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: Home },
  ] : [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-20 md:pb-0 md:pl-64">
      {/* Top Navbar for Desktop */}
      <header className="hidden h-16 w-full items-center justify-between border-b bg-white px-6 md:flex">
        <h1 className="text-xl font-bold text-blue-600">MedVault</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button 
            onClick={handleLogout}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-white md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">MedVault</h1>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mt-1">
            {role} portal
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location.pathname === item.path 
                  ? "bg-blue-50 text-blue-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
              )}
            >
              <item.icon size={20} />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="flex h-16 w-full items-center justify-between bg-white px-6 shadow-sm md:hidden">
        <h1 className="text-xl font-bold text-blue-600">MedVault</h1>
        <div className="flex items-center gap-3">
           <button 
            onClick={handleLogout}
            className="p-2 text-gray-500"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Outlet />
      </main>

      <Chatbot />

      {/* Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 flex h-16 w-full items-center justify-around border-t bg-white md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
              location.pathname === item.path ? "text-blue-600" : "text-gray-400"
            )}
          >
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
        {isDoctor && location.pathname.startsWith('/doctor/patient/') && (
           <div className="flex flex-col items-center gap-1 text-[10px] font-medium text-blue-600">
             <UserIcon size={20} />
             Patient
           </div>
        )}
      </nav>
    </div>
  );
}
