/**
 * Client-Side GSTIN and PAN Validator for BazaarOne
 *
 * Provides real-time interactive feedback for vendor onboarding.
 * Formats, trims, and validates GSTIN structure and Mod-36 checksum.
 * Note: Never claims government database verification; strictly structural.
 */

export const GSTN_CODEPOINT_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const VALID_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
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
  '25': 'Daman & Diu',
  '26': 'Dadra & Nagar Haveli',
  '27': 'Maharashtra',
  '28': 'Andhra Pradesh (Old)',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman & Nicobar Islands',
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

export function normalizeGstin(input?: string | null): string {
  if (!input) return '';
  return input.trim().toUpperCase();
}

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

export interface ClientGstinValidationResult {
  isValid: boolean;
  error?: string;
  pan?: string;
  stateCode?: string;
  stateName?: string;
  entityType?: string;
  expectedChecksum?: string;
}

export function validateGstinClient(rawGstin?: string | null): ClientGstinValidationResult {
  const gstin = normalizeGstin(rawGstin);

  if (!gstin) {
    return { isValid: false, error: 'GSTIN is required.' };
  }

  if (gstin.length !== 15) {
    return {
      isValid: false,
      error: `GSTIN must be exactly 15 characters (currently ${gstin.length}/15).`,
    };
  }

  const regexPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  if (!regexPattern.test(gstin)) {
    const stateCode = gstin.slice(0, 2);
    if (!/^[0-9]{2}$/.test(stateCode)) {
      return { isValid: false, error: 'First 2 characters must be a 2-digit State Code.' };
    }
    const panPart = gstin.slice(2, 12);
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panPart)) {
      return {
        isValid: false,
        error: 'Characters 3-12 must represent a valid PAN (e.g., ABCDE1234F).',
      };
    }
    if (gstin[13] !== 'Z') {
      return { isValid: false, error: '14th character of GSTIN must be "Z".' };
    }
    return { isValid: false, error: 'Invalid GSTIN format.' };
  }

  const stateCode = gstin.slice(0, 2);
  const stateName = VALID_STATE_CODES[stateCode];
  if (!stateName) {
    return {
      isValid: false,
      error: `State code "${stateCode}" is not a recognized Indian state code.`,
    };
  }

  const pan = gstin.slice(2, 12);
  const entityType = PAN_ENTITY_TYPES[pan[3]] || 'Registered Entity';

  const expectedChecksum = calculateGstinChecksum(gstin.slice(0, 14));
  const actualChecksum = gstin[14];

  if (actualChecksum !== expectedChecksum) {
    return {
      isValid: false,
      error: `Checksum character mismatch. Expected "${expectedChecksum}", found "${actualChecksum}".`,
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
