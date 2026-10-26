/**
 * Secure File and Magic Bytes Validator
 *
 * Verifies that uploaded files match their claimed MIME type and adhere to
 * safe byte signatures (magic bytes) to prevent extension spoofing.
 *
 * Supported formats:
 * - PDF (%PDF -> 0x25, 0x50, 0x44, 0x46)
 * - JPEG/JPG (0xFF, 0xD8, 0xFF)
 * - PNG (0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)
 *
 * Size limit: 5 MB (5 * 1024 * 1024 bytes)
 */

export const MAX_DOCUMENT_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
];

export interface FileValidationResult {
  isValid: boolean;
  detectedMimeType?: string;
  error?: string;
}

/**
 * Validates the binary header (magic bytes) of a file buffer.
 */
export function validateFileMagicBytes(
  buffer?: Buffer | null,
  claimedMimeType?: string
): FileValidationResult {
  if (!buffer || buffer.length === 0) {
    return { isValid: false, error: 'Document buffer is empty' };
  }

  if (buffer.length > MAX_DOCUMENT_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds the 5 MB maximum limit (${(buffer.length / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  // Need at least 4 bytes to check signatures
  if (buffer.length < 4) {
    return { isValid: false, error: 'File header is too short to be a valid document.' };
  }

  let detectedType: string | null = null;

  // 1. PDF: %PDF (0x25, 0x50, 0x44, 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    detectedType = 'application/pdf';
  }
  // 2. JPEG: 0xFF, 0xD8, 0xFF
  else if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    detectedType = 'image/jpeg';
  }
  // 3. PNG: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  else if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    detectedType = 'image/png';
  }

  if (!detectedType) {
    return {
      isValid: false,
      error: 'Invalid file signature. File content does not match a valid PDF, JPEG, or PNG document.',
    };
  }

  if (claimedMimeType) {
    const normalizedClaimed = claimedMimeType.toLowerCase().trim();
    const isJpegMatch =
      detectedType === 'image/jpeg' &&
      (normalizedClaimed === 'image/jpeg' || normalizedClaimed === 'image/jpg');

    if (detectedType !== normalizedClaimed && !isJpegMatch) {
      return {
        isValid: false,
        error: `MIME type mismatch: claimed "${claimedMimeType}", but binary signature indicates "${detectedType}".`,
        detectedMimeType: detectedType,
      };
    }
  }

  return {
    isValid: true,
    detectedMimeType: detectedType,
  };
}
