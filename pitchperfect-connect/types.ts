export enum UserRole {
  PARENT = 'PARENT',
  COACH = 'COACH'
}

export type StatGroup = 'Attacking' | 'Defending' | 'Physical' | 'Mental';

export interface Stat {
  name: string;
  group: StatGroup;
  value: number; // 0-100
  fullMark: number;
}

export interface ReportCard {
  id: string;
  season: string; // e.g., "2025/26"
  quarter: string; // e.g., "Q1", "Q2"
  date: string;
  stats: Stat[];
  summary: string;
  strengths: string[];
  improvements: string[];
  coachNotes: string;
  overallRating: number;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  imageUrl: string;
  accessCode: string; // Simulating a password for parents
  reportCards: ReportCard[];
  ageGroup: string;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  linkedPlayerId?: string; // If parent
}