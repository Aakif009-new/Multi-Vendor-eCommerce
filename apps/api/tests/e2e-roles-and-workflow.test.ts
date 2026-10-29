import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import { hashPassword } from '../src/utils/password';
import { CANONICAL_SUPER_ADMIN_EMAIL } from '../src/utils/superAdminGuard';

describe('End-to-End Functional & Security Audit: Customer, Vendor, and Super Admin Roles', () => {
  const timestamp = Date.now();
  let adminToken: string;
  let customerEmail: string;
  let customerPassword = 'Market@123';
  let customerToken: string;
  let customerId: string;

  let vendorEmail: string;
  let vendorPassword = 'Market@123';
  let vendorToken: string;
  let vendorId: string;
  let vendorApplicationId: string;
  let createdProductId: string;

  let competitorVendorToken: string;
  let competitorVendorId: string;

  const validGstin = '29AAACG0569P1Z3'; // Authentic Mod-36 checksum validated GSTIN

  beforeAll(async () => {
    // 1. Locate Canonical Super Admin
    const admin = await prisma.user.findUnique({
      where: { email: CANONICAL_SUPER_ADMIN_EMAIL },
    });
    if (!admin) {
      const pwd = await hashPassword('Market@123');
      await prisma.user.create({
        data: {
          name: 'Super Administrator',
          email: CANONICAL_SUPER_ADMIN_EMAIL,
          passwordHash: pwd,
          role: 'ADMIN',
          status: 'ACTIVE',
        },
      });
    }

    // 2. Setup Competitor Vendor for Isolation Testing
    const pwdHash = await hashPassword('Market@123');
    const compUser = await prisma.user.create({
      data: {
        name: 'Competitor Vendor User',
        email: `comp_vendor_${timestamp}@bazaarone.test`,
        passwordHash: pwdHash,
        role: 'VENDOR',
        status: 'ACTIVE',
      },
    });

    const compVendor = await prisma.vendor.create({
      data: {
        userId: compUser.id,
        businessName: 'Competitor Storefront',
        slug: `comp-store-${timestamp}`,
        businessAddress: '12 Competitor Way, Delhi',
        phone: '9811122233',
        status: 'APPROVED',
        accountStatus: 'ACTIVE',
      },
    });
    competitorVendorId = compVendor.id;

    // Login competitor to get token
    const compLoginRes = await request(app).post('/api/auth/login').send({
      email: compUser.email,
      password: 'Market@123',
    });
    competitorVendorToken = compLoginRes.body.data.token;
  });

  afterAll(async () => {
    // Clean up created product
    if (createdProductId) {
      await prisma.product.deleteMany({ where: { id: createdProductId } });
    }
    // Clean up test users and vendors
    await prisma.vendor.deleteMany({
      where: { businessName: { contains: `${timestamp}` } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: `${timestamp}@bazaarone.test` } },
    });
  });

  // =========================================================================
  // 1. CUSTOMER ROLE AUDIT
  // =========================================================================
  describe('1. Customer Role: Registration, Immediate Login, Permissions & Isolation', () => {
    it('should register a new CUSTOMER account and immediately set session cookies', async () => {
      customerEmail = `e2e_cust_${timestamp}@bazaarone.test`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Aakif Customer',
        email: customerEmail,
        password: customerPassword,
        role: 'CUSTOMER',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(customerEmail);
      expect(res.body.data.user.role).toBe('CUSTOMER');
      customerId = res.body.data.user.id;

      // Verify immediate session cookie issuance
      const rawCookies = res.headers['set-cookie'];
      expect(rawCookies).toBeDefined();
      const cookieStr = Array.isArray(rawCookies) ? rawCookies.join(';') : String(rawCookies);
      expect(cookieStr).toContain('token=');
      expect(cookieStr).toContain('bazaarone_session=1');
    });

    it('should login as CUSTOMER immediately without requiring page refresh', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: customerEmail,
        password: customerPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('CUSTOMER');
      customerToken = res.body.data.token;
      expect(customerToken).toBeDefined();
    });

    it('should retrieve authenticated user profile on GET /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe(customerEmail);
      expect(res.body.data.user.role).toBe('CUSTOMER');
    });

    it('should FORBID Customer from accessing Super Admin stats (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should FORBID Customer from accessing Vendor portal APIs (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/vendors/me')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  // =========================================================================
  // 2. COMPLETE NEW-VENDOR WORKFLOW AUDIT
  // =========================================================================
  describe('2. Complete New-Vendor Workflow: Registration -> Approval -> Dashboard -> Product Creation', () => {
    it('Step 2.1: Register a new Vendor with GSTIN and PAN document', async () => {
      vendorEmail = `e2e_vend_${timestamp}@bazaarone.test`;
      const dummyPdf = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

      const res = await request(app)
        .post('/api/auth/register')
        .field('name', 'Artisan Master')
        .field('email', vendorEmail)
        .field('password', vendorPassword)
        .field('role', 'VENDOR')
        .field('businessName', `Artisan Haven ${timestamp}`)
        .field('businessAddress', '45 Palace Road, Jaipur, Rajasthan')
        .field('phone', '9876543210')
        .field('legalStructure', 'SOLE_PROPRIETORSHIP')
        .field('gstin', validGstin)
        .attach('panDocument', dummyPdf, 'business_pan.pdf');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('VENDOR');

      // Verify database state: Vendor profile is PENDING
      const dbUser = await prisma.user.findUnique({
        where: { email: vendorEmail },
        include: { vendor: true, vendorApplications: true },
      });
      expect(dbUser).toBeDefined();
      expect(dbUser?.vendor?.status).toBe('PENDING');
      expect(dbUser?.vendorApplications.length).toBeGreaterThan(0);
      vendorApplicationId = dbUser!.vendorApplications[0].id;
      vendorId = dbUser!.vendor!.id;
    });

    it('Step 2.2: Super Admin logs in and retrieves pending applications', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: CANONICAL_SUPER_ADMIN_EMAIL,
        password: 'Market@123',
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.role).toBe('ADMIN');
      adminToken = loginRes.body.data.token;

      // Super Admin fetches applications list
      const appsRes = await request(app)
        .get('/api/admin/vendor-applications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(appsRes.status).toBe(200);
      expect(Array.isArray(appsRes.body.data)).toBe(true);
      const targetApp = appsRes.body.data.find((a: any) => a.id === vendorApplicationId);
      expect(targetApp).toBeDefined();
      expect(targetApp.status).toBe('PENDING');
    });

    it('Step 2.3: Super Admin APPROVES the vendor application', async () => {
      const reviewRes = await request(app)
        .patch(`/api/admin/vendor-applications/${vendorApplicationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });

      expect(reviewRes.status).toBe(200);
      expect(reviewRes.body.success).toBe(true);
      expect(reviewRes.body.data.status).toBe('APPROVED');

      // Verify MongoDB Atlas persistence: Vendor status is now APPROVED and ACTIVE
      const recheckedVendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      expect(recheckedVendor?.status).toBe('APPROVED');
      expect(recheckedVendor?.accountStatus).toBe('ACTIVE');
    });

    it('Step 2.4: Approved Vendor logs in and accesses merchant dashboard', async () => {
      const loginRes = await request(app).post('/api/auth/login').send({
        email: vendorEmail,
        password: vendorPassword,
      });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.user.role).toBe('VENDOR');
      vendorToken = loginRes.body.data.token;

      // Vendor accesses /api/vendors/me
      const meRes = await request(app)
        .get('/api/vendors/me')
        .set('Authorization', `Bearer ${vendorToken}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.status).toBe('APPROVED');
      expect(meRes.body.data.businessName).toContain('Artisan Haven');
    });

    it('Step 2.5: Approved Vendor uploads product image to Cloudinary (or resilient fallback)', async () => {
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const uploadRes = await request(app)
        .post('/api/upload/image')
        .set('Authorization', `Bearer ${vendorToken}`)
        .attach('image', pngBuffer, 'product.png');

      expect(uploadRes.status).toBe(201);
      expect(uploadRes.body.success).toBe(true);
      expect(uploadRes.body.data.url).toBeDefined();
    });

    it('Step 2.6: Approved Vendor creates a product in MongoDB Atlas', async () => {
      // Find a category to associate
      const category = await prisma.category.findFirst({ where: { isActive: true } });
      expect(category).toBeDefined();

      const prodRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          name: `Handcrafted Brass Lamp ${timestamp}`,
          description: 'Authentic handcrafted brass lamp made in Jaipur.',
          price: 2499,
          discountPrice: 1999,
          stock: 25,
          categoryId: category!.id,
          images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30'],
          status: 'ACTIVE',
        });

      expect(prodRes.status).toBe(201);
      expect(prodRes.body.success).toBe(true);
      expect(prodRes.body.data.name).toContain('Handcrafted Brass Lamp');
      expect(prodRes.body.data.status).toBe('ACTIVE');
      createdProductId = prodRes.body.data.id;

      // Verify MongoDB Atlas database persistence
      const dbProduct = await prisma.product.findUnique({
        where: { id: createdProductId },
      });
      expect(dbProduct).toBeDefined();
      expect(dbProduct?.vendorId).toBe(vendorId);
      expect(dbProduct?.stock).toBe(25);
      expect(dbProduct?.price).toBe(2499);
    });

    it('Step 2.7: Newly created product appears correctly in public marketplace catalog', async () => {
      const catalogRes = await request(app)
        .get(`/api/products?search=${encodeURIComponent(`Brass Lamp ${timestamp}`)}`);

      expect(catalogRes.status).toBe(200);
      expect(catalogRes.body.success).toBe(true);
      expect(Array.isArray(catalogRes.body.data)).toBe(true);

      const found = catalogRes.body.data.find((p: any) => p.id === createdProductId);
      expect(found).toBeDefined();
      expect(found.name).toContain('Handcrafted Brass Lamp');
      expect(found.vendor.id).toBe(vendorId);
    });

    it('Step 2.8: Vendor Isolation: Competitor Vendor CANNOT modify newly created product (403 Forbidden)', async () => {
      const hijackRes = await request(app)
        .put(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${competitorVendorToken}`)
        .send({
          name: 'Hijacked Product Name',
          price: 1,
        });

      expect(hijackRes.status).toBe(403);
      expect(hijackRes.body.success).toBe(false);

      // Verify product was not altered
      const rechecked = await prisma.product.findUnique({ where: { id: createdProductId } });
      expect(rechecked?.name).toContain('Handcrafted Brass Lamp');
      expect(rechecked?.price).toBe(2499);
    });
  });

  // =========================================================================
  // 3. SUPER ADMIN ROLE AUDIT & SECURITY BOUNDARIES
  // =========================================================================
  describe('3. Super Admin Role: Uniqueness, Management Endpoints, and Privilege Escalation Resistance', () => {
    it('MUST verify that exactly one Super Admin exists in the system', async () => {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      expect(adminCount).toBe(1);

      const soleAdmin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      expect(soleAdmin?.email).toBe(CANONICAL_SUPER_ADMIN_EMAIL);
      expect(soleAdmin?.status).toBe('ACTIVE');
    });

    it('MUST strictly reject public registration as ADMIN (403 Forbidden)', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Attacker Admin',
        email: `hacker_${timestamp}@bazaarone.test`,
        password: 'Password@123',
        role: 'ADMIN',
      });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('MUST strictly reject role escalation via PUT /api/auth/profile (403 Forbidden)', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          role: 'ADMIN',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Privilege escalation attempt detected');
    });

    it('should allow authentic Super Admin to retrieve marketplace stats', async () => {
      const res = await request(app)
        .get('/api/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalProducts).toBeGreaterThan(0);
    });

    it('should allow authentic Super Admin to retrieve users list', async () => {
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  afterAll(async () => {
    // Clean up test created product and users to preserve pristine 100-product catalog
    if (createdProductId) {
      await prisma.product.deleteMany({ where: { id: createdProductId } }).catch(() => {});
    }
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            customerEmail,
            vendorEmail,
            `comp_vendor_${timestamp}@bazaarone.test`,
            `hacker_${timestamp}@bazaarone.test`,
          ],
        },
      },
    }).catch(() => {});
  });
});
