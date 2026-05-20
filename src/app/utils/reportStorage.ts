import { getSupabase } from './supabase';

export interface RouteReport {
  id: string;
  routeId: string;
  reportedBy: string;
  reason: 'wrong_grade' | 'wrong_name' | 'wrong_length' | 'non_existent';
  createdAt: string;
}

export const reportStorage = {
  async reportRoute(routeId: string, reason: string): Promise<void> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get user session to get user ID
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('route_reports')
      .insert([{
        route_id: routeId,
        reported_by: user.id,
        reason: reason
      }]);

    if (error) {
      console.error('Error reporting route:', error);
      throw error;
    }
  },

  async hasUserReportedRoute(routeId: string): Promise<boolean> {
    const supabase = getSupabase();
    const token = localStorage.getItem('access_token');

    if (!token) {
      return false;
    }

    // Get user session to get user ID
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('route_reports')
      .select('id')
      .eq('route_id', routeId)
      .eq('reported_by', user.id)
      .limit(1);

    if (error) {
      console.error('Error checking report status:', error);
      return false;
    }

    return (data && data.length > 0);
  }
};
