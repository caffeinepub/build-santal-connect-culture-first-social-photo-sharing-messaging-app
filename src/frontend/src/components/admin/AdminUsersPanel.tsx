import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Search, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchUsersByDisplayName } from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import AdminUserModerationPanel from './AdminUserModerationPanel';
import AdminUserConversationsPanel from './AdminUserConversationsPanel';
import AdminAllUsersTablePanel from './AdminAllUsersTablePanel';

export default function AdminUsersPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: searchResults = [], isLoading: isSearching } = useSearchUsersByDisplayName(submittedQuery);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(searchQuery.trim());
    setSelectedUserId(null);
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleBackToSearch = () => {
    setSelectedUserId(null);
  };

  if (selectedUserId) {
    const selectedPrincipal = Principal.fromText(selectedUserId);
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBackToSearch}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to User Management
        </Button>
        <AdminUserModerationPanel userPrincipal={selectedPrincipal} />
        <AdminUserConversationsPanel userPrincipal={selectedPrincipal} />
      </div>
    );
  }

  return (
    <Tabs defaultValue="search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="search">Search Users</TabsTrigger>
        <TabsTrigger value="all">All Users</TabsTrigger>
      </TabsList>

      <TabsContent value="search" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>User Search</CardTitle>
            <CardDescription>Search for users to view details, manage verification, and moderate accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userSearch">Search by Display Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="userSearch"
                    placeholder="Enter display name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {submittedQuery && (
          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {isSearching ? 'Searching...' : `Found ${searchResults.length} user(s)`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No users found matching "{submittedQuery}"</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <div
                      key={result.userId}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleSelectUser(result.userId)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{result.userId}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="all" className="mt-6">
        <AdminAllUsersTablePanel />
      </TabsContent>
    </Tabs>
  );
}
