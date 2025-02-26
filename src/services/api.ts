import { createClient } from '@supabase/supabase-js';
import { Vote, Nominee } from '../types';

const SITE_URL = import.meta.env.PROD 
  ? 'https://oscarvotingsystemsimulator.netlify.app'
  : 'http://localhost:3000';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const api = {
  async getNominees(): Promise<Nominee[]> {
    const { data, error } = await supabase
      .from('nominees')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  },

  async submitVote(vote: Omit<Vote, 'id'>): Promise<Vote> {
    const { data, error } = await supabase
      .from('votes')
      .insert([{
        ...vote,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAllVotes(): Promise<Vote[]> {
    const { data, error } = await supabase
      .from('votes')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  async signInWithEmail(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: SITE_URL,
      }
    });
    if (error) throw error;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};