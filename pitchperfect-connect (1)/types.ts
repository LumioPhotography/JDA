export enum UserRole {
  PARENT = 'PARENT',
  COACH = 'COACH'
}

export type StatGroup = 'Technical' | 'Tactical' | 'Physical' | 'Psychological';

export interface Stat {
  name: string;
  group: StatGroup;
  value: number; // 0-100
  fullMark: number;
}

export interface AttendanceRecord {
  attendanceScore: number; // 0-10
  commitmentScore: number; // 0-10
  note: string;
}

export interface RatingsSummary {
  applicationScore: number; // 0-10
  behaviourScore: number; // 0-10
  coachComment: string;
}

export interface Improvements {
  keyArea: string;
  buildOnArea: string;
}

export interface ReportCard {
  id: string;
  season: string;
  quarter: string;
  date: string;
  
  // New Structure
  attendance: AttendanceRecord;
  stats: Stat[]; // Covers Technical, Tactical, Physical, Psychological
  strengths: string[]; // 3 items
  improvements: Improvements;
  ratingsSummary: RatingsSummary;
  finalSummary: string; // The main coach paragraph
  
  // Legacy/Computed helpers
  overallRating: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  imageUrl: string;
  accessCode: string;
  reportCards: ReportCard[];
  ageGroup: string; // This acts as the "Team" identifier
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
  password?: string; // Simple auth
  assignedTeams: string[]; // e.g. ["U-8 Teals", "U-10 Reds"]
  isAdmin: boolean;
  imageUrl?: string;
}