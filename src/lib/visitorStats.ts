import { supabase } from "@/lib/supabase";

export interface VisitorLog {
  id: string;
  page: string;
  user_agent: string;
  referrer: string | null;
  created_at: string;
}

export interface VisitorStats {
  totalVisits: number;
  todayVisits: number;
  monthlyVisits: number;
  uniqueVisitors: number;
  pageBreakdown: Array<{ page: string; count: number }>;
  dailyData: Array<{ date: string; visits: number }>;
}

export async function getVisitorStats(): Promise<VisitorStats> {
  const today = new Date().toISOString().slice(0, 10);
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);

  // Get all visitor logs
  const { data: allLogs, error: allError } = await supabase
    .from("visitor_logs")
    .select("*");

  if (allError) throw allError;

  // Get today's visits
  const { data: todayLogs, error: todayError } = await supabase
    .from("visitor_logs")
    .select("*")
    .gte("created_at", `${today}T00:00:00`)
    .lt("created_at", `${today}T23:59:59`);

  if (todayError) throw todayError;

  // Get this month's visits
  const { data: monthLogs, error: monthError } = await supabase
    .from("visitor_logs")
    .select("*")
    .gte("created_at", `${monthStartStr}T00:00:00`);

  if (monthError) throw monthError;

  // Calculate page breakdown
  const pageBreakdown = allLogs
    ? Object.entries(
        allLogs.reduce(
          (acc, log) => {
            acc[log.page] = (acc[log.page] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>,
        ),
      )
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  // Calculate daily data for the last 30 days
  const dailyData: Record<string, number> = {};
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  if (allLogs) {
    allLogs.forEach((log) => {
      const date = log.created_at.slice(0, 10);
      if (new Date(date) >= last30Days) {
        dailyData[date] = (dailyData[date] || 0) + 1;
      }
    });
  }

  const dailyDataArray = Object.entries(dailyData)
    .map(([date, visits]) => ({ date, visits }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Count unique visitors (based on user_agent + referrer combination)
  const uniqueVisitors = allLogs
    ? new Set(allLogs.map((log) => `${log.user_agent}|${log.referrer}`)).size
    : 0;

  return {
    totalVisits: allLogs?.length || 0,
    todayVisits: todayLogs?.length || 0,
    monthlyVisits: monthLogs?.length || 0,
    uniqueVisitors,
    pageBreakdown,
    dailyData: dailyDataArray,
  };
}
