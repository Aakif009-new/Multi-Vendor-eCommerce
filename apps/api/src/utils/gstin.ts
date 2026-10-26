/**
 * GSTIN (Goods and Services Tax Identification Number) Validator & Utilities
 *
 * GSTIN Structure (15 Characters):
 * - Characters 1-2: State Code (01-38, 97, 99)
 * - Characters 3-12: Permanent Account Number (PAN) (5 letters, 4 digits, 1 letter)
 * - Character 13: Entity code (1-9, A-Z) indicating registration sequence for PAN in state
 * - Character 14: Default letter 'Z'
 * - Character 15: Mod-36 Luhn Checksum character
 *
 * NOTE: This validator strictly evaluates structural syntax, state code validity,
 * and Mod-36 check character integrity according to GSTN specifications. It does NOT
 * assert or claim government database verification.
 */

export const GSTN_CODEPOINT_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const VALID_STATE_CODES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '25': 'Daman and Diu',
  '26': 'Dadra and Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh (New)',
  '38': 'Ladakh',
  '97': 'Other Territory',
  '99': 'Centre Jurisdiction',
};

export const PAN_ENTITY_TYPES: Record<string, string> = {
  C: 'Company',
  P: 'Individual / Sole Proprietor',
  H: 'Hindu Undivided Family (HUF)',
  F: 'Partnership Firm / LLP',
  A: 'Association of Persons (AOP)',
  T: 'Trust',
  B: 'Body of Individuals (BOI)',
  L: 'Local Authority',
  J: 'Artificial Juridical Person',
  G: 'Government Agency',
  K: 'Krishak / Custodian',
};

/**
 * Normalizes GSTIN by trimming leading/trailing whitespace and converting to uppercase.
 */
export function normalizeGstin(input?: string | null): string {
  if (!input) return '';
  return input.trim().toUpperCase();
}

/**
 * Calculates the GSTN Mod-36 check character for the first 14 characters of a GSTIN.
 */
export function calculateGstinChecksum(gstin14: string): string {
  if (!gstin14 || gstin14.length < 14) return '';

  const clean = gstin14.slice(0, 14).toUpperCase();
  let factor = 2;
  let sum = 0;
  const mod = GSTN_CODEPOINT_CHARS.length; // 36

  for (let i = clean.length - 1; i >= 0; i--) {
    const codePoint = GSTN_CODEPOINT_CHARS.indexOf(clean[i]);
    if (codePoint === -1) return '';
    let digit = factor * codePoint;
    factor = factor === 2 ? 1 : 2;
    digit = Math.floor(digit / mod) + (digit % mod);
    sum += digit;
  }

  const checkCodePoint = (mod - (sum % mod)) % mod;
  return GSTN_CODEPOINT_CHARS[checkCodePoint];
}

export interface GstinValidationResult {
  isValid: boolean;
  error?: string;
  pan?: string;
  stateCode?: string;
  stateName?: string;
  entityType?: string;
  expectedChecksum?: string;
}

/**
 * Validates a GSTIN string for:
 * 1. Exactly 15 alphanumeric characters.
 * 2. Valid 2-digit Indian State code.
 * 3. Valid 10-character PAN syntax (chars 3-12).
 * 4. 14th character must be 'Z'.
 * 5. 15th character matches the official GSTN Mod-36 checksum.
 */
export function validateGstin(rawGstin?: string | null): GstinValidationResult {
  const gstin = normalizeGstin(rawGstin);

  if (!gstin) {
    return { isValid: false, error: 'GSTIN is required' };
  }

  if (gstin.length !== 15) {
    return {
      isValid: false,
      error: `GSTIN must be exactly 15 characters (currently ${gstin.length})`,
    };
  }

  // Regex structure: 2 digits state + 5 letters PAN + 4 digits PAN + 1 letter PAN + 1 alphanumeric entity num + 'Z' + 1 checksum
  const regexPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regexPattern.test(gstin)) {
    // Determine specific structural failure for helpful error message
    const stateCode = gstin.slice(0, 2);
    if (!/^[0-9]{2}$/.test(stateCode)) {
      return { isValid: false, error: 'First 2 characters must be a numeric State Code.' };
    }
    const panPart = gstin.slice(2, 12);
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panPart)) {
      return {
        isValid: false,
        error: 'Characters 3 to 12 must represent a valid 10-character PAN (5 letters, 4 digits, 1 letter).',
      };
    }
    if (gstin[13] !== 'Z') {
      return { isValid: false, error: '14th character of GSTIN must be "Z".' };
    }
    return { isValid: false, error: 'Invalid GSTIN structure or characters.' };
  }

  const stateCode = gstin.slice(0, 2);
  const stateName = VALID_STATE_CODES[stateCode];
  if (!stateName) {
    return {
      isValid: false,
      error: `State code "${stateCode}" is not a recognized Indian state or territory code.`,
    };
  }

  const pan = gstin.slice(2, 12);
  const panFourthChar = pan[3];
  const entityType = PAN_ENTITY_TYPES[panFourthChar] || 'Registered Entity';

  // Checksum calculation
  const expectedChecksum = calculateGstinChecksum(gstin.slice(0, 14));
  const actualChecksum = gstin[14];

  if (actualChecksum !== expectedChecksum) {
    return {
      isValid: false,
      error: `GSTIN checksum character "${actualChecksum}" is invalid. Expected "${expectedChecksum}".`,
      expectedChecksum,
      pan,
      stateCode,
      stateName,
      entityType,
    };
  }

  return {
    isValid: true,
    pan,
    stateCode,
    stateName,
    entityType,
    expectedChecksum,
  };
}

/**
 * Validates a 10-character Indian Permanent Account Number (PAN).
 */
export function validatePanFormat(rawPan?: string | null): {
  isValid: boolean;
  error?: string;
  entityType?: string;
} {
  if (!rawPan) return { isValid: false, error: 'PAN is required' };
  const pan = rawPan.trim().toUpperCase();
  if (pan.length !== 10) {
    return { isValid: false, error: 'PAN must be exactly 10 characters' };
  }
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(pan)) {
    return { isValid: false, error: 'Invalid PAN structure (expected 5 letters, 4 digits, 1 letter)' };
  }
  const entityType = PAN_ENTITY_TYPES[pan[3]] || 'Entity';
  return { isValid: true, entityType };
}
