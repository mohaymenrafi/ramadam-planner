import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ActivityStatus = 'yes' | 'no' | 'pending'

// Ramadan last 10 nights: days 21-30
export const RAMADAN_DAYS = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

// English dates corresponding to Ramadan 21-30 in 2026
export const DAY_DATES: Record<number, string> = {
  21: '10 মার্চ',
  22: '11 মার্চ',
  23: '12 মার্চ',
  24: '13 মার্চ',
  25: '14 মার্চ',
  26: '15 মার্চ',
  27: '16 মার্চ',
  28: '17 মার্চ',
  29: '18 মার্চ',
  30: '19 মার্চ',
}

export const ACTIVITIES = [
  'তারাবীর পর ৮ রাকাত আলাদা নামাজ',
  'জামাতে না পড়ে থাকলে ৩ রাকাত বিতরের নামাজ',
  'কিছু টাকা সাদাক্বা করা',
  'কুরআন তিলাওয়াত',
  '৩ বার সূরা ফাতিহা',
  'সূরা বাক্বারার শেষ দুই আয়াত',
  '৯ বার সূরা ইখলাস',
  '১০০ বার সুবহানাল্লাহ',
  '১০ বার দরুদ শরীফ',
  '১০০ বার ইস্তিগফার (আস্তাগফিরুল্লাহ)',
  "লাইলাতুল ক্বদরের দুয়া: আল্লাহুম্মা ইন্নাকা 'আফুউন, তুহিব্বুল 'আফওয়া, ফা'ফু 'আন্নি",
  'ব্যক্তিগত দুয়া',
  'সেহেরি খাওয়া',
]

interface TrackerState {
  // Key: "day-activityIdx" e.g. "21-0"
  statuses: Record<string, ActivityStatus>
  selectedDay: number
  setStatus: (day: number, activityIdx: number, status: ActivityStatus) => void
  setSelectedDay: (day: number) => void
  getCompletedCount: (day: number) => number
  getTotalCount: () => number
  getOverallProgress: () => number
}

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set, get) => ({
      statuses: {},
      selectedDay: 21,

      setStatus: (day, activityIdx, status) => {
        set((state) => ({
          statuses: {
            ...state.statuses,
            [`${day}-${activityIdx}`]: status,
          },
        }))
      },

      setSelectedDay: (day) => set({ selectedDay: day }),

      getCompletedCount: (day) => {
        const { statuses } = get()
        return ACTIVITIES.reduce((count, _, idx) => {
          if (statuses[`${day}-${idx}`] === 'yes') return count + 1
          return count
        }, 0)
      },

      getTotalCount: () => ACTIVITIES.length,

      getOverallProgress: () => {
        const { statuses } = get()
        const totalCells = RAMADAN_DAYS.length * ACTIVITIES.length
        const completed = Object.values(statuses).filter((s) => s === 'yes').length
        return totalCells > 0 ? Math.round((completed / totalCells) * 100) : 0
      },
    }),
    {
      name: 'ramadan-tracker-2026',
    }
  )
)
