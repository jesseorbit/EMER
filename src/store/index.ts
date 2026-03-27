import { create } from 'zustand';
import type { User, AttendanceRecord, PointTransaction } from '../types';

interface AppState {
  // 유저
  user: User | null;
  setUser: (user: User) => void;

  // 출석
  monthlyRecords: AttendanceRecord[];
  setMonthlyRecords: (records: AttendanceRecord[]) => void;
  addAttendance: (record: AttendanceRecord) => void;

  // 포인트
  pointHistory: PointTransaction[];
  setPointHistory: (history: PointTransaction[]) => void;
  addPoints: (transaction: PointTransaction) => void;

  // 로딩
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  monthlyRecords: [],
  setMonthlyRecords: (records) => set({ monthlyRecords: records }),
  addAttendance: (record) =>
    set((state) => ({ monthlyRecords: [...state.monthlyRecords, record] })),

  pointHistory: [],
  setPointHistory: (history) => set({ pointHistory: history }),
  addPoints: (transaction) =>
    set((state) => ({
      pointHistory: [transaction, ...state.pointHistory],
      user: state.user
        ? { ...state.user, totalPoints: state.user.totalPoints + transaction.amount }
        : null,
    })),

  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));
