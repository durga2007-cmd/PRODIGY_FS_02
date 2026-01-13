import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  LogOut, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Briefcase,
  LayoutDashboard,
  PieChart as PieChartIcon,
  CheckCircle,
  Coffee,
  Clock,
  UserCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import { Employee, User, Department, EmployeeStatus } from './types';
import { getCurrentUser, getEmployees, initializeStorage, login, logout, saveEmployee, deleteEmployee, getEmployeeById } from './services/storageService';
import { Button } from './components/Button';
import { EmployeeModal } from './components/EmployeeModal';
import { AIInsights } from './components/AIInsights';

// --- Login Component ---
const LoginView: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration State
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regDept, setRegDept] = useState(Department.Engineering);
  const [regPosition, setRegPosition] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      onLogin(user);
    } catch (err) {
      setError('Invalid credentials. Try admin/admin or your employee email/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail || !regPassword) return;
    
    setLoading(true);
    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      firstName: regFirstName,
      lastName: regLastName,
      email: regEmail,
      password: regPassword,
      department: regDept,
      position: regPosition || 'Staff',
      status: EmployeeStatus.Active,
      hireDate: new Date().toISOString().split('T')[0],
      salary: 50000, // Default start
      performanceNotes: 'New employee registered via portal.'
    };
    
    saveEmployee(newEmp);
    
    // Auto login
    try {
      const user = await login(regEmail, regPassword);
      onLogin(user);
    } catch (e) {
      setError("Registration successful but login failed.");
      setIsRegistering(false);
    }
    setLoading(false);
  };

  if (isRegistering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
          <div className="text-center">
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Register Employee</h2>
            <p className="mt-2 text-sm text-gray-600">Create your account to access the portal</p>
          </div>
          <form className="mt-8 space-y-4" onSubmit={handleRegister}>
             <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="First Name" required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={regFirstName} onChange={e => setRegFirstName(e.target.value)} />
               <input type="text" placeholder="Last Name" required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={regLastName} onChange={e => setRegLastName(e.target.value)} />
             </div>
             <input type="email" placeholder="Email Address" required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
             <input type="password" placeholder="Password" required className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={regPassword} onChange={e => setRegPassword(e.target.value)} />
             <div className="grid grid-cols-2 gap-4">
                <select className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" value={regDept} onChange={e => setRegDept(e.target.value as Department)}>
                  {Object.values(Department).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" placeholder="Position" className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" value={regPosition} onChange={e => setRegPosition(e.target.value)} />
             </div>
             
             <Button type="submit" className="w-full h-10" isLoading={loading}>Register</Button>
             <div className="text-center">
               <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-blue-600 hover:text-blue-500">Back to Login</button>
             </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
             <Users className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-semibold text-slate-800">HR System</h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Username / Email</label>
            <input 
              type="text" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl text-base bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200" isLoading={loading}>
            Sign In
          </Button>
          <div className="text-center mt-4">
             <button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-blue-600 hover:underline">
               Register new employee?
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Employee Dashboard Component ---
const EmployeeDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [employee, setEmployee] = useState<Employee | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.employeeId) {
      setEmployee(getEmployeeById(user.employeeId));
    }
  }, [user.employeeId]);

  const updateStatus = (status: EmployeeStatus) => {
    if (!employee) return;
    setLoading(true);
    const updated = { ...employee, status };
    saveEmployee(updated);
    setEmployee(updated);
    setTimeout(() => setLoading(false), 500);
  };

  if (!employee) return <div className="p-10 text-center">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
       <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
               </div>
               <span className="font-bold text-lg text-slate-800">Employee Portal</span>
             </div>
             <button onClick={onLogout} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-2">
               <LogOut className="w-4 h-4" /> Sign Out
             </button>
          </div>
       </header>

       <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
             <h1 className="text-2xl font-bold text-slate-900">Welcome back, {employee.firstName}</h1>
             <p className="text-slate-500">Manage your daily status and view your profile.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {/* Status Card */}
             <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
                   <Clock className="w-5 h-5 text-blue-500" /> Today's Status
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-6 items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-100 mb-8">
                   <div className="text-center">
                      <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Current Status</p>
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold
                        ${employee.status === EmployeeStatus.Active ? 'bg-emerald-100 text-emerald-700' : 
                          employee.status === EmployeeStatus.OnLeave ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                        {employee.status}
                      </span>
                   </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button 
                     onClick={() => updateStatus(EmployeeStatus.Active)}
                     disabled={loading || employee.status === EmployeeStatus.Active}
                     className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                       ${employee.status === EmployeeStatus.Active 
                         ? 'border-emerald-500 bg-emerald-50 text-emerald-700 opacity-50 cursor-default' 
                         : 'border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'}`}
                   >
                      <CheckCircle className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold">Mark Present</div>
                        <div className="text-xs opacity-75">Check-in for work</div>
                      </div>
                   </button>

                   <button 
                     onClick={() => updateStatus(EmployeeStatus.OnLeave)}
                     disabled={loading || employee.status === EmployeeStatus.OnLeave}
                     className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all
                       ${employee.status === EmployeeStatus.OnLeave 
                         ? 'border-amber-500 bg-amber-50 text-amber-700 opacity-50 cursor-default' 
                         : 'border-slate-200 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700'}`}
                   >
                      <Coffee className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold">Request Leave</div>
                        <div className="text-xs opacity-75">Mark as on leave</div>
                      </div>
                   </button>
                </div>
             </div>

             {/* Profile Card */}
             <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center mb-6">
                   <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 text-2xl font-bold mb-3 border-4 border-white shadow-lg">
                      {employee.firstName[0]}{employee.lastName[0]}
                   </div>
                   <h3 className="font-bold text-slate-900">{employee.firstName} {employee.lastName}</h3>
                   <p className="text-sm text-slate-500">{employee.position}</p>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-gray-100">
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Department</span>
                      <span className="text-sm font-medium text-slate-800">{employee.department}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Email</span>
                      <span className="text-sm font-medium text-slate-800 truncate max-w-[150px]">{employee.email}</span>
                   </div>
                   <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Hired</span>
                      <span className="text-sm font-medium text-slate-800">{employee.hireDate}</span>
                   </div>
                </div>
             </div>
          </div>
       </main>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [view, setView] = useState<'dashboard' | 'employees'>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeForAI, setSelectedEmployeeForAI] = useState<Employee | null>(null);

  useEffect(() => {
    initializeStorage();
    const currentUser = getCurrentUser();
    if (currentUser) setUser(currentUser);
    refreshData();
  }, []);

  const refreshData = () => {
    setEmployees(getEmployees());
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const handleSaveEmployee = (emp: Employee) => {
    saveEmployee(emp);
    refreshData();
    setIsModalOpen(false);
    setEditingEmployee(undefined);
  };

  const handleDeleteEmployee = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
      refreshData();
      if (selectedEmployeeForAI?.id === id) setSelectedEmployeeForAI(null);
      return true;
    }
    return false;
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingEmployee(undefined);
    setIsModalOpen(true);
  };

  // Derived Stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === EmployeeStatus.Active).length;
  const deptData = Object.values(Department).map(dept => ({
    name: dept,
    count: employees.filter(e => e.department === dept).length
  }));
  const statusData = [
    { name: 'Active', value: activeEmployees, color: '#3b82f6' }, // Blue
    { name: 'On Leave', value: employees.filter(e => e.status === EmployeeStatus.OnLeave).length, color: '#f59e0b' }, // Amber
    { name: 'Probation', value: employees.filter(e => e.status === EmployeeStatus.Probation).length, color: '#6366f1' }, // Indigo
    { name: 'Terminated', value: employees.filter(e => e.status === EmployeeStatus.Terminated).length, color: '#ef4444' }, // Red
  ].filter(d => d.value > 0);

  const filteredEmployees = employees.filter(e => 
    e.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return <LoginView onLogin={setUser} />;
  }

  // Render Employee Dashboard if role is employee
  if (user.role === 'employee') {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />;
  }

  // Render Admin Dashboard
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col z-20 transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shrink-0">
             <span className="font-bold">HR</span>
          </div>
          <span className="ml-3 font-semibold text-slate-800 text-lg hidden lg:block tracking-tight">Employee Sys</span>
        </div>
        
        <nav className="flex-1 px-3 py-6 space-y-1">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
              view === 'dashboard' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-slate-500 hover:bg-gray-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-6 h-6 lg:w-5 lg:h-5 ${view === 'dashboard' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="hidden lg:block">Overview</span>
          </button>
          <button 
            onClick={() => setView('employees')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
              view === 'employees' 
              ? 'bg-blue-50 text-blue-700 font-medium' 
              : 'text-slate-500 hover:bg-gray-100 hover:text-slate-900'
            }`}
          >
            <Briefcase className={`w-6 h-6 lg:w-5 lg:h-5 ${view === 'employees' ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span className="hidden lg:block">Employees</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 w-full text-slate-500 hover:text-slate-800 transition-colors">
             <LogOut className="w-5 h-5" />
             <span className="hidden lg:block text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50 relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 lg:px-8">
           <h2 className="text-xl font-semibold text-slate-800">
             {view === 'dashboard' ? 'Overview' : 'Employee Directory'}
           </h2>
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">AD</div>
                 <div className="text-sm font-medium text-slate-700 hidden sm:block">Admin User</div>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          {view === 'dashboard' ? (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Employees", val: totalEmployees, icon: Users, color: "bg-blue-600" },
                  { label: "Active Status", val: activeEmployees, icon: TrendingUp, color: "bg-emerald-500" },
                  { label: "Departments", val: deptData.filter(d => d.count > 0).length, icon: Briefcase, color: "bg-violet-500" },
                  { label: "Avg Salary (k)", val: `$${Math.round(employees.reduce((acc, curr) => acc + curr.salary, 0) / (employees.length || 1) / 1000)}`, icon: PieChartIcon, color: "bg-amber-500" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${stat.color} text-white shadow-md`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stat.val}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
                   <h3 className="text-base font-semibold text-slate-800 mb-6">Department Distribution</h3>
                   <ResponsiveContainer width="100%" height="90%">
                      <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-96">
                   <h3 className="text-base font-semibold text-slate-800 mb-6">Status Breakdown</h3>
                   <ResponsiveContainer width="100%" height="90%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="flex justify-center gap-4 text-xs text-slate-500 -mt-8">
                      {statusData.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}} />
                          {d.name}
                        </div>
                      ))}
                   </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="max-w-7xl mx-auto h-full flex flex-col lg:flex-row gap-6">
              
              {/* Left Side: Table */}
              <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search directory..." 
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-gray-50 focus:bg-white transition-colors"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button onClick={openCreateModal} icon={<Plus className="w-4 h-4"/>} className="rounded-xl shadow-md shadow-blue-100">
                    Add Employee
                  </Button>
                </div>

                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Role</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Dept</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredEmployees.map(emp => (
                        <tr 
                          key={emp.id} 
                          onClick={() => setSelectedEmployeeForAI(emp)}
                          className={`hover:bg-blue-50/50 cursor-pointer transition-colors group ${selectedEmployeeForAI?.id === emp.id ? 'bg-blue-50/80' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold text-xs border border-blue-200 shadow-sm">
                                {emp.firstName[0]}{emp.lastName[0]}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">{emp.firstName} {emp.lastName}</div>
                                <div className="text-xs text-slate-500">{emp.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-slate-600">{emp.position}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-medium rounded-full border 
                              ${emp.status === EmployeeStatus.Active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                emp.status === EmployeeStatus.OnLeave ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 hidden lg:table-cell">
                            {emp.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEditModal(emp); }}
                                className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(emp.id); }}
                                className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredEmployees.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-20 text-center text-slate-400">
                             <div className="flex flex-col items-center">
                                <Search className="w-10 h-10 mb-3 opacity-20" />
                                <p>No employees found matching your criteria.</p>
                             </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Side: Assistant Panel */}
              <div className="w-full lg:w-[400px] flex-shrink-0 h-[600px] lg:h-auto">
                 <div className="h-full">
                    <AIInsights employees={employees} selectedEmployee={selectedEmployeeForAI} />
                 </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <EmployeeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEmployee}
        onDelete={(id) => {
          if (handleDeleteEmployee(id)) {
            setIsModalOpen(false);
          }
        }}
        initialData={editingEmployee}
      />
    </div>
  );
}