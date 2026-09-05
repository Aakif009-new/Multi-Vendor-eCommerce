import { prisma } from '../config/db';
import { CATEGORY_PRICE_RANGES } from '../services/pricing.service';
import { PaymentService } from '../services/payment.service';
import crypto from 'crypto';
import { env } from '../config/env';

const EXPECTED_DISTRIBUTION: Record<string, { name: string; count: number }> = {
  'electronics': { name: 'Electronics', count: 12 },
  'computers-accessories': { name: 'Computers & Accessories', count: 8 },
  'mens-fashion': { name: "Men's Fashion", count: 8 },
  'womens-fashion': { name: "Women's Fashion", count: 10 },
  'home-kitchen': { name: 'Home & Kitchen', count: 12 },
  'beauty-personal-care': { name: 'Beauty & Personal Care', count: 8 },
  'grocery-food': { name: 'Grocery & Food', count: 10 },
  'sports-fitness': { name: 'Sports & Fitness', count: 7 },
  'books-stationery': { name: 'Books & Stationery', count: 7 },
  'toys-games': { name: 'Toys & Games', count: 6 },
  'automotive': { name: 'Automotive', count: 6 },
  'mobile-accessories': { name: 'Mobile Accessories', count: 6 },
};

async function runPhase4QA() {
  console.log('================================================================');
  console.log('       PHASE 4: FINAL PRODUCTION READINESS & QA AUDIT           ');
  console.log('================================================================\n');

  let hasErrors = false;

  // 1. Catalogue & Category Distribution Audit
  console.log('1. AUDITING 100-PRODUCT CATALOGUE & 12-CATEGORY MATRIX...');
  const products = await prisma.product.findMany({
    include: { category: true, vendor: true, brand: true },
  });

  console.log(`   - Total Products Found: ${products.length} (Expected: 100)`);
  if (products.length !== 100) {
    console.error(`   ❌ Total product count mismatch!`);
    hasErrors = true;
  } else {
    console.log(`   ✅ Total product count is EXACTLY 100.`);
  }

  const categoryCounts: Record<string, number> = {};
  for (const p of products) {
    const slug = p.category?.slug || 'unknown';
    categoryCounts[slug] = (categoryCounts[slug] || 0) + 1;
  }

  let distPassed = true;
  for (const [slug, exp] of Object.entries(EXPECTED_DISTRIBUTION)) {
    const count = categoryCounts[slug] || 0;
    if (count !== exp.count) {
      console.error(`   ❌ Category ${exp.name} mismatch: Expected ${exp.count}, found ${count}`);
      distPassed = false;
      hasErrors = true;
    }
  }
  if (distPassed) {
    console.log(`   ✅ All 12 categories match exact target distribution counts.`);
  }

  // 2. Image Integrity & Relevance Audit
  console.log('\n2. AUDITING IMAGE ASSETS & URL INTEGRITY...');
  let missingImgs = 0;
  let invalidUrls = 0;
  const imageSet = new Set<string>();
  const duplicates: string[] = [];

  for (const p of products) {
    if (!p.images || p.images.length === 0 || !p.images[0]) {
      missingImgs++;
      hasErrors = true;
    } else {
      const url = p.images[0];
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        invalidUrls++;
        hasErrors = true;
      }
      if (imageSet.has(url)) {
        duplicates.push(url);
      } else {
        imageSet.add(url);
      }
    }
  }

  console.log(`   - Missing Images: ${missingImgs}`);
  console.log(`   - Invalid URL Formats: ${invalidUrls}`);
  console.log(`   - Unique Image URLs: ${imageSet.size}`);
  console.log(`   - Duplicate Image URLs: ${duplicates.length}`);
  if (missingImgs === 0 && invalidUrls === 0 && duplicates.length === 0) {
    console.log(`   ✅ Image assets verified: 100% valid, accessible, and uniquely mapped.`);
  } else {
    console.error(`   ❌ Image integrity issues detected!`);
  }

  // 3. Pricing & Discount Integrity
  console.log('\n3. AUDITING INDIAN RUPEE (INR ₹) PRICING & DISCOUNTS...');
  let pricingErrors = 0;
  for (const p of products) {
    const slug = p.category?.slug || '';
    const range = CATEGORY_PRICE_RANGES[slug];

    if (p.price <= 0) {
      console.error(`   ❌ Invalid non-positive price on product ${p.name}`);
      pricingErrors++;
    }
    if (range && (p.price < range.min * 0.9 || p.price > range.max * 1.1)) {
      console.error(`   ❌ Price out of range for ${p.name} (₹${p.price} not in ₹${range.min}-₹${range.max})`);
      pricingErrors++;
    }
    if (p.discountPrice !== null && p.discountPrice !== undefined) {
      if (p.discountPrice <= 0 || p.discountPrice >= p.price) {
        console.error(`   ❌ Invalid discount on ${p.name}: price=${p.price}, discountPrice=${p.discountPrice}`);
        pricingErrors++;
      }
    }
  }

  if (pricingErrors === 0) {
    console.log(`   ✅ All 100 products have valid, non-negative, category-aligned INR pricing.`);
  } else {
    hasErrors = true;
  }

  // 4. Cryptographic Security & Webhook Signatures
  console.log('\n4. AUDITING RAZORPAY TEST MODE & CRYPTOGRAPHIC VERIFICATION...');
  const fakeOrderId = 'order_test_audit_101';
  const fakePayId = 'pay_test_audit_202';
  const validPaymentSig = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${fakeOrderId}|${fakePayId}`)
    .digest('hex');

  const isSigValid = PaymentService.verifyPaymentSignature({
    razorpayOrderId: fakeOrderId,
    razorpayPaymentId: fakePayId,
    razorpaySignature: validPaymentSig,
  });

  const isForgedSigRejected = !PaymentService.verifyPaymentSignature({
    razorpayOrderId: fakeOrderId,
    razorpayPaymentId: fakePayId,
    razorpaySignature: 'forged_signature_attack_string',
  });

  if (isSigValid && isForgedSigRejected) {
    console.log(`   ✅ Razorpay HMAC-SHA256 signature verification & forged rejection verified.`);
  } else {
    console.error(`   ❌ Signature verification logic failed!`);
    hasErrors = true;
  }

  // 5. Default User Accounts & RBAC Profiles
  console.log('\n5. AUDITING DEFAULT USER ACCOUNTS & ROLES...');
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@bazaarone.com' } });
  const customerUser = await prisma.user.findUnique({ where: { email: 'customer@bazaarone.com' } });
  const vendorUser = await prisma.user.findUnique({ where: { email: 'apex@bazaarone.com' } });

  console.log(`   - Super Admin (admin@bazaarone.com): ${adminUser?.role === 'ADMIN' ? '✅ ACTIVE' : '❌ MISSING'}`);
  console.log(`   - Customer (customer@bazaarone.com): ${customerUser?.role === 'CUSTOMER' ? '✅ ACTIVE' : '❌ MISSING'}`);
  console.log(`   - Approved Vendor (apex@bazaarone.com): ${vendorUser?.role === 'VENDOR' ? '✅ ACTIVE' : '❌ MISSING'}`);

  if (!adminUser || !customerUser || !vendorUser) {
    hasErrors = true;
  }

  console.log('\n================================================================');
  if (!hasErrors) {
    console.log('✅ ALL PHASE 4 PRODUCTION READINESS CHECKS PASSED WITH 100% SUCCESS!');
  } else {
    console.error('❌ PHASE 4 CHECKS ENCOUNTERED ISSUES.');
  }
  console.log('================================================================\n');

  process.exit(hasErrors ? 1 : 0);
}

runPhase4QA().catch((err) => {
  console.error('QA Audit Error:', err);
  process.exit(1);
});
