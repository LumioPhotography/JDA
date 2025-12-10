import { Player, UserRole, User, ReportCard, StatGroup } from './types';

// Helper to create stats easily
const createStats = (
  attacking: number[], 
  defending: number[], 
  physical: number[], 
  mental: number[]
) => {
  const mkStat = (name: string, group: StatGroup, val: number) => ({ name, group, value: val, fullMark: 100 });
  
  return [
    // Attacking
    mkStat('Shooting', 'Attacking', attacking[0]),
    mkStat('Passing', 'Attacking', attacking[1]),
    mkStat('Dribbling', 'Attacking', attacking[2]),
    
    // Defending
    mkStat('Tackling', 'Defending', defending[0]),
    mkStat('Positioning', 'Defending', defending[1]),
    mkStat('Interceptions', 'Defending', defending[2]),

    // Physical
    mkStat('Pace', 'Physical', physical[0]),
    mkStat('Strength', 'Physical', physical[1]),
    mkStat('Stamina', 'Physical', physical[2]),

    // Mental
    mkStat('Attitude', 'Mental', mental[0]),
    mkStat('Work Rate', 'Mental', mental[1]),
    mkStat('Teamwork', 'Mental', mental[2]),
  ];
};

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Luke Skehill',
    position: 'Midfield',
    jerseyNumber: 7,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luke&backgroundColor=b6e3f4', // Placeholder avatar
    ageGroup: 'U-8 Teals',
    accessCode: '1234',
    reportCards: [
      {
        id: 'rc_2526_q2',
        season: '2025/26',
        quarter: 'Q2',
        date: '2025-12-12',
        overallRating: 85,
        stats: createStats([88, 82, 85], [60, 65, 70], [90, 75, 88], [95, 92, 90]),
        summary: "Luke has had a fantastic quarter. His energy on the pitch is infectious and he is becoming a real leader for the U-8s.",
        strengths: ["Work Rate", "Passing Range", "Speed"],
        improvements: ["Defensive positioning", "Using left foot"],
        coachNotes: "A pleasure to coach. Always listening and trying to improve."
      },
      {
        id: 'rc_2526_q1',
        season: '2025/26',
        quarter: 'Q1',
        date: '2025-09-20',
        overallRating: 80,
        stats: createStats([80, 75, 80], [55, 60, 60], [85, 70, 80], [90, 85, 85]),
        summary: "Great start to the season for Luke. He is showing great promise in attacking drills.",
        strengths: ["Speed", "Dribbling", "Enthusiasm"],
        improvements: ["Passing accuracy", "Tackling timing"],
        coachNotes: "Good start. Needs to focus a bit more during tactical talks."
      }
    ]
  },
  {
    id: 'p2',
    name: 'Mason Mount-Jr',
    position: 'Forward',
    jerseyNumber: 10,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason&backgroundColor=c0aede',
    ageGroup: 'U-8 Teals',
    accessCode: '7777',
    reportCards: [
      {
        id: 'rc_2526_q1',
        season: '2025/26',
        quarter: 'Q1',
        date: '2025-09-15',
        overallRating: 78,
        stats: createStats([85, 70, 75], [40, 50, 45], [80, 65, 70], [80, 85, 80]),
        summary: "Mason loves to attack. We are working on his defensive transition this season.",
        strengths: ["Shooting", "Pace", "Confidence"],
        improvements: ["Tracking back", "Passing vision"],
        coachNotes: "Loves scoring goals. Needs to share the ball more."
      }
    ]
  }
];

export const COACH_USER: User = {
  id: 'coach1',
  name: 'Coach JDA',
  role: UserRole.COACH
};