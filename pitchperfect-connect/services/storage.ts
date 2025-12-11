import { Player, Coach } from '../types';
import { supabase } from './supabaseClient';
import { MOCK_PLAYERS, MOCK_COACHES, TEAM_LOGO_URL as DEFAULT_LOGO } from '../constants';

/**
 * StorageService (Supabase Edition)
 * Includes Real-Time Subscription logic.
 */
export const storage = {
  
  // --- Real-Time Sync ---
  /**
   * Listens for ANY change in the database.
   * When a change happens, it triggers the `onUpdate` callback.
   */
  subscribeToUpdates: (onUpdate: () => void) => {
    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'players' },
        (payload) => {
          console.log('Player update detected:', payload);
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'coaches' },
        (payload) => {
          console.log('Coach update detected:', payload);
          onUpdate();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'settings' },
        (payload) => {
          console.log('Settings update detected:', payload);
          onUpdate();
        }
      )
      .subscribe();

    // Return a cleanup function to unsubscribe when the app closes
    return () => {
      supabase.removeChannel(channel);
    };
  },

  // --- Players ---
  
  fetchPlayers: async (): Promise<Player[]> => {
    try {
      const { data, error } = await supabase.from('players').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data.map((row: any) => row.data as Player);
      }
      return []; 
    } catch (e: any) {
      // Log the actual message instead of [object Object]
      console.warn("Supabase load error (Players):", e.message || JSON.stringify(e));
      return [];
    }
  },

  savePlayer: async (player: Player) => {
    try {
      const { error } = await supabase
        .from('players')
        .upsert({ id: player.id, data: player }); 
      
      if (error) throw error;
      console.log(`Saved player: ${player.name}`);
    } catch (e: any) {
      console.error("Error saving player:", e.message || JSON.stringify(e));
      alert(`Failed to save to cloud: ${e.message || "Unknown error"}`);
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
    } catch (e: any) {
      console.warn("Supabase load error (Coaches):", e.message || JSON.stringify(e));
      return [];
    }
  },

  saveCoach: async (coach: Coach) => {
    try {
      const { error } = await supabase
        .from('coaches')
        .upsert({ id: coach.id, data: coach });
      
      if (error) throw error;
    } catch (e: any) {
      console.error("Error saving coach:", e.message || JSON.stringify(e));
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
    } catch (e: any) {
      // PGRST116 is "The result contains 0 rows" - this is normal if no logo is set yet
      if (e.code !== 'PGRST116') {
         console.warn("Supabase load error (Logo):", e.message || JSON.stringify(e));
      }
      return DEFAULT_LOGO;
    }
  },

  saveTeamLogo: async (logoUrl: string) => {
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'team_logo', value: logoUrl });
    } catch (e: any) {
      console.error("Error saving logo:", e.message || JSON.stringify(e));
    }
  }
};
