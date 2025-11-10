import React, { useState, useEffect } from 'react';
import type { Visit } from '../types';
import { CrosshairIcon } from './icons';
import { PROVIDERS } from '../constants';

type VisitFormProps = {
  onSave: (visit: Omit<Visit, 'id' | 'timestamp' | 'lastModified'> & { id?: string }) => void;
  onCancel: () => void;
  initialVisit: Visit | null;
};

// Redefine FormData to handle string inputs for number fields and the new revisitDate
type FormData = Omit<Visit, 'id' | 'timestamp' | 'lastModified' | 'numberOfPhones' | 'estimatedMonthlyPayment' | 'revisitDate'> & {
  numberOfPhones: string;
  estimatedMonthlyPayment: string;
  revisitDate: string;
};

const inputClasses = "w-full p-2 bg-brand-light-gray text-brand-dark-gray dark:bg-zinc-800 dark:text-gray-200 border border-transparent dark:border-gray-700 rounded-lg focus:ring-brand-blue focus:border-brand-blue focus:bg-white dark:focus:bg-zinc-900 transition-colors";

/**
 * Formats a Date object into a string suitable for a datetime-local input value.
 * e.g., "2024-07-26T14:30"
 */
function formatForDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


const VisitForm: React.FC<VisitFormProps> = ({ onSave, onCancel, initialVisit }) => {
  const [formData, setFormData] = useState<FormData>({
    visitType: 'Follow-Up',
    businessName: '',
    contactPerson: '',
    ownerName: '',
    ownerContact: '',
    numberOfPhones: '', // Default to blank
    estimatedMonthlyPayment: '', // Default to blank
    currentProvider: '',
    address: '',
    notes: '',
    revisitDate: '',
  });
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (initialVisit) {
      // When editing, convert numbers to strings for the form state, handling null
      setFormData({
        visitType: initialVisit.visitType,
        businessName: initialVisit.businessName,
        contactPerson: initialVisit.contactPerson,
        ownerName: initialVisit.ownerName,
        ownerContact: initialVisit.ownerContact || '',
        numberOfPhones: initialVisit.numberOfPhones === null ? '' : String(initialVisit.numberOfPhones),
        estimatedMonthlyPayment: initialVisit.estimatedMonthlyPayment === null ? '' : String(initialVisit.estimatedMonthlyPayment),
        currentProvider: initialVisit.currentProvider,
        address: initialVisit.address,
        notes: initialVisit.notes,
        revisitDate: initialVisit.revisitDate ? formatForDateTimeLocal(new Date(initialVisit.revisitDate)) : '',
      });
    }
  }, [initialVisit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Simply update state with the string value from the input
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName) {
      alert('Business Name is required.');
      return;
    }
    // Convert string values back to numbers on save, or null if blank
    onSave({
      ...formData,
      numberOfPhones: formData.numberOfPhones.trim() === '' ? null : parseFloat(formData.numberOfPhones),
      estimatedMonthlyPayment: formData.estimatedMonthlyPayment.trim() === '' ? null : parseFloat(formData.estimatedMonthlyPayment),
      revisitDate: formData.revisitDate ? new Date(formData.revisitDate).toISOString() : undefined,
      id: initialVisit?.id,
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Using OpenStreetMap's Nominatim for reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) {
            throw new Error('Failed to fetch address.');
          }
          const data = await response.json();
          if (data && data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
          } else {
            throw new Error('Could not find address for the location.');
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          alert(`Could not retrieve address. Please enter it manually. Error: ${error.message}`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        let errorMessage = 'Could not get your location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "You denied the request for Geolocation.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "The request to get user location timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
            break;
        }
        alert(errorMessage);
        setIsLocating(false);
      }
    );
  };
  
  const isSaveDisabled = !formData.businessName;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <header className="sticky top-0 bg-white/80 dark:bg-brand-dark-gray/80 backdrop-blur-sm z-10 flex items-center justify-between p-2 border-b dark:border-gray-700">
        <button type="button" onClick={onCancel} className="text-brand-blue p-2 text-lg">
          Cancel
        </button>
        <h1 className="text-lg font-semibold dark:text-gray-100">{initialVisit ? 'Edit Visit' : 'New Visit'}</h1>
        <button type="submit" disabled={isSaveDisabled} className="text-brand-blue p-2 text-lg font-bold disabled:text-brand-gray dark:disabled:text-gray-500">
          Save
        </button>
      </header>
      <main className="flex-grow overflow-y-auto p-4 space-y-4">
        <div className="space-y-1">
          <label className="font-medium text-brand-dark-gray dark:text-gray-300">Revisit Type *</label>
          <div className="flex rounded-lg bg-brand-light-gray dark:bg-zinc-800 p-1">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, visitType: 'Follow-Up' }))}
              className={`w-1/3 p-2 rounded-md text-sm font-semibold transition-colors ${
                formData.visitType === 'Follow-Up'
                  ? 'bg-brand-blue text-white shadow'
                  : 'text-brand-dark-gray dark:text-gray-300'
              }`}
            >
              Follow-Up
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, visitType: 'Crawlback' }))}
              className={`w-1/3 p-2 rounded-md text-sm font-semibold transition-colors ${
                formData.visitType === 'Crawlback'
                  ? 'bg-brand-blue text-white shadow'
                  : 'text-brand-dark-gray dark:text-gray-300'
              }`}
            >
              Crawlback
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, visitType: 'Call' }))}
              className={`w-1/3 p-2 rounded-md text-sm font-semibold transition-colors ${
                formData.visitType === 'Call'
                  ? 'bg-brand-blue text-white shadow'
                  : 'text-brand-dark-gray dark:text-gray-300'
              }`}
            >
              Call
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="businessName" className="font-medium text-brand-dark-gray dark:text-gray-300">Business Name *</label>
          <input id="businessName" name="businessName" type="text" value={formData.businessName} onChange={handleChange} required className={inputClasses} />
        </div>
        <div className="space-y-1">
          <label htmlFor="contactPerson" className="font-medium text-brand-dark-gray dark:text-gray-300">Contact Person</label>
          <input id="contactPerson" name="contactPerson" type="text" value={formData.contactPerson} onChange={handleChange} className={inputClasses} />
        </div>
        <div className="space-y-1">
          <label htmlFor="ownerName" className="font-medium text-brand-dark-gray dark:text-gray-300">Owner Name</label>
          <input id="ownerName" name="ownerName" type="text" value={formData.ownerName} onChange={handleChange} className={inputClasses} />
        </div>
        <div className="space-y-1">
          <label htmlFor="ownerContact" className="font-medium text-brand-dark-gray dark:text-gray-300">Owner Contact</label>
          <input id="ownerContact" name="ownerContact" type="tel" value={formData.ownerContact || ''} onChange={handleChange} className={inputClasses} placeholder="e.g., 555-123-4567" />
        </div>
        <div className="space-y-1">
          <label htmlFor="currentProvider" className="font-medium text-brand-dark-gray dark:text-gray-300">Current Provider</label>
          <select id="currentProvider" name="currentProvider" value={formData.currentProvider} onChange={handleChange} className={inputClasses}>
            <option value="" disabled>Select a provider</option>
            {PROVIDERS.map(provider => (
              <option key={provider} value={provider}>{provider}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="numberOfPhones" className="font-medium text-brand-dark-gray dark:text-gray-300">Number of Phones</label>
          <input id="numberOfPhones" name="numberOfPhones" type="number" value={formData.numberOfPhones} onChange={handleChange} className={inputClasses} />
        </div>
        <div className="space-y-1">
          <label htmlFor="estimatedMonthlyPayment" className="font-medium text-brand-dark-gray dark:text-gray-300">Estimated Monthly Payment</label>
          <input id="estimatedMonthlyPayment" name="estimatedMonthlyPayment" type="number" step="0.01" value={formData.estimatedMonthlyPayment} onChange={handleChange} className={inputClasses} />
        </div>
        <div className="space-y-1">
          <label htmlFor="address" className="font-medium text-brand-dark-gray dark:text-gray-300">Address</label>
          <div className="relative">
            <input id="address" name="address" type="text" value={formData.address} onChange={handleChange} className={`${inputClasses} pr-10`} />
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={isLocating}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-gray hover:text-brand-blue disabled:text-gray-400 disabled:cursor-not-allowed"
              aria-label="Get current location"
            >
              {isLocating ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <CrosshairIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="revisitDate" className="font-medium text-brand-dark-gray dark:text-gray-300">Revisit Date & Time</label>
          <input id="revisitDate" name="revisitDate" type="datetime-local" value={formData.revisitDate} onChange={handleChange} className={inputClasses} />
        </div>
        <div className="space-y-1">
          <label htmlFor="notes" className="font-medium text-brand-dark-gray dark:text-gray-300">Notes</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={5} className={inputClasses} />
        </div>
      </main>
    </form>
  );
};

export default VisitForm;