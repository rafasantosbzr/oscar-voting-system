import { createClient } from '@supabase/supabase-js';
import { Vote, Nominee } from '../types';

const SITE_URL = import.meta.env.PROD 
  ? 'https://your-site-name.netlify.app'
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      throw new Error('User not authenticated');
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_email', user.email)
      .single();

    if (existingVote) {
      throw new Error('You have already submitted a vote');
    }

    const { data, error } = await supabase
      .from('votes')
      .insert([{
        ...vote,
        user_email: user.email,
        timestamp: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('You have already submitted a vote');
      }
      throw error;
    }
    return data;
  },

  async hasUserVoted(): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return false;
    }

    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('user_email', user.email)
      .single();

    return !!data;
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