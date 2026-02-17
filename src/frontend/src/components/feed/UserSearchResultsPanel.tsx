import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User, X } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { UserSearchResult } from '../../backend';

interface UserSearchResultsPanelProps {
  results: UserSearchResult[];
  isLoading: boolean;
  error: Error | null;
  searchQuery: string;
  onClose: () => void;
}

export default function UserSearchResultsPanel({
  results,
  isLoading,
  error,
  searchQuery,
  onClose,
}: UserSearchResultsPanelProps) {
  const navigate = useNavigate();

  const handleUserClick = (userId: string) => {
    navigate({ to: '/profile/$userId', params: { userId } });
    onClose();
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">
          Search Results for "{searchQuery}"
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} title="Close search results">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Searching...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error.message}</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No users found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Try searching with a different username
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result) => (
              <button
                key={result.userId}
                onClick={() => handleUserClick(result.userId)}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{result.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-md">
                      {result.userId}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
