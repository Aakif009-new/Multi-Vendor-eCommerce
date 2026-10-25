export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Empty' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  barColor: string;
  textColor: string;
  requirements: PasswordRequirement[];
  feedback?: string;
  isCommon?: boolean;
}

// Local offline dictionary of common/compromised password roots
const COMMON_PASSWORDS = new Set([
  'password',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'admin123',
  'welcome1',
  'iloveyou',
  'bazaarone',
  'market123',
  'password123',
  'abc12345',
  'letmein1',
  'pass1234',
  'monkey123',
  'dragon123',
]);

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Empty',
      color: 'bg-surface-200',
      barColor: 'bg-surface-200',
      textColor: 'text-surface-400',
      requirements: [
        { id: 'length', label: 'At least 8 characters', met: false },
        { id: 'lowercase', label: 'One lowercase letter (a-z)', met: false },
        { id: 'uppercase', label: 'One uppercase letter (A-Z)', met: false },
        { id: 'number_or_symbol', label: 'One number or special symbol (!@#$...)', met: false },
      ],
    };
  }

  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasNumberOrSymbol = hasNumber || hasSpecial;

  const requirements: PasswordRequirement[] = [
    { id: 'length', label: 'At least 8 characters', met: hasMinLength },
    { id: 'lowercase', label: 'One lowercase letter (a-z)', met: hasLower },
    { id: 'uppercase', label: 'One uppercase letter (A-Z)', met: hasUpper },
    { id: 'number_or_symbol', label: 'One number or special symbol (!@#$...)', met: hasNumberOrSymbol },
  ];

  const lowerPwd = password.toLowerCase();
  const isCommon =
    COMMON_PASSWORDS.has(lowerPwd) ||
    Array.from(COMMON_PASSWORDS).some((common) => lowerPwd.length > 5 && lowerPwd.includes(common));

  // Check repetitive characters like "aaaaaaa" or "11111111"
  const isRepetitive = /^(.)\1+$/.test(password);

  let score: 0 | 1 | 2 | 3 | 4 = 1;
  let feedback = '';

  // Rule: Do NOT show success or high strength if under 8 characters, regardless of diversity
  if (!hasMinLength) {
    score = 1;
    feedback = 'Password is too short (minimum 8 characters).';
  } else if (isCommon) {
    score = 1;
    feedback = 'This password is too common and easy to guess.';
  } else if (isRepetitive) {
    score = 1;
    feedback = 'Avoid repeating identical characters.';
  } else {
    // Count character diversity
    let diversityCount = 0;
    if (hasLower) diversityCount++;
    if (hasUpper) diversityCount++;
    if (hasNumber) diversityCount++;
    if (hasSpecial) diversityCount++;

    if (password.length >= 12 && diversityCount >= 3) {
      score = 4; // Strong
      feedback = 'Excellent and robust password.';
    } else if (password.length >= 10 && diversityCount >= 3) {
      score = 3; // Good
      feedback = 'Good password. Add more length or symbols for extra security.';
    } else if (password.length >= 8 && diversityCount >= 3) {
      score = 3; // Good
      feedback = 'Meets security standards.';
    } else if (password.length >= 8 && diversityCount >= 2) {
      score = 2; // Fair
      feedback = 'Fair password. Include uppercase, numbers, or symbols.';
    } else {
      score = 1; // Weak
      feedback = 'Weak password. Add a mix of letters, numbers, and symbols.';
    }
  }

  switch (score) {
    case 4:
      return {
        score: 4,
        label: 'Strong',
        color: 'bg-emerald-500',
        barColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        requirements,
        feedback,
        isCommon,
      };
    case 3:
      return {
        score: 3,
        label: 'Good',
        color: 'bg-blue-500',
        barColor: 'bg-blue-500',
        textColor: 'text-blue-700',
        requirements,
        feedback,
        isCommon,
      };
    case 2:
      return {
        score: 2,
        label: 'Fair',
        color: 'bg-amber-500',
        barColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        requirements,
        feedback,
        isCommon,
      };
    case 1:
    default:
      return {
        score: 1,
        label: 'Weak',
        color: 'bg-rose-500',
        barColor: 'bg-rose-500',
        textColor: 'text-rose-700',
        requirements,
        feedback,
        isCommon,
      };
  }
}
