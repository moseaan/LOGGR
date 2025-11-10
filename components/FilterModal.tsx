
import React, { useState, useEffect } from 'react';
import { PROVIDERS } from '../constants';
import type { Visit } from '../types';

export type Filters = {
  sortBy: 'newest' | 'oldest' | 'lastModified';
  visitType: 'all' | Visit['visitType'];
  providers: string[];
};

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  onClear: () => void;
  currentFilters: Filters;
};

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApply, onClear, currentFilters }) => {
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

  useEffect(() => {
    // Reset local state if modal is reopened or current filters change from parent
    if (isOpen) {
      setLocalFilters(currentFilters);
    }
  }, [currentFilters, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleProviderToggle = (provider: string) => {
    setLocalFilters(prev => {
      const newProviders = prev.providers.includes(provider)
        ? prev.providers.filter(p => p !== provider)
        : [...prev.providers, provider];
      return { ...prev, providers: newProviders };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center sm:justify-center animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-modal-title"
    >
      <div 
        className="bg-white dark:bg-brand-dark-gray rounded-t-xl sm:rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <header className="p-4 border-b dark:border-gray-700 flex justify-center items-center relative">
          <h2 id="filter-modal-title" className="text-xl font-bold text-brand-dark-gray dark:text-gray-100">Filters</h2>
          <button 
            onClick={onClose} 
            className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl text-brand-gray dark:text-gray-400 hover:text-black dark:hover:text-white"
          >
            &times;
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          <fieldset>
            <legend className="font-semibold text-brand-dark-gray dark:text-gray-300 mb-2">Sort By</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="sortBy" value="newest" checked={localFilters.sortBy === 'newest'} onChange={() => setLocalFilters(f => ({ ...f, sortBy: 'newest' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">Newest First</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="sortBy" value="oldest" checked={localFilters.sortBy === 'oldest'} onChange={() => setLocalFilters(f => ({ ...f, sortBy: 'oldest' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">Oldest First</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="sortBy" value="lastModified" checked={localFilters.sortBy === 'lastModified'} onChange={() => setLocalFilters(f => ({ ...f, sortBy: 'lastModified' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">Last Modified</span>
              </label>
            </div>
          </fieldset>
          
          <fieldset>
            <legend className="font-semibold text-brand-dark-gray dark:text-gray-300 mb-2">Visit Type</legend>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="visitType" value="all" checked={localFilters.visitType === 'all'} onChange={() => setLocalFilters(f => ({ ...f, visitType: 'all' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">All</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="visitType" value="Follow-Up" checked={localFilters.visitType === 'Follow-Up'} onChange={() => setLocalFilters(f => ({ ...f, visitType: 'Follow-Up' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">Follow-Up</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="visitType" value="Crawlback" checked={localFilters.visitType === 'Crawlback'} onChange={() => setLocalFilters(f => ({ ...f, visitType: 'Crawlback' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">Crawlback</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="visitType" value="Call" checked={localFilters.visitType === 'Call'} onChange={() => setLocalFilters(f => ({ ...f, visitType: 'Call' }))} />
                <span className="text-brand-dark-gray dark:text-gray-200">Call</span>
              </label>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-semibold text-brand-dark-gray dark:text-gray-300 mb-2">Providers</legend>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {PROVIDERS.map(provider => (
                <label key={provider} className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" checked={localFilters.providers.includes(provider)} onChange={() => handleProviderToggle(provider)} />
                  <span className="text-brand-dark-gray dark:text-gray-200">{provider}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </main>
        
        <footer className="p-4 border-t dark:border-gray-700 flex items-center justify-between bg-brand-light-gray/50 dark:bg-black/20">
          <button onClick={handleClear} className="px-4 py-2 text-brand-gray dark:text-gray-400 font-semibold hover:text-brand-dark-gray dark:hover:text-white rounded-lg transition-colors">
            Clear Filters
          </button>
          <button onClick={handleApply} className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow">
            Apply Filters
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FilterModal;