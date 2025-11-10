
import React from 'react';
import type { Visit } from '../types';
import { ChevronLeftIcon, PencilIcon, TrashIcon, UserIcon, PhoneIcon, DollarIcon, WifiIcon, LocationIcon, DocumentIcon, ClockIcon, CalendarPlusIcon, CheckCircleIcon, CheckIcon } from './icons';

type VisitDetailProps = {
  visit: Visit;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleRevisitSuccess: () => void;
};

const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value?: string | number | null; children?: React.ReactNode }> = ({ icon, label, value, children }) => {
    if ((value === null || value === undefined || value === '') && !children) return null;
    return (
        <div className="flex items-start py-3">
            <div className="text-brand-gray dark:text-gray-400 w-6 mr-4 mt-1">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-brand-gray dark:text-gray-400">{label}</p>
                {children ? <div className="text-brand-dark-gray dark:text-gray-200">{children}</div> : <p className="text-brand-dark-gray dark:text-gray-200">{value}</p>}
            </div>
        </div>
    );
};


const VisitDetail: React.FC<VisitDetailProps> = ({ visit, onBack, onEdit, onDelete, onToggleRevisitSuccess }) => {
  const formattedDate = new Date(visit.timestamp).toLocaleString(undefined, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const formattedRevisitDate = visit.revisitDate
    ? new Date(visit.revisitDate).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : null;

  const formattedPayment = visit.estimatedMonthlyPayment === null
    ? 'Unknown'
    : visit.estimatedMonthlyPayment.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
      
  const formatGoogleCalendarDate = (isoDate: string): string => {
    return new Date(isoDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const handleAddToCalendarClick = () => {
    if (!visit.revisitDate) return;

    const baseUrl = 'https://www.google.com/calendar/render?action=TEMPLATE';
    const title = `${visit.visitType} with ${visit.businessName}`;
    const startDate = new Date(visit.revisitDate);
    // Default to a 1-hour event
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const dates = `${formatGoogleCalendarDate(startDate.toISOString())}/${formatGoogleCalendarDate(endDate.toISOString())}`;
    
    const params = new URLSearchParams({
        text: title,
        dates: dates,
        location: visit.address,
        details: visit.notes,
    });

    const url = `${baseUrl}&${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  return (
    <div className="flex flex-col h-full">
      <header className="sticky top-0 bg-white/80 dark:bg-brand-dark-gray/80 backdrop-blur-sm z-10 px-2 py-1 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
            <button onClick={onBack} className="flex items-center text-brand-blue p-2">
                <ChevronLeftIcon className="w-6 h-6" />
                <span className="text-lg">Back</span>
            </button>
            <div className="flex items-center space-x-1">
                {visit.revisitDate && (
                  <>
                    <button 
                      onClick={onToggleRevisitSuccess} 
                      className="p-2 text-brand-dark-gray dark:text-gray-200 hover:text-brand-gray dark:hover:text-gray-400 transition-colors"
                      aria-label={visit.isRevisitSuccessful ? "Unmark revisit as successful" : "Mark revisit as successful"}
                    >
                      <CheckCircleIcon className="w-6 h-6" />
                    </button>
                    <button onClick={handleAddToCalendarClick} className="p-2 text-green-500" aria-label="Add revisit to calendar">
                      <CalendarPlusIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
                <button onClick={onEdit} className="p-2 text-brand-blue" aria-label="Edit visit">
                    <PencilIcon className="w-6 h-6" />
                </button>
                <button onClick={onDelete} className="p-2 text-red-500" aria-label="Delete visit">
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
      </header>
      <main className="flex-grow overflow-y-auto p-4">
        <div className="pb-4 border-b dark:border-gray-700">
            <h1 className="text-3xl font-bold text-brand-dark-gray dark:text-gray-100">{visit.businessName}</h1>
            <div className="flex items-center mt-2 space-x-2">
              <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                visit.visitType === 'Follow-Up'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : visit.visitType === 'Crawlback'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {visit.visitType}
              </span>
              {visit.isRevisitSuccessful && <CheckIcon className="w-5 h-5 text-green-500" />}
            </div>
        </div>
        <div className="divide-y dark:divide-gray-700 mt-2">
            <DetailRow icon={<ClockIcon className="w-5 h-5" />} label="Visit Time" value={formattedDate} />
            <DetailRow icon={<UserIcon className="w-5 h-5" />} label="Contact Person" value={visit.contactPerson} />
            <DetailRow icon={<UserIcon className="w-5 h-5" />} label="Owner Name" value={visit.ownerName} />
            <DetailRow icon={<PhoneIcon className="w-5 h-5" />} label="Owner Contact">
                {visit.ownerContact ? (
                    <a href={`tel:${visit.ownerContact.replace(/\D/g, '')}`} className="text-brand-blue hover:underline">
                        {visit.ownerContact}
                    </a>
                ) : 'Not Provided'}
            </DetailRow>
            <DetailRow icon={<WifiIcon className="w-5 h-5" />} label="Current Provider" value={visit.currentProvider} />
            <DetailRow icon={<PhoneIcon className="w-5 h-5" />} label="Number of Phones" value={visit.numberOfPhones ?? 'Unknown'} />
            <DetailRow icon={<DollarIcon className="w-5 h-5" />} label="Est. Monthly Payment" value={formattedPayment} />
            <DetailRow icon={<LocationIcon className="w-5 h-5" />} label="Address" value={visit.address} />
            <DetailRow icon={<CalendarPlusIcon className="w-5 h-5" />} label="Revisit Date" value={formattedRevisitDate || 'Not set'} />
            <DetailRow icon={<DocumentIcon className="w-5 h-5" />} label="Notes">
              <p className="whitespace-pre-wrap text-brand-dark-gray dark:text-gray-200">{visit.notes || 'No notes added.'}</p>
            </DetailRow>
        </div>
      </main>
    </div>
  );
};

export default VisitDetail;
