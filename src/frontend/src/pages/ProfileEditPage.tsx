import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Loader2, Shield } from 'lucide-react';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useIsCallerAdmin } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import AvatarUploader from '../components/profile/AvatarUploader';
import CountryCallingCodeSelect from '../components/profile/CountryCallingCodeSelect';
import { toast } from 'sonner';
import type { UserProfile } from '../backend';
import { ExternalBlob } from '../backend';
import { normalizeBackendError } from '../utils/backendErrors';
import { validatePhoneNumber, normalizePhoneNumber } from '../utils/phoneValidation';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const saveProfile = useSaveCallerUserProfile();

  const [phoneError, setPhoneError] = useState('');
  const [isApplyingAvatar, setIsApplyingAvatar] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (profile) {
      setEditForm({
        publicProfile: profile.publicProfile,
        countryCode: profile.countryCode,
        phone: profile.phone,
      });
    }
  }, [profile]);

  const handlePhoneChange = (value: string) => {
    setEditForm({ ...editForm, phone: value });
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleSaveEdit = async () => {
    if (!profile || !editForm.publicProfile) return;

    // Validate required fields
    if (!editForm.publicProfile.displayName?.trim()) {
      toast.error('Display name is required');
      return;
    }

    if (!editForm.countryCode) {
      toast.error('Country code is required');
      return;
    }

    // Validate phone if changed
    if (editForm.phone !== undefined) {
      const phoneValidation = validatePhoneNumber(editForm.phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.error || 'Invalid phone number');
        toast.error(phoneValidation.error || 'Invalid phone number');
        return;
      }
    }

    // Validate location
    if (!editForm.publicProfile.location?.trim()) {
      toast.error('Location is required');
      return;
    }

    try {
      const updatedProfile: UserProfile = {
        publicProfile: {
          ...editForm.publicProfile,
          displayName: editForm.publicProfile.displayName.trim(),
          bio: editForm.publicProfile.bio || '',
          location: editForm.publicProfile.location.trim() || undefined,
        },
        countryCode: editForm.countryCode,
        phone: editForm.phone ? normalizePhoneNumber(editForm.phone) : profile.phone,
      };

      await saveProfile.mutateAsync(updatedProfile);
      toast.success('Profile updated successfully!');
      
      // Navigate back to profile
      const userId = identity?.getPrincipal().toString();
      if (userId) {
        navigate({ to: '/profile/$userId', params: { userId } });
      }
    } catch (error) {
      console.error('Save profile error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  const handleApplyAdminAvatar = async () => {
    if (!profile) return;

    setIsApplyingAvatar(true);
    try {
      const response = await fetch('/assets/generated/admin-avatar.dim_512x512.jpg');
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const adminAvatar = ExternalBlob.fromBytes(uint8Array);
      
      setEditForm({
        ...editForm,
        publicProfile: {
          ...editForm.publicProfile!,
          avatar: adminAvatar,
        },
      });
      
      toast.success('Admin avatar applied!');
    } catch (error) {
      console.error('Apply admin avatar error:', error);
      toast.error(normalizeBackendError(error));
    } finally {
      setIsApplyingAvatar(false);
    }
  };

  const handleCancel = () => {
    const userId = identity?.getPrincipal().toString();
    if (userId) {
      navigate({ to: '/profile/$userId', params: { userId } });
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Avatar</Label>
            <AvatarUploader
              currentAvatar={editForm.publicProfile?.avatar}
              onAvatarChange={(avatar) =>
                setEditForm({
                  ...editForm,
                  publicProfile: { ...editForm.publicProfile!, avatar },
                })
              }
              displayName={editForm.publicProfile?.displayName || profile.publicProfile.displayName}
            />
          </div>

          {isAdmin && (
            <Button
              onClick={handleApplyAdminAvatar}
              disabled={isApplyingAvatar}
              variant="outline"
              size="sm"
            >
              {isApplyingAvatar ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Apply Admin Avatar
                </>
              )}
            </Button>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-displayName">Display Name *</Label>
            <Input
              id="edit-displayName"
              value={editForm.publicProfile?.displayName || ''}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  publicProfile: { ...editForm.publicProfile!, displayName: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              value={editForm.publicProfile?.bio || ''}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  publicProfile: { ...editForm.publicProfile!, bio: e.target.value },
                })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-location">Location *</Label>
            <Input
              id="edit-location"
              value={editForm.publicProfile?.location || ''}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  publicProfile: { ...editForm.publicProfile!, location: e.target.value },
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-countryCode">Country Code *</Label>
            <CountryCallingCodeSelect
              value={editForm.countryCode || ''}
              onChange={(value) => setEditForm({ ...editForm, countryCode: value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone Number *</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={editForm.phone || ''}
              onChange={(e) => handlePhoneChange(e.target.value)}
              required
            />
            {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saveProfile.isPending} className="flex-1">
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
