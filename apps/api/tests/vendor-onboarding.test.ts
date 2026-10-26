import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { calculateGstinChecksum, validateGstin } from '../src/utils/gstin';
import { validateFileMagicBytes } from '../src/utils/fileValidation';

describe('BazaarOne Secure Vendor Onboarding: GSTIN & PAN Upload', () => {
  const timestamp = Date.now();

  // Valid GSTIN test vectors with authentic Mod-36 checksums
  const validKarnatakaGstin = '29AAACG0569P1Z3'; // State 29, PAN AAACG0569P, entity 1, Z, checksum 3
  const validMaharashtraGstin = '27AAPFU0939F1ZV'; // State 27, PAN AAPFU0939F, entity 1, Z, checksum V
  const illustrativePlaceholder = '29ABCDE1234F1Z5'; // Given in prompt as illustrative placeholder (target checksum W)

  // Dummy valid file buffers
  const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\ntrailer\n<<\n>>\n%%EOF');
  const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);

  // Spoofed file (plain text pretending to be PDF)
  const spoofedPdfBuffer = Buffer.from('Plain text file pretending to be a PDF without magic bytes');

  // Oversized file (> 5 MB)
  const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024); // 5 MB + 1 KB

  let vendorToken: string;
  let vendorUserId: string;
  let vendorId: string;
  let vendorApplicationId: string;

  let customerToken: string;
  let adminToken: string;

  beforeAll(async () => {
    // 1. Create a customer to test unauthorized access
    const customerEmail = `onboard_cust_${timestamp}@test.com`;
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Onboard Customer',
      email: customerEmail,
      password: 'Password@123',
      role: 'CUSTOMER',
    });
    customerToken = custRes.body.data.token;

    // 2. Obtain an admin token for authorized admin tests
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (adminUser) {
      const adminLoginRes = await request(app).post('/api/auth/login').send({
        email: adminUser.email,
        password: 'Password@123',
      });
      if (adminLoginRes.body.data?.token) {
        adminToken = adminLoginRes.body.data.token;
      }
    }
  });

  describe('1. GSTIN Structural and Mod-36 Checksum Validation', () => {
    it('should correctly calculate Mod-36 checksum for valid GSTINs', () => {
      expect(calculateGstinChecksum(validKarnatakaGstin.slice(0, 14))).toBe('3');
      expect(calculateGstinChecksum(validMaharashtraGstin.slice(0, 14))).toBe('V');
    });

    it('should validate authentic GSTIN format and checksum', () => {
      const res = validateGstin(validKarnatakaGstin);
      expect(res.isValid).toBe(true);
      expect(res.stateCode).toBe('29');
      expect(res.stateName).toContain('Karnataka');
      expect(res.pan).toBe('AAACG0569P');
    });

    it('should reject illustrative placeholder 29ABCDE1234F1Z5 due to checksum mismatch', () => {
      const res = validateGstin(illustrativePlaceholder);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('checksum character');
      expect(res.expectedChecksum).toBe('W');
    });

    it('should reject GSTIN with invalid length via API', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Short GSTIN Vendor',
          email: `short_gstin_${timestamp}@test.com`,
          password: 'Password@123',
          role: 'VENDOR',
          businessName: 'Short GSTIN Store',
          businessAddress: '12 Commercial Street',
          phone: '9876543210',
          gstin: '29AAACG0569P1Z', // only 14 characters
        });

      expect(res.status).toBe(422);
      expect(JSON.stringify(res.body.errors)).toContain('exactly 15 characters');
    });

    it('should reject GSTIN with invalid state code via API', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Bad State Vendor',
          email: `bad_state_${timestamp}@test.com`,
          password: 'Password@123',
          role: 'VENDOR',
          businessName: 'Bad State Store',
          businessAddress: '12 Commercial Street',
          phone: '9876543210',
          gstin: '98AAACG0569P1ZW', // invalid state 98
        });

      expect(res.status).toBe(422);
      expect(JSON.stringify(res.body.errors)).toContain('not a recognized Indian state');
    });

    it('should reject GSTIN with invalid checksum via API', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Placeholder GSTIN Vendor',
          email: `placeholder_gstin_${timestamp}@test.com`,
          password: 'Password@123',
          role: 'VENDOR',
          businessName: 'Placeholder Store',
          businessAddress: '12 Commercial Street',
          phone: '9876543210',
          gstin: illustrativePlaceholder, // 29ABCDE1234F1Z5
        });

      expect(res.status).toBe(422);
      expect(JSON.stringify(res.body.errors)).toContain('checksum');
    });

    it('should require GSTIN for registered entities (PARTNERSHIP / PRIVATE_LIMITED)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Pvt Ltd Vendor',
          email: `pvtltd_${timestamp}@test.com`,
          password: 'Password@123',
          role: 'VENDOR',
          businessName: 'Corp Artisans Pvt Ltd',
          businessAddress: '55 Tech Park, Bengaluru',
          phone: '9876543210',
          legalStructure: 'PRIVATE_LIMITED',
          // gstin omitted
        });

      expect(res.status).toBe(422);
      expect(JSON.stringify(res.body.errors)).toContain('GSTIN is mandatory for registered partnerships');
    });

    it('should allow sole proprietorship registration without GSTIN (exempt sole-proprietor policy)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Exempt Artisan',
          email: `exempt_artisan_${timestamp}@test.com`,
          password: 'Password@123',
          role: 'VENDOR',
          businessName: 'Exempt Village Crafts',
          businessAddress: 'Village Post, Karnataka',
          phone: '9876543210',
          legalStructure: 'SOLE_PROPRIETORSHIP',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('VENDOR');
    });
  });

  describe('2. Binary Magic Bytes & File Upload Validation', () => {
    it('should accept valid PDF binary header (%PDF)', () => {
      const check = validateFileMagicBytes(validPdfBuffer, 'application/pdf');
      expect(check.isValid).toBe(true);
      expect(check.detectedMimeType).toBe('application/pdf');
    });

    it('should accept valid JPEG binary header (0xFF 0xD8 0xFF)', () => {
      const check = validateFileMagicBytes(validJpegBuffer, 'image/jpeg');
      expect(check.isValid).toBe(true);
      expect(check.detectedMimeType).toBe('image/jpeg');
    });

    it('should accept valid PNG binary header (0x89 0x50 0x4E 0x47)', () => {
      const check = validateFileMagicBytes(validPngBuffer, 'image/png');
      expect(check.isValid).toBe(true);
      expect(check.detectedMimeType).toBe('image/png');
    });

    it('should reject spoofed file extension via magic bytes check', () => {
      const check = validateFileMagicBytes(spoofedPdfBuffer, 'application/pdf');
      expect(check.isValid).toBe(false);
      expect(check.error).toContain('Invalid file signature');
    });

    it('should reject oversized document (> 5 MB)', () => {
      const check = validateFileMagicBytes(oversizedBuffer, 'application/pdf');
      expect(check.isValid).toBe(false);
      expect(check.error).toContain('exceeds the 5 MB maximum limit');
    });

    it('should reject unsupported file MIME types (e.g. .txt or .exe) in registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .field('name', 'Exe Upload Vendor')
        .field('email', `exe_upload_${timestamp}@test.com`)
        .field('password', 'Password@123')
        .field('role', 'VENDOR')
        .field('businessName', 'Malware Store')
        .field('businessAddress', '10 Darknet Way')
        .field('phone', '9876543210')
        .attach('panDocument', Buffer.from('MZ executable header'), {
          filename: 'payload.exe',
          contentType: 'application/x-msdownload',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Only PDF, JPEG, and PNG');
    });

    it('should reject spoofed MIME content (text file disguised as PDF)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .field('name', 'Disguised Upload Vendor')
        .field('email', `disguised_${timestamp}@test.com`)
        .field('password', 'Password@123')
        .field('role', 'VENDOR')
        .field('businessName', 'Disguised Store')
        .field('businessAddress', '10 Safe Way')
        .field('phone', '9876543210')
        .attach('panDocument', spoofedPdfBuffer, {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid file signature');
    });
  });

  describe('3. Successful Vendor Registration with GSTIN & PAN Document', () => {
    it('should register a new vendor with valid GSTIN and valid PDF PAN document', async () => {
      const vendorEmail = `verified_vendor_${timestamp}@test.com`;

      const res = await request(app)
        .post('/api/auth/register')
        .field('name', 'Ramesh Kumar')
        .field('email', vendorEmail)
        .field('password', 'Password@123')
        .field('role', 'VENDOR')
        .field('businessName', 'Ramesh Silk Handlooms')
        .field('businessAddress', '88 Silk Weavers Colony, Kanchipuram')
        .field('phone', '9876543210')
        .field('legalStructure', 'PARTNERSHIP')
        .field('gstin', validKarnatakaGstin)
        .attach('panDocument', validPdfBuffer, {
          filename: 'business_pan.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('VENDOR');
      expect(res.body.data.token).toBeDefined();

      vendorToken = res.body.data.token;
      vendorUserId = res.body.data.user.id;

      // Verify database record has GSTIN, extracted PAN, and secure document key
      const vendorRecord = await prisma.vendor.findUnique({
        where: { userId: vendorUserId },
      });
      expect(vendorRecord).toBeDefined();
      expect(vendorRecord?.gstin).toBe(validKarnatakaGstin);
      expect(vendorRecord?.panNumber).toBe('AAACG0569P');
      expect(vendorRecord?.panDocumentKey).toBeDefined();
      vendorId = vendorRecord!.id;

      const appRecord = await prisma.vendorApplication.findFirst({
        where: { userId: vendorUserId },
      });
      expect(appRecord).toBeDefined();
      expect(appRecord?.gstin).toBe(validKarnatakaGstin);
      expect(appRecord?.panDocumentKey).toBeDefined();
      vendorApplicationId = appRecord!.id;
    });
  });

  describe('4. Secure Access Control to Sensitive Business Documents', () => {
    it('should reject unauthenticated access to vendor PAN document (401)', async () => {
      const res = await request(app).get('/api/vendors/me/documents/pan');
      expect(res.status).toBe(401);
    });

    it('should reject non-vendor customer access to vendor PAN document (403)', async () => {
      const res = await request(app)
        .get('/api/vendors/me/documents/pan')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow owning vendor to obtain signed access URL to their PAN document', async () => {
      const res = await request(app)
        .get('/api/vendors/me/documents/pan')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessUrl).toBeDefined();
      expect(res.body.data.notice).toContain('Authenticity has not been verified with government records');
    });

    it('should reject unauthenticated access to admin vendor application document (401)', async () => {
      const res = await request(app).get(
        `/api/admin/vendor-applications/${vendorApplicationId}/pan-document`
      );
      expect(res.status).toBe(401);
    });

    it('should reject regular vendor/customer access to admin document review (403)', async () => {
      const res = await request(app)
        .get(`/api/admin/vendor-applications/${vendorApplicationId}/pan-document`)
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow authorized administrator to generate signed access URL for review', async () => {
      if (!adminToken) {
        // Skip if admin token unavailable in test environment
        return;
      }
      const res = await request(app)
        .get(`/api/admin/vendor-applications/${vendorApplicationId}/pan-document`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessUrl).toBeDefined();
      expect(res.body.data.gstin).toBe(validKarnatakaGstin);
    });

    it('should strictly NOT expose PAN documents or PAN numbers in public storefront APIs', async () => {
      // Approve vendor so storefront endpoint can locate active storefront
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { status: 'APPROVED' },
      });

      const res = await request(app).get(`/api/vendors/store/${vendorId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.panDocumentUrl).toBeUndefined();
      expect(res.body.data.panDocumentKey).toBeUndefined();
      expect(res.body.data.panNumber).toBeUndefined();
    });
  });
});
