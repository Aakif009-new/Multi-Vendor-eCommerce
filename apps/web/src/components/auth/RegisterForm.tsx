'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  ShoppingBag,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  FileText,
  FileUp,
  X,
  Building2,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { validateGstinClient } from '@/lib/gstinValidator';
import { cn } from '@/lib/utils';

export interface RegisterFormProps {
  onSuccess?: (user: { id: string; name: string; email: string; role: string }) => void;
  onSwitchToLogin?: () => void;
}

export type LegalStructureType =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'PRIVATE_LIMITED'
  | 'OTHER';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
}) => {
  const [role, setRole] = useState<'CUSTOMER' | 'VENDOR'>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [legalStructure, setLegalStructure] = useState<LegalStructureType>('SOLE_PROPRIETORSHIP');
  const [gstin, setGstin] = useState('');
  const [panFile, setPanFile] = useState<File | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Field-specific validation errors & touch state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Real-time GSTIN validation calculation
  const gstinResult = useMemo(() => {
    if (!gstin.trim()) return null;
    return validateGstinClient(gstin);
  }, [gstin]);

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isGstinRequired =
    role === 'VENDOR' &&
    (legalStructure === 'PARTNERSHIP' || legalStructure === 'PRIVATE_LIMITED');

  const validateField = (field: string, val?: any): string => {
    switch (field) {
      case 'name': {
        const v = (val !== undefined ? val : name).trim();
        if (!v) return 'Full name is required.';
        if (v.length < 2) return 'Name must be at least 2 characters.';
        if (v.length > 70) return 'Name cannot exceed 70 characters.';
        if (/[\x00-\x1F\x7F]/.test(v)) return 'Name contains invalid characters.';
        return '';
      }
      case 'email': {
        const v = (val !== undefined ? val : email).trim();
        if (!v) return 'Email address is required.';
        const emailRegex =
          /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
        if (!emailRegex.test(v)) return 'Please enter a valid email address.';
        if (v.length > 254) return 'Email cannot exceed 254 characters.';
        return '';
      }
      case 'password': {
        const v = val !== undefined ? val : password;
        if (!v) return 'Password is required.';
        if (v.length < 8) return 'Password must be at least 8 characters long.';
        if (v.length > 128) return 'Password cannot exceed 128 characters.';
        return '';
      }
      case 'confirmPassword': {
        const v = val !== undefined ? val : confirmPassword;
        if (!v) return 'Please confirm your password.';
        if (v !== password) return 'Passwords do not match.';
        return '';
      }
      case 'agreeTerms': {
        const v = val !== undefined ? val : agreeTerms;
        if (!v) return 'You must agree to the Terms of Service to register.';
        return '';
      }
      case 'businessName': {
        if (role !== 'VENDOR') return '';
        const v = (val !== undefined ? val : businessName).trim();
        if (!v) return 'Store / Business name is required for vendor registration.';
        if (v.length < 2) return 'Business name must be at least 2 characters.';
        return '';
      }
      case 'businessAddress': {
        if (role !== 'VENDOR') return '';
        const v = (val !== undefined ? val : businessAddress).trim();
        if (!v) return 'Business address is required for vendor registration.';
        if (v.length < 5) return 'Address must be at least 5 characters.';
        return '';
      }
      case 'phone': {
        if (role !== 'VENDOR') return '';
        const v = (val !== undefined ? val : phone).trim();
        if (!v) return 'Phone number is required for vendor registration.';
        if (v.length < 8) return 'Please enter a valid phone number.';
        return '';
      }
      case 'gstin': {
        if (role !== 'VENDOR') return '';
        const v = (val !== undefined ? val : gstin).trim().toUpperCase();
        if (!v) {
          if (isGstinRequired) {
            return 'GSTIN is mandatory for partnerships, LLPs, and corporate entities.';
          }
          return ''; // Optional for exempt sole proprietors
        }
        if (v.length !== 15) {
          return `GSTIN must be exactly 15 characters (currently ${v.length}/15).`;
        }
        const res = validateGstinClient(v);
        if (!res.isValid) {
          return res.error || 'Invalid GSTIN structure or checksum.';
        }
        return '';
      }
      case 'panDocument': {
        if (role !== 'VENDOR') return '';
        if (!panFile) {
          return 'Business PAN Card document upload is required for vendor onboarding.';
        }
        if (panFile.size > 5 * 1024 * 1024) {
          return `File size (${(panFile.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit.`;
        }
        const allowedMimes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedMimes.includes(panFile.type.toLowerCase())) {
          return 'Only PDF, JPEG, and PNG files are accepted.';
        }
        return '';
      }
      default:
        return '';
    }
  };

  const handleBlur = (field: string) => {
    markTouched(field);
    const err = validateField(field);
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleChange = (field: string, value: any) => {
    if (fieldErrors[field]) {
      const err = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
    if (field === 'password' && touched.confirmPassword) {
      if (confirmPassword && value !== confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleGstinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Normalize: uppercase, alphanumeric only, max 15 characters
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
    setGstin(clean);
    handleChange('gstin', clean);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    markTouched('panDocument');

    // 5 MB limit
    if (file.size > 5 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        panDocument: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 5 MB limit.`,
      }));
      setPanFile(null);
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type.toLowerCase())) {
      setFieldErrors((prev) => ({
        ...prev,
        panDocument: 'Invalid format. Only PDF, JPG, JPEG, and PNG files are accepted.',
      }));
      setPanFile(null);
      return;
    }

    setFieldErrors((prev) => ({ ...prev, panDocument: '' }));
    setPanFile(file);
  };

  const handleRemoveFile = () => {
    setPanFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    markTouched('panDocument');
    setFieldErrors((prev) => ({
      ...prev,
      panDocument: 'Business PAN Card document upload is required.',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate all fields
    const fieldsToValidate = ['name', 'email', 'password', 'confirmPassword', 'agreeTerms'];
    if (role === 'VENDOR') {
      fieldsToValidate.push('businessName', 'businessAddress', 'phone', 'panDocument');
      if (isGstinRequired || gstin.trim().length > 0) {
        fieldsToValidate.push('gstin');
      }
    }

    const errors: Record<string, string> = {};
    let hasError = false;

    for (const f of fieldsToValidate) {
      const err = validateField(f);
      if (err) {
        errors[f] = err;
        hasError = true;
      }
      markTouched(f);
    }

    setFieldErrors(errors);

    if (hasError) {
      setServerError('Please correct the highlighted errors before submitting.');
      return;
    }

    setIsLoading(true);

    try {
      let res: Response;

      if (role === 'VENDOR' && panFile) {
        // Send multipart form data with file attached
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('email', email.trim().toLowerCase());
        formData.append('password', password);
        formData.append('role', role);
        formData.append('businessName', businessName.trim());
        formData.append('businessAddress', businessAddress.trim());
        formData.append('phone', phone.trim());
        formData.append('legalStructure', legalStructure);

        if (gstin.trim()) {
          formData.append('gstin', gstin.trim().toUpperCase());
        }

        formData.append('panDocument', panFile);

        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          credentials: 'include',
          body: formData,
        });
      } else {
        // Standard JSON payload (Customer accounts or API fallback)
        const payload: Record<string, any> = {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role,
        };

        if (role === 'VENDOR') {
          payload.businessName = businessName.trim();
          payload.businessAddress = businessAddress.trim();
          payload.phone = phone.trim();
          payload.legalStructure = legalStructure;
          if (gstin.trim()) {
            payload.gstin = gstin.trim().toUpperCase();
          }
        }

        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      if (onSuccess && data.data?.user) {
        onSuccess(data.data.user);
      }
    } catch (err: any) {
      setServerError(err.message || 'Could not complete registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const isConfirmPasswordMatch =
    password && confirmPassword && password === confirmPassword;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
      {serverError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold animate-shake flex items-start gap-2"
        >
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Account Type Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-surface-100 border border-surface-200">
          <button
            type="button"
            onClick={() => {
              setRole('CUSTOMER');
              setFieldErrors({});
            }}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all',
              role === 'CUSTOMER'
                ? 'bg-white text-surface-900 shadow-sm border border-surface-200/80'
                : 'text-surface-600 hover:text-surface-900'
            )}
          >
            <ShoppingBag className="h-4 w-4 text-blue-600" />
            Customer
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('VENDOR');
              setFieldErrors({});
            }}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all',
              role === 'VENDOR'
                ? 'bg-white text-surface-900 shadow-sm border border-surface-200/80'
                : 'text-surface-600 hover:text-surface-900'
            )}
          >
            <Store className="h-4 w-4 text-amber-500" />
            Merchant / Vendor
          </button>
        </div>
      </div>

      {/* Full Name */}
      <Input
        label={role === 'VENDOR' ? 'Owner / Primary Contact Name' : 'Full Name'}
        placeholder="Sarah Jenkins"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          handleChange('name', e.target.value);
        }}
        onBlur={() => handleBlur('name')}
        error={touched.name ? fieldErrors.name : undefined}
        leftIcon={<User className="h-4 w-4" />}
        autoComplete="name"
        required
      />

      {/* Email Address */}
      <Input
        label="Email Address"
        type="email"
        placeholder="sarah@example.com"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          handleChange('email', e.target.value);
        }}
        onBlur={() => handleBlur('email')}
        error={touched.email ? fieldErrors.email : undefined}
        leftIcon={<Mail className="h-4 w-4" />}
        autoComplete="email"
        required
      />

      {/* Additional Vendor Information */}
      {role === 'VENDOR' && (
        <div className="space-y-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 animate-slide-down">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <Store className="h-4 w-4 text-amber-600" />
              Merchant Storefront & Tax Compliance Profile
            </div>
            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
              India Vendor Policy
            </span>
          </div>

          {/* Legal Structure Selector */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
              Business Legal Structure
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: 'SOLE_PROPRIETORSHIP', label: 'Sole Proprietorship / Individual' },
                { id: 'PARTNERSHIP', label: 'Partnership / LLP' },
                { id: 'PRIVATE_LIMITED', label: 'Private Limited / Company' },
                { id: 'OTHER', label: 'Other Commercial Entity' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setLegalStructure(item.id as LegalStructureType);
                    // Re-trigger validation for gstin if touched
                    if (touched.gstin) {
                      setTimeout(() => handleBlur('gstin'), 0);
                    }
                  }}
                  className={cn(
                    'p-2.5 rounded-xl border text-left font-medium transition-all text-[11px] leading-tight',
                    legalStructure === item.id
                      ? 'border-amber-500 bg-amber-100/70 text-amber-950 font-bold shadow-sm'
                      : 'border-surface-200 bg-white hover:border-surface-300 text-surface-700'
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-surface-500">
              {legalStructure === 'SOLE_PROPRIETORSHIP'
                ? 'ℹ️ Unregistered / exempt sole proprietors under turnover threshold may register without GSTIN.'
                : 'ℹ️ GSTIN is mandatory for partnerships, LLPs, and incorporated private companies.'}
            </p>
          </div>

          <Input
            label="Business / Storefront Trade Name"
            placeholder="Heritage Crafts & Decor"
            value={businessName}
            onChange={(e) => {
              setBusinessName(e.target.value);
              handleChange('businessName', e.target.value);
            }}
            onBlur={() => handleBlur('businessName')}
            error={touched.businessName ? fieldErrors.businessName : undefined}
            leftIcon={<Store className="h-4 w-4 text-amber-600" />}
            required
          />

          <Input
            label="Business Operating Address"
            placeholder="12 Commercial Way, Bengaluru, Karnataka"
            value={businessAddress}
            onChange={(e) => {
              setBusinessAddress(e.target.value);
              handleChange('businessAddress', e.target.value);
            }}
            onBlur={() => handleBlur('businessAddress')}
            error={touched.businessAddress ? fieldErrors.businessAddress : undefined}
            leftIcon={<MapPin className="h-4 w-4 text-amber-600" />}
            required
          />

          <Input
            label="Contact Phone Number"
            type="tel"
            placeholder="9876543210"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              handleChange('phone', e.target.value);
            }}
            onBlur={() => handleBlur('phone')}
            error={touched.phone ? fieldErrors.phone : undefined}
            leftIcon={<Phone className="h-4 w-4 text-amber-600" />}
            autoComplete="tel"
            required
          />

          {/* GSTIN Field */}
          <div className="space-y-1.5 text-left">
            <div className="flex items-center justify-between">
              <label
                htmlFor="gstin-input"
                className="block text-xs font-semibold uppercase tracking-wider text-surface-600"
              >
                GST Identification Number (GSTIN)
                {isGstinRequired ? (
                  <span className="text-rose-600 ml-1 font-bold">*</span>
                ) : (
                  <span className="text-surface-400 font-normal lowercase ml-1">(optional for exempt sole proprietors)</span>
                )}
              </label>
              <span className="text-[10px] text-surface-400 font-mono">
                {gstin.length}/15
              </span>
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3.5 flex items-center pointer-events-none text-surface-400">
                <Building2 className="h-4 w-4 text-amber-600" />
              </div>
              <input
                id="gstin-input"
                type="text"
                maxLength={15}
                placeholder="29ABCDE1234F1Z5"
                value={gstin}
                onChange={handleGstinInputChange}
                onBlur={() => handleBlur('gstin')}
                className={cn(
                  'w-full uppercase font-mono rounded-xl border bg-white px-4 py-2.5 text-sm transition-all shadow-sm focus:outline-none focus:ring-2 pl-10 pr-10',
                  touched.gstin && fieldErrors.gstin
                    ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
                    : gstinResult?.isValid
                    ? 'border-emerald-400 bg-emerald-50/20 text-emerald-950 focus:border-emerald-500 focus:ring-emerald-500/20'
                    : 'border-surface-200 hover:border-surface-300 focus:border-brand-500 focus:ring-brand-500/20 text-surface-900'
                )}
              />
              {gstinResult?.isValid && (
                <div className="absolute right-3.5 flex items-center text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              )}
            </div>

            {/* Inline GSTIN Error */}
            {touched.gstin && fieldErrors.gstin && (
              <p role="alert" className="text-xs font-medium text-rose-600 animate-slide-down">
                {fieldErrors.gstin}
              </p>
            )}

            {/* Inline GSTIN Success Badge */}
            {gstinResult?.isValid && (
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-slide-down">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>Format & Checksum Valid:</strong> Registered in {gstinResult.stateName} ({gstinResult.entityType}).
                </span>
              </div>
            )}

            {/* Format Disclaimer */}
            <p className="text-[11px] text-surface-500 leading-normal">
              Example placeholder: <code className="bg-amber-100/60 px-1 py-0.5 rounded font-mono text-[10px]">29ABCDE1234F1Z5</code>{' '}
              (illustrative format example, not a verified GSTIN). This system validates structure and Mod-36 checksum locally; it does not claim government verification.
            </p>
          </div>

          {/* Business PAN Card Document Upload */}
          <div className="space-y-2 text-left pt-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-surface-600">
                Business PAN Card Document <span className="text-rose-600 font-bold">*</span>
              </label>
              <span className="text-[10px] text-surface-400">PDF, JPG, JPEG, PNG (Max 5 MB)</span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              className="hidden"
              id="pan-document-upload"
            />

            {!panFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all hover:bg-white/80 group',
                  touched.panDocument && fieldErrors.panDocument
                    ? 'border-rose-300 bg-rose-50/30'
                    : 'border-surface-300 hover:border-amber-500 bg-white/50'
                )}
              >
                <FileUp className="h-8 w-8 mx-auto text-amber-500 group-hover:scale-110 transition-transform mb-2" />
                <p className="text-xs font-bold text-surface-800">
                  Click to select Business PAN Card file
                </p>
                <p className="text-[11px] text-surface-500 mt-0.5">
                  Drag and drop or browse from your computer (Up to 5 MB)
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-300 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <FileCheck className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-surface-900 truncate">
                      {panFile.name}
                    </p>
                    <p className="text-[10px] text-surface-500">
                      {(panFile.size / 1024).toFixed(0)} KB •{' '}
                      <span className="text-emerald-700 font-semibold uppercase">
                        {panFile.name.split('.').pop()} Ready for Secure Storage
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-xs font-semibold text-surface-600 hover:text-amber-700 hover:bg-amber-50 flex items-center gap-1"
                    title="Replace file"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Replace</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-1"
                    title="Remove file"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
            )}

            {touched.panDocument && fieldErrors.panDocument && (
              <p role="alert" className="text-xs font-medium text-rose-600 animate-slide-down">
                {fieldErrors.panDocument}
              </p>
            )}

            {/* Authenticity Disclaimer Box */}
            <div className="p-2.5 rounded-xl bg-amber-100/60 border border-amber-200/80 text-[11px] text-amber-900 leading-normal flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                <strong>Document Security Notice:</strong> Documents are stored in an encrypted private vault and accessible only to you and authorized marketplace administrators. Document authenticity has not been verified against government databases and will be audited during merchant review.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Password with Show/Hide toggle */}
      <div className="space-y-1">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Create an 8+ character password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            handleChange('password', e.target.value);
          }}
          onBlur={() => handleBlur('password')}
          error={touched.password ? fieldErrors.password : undefined}
          leftIcon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="text-surface-400 hover:text-surface-600 focus:outline-none p-1 rounded-md"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          required
        />

        {/* Real-Time Password Strength Meter */}
        <PasswordStrengthMeter password={password} />
      </div>

      {/* Confirm Password with match status */}
      <Input
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          handleChange('confirmPassword', e.target.value);
        }}
        onBlur={() => handleBlur('confirmPassword')}
        error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
        helperText={
          isConfirmPasswordMatch
            ? '✓ Passwords match'
            : confirmPassword
            ? 'Passwords must match'
            : undefined
        }
        className={cn(
          isConfirmPasswordMatch &&
            'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20'
        )}
        leftIcon={<Lock className="h-4 w-4" />}
        autoComplete="new-password"
        rightIcon={
          <div className="flex items-center gap-1.5">
            {isConfirmPasswordMatch && (
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Passwords match" />
            )}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
              className="text-surface-400 hover:text-surface-600 focus:outline-none p-1 rounded-md"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        }
        required
      />

      {/* Terms and Conditions Consent Checkbox */}
      <div className="space-y-1 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-surface-600 select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              handleChange('agreeTerms', e.target.checked);
            }}
            onBlur={() => handleBlur('agreeTerms')}
            aria-invalid={!!fieldErrors.agreeTerms}
            className="mt-0.5 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500/20"
            required
          />
          <span>
            I agree to the{' '}
            <span className="font-semibold text-brand-700 underline">Terms of Service</span> and{' '}
            <span className="font-semibold text-brand-700 underline">Privacy Policy</span>.
          </span>
        </label>
        {touched.agreeTerms && fieldErrors.agreeTerms && (
          <p role="alert" className="text-xs font-medium text-rose-600">
            {fieldErrors.agreeTerms}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full font-bold shadow-md shadow-brand-600/20 mt-2"
        isLoading={isLoading}
        disabled={isLoading}
        rightIcon={<ArrowRight className="h-4 w-4" />}
      >
        {role === 'VENDOR' ? 'Register as Vendor Partner' : 'Create Customer Account'}
      </Button>

      {onSwitchToLogin && (
        <p className="text-xs text-center text-surface-500 pt-2">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline focus:outline-none"
          >
            Sign in
          </button>
        </p>
      )}
    </form>
  );
};
