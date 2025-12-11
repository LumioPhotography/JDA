import { Player, Coach } from '../types';
import { supabase } from './supabaseClient';
import { MOCK_PLAYERS, MOCK_COACHES, TEAM_LOGO_URL as DEFAULT_LOGO } from '../constants';

/**
 * StorageService (Supabase Edition)
 * 
 * Instead of saving the whole array at once, we now save individual records
 * to ensure multiple users don't overwrite each other's work.
 */
export const storage = {
  
  // --- Players ---
  
  fetchPlayers: async (): Promise<Player[]> => {
    try {
      const { data, error } = await supabase.from('players').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Map the database rows back to Player objects
        return data.map((row: any) => row.data as Player);
      }
      return []; // Return empty if DB is empty (App will handle defaults)
    } catch (e) {
      console.error("Supabase load error:", e);
      return [];
    }
  },

  /**
   * Saves or Updates a SINGLE player.
   * This is efficient and prevents overwriting other players.
   */
  savePlayer: async (player: Player) => {
    try {
      const { error } = await supabase
        .from('players')
        .upsert({ id: player.id, data: player }); // 'data' column holds the JSON
      
      if (error) throw error;
      console.log(`Saved player: ${player.name}`);
    } catch (e) {
      console.error("Error saving player:", e);
      alert("Failed to save to cloud. Check console.");
    }
  },

  // --- Coaches ---

  fetchCoaches: async (): Promise<Coach[]> => {
    try {
      const { data, error } = await supabase.from('coaches').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map((row: any) => row.data as Coach);
      }
      return []; 
    } catch (e) {
      console.error("Error loading coaches:", e);
      return [];
    }
  },

  saveCoach: async (coach: Coach) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .upsert({ id: coach.id, data: coach });
      
      if (error) throw error;
    } catch (e) {
      console.error("Error saving coach:", e);
    }
  },

  // --- Team Logo ---

  fetchTeamLogo: async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'team_logo')
        .single();
      
      if (data) return data.value;
      return DEFAULT_LOGO;
    } catch (e) {
      return DEFAULT_LOGO;
    }
  },

  saveTeamLogo: async (logoUrl: string) => {
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'team_logo', value: logoUrl });
    } catch (e) {
      console.error("Error saving logo:", e);
    }
  }
};
