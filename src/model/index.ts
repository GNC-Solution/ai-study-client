
export type LoginResponse = {
  success: boolean;
  message: string;
  user: UserType | null;
};

export type ServerResponse = {
  success: boolean;
  message: string
}

export type UserType = {
  id: number;
  name: string;
};

export type DailyResponse = {
  success: boolean;
  message: string;
  dailyStudyRatio: Array<DailyType>;
}

export type DailyType = {
  userName: string;
  date: string;
  dailyStudyHour: number;
  dailyPauseHour: number;
  phoneUsageCount: number;
  pauseCount: number;
}