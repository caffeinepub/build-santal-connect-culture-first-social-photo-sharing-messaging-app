import { ReactNode } from 'react';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RequireAdminProps {
  children: ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to access this page. Admin privileges are required.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
