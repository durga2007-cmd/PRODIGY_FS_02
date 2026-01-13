import { Employee, User } from "../types";
import { MOCK_EMPLOYEES, STORAGE_KEY, AUTH_TOKEN_KEY } from "../constants";

// Initialize storage with mock data if empty
export const initializeStorage = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (!existing) {
    // Add default passwords to mock data for testing
    const mockedWithPasswords = MOCK_EMPLOYEES.map(e => ({...e, password: 'password'}));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockedWithPasswords));
  }
};

export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveEmployee = (employee: Employee): Employee => {
  const employees = getEmployees();
  const index = employees.findIndex(e => e.id === employee.id);
  
  if (index >= 0) {
    // Update
    employees[index] = employee;
  } else {
    // Create
    employees.push(employee);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  return employee;
};

export const deleteEmployee = (id: string): void => {
  const employees = getEmployees();
  const filtered = employees.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const getEmployeeById = (id: string): Employee | undefined => {
  const employees = getEmployees();
  return employees.find(e => e.id === id);
};

// Auth Mock
export const login = (username: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Admin Login
      if (username === 'admin' && password === 'admin') {
        const user: User = { username, role: 'admin', token: 'mock-jwt-token-admin' };
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(user));
        resolve(user);
        return;
      }

      // Employee Login
      const employees = getEmployees();
      const employee = employees.find(e => e.email === username && e.password === password);
      
      if (employee) {
        const user: User = { 
          username: employee.email, 
          role: 'employee', 
          token: `mock-jwt-token-${employee.id}`,
          employeeId: employee.id 
        };
        localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify(user));
        resolve(user);
        return;
      }

      reject(new Error('Invalid credentials'));
    }, 600);
  });
};

export const logout = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(AUTH_TOKEN_KEY);
  return data ? JSON.parse(data) : null;
};