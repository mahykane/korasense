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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navigation user={user} />
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        width: '100%'
      }}>
        {children}
      </main>
    </div>
  );
}
