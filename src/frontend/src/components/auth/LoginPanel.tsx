import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { BRAND_CONFIG } from '../../config/brand';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPanel() {
  const { login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const isLoggingIn = loginStatus === 'logging-in';

  const handleLogin = async () => {
    setError(null);
    try {
      await login();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login error:', err);
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/assets/generated/santal-pattern.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/assets/1771089289520.png"
              alt={BRAND_CONFIG.appName}
              className="w-32 h-32 rounded-2xl object-contain"
            />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{BRAND_CONFIG.appName}</h1>
            <p className="text-muted-foreground">{BRAND_CONFIG.description}</p>
          </div>

          {/* Login Content */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Sign in securely with Internet Identity to access the Santal community
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in with Internet Identity'
              )}
            </Button>

            {/* Info Text */}
            <p className="text-center text-sm text-muted-foreground">
              Join the Santal community to share culture, art, and traditions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
