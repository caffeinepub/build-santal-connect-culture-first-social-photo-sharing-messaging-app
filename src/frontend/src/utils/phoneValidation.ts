export function validatePhoneNumber(phone: string): { isValid: boolean; error?: string } {
  const trimmed = phone.trim();
  
  if (!trimmed) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Remove spaces and dashes for validation
  const cleaned = trimmed.replace(/[\s-]/g, '');
  
  // Check if it contains only digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Phone number must contain only digits' };
  }
  
  // Check length (most phone numbers are between 7 and 15 digits)
  if (cleaned.length < 7) {
    return { isValid: false, error: 'Phone number is too short' };
  }
  
  if (cleaned.length > 15) {
    return { isValid: false, error: 'Phone number is too long' };
  }
  
  return { isValid: true };
}

export function normalizePhoneNumber(phone: string): string {
  // Remove spaces and dashes
  return phone.trim().replace(/[\s-]/g, '');
}
