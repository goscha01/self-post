import { ConnectedProfiles } from '@/components/dashboard/connected-profiles';
import { UpcomingPosts } from '@/components/dashboard/upcoming-posts';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { GoogleProfileCard } from '@/components/dashboard/google-profile-card';

export default function DashboardPage() {
  return (
    <div className="min-h-full p-6 space-y-6 pb-20">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <QuickStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoogleProfileCard />
        <ConnectedProfiles />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <UpcomingPosts />
      </div>
    </div>
  );
}
