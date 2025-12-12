
export enum UserRole {
  PARENT = 'PARENT',
  COACH = 'COACH'
}

export type Branch = 'ACADEMY' | 'COACHING' | 'TECH_CENTRE';

export type StatGroup = 'Technical' | 'Tactical' | 'Physical' | 'Psychological';

export interface Stat {
  name: string;
  group: StatGroup;
  value: number; // 1-5
  fullMark: number; // 5
}

export interface AttendanceRecord {
  attendanceScore: number; // 1-5
  commitmentScore: number; // 1-5
  note: string;
}

export interface RatingsSummary {
  applicationScore: number; // 1-5
  behaviourScore: number; // 1-5
  coachComment: string; // Top comment
}

export interface Improvements {
  keyArea: string;
  buildOnArea: string;
}

export interface Target {
  id: string;
  description: string;
  achieved: boolean;
}

export interface ReportCard {
  id: string;
  season: string;
  quarter: string; // e.g. "Winter Term"
  date: string;
  authorCoachId?: string; // ID of the coach who wrote it
  authorCoachName?: string; // Name snapshot
  
  // New Structure
  attendance: AttendanceRecord;
  stats: Stat[]; 
  strengths: string[]; 
  improvements: Improvements;
  ratingsSummary: RatingsSummary;
  finalSummary: string; // The main paragraph
  coachFooterNote?: string; // New: Little note at the bottom
  targets: Target[];
  
  // Computed helpers
  overallRating: number; // Stored as 1-5 (can be decimal)
}

export interface Team {
  id: string;
  name: string;
}

export interface Player {
  id: string;
  name: string;
  branch: Branch;
  teamId?: string; // Only for Academy
  position: string;
  jerseyNumber?: number; // Only for Academy
  imageUrl: string;
  accessCode: string;
  reportCards: ReportCard[];
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface Coach extends User {
  role: UserRole.COACH;
  email: string;
  instagramHandle?: string;
  password?: string; 
  assignedTeams: string[]; 
  isAdmin: boolean;
  imageUrl?: string;
}

export interface Feedback {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  date: string;
  type: 'positive' | 'constructive';
}
