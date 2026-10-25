'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { evaluatePasswordStrength } from '@/lib/passwordStrength';
import { cn } from '@/lib/utils';

export interface RegisterFormProps {
  onSuccess?: (user: { id: string; name: string; email: string; role: string }) => void;
  onSwitchToLogin?: () => void;
}

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
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Field-specific validation errors & touch state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

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
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
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
    // Clear field-specific error as user types
    if (fieldErrors[field]) {
      const err = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: err }));
    }
    // Cross-validate confirm password if password changes
    if (field === 'password' && touched.confirmPassword) {
      if (confirmPassword && value !== confirmPassword) {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Validate all fields
    const fieldsToValidate = ['name', 'email', 'password', 'confirmPassword', 'agreeTerms'];
    if (role === 'VENDOR') {
      fieldsToValidate.push('businessName', 'businessAddress', 'phone');
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
      }

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

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
        label={role === 'VENDOR' ? 'Owner / Contact Name' : 'Full Name'}
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
        <div className="space-y-4 p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/60 animate-slide-down">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Store className="h-4 w-4 text-amber-600" />
            Merchant Storefront Profile
          </div>

          <Input
            label="Business / Store Name"
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
