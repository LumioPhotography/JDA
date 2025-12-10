import { Player, UserRole, User, StatGroup, Coach } from './types';

export const TEAM_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/1665/1665670.png"; // REPLACE THIS WITH YOUR IMAGE URL

// Helper to create stats
const createStats = (
  technical: number[], 
  tactical: number[], 
  physical: number[], 
  psychological: number[]
) => {
  const mkStat = (name: string, group: StatGroup, val: number) => ({ name, group, value: val, fullMark: 100 });
  
  return [
    // Technical (7 items)
    mkStat('Ball Mastery', 'Technical', technical[0]),
    mkStat('1v1 Attacking', 'Technical', technical[1]),
    mkStat('1v1 Defending', 'Technical', technical[2]),
    mkStat('First Touch', 'Technical', technical[3]),
    mkStat('Ball Striking', 'Technical', technical[4]),
    mkStat('Passing Technique', 'Technical', technical[5]),
    mkStat('Non-Dominant Foot', 'Technical', technical[6]),
    
    // Tactical (5 items)
    mkStat('Scanning/Awareness', 'Tactical', tactical[0]),
    mkStat('Movement off Ball', 'Tactical', tactical[1]),
    mkStat('Pos. In Possession', 'Tactical', tactical[2]),
    mkStat('Pos. Out Possession', 'Tactical', tactical[3]),
    mkStat('Decision Making', 'Tactical', tactical[4]),

    // Physical (4 items)
    mkStat('Speed/Acceleration', 'Physical', physical[0]),
    mkStat('Agility & Balance', 'Physical', physical[1]),
    mkStat('Strength', 'Physical', physical[2]),
    mkStat('Endurance', 'Physical', physical[3]),

    // Psychological (6 items)
    mkStat('Focus', 'Psychological', psychological[0]),
    mkStat('Confidence', 'Psychological', psychological[1]),
    mkStat('Coachability', 'Psychological', psychological[2]),
    mkStat('Resilience', 'Psychological', psychological[3]),
    mkStat('Teamwork', 'Psychological', psychological[4]),
    mkStat('Encouraging Others', 'Psychological', psychological[5]),
  ];
};

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Luke Skehill',
    position: 'Midfield',
    jerseyNumber: 7,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luke&backgroundColor=b6e3f4',
    ageGroup: 'U-8 Teals',
    accessCode: '1234',
    reportCards: [
      {
        id: 'rc_2526_q2',
        season: '2025/26',
        quarter: 'Term 2',
        date: '2025-12-12',
        overallRating: 88,
        attendance: {
          attendanceScore: 9.5,
          commitmentScore: 9,
          note: "Excellent attendance record."
        },
        stats: createStats(
          [85, 80, 75, 88, 82, 85, 70], // Technical
          [80, 85, 82, 78, 80],         // Tactical
          [90, 88, 75, 92],             // Physical
          [95, 90, 95, 85, 90, 92]      // Psychological
        ),
        strengths: ["Work Rate", "Passing Range", "Speed"],
        improvements: {
           keyArea: "Scanning before receiving the ball.",
           buildOnArea: "Using left foot for crossing."
        },
        ratingsSummary: {
          applicationScore: 9,
          behaviourScore: 10,
          coachComment: "A model student."
        },
        finalSummary: "Luke has had a fantastic term. His energy on the pitch is infectious and he is becoming a real leader for the U-8s. He needs to continue working on checking his shoulder before receiving."
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
    reportCards: []
  }
];

export const MOCK_COACHES: Coach[] = [
  {
    id: 'coach_admin',
    name: 'Head Coach JDA',
    role: UserRole.COACH,
    email: 'headcoach@jda.com',
    instagramHandle: 'jda_academy',
    password: 'admin',
    isAdmin: true,
    assignedTeams: [], // Admin sees all
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JDA&backgroundColor=14b8a6'
  }
];