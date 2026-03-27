import { api } from './api';
import type { AttendanceRecord, MonthlyAttendance } from '../types';

export const attendanceService = {
  async checkIn(userId: string): Promise<{ record: AttendanceRecord }> {
    return api.post('/attendance/check-in', { userId });
  },

  async getMonthly(userId: string, year: number, month: number): Promise<MonthlyAttendance> {
    return api.get(`/attendance/${userId}?year=${year}&month=${month}`);
  },
};
