/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Hospital, 
  User, 
  Calendar, 
  Stethoscope, 
  ShieldCheck, 
  LogOut, 
  PlusCircle,
  Clock,
  UserPlus,
  ArrowRight
} from 'lucide-react';

type View = 'home' | 'login' | 'register' | 'patient_dashboard' | 'doctor_dashboard' | 'admin_dashboard' | 'book_appointment';

interface Doctor {
  name: string;
  specialization: string;
}

interface Appointment {
  id: number;
  patient_name: string;
  doctor_name: string;
  date: string;
  time: string;
}

interface Patient {
  name: string;
  email: string;
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [adminData, setAdminData] = useState<{ patients: Patient[], doctors: Doctor[], appointments: Appointment[] } | null>(null);

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [bookDoctor, setBookDoctor] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');

  useEffect(() => {
    if (view === 'book_appointment' || view === 'admin_dashboard') {
      fetch('/api/doctors').then(res => res.json()).then(setDoctors);
    }
    if (view === 'doctor_dashboard') {
      fetch('/api/appointments').then(res => res.json()).then(setAppointments);
    }
    if (view === 'admin_dashboard') {
      fetch('/api/admin/data').then(res => res.json()).then(setAdminData);
    }
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    });
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setView('patient_dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: regName, email: regEmail, password: regPassword })
    });
    if (res.ok) {
      setView('login');
      alert('Registration successful! Please login.');
    } else {
      alert('Email already exists');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        patientName: user?.name, 
        doctorName: bookDoctor, 
        date: bookDate, 
        time: bookTime 
      })
    });
    if (res.ok) {
      setView('patient_dashboard');
      alert('Appointment booked successfully!');
    }
  };

  const logout = () => {
    setUser(null);
    setView('home');
  };

  const Card = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}
    >
      {children}
    </motion.div>
  );

  const Button = ({ onClick, children, variant = "primary", className = "" }: any) => (
    <button
      onClick={onClick}
      className={`px-6 py-2.5 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center gap-2 ${
        variant === "primary" 
          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" 
          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
      } ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => setView('home')}
        >
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Hospital className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">CareFlow</span>
        </div>
        
        <div className="flex gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Welcome, {user.name}</span>
              <Button onClick={logout} variant="secondary" className="!py-1.5 !px-4 text-sm">
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          ) : (
            <>
              <Button onClick={() => setView('login')} variant="secondary" className="!py-1.5 !px-4 text-sm">Login</Button>
              <Button onClick={() => setView('register')} className="!py-1.5 !px-4 text-sm">Register</Button>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-12">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center space-y-8 py-12"
            >
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                  Modern Healthcare <br />
                  <span className="text-indigo-600">Simplified.</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                  Manage appointments, consult with top doctors, and track your health journey all in one place.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={() => setView('register')} className="px-8 py-4 text-lg">
                  Get Started <ArrowRight className="w-5 h-5" />
                </Button>
                <Button onClick={() => setView('doctor_dashboard')} variant="secondary" className="px-8 py-4 text-lg">
                  Doctor Portal
                </Button>
                <Button onClick={() => setView('admin_dashboard')} variant="secondary" className="px-8 py-4 text-lg">
                  Admin Access
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <Card>
                  <Stethoscope className="text-indigo-600 w-10 h-10 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Expert Doctors</h3>
                  <p className="text-slate-500 text-sm">Connect with specialists across various medical fields.</p>
                </Card>
                <Card>
                  <Calendar className="text-indigo-600 w-10 h-10 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Easy Booking</h3>
                  <p className="text-slate-500 text-sm">Schedule appointments in seconds with our intuitive interface.</p>
                </Card>
                <Card>
                  <ShieldCheck className="text-indigo-600 w-10 h-10 mb-4" />
                  <h3 className="text-lg font-bold mb-2">Secure Records</h3>
                  <p className="text-slate-500 text-sm">Your medical data is encrypted and handled with utmost care.</p>
                </Card>
              </div>
            </motion.div>
          )}

          {view === 'login' && (
            <motion.div key="login" className="max-w-md mx-auto">
              <Card>
                <h2 className="text-2xl font-bold mb-6 text-center">Patient Login</h2>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full py-3">Login</Button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-500">
                  Don't have an account? <span className="text-indigo-600 cursor-pointer" onClick={() => setView('register')}>Register</span>
                </p>
              </Card>
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div key="register" className="max-w-md mx-auto">
              <Card>
                <h2 className="text-2xl font-bold mb-6 text-center">Patient Registration</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input 
                      type="password" 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <Button className="w-full py-3">Register</Button>
                </form>
                <p className="mt-4 text-center text-sm text-slate-500">
                  Already have an account? <span className="text-indigo-600 cursor-pointer" onClick={() => setView('login')}>Login</span>
                </p>
              </Card>
            </motion.div>
          )}

          {view === 'patient_dashboard' && (
            <motion.div key="patient_dashboard" className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold">Patient Dashboard</h2>
                  <p className="text-slate-500">Manage your health and appointments.</p>
                </div>
                <Button onClick={() => setView('book_appointment')}>
                  <PlusCircle className="w-5 h-5" /> Book Appointment
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-indigo-600 text-white border-none">
                  <Calendar className="w-8 h-8 mb-4 opacity-80" />
                  <div className="text-2xl font-bold">Next Visit</div>
                  <p className="opacity-80 text-sm">No upcoming appointments</p>
                </Card>
                <Card>
                  <Clock className="text-indigo-600 w-8 h-8 mb-4" />
                  <div className="text-2xl font-bold text-slate-800">History</div>
                  <p className="text-slate-500 text-sm">View your past medical records</p>
                </Card>
                <Card>
                  <User className="text-indigo-600 w-8 h-8 mb-4" />
                  <div className="text-2xl font-bold text-slate-800">Profile</div>
                  <p className="text-slate-500 text-sm">Update your personal information</p>
                </Card>
              </div>
            </motion.div>
          )}

          {view === 'book_appointment' && (
            <motion.div key="book_appointment" className="max-w-2xl mx-auto">
              <Card>
                <h2 className="text-2xl font-bold mb-6">Book an Appointment</h2>
                <form onSubmit={handleBooking} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Select Doctor</label>
                    <select 
                      required
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                      value={bookDoctor}
                      onChange={(e) => setBookDoctor(e.target.value)}
                    >
                      <option value="">Choose a doctor...</option>
                      {doctors.map(doc => (
                        <option key={doc.name} value={doc.name}>{doc.name} - {doc.specialization}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Date</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={bookDate}
                        onChange={(e) => setBookDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Time</label>
                      <input 
                        type="time" 
                        required
                        className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={bookTime}
                        onChange={(e) => setBookTime(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1">Confirm Booking</Button>
                    <Button type="button" variant="secondary" onClick={() => setView('patient_dashboard')}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {view === 'doctor_dashboard' && (
            <motion.div key="doctor_dashboard" className="space-y-6">
              <h2 className="text-3xl font-bold">Doctor Dashboard</h2>
              <Card className="overflow-hidden !p-0">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Upcoming Appointments</h3>
                  <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {appointments.length} Total
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-slate-400 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-semibold">Patient</th>
                        <th className="px-6 py-4 font-semibold">Doctor</th>
                        <th className="px-6 py-4 font-semibold">Date</th>
                        <th className="px-6 py-4 font-semibold">Time</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-700">{a.patient_name}</td>
                          <td className="px-6 py-4 text-slate-600">{a.doctor_name}</td>
                          <td className="px-6 py-4 text-slate-600">{a.date}</td>
                          <td className="px-6 py-4 text-slate-600">{a.time}</td>
                          <td className="px-6 py-4">
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-medium">Confirmed</span>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No appointments found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}

          {view === 'admin_dashboard' && (
            <motion.div key="admin_dashboard" className="space-y-8">
              <h2 className="text-3xl font-bold">Admin Control Center</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{adminData?.patients.length || 0}</div>
                      <div className="text-slate-500 text-sm">Total Patients</div>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{adminData?.doctors.length || 0}</div>
                      <div className="text-slate-500 text-sm">Active Doctors</div>
                    </div>
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{adminData?.appointments.length || 0}</div>
                      <div className="text-slate-500 text-sm">Appointments</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="!p-0 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 font-bold">Recent Patients</div>
                  <div className="divide-y divide-slate-100">
                    {adminData?.patients.map((p, i) => (
                      <div key={i} className="px-6 py-3 flex justify-between items-center">
                        <span className="font-medium">{p.name}</span>
                        <span className="text-sm text-slate-500">{p.email}</span>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="!p-0 overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 font-bold">Recent Appointments</div>
                  <div className="divide-y divide-slate-100">
                    {adminData?.appointments.map((a, i) => (
                      <div key={i} className="px-6 py-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{a.patient_name}</div>
                          <div className="text-xs text-slate-400">with {a.doctor_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{a.date}</div>
                          <div className="text-xs text-slate-500">{a.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
