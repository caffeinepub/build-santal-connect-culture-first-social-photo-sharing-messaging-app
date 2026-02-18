import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, CheckCircle2, Shield, Ban, UserCheck, Phone, MapPin, BookOpen } from 'lucide-react';
import {
  useGetUserProfile,
  useCheckRole,
  useAdminSetVerified,
  useAdminBanUser,
  useAdminUnbanUser,
  useAdminIsUserBanned,
  useAdminGrantTeacherBadge,
  useAdminRevokeTeacherBadge,
} from '../../hooks/useQueries';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { normalizeBackendError } from '../../utils/backendErrors';
import { UserRole } from '../../backend';

interface AdminUserModerationPanelProps {
  userPrincipal: Principal;
}

export default function AdminUserModerationPanel({ userPrincipal }: AdminUserModerationPanelProps) {
  const { data: profile, isLoading: profileLoading } = useGetUserProfile(userPrincipal);
  const { data: role, isLoading: roleLoading } = useCheckRole(userPrincipal);
  const { data: isBanned, isLoading: banStatusLoading } = useAdminIsUserBanned(userPrincipal);

  const setVerified = useAdminSetVerified();
  const banUser = useAdminBanUser();
  const unbanUser = useAdminUnbanUser();
  const grantTeacherBadge = useAdminGrantTeacherBadge();
  const revokeTeacherBadge = useAdminRevokeTeacherBadge();

  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);

  const isVerified = profile?.publicProfile.verified || false;
  const hasTeacherBadge = profile?.publicProfile.teacherBadge || false;
  const isAdmin = role === UserRole.admin;

  const handleToggleVerified = async () => {
    try {
      await setVerified.mutateAsync({ user: userPrincipal, verified: !isVerified });
      toast.success(isVerified ? 'User verification revoked successfully!' : 'User has been verified successfully!');
    } catch (error) {
      console.error('Toggle verified error:', error);
      const errorMessage = normalizeBackendError(error);
      toast.error(`Failed to update verification: ${errorMessage}`);
    }
  };

  const handleToggleTeacherBadge = async () => {
    try {
      if (hasTeacherBadge) {
        await revokeTeacherBadge.mutateAsync(userPrincipal);
        toast.success('Teacher Badge revoked successfully');
      } else {
        await grantTeacherBadge.mutateAsync(userPrincipal);
        toast.success('Teacher Badge granted successfully');
      }
    } catch (error) {
      console.error('Teacher badge toggle error:', error);
      const errorMessage = normalizeBackendError(error);
      toast.error(`Failed to update teacher badge: ${errorMessage}`);
    }
  };

  const handleBanUser = async () => {
    try {
      await banUser.mutateAsync(userPrincipal);
      toast.success('User has been banned');
      setShowBanDialog(false);
    } catch (error) {
      console.error('Ban user error:', error);
      const errorMessage = normalizeBackendError(error);
      toast.error(`Failed to ban user: ${errorMessage}`);
    }
  };

  const handleUnbanUser = async () => {
    try {
      await unbanUser.mutateAsync(userPrincipal);
      toast.success('User has been unbanned');
      setShowUnbanDialog(false);
    } catch (error) {
      console.error('Unban user error:', error);
      const errorMessage = normalizeBackendError(error);
      toast.error(`Failed to unban user: ${errorMessage}`);
    }
  };

  if (profileLoading || roleLoading || banStatusLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">User profile not found</p>
        </CardContent>
      </Card>
    );
  }

  const avatarUrl = profile.publicProfile.avatar?.getDirectURL();
  const initials = profile.publicProfile.displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Moderation</CardTitle>
          <CardDescription>Manage user permissions and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={profile.publicProfile.displayName} />
              ) : (
                <AvatarFallback>{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile.publicProfile.displayName}</h3>
              <p className="text-sm text-muted-foreground">{userPrincipal.toString()}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{profile.countryCode} {profile.phone}</span>
            </div>
            {profile.publicProfile.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{profile.publicProfile.location}</span>
              </div>
            )}
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {isAdmin && <Badge variant="default"><Shield className="w-3 h-3 mr-1" />Admin</Badge>}
            {isVerified && <Badge variant="secondary"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>}
            {hasTeacherBadge && <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"><BookOpen className="w-3 h-3 mr-1" />Teacher</Badge>}
            {isBanned && <Badge variant="destructive"><Ban className="w-3 h-3 mr-1" />Banned</Badge>}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant={isVerified ? "outline" : "default"}
              size="sm"
              onClick={handleToggleVerified}
              disabled={setVerified.isPending}
              className="w-full"
            >
              {setVerified.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              {isVerified ? 'Revoke Verified' : 'Apply Verified'}
            </Button>

            <Button
              variant={hasTeacherBadge ? "outline" : "default"}
              size="sm"
              onClick={handleToggleTeacherBadge}
              disabled={grantTeacherBadge.isPending || revokeTeacherBadge.isPending}
              className="w-full"
            >
              {(grantTeacherBadge.isPending || revokeTeacherBadge.isPending) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              {hasTeacherBadge ? 'Revoke Teacher Badge' : 'Grant Teacher Badge'}
            </Button>

            {isBanned ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUnbanDialog(true)}
                disabled={unbanUser.isPending}
                className="w-full"
              >
                {unbanUser.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-2" />
                )}
                Unban User
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBanDialog(true)}
                disabled={banUser.isPending}
                className="w-full"
              >
                {banUser.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4 mr-2" />
                )}
                Ban User
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to ban {profile.publicProfile.displayName}? This will prevent them from accessing the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBanUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unban Confirmation Dialog */}
      <AlertDialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unban User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unban {profile.publicProfile.displayName}? This will restore their access to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnbanUser}>
              Unban User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
