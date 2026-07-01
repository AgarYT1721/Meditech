/**
 * Validates email according to strict BRD rules:
 * - Domain is strictly @gmail.com
 * - Prefix length is between 6 and 32 characters
 * - Prefix contains only A-Z, a-z, 0-9, _, and .
 * 
 * @param {string} email 
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return { isValid: false, error: 'Email is required.' };
  
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Invalid email format.' };
  }

  const prefix = parts[0];
  const domain = parts[1];

  if (domain !== 'gmail.com') {
    return { isValid: false, error: 'Domain must be strictly @gmail.com.' };
  }

  if (prefix.length < 6 || prefix.length > 32) {
    return { isValid: false, error: 'Email prefix must be between 6 and 32 characters.' };
  }

  const prefixRegex = /^[a-zA-Z0-9_.]+$/;
  if (!prefixRegex.test(prefix)) {
    return { isValid: false, error: 'Email prefix can only contain letters, numbers, underscores (_), and periods (.).' };
  }

  return { isValid: true, error: '' };
};

/**
 * Validates password according to strict BRD FR-AUTH-02 rules:
 * - Length between 15 and 20 characters
 * - Requires combination of upper, lower, numbers, and allowed symbols
 * - Allowed symbols: ! @ ? _ - .
 * - Reject emojis (enforced by restricting to allowed char class)
 * 
 * @param {string} password 
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return { isValid: false, error: 'Password is required.' };

  if (password.length < 15 || password.length > 20) {
    return { isValid: false, error: 'Password must be strictly between 15 and 20 characters.' };
  }

  // Check for allowed characters only (rejects emojis and unapproved symbols)
  const allowedCharsRegex = /^[a-zA-Z0-9!@?_.\-]+$/;
  if (!allowedCharsRegex.test(password)) {
    return { isValid: false, error: 'Password contains invalid characters or emojis. Allowed symbols: ! @ ? _ - .' };
  }

  // Check for at least one of each required character type
  if (!/[A-Z]/.test(password)) return { isValid: false, error: 'Password must contain at least one uppercase letter.' };
  if (!/[a-z]/.test(password)) return { isValid: false, error: 'Password must contain at least one lowercase letter.' };
  if (!/[0-9]/.test(password)) return { isValid: false, error: 'Password must contain at least one number.' };
  if (!/[!@?_.\-]/.test(password)) return { isValid: false, error: 'Password must contain at least one allowed symbol (! @ ? _ - .).' };

  return { isValid: true, error: '' };
};
