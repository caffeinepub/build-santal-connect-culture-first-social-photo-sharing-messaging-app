import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CountryCallingCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Common country calling codes with country names
const COUNTRY_CODES = [
  { code: '+91', country: 'India' },
  { code: '+1', country: 'United States/Canada' },
  { code: '+44', country: 'United Kingdom' },
  { code: '+61', country: 'Australia' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+33', country: 'France' },
  { code: '+49', country: 'Germany' },
  { code: '+39', country: 'Italy' },
  { code: '+7', country: 'Russia' },
  { code: '+55', country: 'Brazil' },
  { code: '+52', country: 'Mexico' },
  { code: '+34', country: 'Spain' },
  { code: '+82', country: 'South Korea' },
  { code: '+62', country: 'Indonesia' },
  { code: '+63', country: 'Philippines' },
  { code: '+66', country: 'Thailand' },
  { code: '+60', country: 'Malaysia' },
  { code: '+65', country: 'Singapore' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'Saudi Arabia' },
  { code: '+27', country: 'South Africa' },
  { code: '+234', country: 'Nigeria' },
  { code: '+20', country: 'Egypt' },
  { code: '+92', country: 'Pakistan' },
  { code: '+880', country: 'Bangladesh' },
  { code: '+977', country: 'Nepal' },
  { code: '+94', country: 'Sri Lanka' },
  { code: '+64', country: 'New Zealand' },
];

export default function CountryCallingCodeSelect({ value, onChange, disabled }: CountryCallingCodeSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="countryCode">
        Country Code <span className="text-destructive">*</span>
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="countryCode" className="w-full">
          <SelectValue placeholder="Select country code" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {COUNTRY_CODES.map(({ code, country }) => (
            <SelectItem key={code} value={code}>
              {code} ({country})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
