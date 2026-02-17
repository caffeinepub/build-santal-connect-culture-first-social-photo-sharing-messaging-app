import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useSaveCallerUserProfile } from '../../hooks/useQueries';
import CountryCallingCodeSelect from './CountryCallingCodeSelect';
import { toast } from 'sonner';
import type { UserProfile } from '../../backend';
import { UserType } from '../../backend';
import { normalizeBackendError } from '../../utils/backendErrors';
import { validatePhoneNumber, normalizePhoneNumber } from '../../utils/phoneValidation';

interface ProfileSetupModalProps {
  open: boolean;
}

export default function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const saveProfile = useSaveCallerUserProfile();

  const handlePhoneChange = (value: string) => {
    setPhone(value);
    if (phoneError) {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!location.trim()) {
      toast.error('Please enter your location');
      return;
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.isValid) {
      setPhoneError(phoneValidation.error || 'Invalid phone number');
      toast.error(phoneValidation.error || 'Invalid phone number');
      return;
    }

    try {
      const profile: UserProfile = {
        publicProfile: {
          displayName: displayName.trim(),
          bio: '',
          location: location.trim(),
          avatar: undefined,
          verified: false,
          userType: UserType.user,
          teacherBadge: false,
          musicianTag: undefined,
          painterTag: undefined,
          influencerTag: undefined,
          dancerTag: undefined,
          singerTag: undefined,
        },
        countryCode,
        phone: normalizePhoneNumber(phone),
      };

      await saveProfile.mutateAsync(profile);
      toast.success('Profile created successfully!');
    } catch (error) {
      console.error('Profile setup error:', error);
      toast.error(normalizeBackendError(error));
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your information to continue using the app
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name *</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter your location"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">Country Code *</Label>
            <CountryCallingCodeSelect value={countryCode} onChange={setCountryCode} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="Enter phone number"
              required
            />
            {phoneError && (
              <p className="text-xs text-destructive">{phoneError}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Profile...
              </>
            ) : (
              'Create Profile'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
