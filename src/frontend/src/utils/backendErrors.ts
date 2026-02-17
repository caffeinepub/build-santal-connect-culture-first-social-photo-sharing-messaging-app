/**
 * Normalizes backend errors into user-friendly English messages
 */
export function normalizeBackendError(error: unknown): string {
  if (!error) return 'An unknown error occurred';

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Check for common backend trap patterns
  if (errorMessage.includes('Unauthorized')) {
    if (errorMessage.includes('profile')) {
      return 'Please complete your profile setup first';
    }
    if (errorMessage.includes('admin')) {
      return 'Admin access required';
    }
    if (errorMessage.includes('follow')) {
      return 'You need to be logged in to follow users';
    }
    return 'You need to be logged in to perform this action';
  }

  if (errorMessage.includes('must have profile')) {
    return 'Please complete your profile setup first';
  }

  if (errorMessage.includes('not found')) {
    return 'The requested item was not found';
  }

  if (errorMessage.includes('already liked')) {
    return 'You already liked this post';
  }

  if (errorMessage.includes('not liked yet')) {
    return 'You have not liked this post yet';
  }

  if (errorMessage.includes('banned')) {
    return 'This user has been banned';
  }

  if (errorMessage.includes('Cannot follow yourself')) {
    return 'You cannot follow yourself';
  }

  if (errorMessage.includes('Already following')) {
    return 'You are already following this user';
  }

  if (errorMessage.includes('Not following')) {
    return 'You are not following this user';
  }

  if (errorMessage.includes('Target user does not exist')) {
    return 'This user does not exist';
  }

  if (errorMessage.includes('Cannot ban an admin')) {
    return 'Admin users cannot be banned';
  }

  if (errorMessage.includes('must not be empty')) {
    return 'All required fields must be filled';
  }

  // Return the original message if no specific pattern matches
  return errorMessage;
}
