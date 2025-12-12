import { Player, Coach, Team } from '../types';
import { supabase } from './supabaseClient';
import { MOCK_PLAYERS, MOCK_COACHES, MOCK_TEAMS, TEAM_LOGO_URL as DEFAULT_LOGO } from '../constants';

/**
 * StorageService (Supabase Edition)
 */
export const storage = {
  
  // --- Real-Time Sync ---
  subscribeToUpdates: (onUpdate: () => void) => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coaches' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => onUpdate())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => onUpdate())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // --- Players ---
  fetchPlayers: async (): Promise<Player[]> => {
    try {
      const { data, error } = await supabase.from('players').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data.map((row: any) => row.data as Player);
      return []; 
    } catch (e) {
      console.warn("Supabase load error (Players)", e);
      return [];
    }
  },

  savePlayer: async (player: Player) => {
    try {
      const { error } = await supabase.from('players').upsert({ id: player.id, data: player }); 
      if (error) throw error;
    } catch (e: any) {
      console.error("Error saving player:", e);
      alert(`Failed to save to cloud: ${e.message}`);
    }
  },

  deletePlayer: async (playerId: string) => {
    try {
        const { error } = await supabase.from('players').delete().eq('id', playerId);
        if (error) throw error;
    } catch (e: any) {
        console.error("Error deleting player:", e);
        alert(`Failed to delete: ${e.message}`);
    }
  },

  // --- Coaches ---
  fetchCoaches: async (): Promise<Coach[]> => {
    try {
      const { data, error } = await supabase.from('coaches').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data.map((row: any) => row.data as Coach);
      return []; 
    } catch (e) {
      console.warn("Supabase load error (Coaches)", e);
      return [];
    }
  },

  saveCoach: async (coach: Coach) => {
    try {
      const { error } = await supabase.from('coaches').upsert({ id: coach.id, data: coach });
      if (error) throw error;
    } catch (e) {
      console.error("Error saving coach:", e);
    }
  },

  // --- Teams ---
  fetchTeams: async (): Promise<Team[]> => {
    try {
      const { data, error } = await supabase.from('teams').select('*');
      if (error) throw error;
      if (data && data.length > 0) return data.map((row: any) => row.data as Team);
      return []; 
    } catch (e) {
        console.warn("Supabase load error (Teams)", e);
        return [];
    }
  },

  saveTeam: async (team: Team) => {
    try {
        const { error } = await supabase.from('teams').upsert({ id: team.id, data: team });
        if (error) throw error;
    } catch (e) {
        console.error("Error saving team", e);
    }
  },

  // --- Team Logo ---
  fetchTeamLogo: async (): Promise<string> => {
    try {
      const { data, error } = await supabase.from('settings').select('value').eq('key', 'team_logo').single();
      if (data) return data.value;
      return DEFAULT_LOGO;
    } catch (e) {
      return DEFAULT_LOGO;
    }
  },

  saveTeamLogo: async (logoUrl: string) => {
    try {
      await supabase.from('settings').upsert({ key: 'team_logo', value: logoUrl });
    } catch (e) {
      console.error("Error saving logo:", e);
    }
  }
};