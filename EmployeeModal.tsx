import React, { useState, useEffect } from 'react';
import { Department, Employee, EmployeeStatus } from '../types';
import { Button } from './Button';
import { X, Trash2 } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  onDelete?: (id: string) => void;
  initialData?: Employee;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: Department.Engineering,
    status: EmployeeStatus.Active,
    salary: 0,
    hireDate: new Date().toISOString().split('T')[0],
    performanceNotes: '',
    password: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        position: '',
        department: Department.Engineering,
        status: EmployeeStatus.Active,
        salary: 0,
        hireDate: new Date().toISOString().split('T')[0],
        performanceNotes: '',
        password: ''
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    const employee: Employee = {
      id: initialData?.id || `emp_${Date.now()}`,
      ...formData as Omit<Employee, 'id'>
    };
    onSave(employee);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} aria-hidden="true"></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg leading-6 font-medium text-slate-900" id="modal-title">
                {initialData ? 'Edit Employee Details' : 'Add New Employee'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form id="employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm font-medium text-slate-700">First name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="last-name" className="block text-sm font-medium text-slate-700">Last name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                 <label htmlFor="hire-date" className="block text-sm font-medium text-slate-700">Hire Date</label>
                 <input 
                    type="date"
                    required
                    value={formData.hireDate}
                    onChange={e => setFormData({...formData, hireDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                 />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({...formData, department: e.target.value as Department})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {Object.values(Department).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="position" className="block text-sm font-medium text-slate-700">Position</label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={e => setFormData({...formData, position: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as EmployeeStatus})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {Object.values(EmployeeStatus).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="salary" className="block text-sm font-medium text-slate-700">Annual Salary ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.salary}
                  onChange={e => setFormData({...formData, salary: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                   Password {initialData && <span className="text-gray-400 font-normal">(Leave blank to keep unchanged)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={initialData ? "••••••••" : "Create a password"}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Performance Notes (used by AI)</label>
                <textarea
                  rows={3}
                  value={formData.performanceNotes}
                  onChange={e => setFormData({...formData, performanceNotes: e.target.value})}
                  className="mt-1 block w-full rounded-md border-slate-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter brief notes about strengths, weaknesses, or recent achievements..."
                />
              </div>
            </form>
          </div>
          <div className="bg-slate-50 px-4 py-3 sm:px-6 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            <div className="flex flex-col sm:flex-row-reverse gap-3 w-full sm:w-auto">
                <Button form="employee-form" type="submit" className="w-full sm:w-auto">
                {initialData ? 'Update' : 'Create'}
                </Button>
                <Button variant="secondary" onClick={onClose} className="w-full sm:w-auto">
                Cancel
                </Button>
            </div>
            
            {initialData && onDelete && (
                <Button 
                    variant="danger" 
                    onClick={() => onDelete(initialData.id)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                    type="button"
                >
                    <Trash2 className="w-4 h-4" /> Delete Employee
                </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};