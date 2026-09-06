"use client";
import { createContext, useContext } from 'react';

export const StudentDashboardContext = createContext({
  dashboardData: null,
  fetchDashboardData: () => {}
});

export const useStudentDashboard = () => useContext(StudentDashboardContext);
