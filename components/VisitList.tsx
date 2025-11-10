import React, { useState, useMemo, useRef } from 'react';
import type { Visit } from '../types';
import VisitItem from './VisitItem';
import FilterModal, { type Filters } from './FilterModal';
import { SearchIcon, PlusIcon, FileImportIcon, FileExportIcon, SunIcon, MoonIcon, RefreshIcon, FilterIcon } from './icons';
import { useTheme } from '../hooks/useTheme';

type VisitListProps = {
  visits: Visit[];
  onSelectVisit: (id: string) => void;
  onNewVisit: () => void;
  setVisits: React.Dispatch<React.SetStateAction<Visit[]>>;
  onEditVisit: (id: string) => void;
  onDeleteVisit: (id: string) => void;
};

const initialFilters: Filters = { sortBy: 'newest', visitType: 'all', providers: [] };

const VisitList: React.FC<VisitListProps> = ({ visits, onSelectVisit, onNewVisit, setVisits, onEditVisit, onDeleteVisit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme, toggleTheme] = useTheme();
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Filters>(initialFilters);

  const filteredVisits = useMemo(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    return visits
      .filter(visit => {
        if (activeFilters.visitType !== 'all' && visit.visitType !== activeFilters.visitType) return false;
        if (activeFilters.providers.length > 0 && !activeFilters.providers.includes(visit.currentProvider)) return false;
        if (searchQuery && !(
            visit.businessName.toLowerCase().includes(lowerCaseQuery) ||
            visit.contactPerson.toLowerCase().includes(lowerCaseQuery) ||
            visit.address.toLowerCase().includes(lowerCaseQuery)
        )) return false;
        return true;
      })
      .sort((a, b) => {
        if (activeFilters.sortBy === 'lastModified') {
            const timeA = new Date(a.lastModified || a.timestamp).getTime();
            const timeB = new Date(b.lastModified || b.timestamp).getTime();
            return timeB - timeA;
        }
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return activeFilters.sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [visits, searchQuery, activeFilters]);
  
  const handleExport = () => {
    if (visits.length === 0) {
      alert("There are no logs to export.");
      return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(visits, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `business-visits-log-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error("File is not readable");
        const importedVisits = JSON.parse(text) as Visit[];
        
        if (Array.isArray(importedVisits) && importedVisits.every(v => v.id && v.businessName && v.timestamp)) {
          if (window.confirm(`Are you sure you want to replace all ${visits.length} existing logs with ${importedVisits.length} imported logs? This action cannot be undone.`)) {
              setVisits(importedVisits);
              alert('Logs imported successfully!');
          }
        } else {
          throw new Error('Invalid file format. Ensure the file is a valid JSON export from this application.');
        }
      } catch (error) {
        alert(`Failed to import logs. Please check the file format. Error: ${error.message}`);
        console.error(error);
      }
    };
    reader.readAsText(file);
    if(event.target) event.target.value = '';
  };

  const handleRefresh = () => {
    setSearchQuery('');
    setOpenItemId(null);
    setActiveFilters(initialFilters);
  };

  const handleApplyFilters = (filters: Filters) => {
    setActiveFilters(filters);
  };
  const handleClearFilters = () => {
    setActiveFilters(initialFilters);
  };

  const isFilterActive = activeFilters.sortBy !== 'newest' || activeFilters.visitType !== 'all' || activeFilters.providers.length > 0;

  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 bg-white/80 dark:bg-brand-dark-gray/80 backdrop-blur-sm z-10 px-4 pt-4 pb-2 border-b dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-brand-dark-gray dark:text-gray-100">LOGGR</h1>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button onClick={handleRefresh} className="p-2 text-brand-gray dark:text-gray-400 transition-colors" aria-label="Refresh and clear search">
                <RefreshIcon className="w-6 h-6" />
              </button>
              <button onClick={toggleTheme} className="p-2 text-brand-gray dark:text-gray-400 transition-colors" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
                {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
              </button>
              <button onClick={handleImportClick} className="p-2 text-brand-gray dark:text-gray-400 transition-colors" aria-label="Import logs">
                <FileImportIcon className="w-6 h-6" />
              </button>
              <button onClick={handleExport} className="p-2 text-brand-gray dark:text-gray-400 transition-colors" aria-label="Export logs">
                <FileExportIcon className="w-6 h-6" />
              </button>
            </div>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-brand-light-gray text-brand-dark-gray placeholder:text-gray-500 dark:bg-zinc-800 dark:text-gray-200 border border-transparent dark:border-gray-700 rounded-lg focus:ring-brand-blue focus:border-brand-blue focus:bg-white dark:focus:bg-zinc-900 transition-colors"
          />
           <button 
            onClick={() => setFilterModalOpen(true)} 
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
              isFilterActive
                ? 'text-brand-blue'
                : 'text-brand-gray dark:text-gray-400'
            }`} 
            aria-label="Open filters"
           >
            <FilterIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto">
        {filteredVisits.length > 0 ? (
          <ul>
            {filteredVisits.map(visit => (
              <VisitItem
                key={visit.id}
                visit={visit}
                onSelect={() => onSelectVisit(visit.id)}
                onEdit={() => onEditVisit(visit.id)}
                onDelete={() => onDeleteVisit(visit.id)}
                isOpen={openItemId === visit.id}
                onSwipeOpen={() => setOpenItemId(visit.id)}
                onSwipeClose={() => setOpenItemId(null)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-10 text-brand-gray dark:text-gray-500">
            <p>{searchQuery || isFilterActive ? 'No visits match your search or filters.' : 'No visits logged yet.'}</p>
          </div>
        )}
      </main>
      <footer className="p-4 border-t dark:border-gray-700">
        <button
          onClick={onNewVisit}
          className="w-full bg-brand-blue text-white py-3 rounded-lg flex items-center justify-center text-lg font-semibold hover:bg-blue-600 transition-colors shadow"
          aria-label="Create new visit"
        >
          <PlusIcon className="w-6 h-6 mr-2" />
          New Visit
        </button>
      </footer>
       <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".json,application/json"
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        currentFilters={activeFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
    </div>
  );
};

export default VisitList;