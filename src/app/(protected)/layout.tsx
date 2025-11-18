import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUser, getOrCreateDefaultTenant } from '@/lib/auth';
import Navigation from '@/components/navigation/Navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Ensure user has a tenant
  await getOrCreateDefaultTenant(user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation user={user} />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
