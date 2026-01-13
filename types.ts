import React from 'react';

export enum Department {
  Engineering = 'Engineering',
  Sales = 'Sales',
  Marketing = 'Marketing',
  HR = 'HR',
  Executive = 'Executive',
  Product = 'Product'
}

export enum EmployeeStatus {
  Active = 'Active',
  OnLeave = 'On Leave',
  Terminated = 'Terminated',
  Probation = 'Probation'
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: Department;
  status: EmployeeStatus;
  hireDate: string;
  salary: number;
  avatarUrl?: string;
  performanceNotes?: string;
  password?: string;
}

export interface User {
  username: string;
  role: 'admin' | 'employee';
  token: string;
  employeeId?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type VideoAspectRatio = '16:9' | '9:16';