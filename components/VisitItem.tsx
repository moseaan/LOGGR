import React, { useRef, useEffect } from 'react';
import type { Visit } from '../types';
import { PencilIcon, TrashIcon, CalendarPlusIcon, CheckIcon } from './icons';

type VisitItemProps = {
  visit: Visit;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onSwipeOpen: () => void;
  onSwipeClose: () => void;
};

/**
 * Formats an ISO date string into the format required by Google Calendar (YYYYMMDDTHHMMSSZ).
 * @param isoDate The date string to format.
 * @returns The formatted date string.
 */
const formatGoogleCalendarDate = (isoDate: string): string => {
  return new Date(isoDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};


const VisitItem: React.FC<VisitItemProps> = ({ visit, onSelect, onEdit, onDelete, isOpen, onSwipeOpen, onSwipeClose }) => {
  const visitDate = new Date(visit.timestamp);
  const formattedDate = visitDate.toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: '2-digit' });
  const formattedTime = visitDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

  const itemRef = useRef<HTMLDivElement>(null);
  const liRef = useRef<HTMLLIElement>(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startTranslateX: 0,
    draggedDistance: 0,
  }).current;

  const hasRevisitDate = !!visit.revisitDate;
  const actionsWidth = (hasRevisitDate ? 80 : 0) + 160; // Add 80px for the calendar button if it exists
  
  useEffect(() => {
    if (!isOpen) {
        setTranslateX(0);
    }
  }, [isOpen]);

  const setTranslateX = (x: number) => {
    if (itemRef.current) {
      itemRef.current.style.transition = 'transform 0.3s ease';
      itemRef.current.style.transform = `translateX(${x}px)`;
    }
  };

  const getClientX = (e: React.MouseEvent | React.TouchEvent) => {
    return 'touches' in e ? e.touches[0].clientX : e.clientX;
  };
  
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    dragState.isDragging = true;
    const clientX = getClientX(e);
    dragState.startX = clientX;
    const currentTransform = itemRef.current?.style.transform;
    dragState.startTranslateX = currentTransform ? parseInt(currentTransform.replace('translateX(', '').replace('px)', '')) : 0;
    dragState.draggedDistance = 0;
    if (itemRef.current) itemRef.current.style.transition = 'none';
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.isDragging) return;
    const clientX = getClientX(e);
    const diff = clientX - dragState.startX;
    dragState.draggedDistance = diff;
    let newTranslate = dragState.startTranslateX + diff;

    // constraints
    if (newTranslate > 0) newTranslate = 0;
    if (newTranslate < -(actionsWidth + 20)) newTranslate = -(actionsWidth + 20); // overdrag
    
    if (itemRef.current) {
        itemRef.current.style.transform = `translateX(${newTranslate}px)`;
    }
  };

  const onDragEnd = () => {
    if (!dragState.isDragging) return;
    dragState.isDragging = false;
    
    const currentTranslate = dragState.startTranslateX + dragState.draggedDistance;

    if (currentTranslate < -actionsWidth / 2) {
      setTranslateX(-actionsWidth);
      if (!isOpen) {
        onSwipeOpen();
      }
    } else {
      setTranslateX(0);
      if (isOpen) {
        onSwipeClose();
      }
    }
  };

  const handleAddToCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

    setTranslateX(0);
    onSwipeClose();
  };
  
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setTranslateX(0);
    onSwipeClose();
  };
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (Math.abs(dragState.draggedDistance) > 10) {
        return; // This was a drag, not a click
    }
    
    // Clicks on action buttons are handled separately and stop propagation.
    // This handler now only fires for clicks on the main content area.
    if (isOpen) {
      setTranslateX(0);
      onSwipeClose();
    } else {
      onSelect();
    }
  };

  return (
    <li 
      ref={liRef} 
      className="relative bg-white dark:bg-brand-dark-gray overflow-hidden border-b dark:border-gray-700"
      style={{ touchAction: 'pan-y' }}
      onMouseDown={onDragStart}
      onTouchStart={onDragStart}
      onMouseMove={onDragMove}
      onTouchMove={onDragMove}
      onMouseUp={onDragEnd}
      onMouseLeave={onDragEnd}
      onTouchEnd={onDragEnd}
      onClick={handleClick}
    >
      {/* Actions container */}
      <div className="absolute top-0 right-0 h-full flex z-0">
        {hasRevisitDate && (
           <div
             onClick={handleAddToCalendarClick}
             className="w-20 h-full flex items-center justify-center bg-green-500 text-white cursor-pointer"
             aria-label={`Add to calendar for ${visit.businessName}`}
           >
             <CalendarPlusIcon className="w-6 h-6" />
           </div>
        )}
        <div
          onClick={handleEditClick}
          className="w-20 h-full flex items-center justify-center bg-brand-blue text-white cursor-pointer"
          aria-label={`Edit visit for ${visit.businessName}`}
        >
          <PencilIcon className="w-6 h-6" />
        </div>
        <div
          onClick={handleDeleteClick}
          className="w-20 h-full flex items-center justify-center bg-red-600 text-white cursor-pointer"
          aria-label={`Delete visit for ${visit.businessName}`}
        >
          <TrashIcon className="w-6 h-6" />
        </div>
      </div>

      {/* Swipeable content */}
      <div
        ref={itemRef}
        className="relative w-full bg-white dark:bg-brand-dark-gray z-10 cursor-pointer"
      >
        <div className="px-4 py-4 pointer-events-none">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 truncate">
              <h2 className="font-semibold text-brand-dark-gray dark:text-gray-200 text-lg truncate">{visit.businessName}</h2>
              {visit.isRevisitSuccessful && <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />}
            </div>
            <div className="text-sm text-brand-gray dark:text-gray-400 flex-shrink-0 text-right">
              <span>{formattedDate}</span>
              <span className="ml-2">{formattedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};

export default VisitItem;