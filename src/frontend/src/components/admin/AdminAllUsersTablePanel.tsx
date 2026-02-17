import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AdminAllUsersTablePanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          Complete list of all registered users with contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            User listing functionality is not available.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Use the search feature to find specific users.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
