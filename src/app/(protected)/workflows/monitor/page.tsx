import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import WorkflowDashboard from '@/components/workflows/WorkflowDashboard';

export default async function WorkflowMonitorPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <WorkflowDashboard />
    </div>
  );
}
