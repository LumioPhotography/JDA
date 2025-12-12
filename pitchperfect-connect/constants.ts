import { Player, UserRole, StatGroup, Coach, Team, Branch } from './types';

export const TEAM_LOGO_URL = "https://cdn-icons-png.flaticon.com/512/1665/1665670.png"; 

// Helper to create stats (Scale 1-5)
const createStats = (
  technical: number[], 
  tactical: number[], 
  physical: number[], 
  psychological: number[]
) => {
  const mkStat = (name: string, group: StatGroup, val: number) => ({ name, group, value: val, fullMark: 5 });
  
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

export const MOCK_TEAMS: Team[] = [
  { id: 'U10 Reds', name: 'U10 Reds' },
  { id: 'U10 Blues', name: 'U10 Blues' }
];

export const MOCK_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Luke Skehill',
    branch: 'ACADEMY',
    teamId: 'U10 Reds',
    position: 'Midfield',
    jerseyNumber: 7,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luke&backgroundColor=b6e3f4',
    accessCode: '1234',
    reportCards: [
      {
        id: 'rc_2526_q2',
        season: '2025/26',
        quarter: 'Winter Term',
        date: '2025-12-12',
        overallRating: 4.2,
        attendance: {
          attendanceScore: 5,
          commitmentScore: 4,
          note: "Excellent attendance record."
        },
        stats: createStats(
          [4, 4, 3, 5, 4, 4, 3], // Technical
          [4, 4, 4, 3, 4],       // Tactical
          [5, 4, 3, 5],          // Physical
          [5, 5, 5, 4, 4, 5]     // Psychological
        ),
        strengths: ["Work Rate", "Passing Range", "Speed"],
        improvements: {
           keyArea: "Scanning before receiving the ball.",
           buildOnArea: "Using left foot for crossing."
        },
        ratingsSummary: {
          applicationScore: 5,
          behaviourScore: 5,
          coachComment: "A model student."
        },
        finalSummary: "Luke has had a fantastic term. His energy on the pitch is infectious and he is becoming a real leader for the U-8s. He needs to continue working on checking his shoulder before receiving.",
        coachFooterNote: "Keep up the great work over the holidays, Luke!",
        targets: [
          { id: 'tg1', description: 'Score 5 goals with left foot', achieved: false },
          { id: 'tg2', description: 'Lead the warm up', achieved: true }
        ]
      }
    ]
  },
  {
    id: 'p2',
    name: 'Mason Mount-Jr',
    branch: 'ACADEMY',
    teamId: 'U10 Blues',
    position: 'Forward',
    jerseyNumber: 10,
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason&backgroundColor=c0aede',
    accessCode: '7777',
    reportCards: []
  },
  {
    id: 'p3',
    name: 'Sarah Coachable',
    branch: 'COACHING',
    position: 'Goalkeeper',
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ffdfbf',
    accessCode: '1111',
    reportCards: []
  }
];

export const MOCK_COACHES: Coach[] = [
  {
    id: 'coach_admin',
    name: 'Head Coach',
    role: UserRole.COACH,
    email: 'admin@example.com',
    instagramHandle: 'academy_official',
    password: 'admin',
    isAdmin: true,
    assignedTeams: [], // Admin sees all
    imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Coach&backgroundColor=14b8a6'
  }
];