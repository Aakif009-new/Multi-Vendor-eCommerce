'use client';

import React, { useState } from 'react';
import { X, MapPin, Plus, CheckCircle2, Trash2, Home, Building } from 'lucide-react';
import { Address } from '@/types/marketplace';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';

export interface AddressManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: Address[];
  onAddAddress: (data: any) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onSetDefaultAddress: (id: string) => Promise<void>;
}

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  isOpen,
  onClose,
  addresses,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onAddAddress({
        title,
        street,
        city,
        state,
        postalCode,
        country: 'India',
        phone,
        isDefault,
      });
      setShowAddForm(false);
      // Reset
      setStreet('');
      setCity('');
      setState('');
      setPostalCode('');
      setPhone('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-surface-200 overflow-hidden animate-slide-up max-h-[85vh] flex flex-col text-left">
        {/* Header */}
        <div className="p-5 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-surface-900">Manage Shipping Addresses</h3>
              <p className="text-xs text-surface-500">Deliveries will be dispatched to your default address</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-100 text-surface-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!showAddForm ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-500">Saved Addresses</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddForm(true)}
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add New Address
                </Button>
              </div>

              {addresses.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-surface-200 rounded-2xl">
                  <MapPin className="h-8 w-8 text-surface-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-surface-800">No saved addresses yet</p>
                  <p className="text-xs text-surface-500 mb-4">Add your shipping destination for fast checkout.</p>
                  <Button variant="primary" size="sm" onClick={() => setShowAddForm(true)}>
                    Add First Address
                  </Button>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      addr.isDefault
                        ? 'border-brand-500 bg-brand-50/20 shadow-xs'
                        : 'border-surface-200 bg-white hover:border-surface-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-surface-900">{addr.title}</span>
                        {addr.isDefault && (
                          <Badge variant="brand" size="sm">Default</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!addr.isDefault && (
                          <button
                            onClick={() => onSetDefaultAddress(addr.id)}
                            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteAddress(addr.id)}
                          className="text-surface-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-surface-700 leading-relaxed">{addr.street}</p>
                    <p className="text-xs text-surface-500">
                      {addr.city}, {addr.state} — {addr.postalCode}, {addr.country}
                    </p>
                    <p className="text-xs text-surface-500 pt-1">Phone: {addr.phone}</p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex justify-between items-center pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-surface-700">New Address Details</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-surface-500 hover:text-surface-900"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Label (e.g. Home / Office)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Street Address / Flat / Building"
                placeholder="42 Lotus Gardens, Ring Road"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
              />

              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="City"
                  placeholder="Bengaluru"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
                <Input
                  label="State"
                  placeholder="Karnataka"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                />
                <Input
                  label="PIN Code"
                  placeholder="560001"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-surface-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                Make this my default shipping address
              </label>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                isLoading={isLoading}
              >
                Save Shipping Address
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
