import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import WorkflowBuilder from '@/components/workflows/WorkflowBuilder';

export default async function WorkflowsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <WorkflowBuilder />
    </div>
  );
}
