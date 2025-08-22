import { PlatformConnections } from '@/components/integration/platform-connections';
import { ConnectionStatus } from '@/components/integration/connection-status';

export default function IntegrationPage() {
  return (
    <div className="min-h-full p-6 pb-20">
      <h1 className="text-3xl font-bold mb-6">Integration</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformConnections />
        <ConnectionStatus />
      </div>
    </div>
  );
}
