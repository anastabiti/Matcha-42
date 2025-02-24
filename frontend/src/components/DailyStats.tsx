import { FC } from 'react';
import { TrendingUp, UserCheck, Star, History, LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

type UserInteraction = {
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  lastViewedAt: Date;
};

interface DailyStatsProps {
  viewers: UserInteraction[];
  likes: UserInteraction[];
  history: UserInteraction[];
}

const StatCard: FC<StatCardProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-[#2a2435] rounded-xl p-4">
    <div className="flex items-center justify-between mb-2">
      <Icon className="w-5 h-5 text-[#e94057]" />
    </div>
    <div className="text-2xl font-bold text-white mb-1">{value}</div>
    <div className="text-sm text-white/50">{label}</div>
  </div>
);

const DailyStats: FC<DailyStatsProps> = ({ viewers, likes, history }) => {
  const today = new Date().setHours(0,0,0,0);
  
  const todayViews = viewers.filter(v => 
    new Date(v.lastViewedAt).setHours(0,0,0,0) === today
  ).length;
  
  const todayLikes = likes.filter(l => 
    new Date(l.lastViewedAt).setHours(0,0,0,0) === today
  ).length;

  const todayVisits = history.filter(h => 
    new Date(h.lastViewedAt).setHours(0,0,0,0) === today
  ).length;
  
  const engagementRate = viewers.length ? Math.round((likes.length / viewers.length) * 100) : 0;

  const stats: StatCardProps[] = [
    {
      icon: UserCheck,
      label: "Today's Views",
      value: todayViews,
    },
    {
      icon: Star,
      label: "Today's Likes",
      value: todayLikes,
    },
    {
      icon: History,
      label: "Today's Visits",
      value: todayVisits,
    },
    {
      icon: TrendingUp,
      label: 'Engagement Rate',
      value: `${engagementRate}%`,
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DailyStats;