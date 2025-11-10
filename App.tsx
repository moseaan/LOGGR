
import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Visit } from './types';
import VisitList from './components/VisitList';
import VisitDetail from './components/VisitDetail';
import VisitForm from './components/VisitForm';

type View = 'list' | 'detail' | 'form';

const App: React.FC = () => {
  const [visits, setVisits] = useLocalStorage<Visit[]>('business-visits', []);
  const [view, setView] = useState<View>('list');
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const selectedVisit = useMemo(() => {
    if (!selectedVisitId) return null;
    return visits.find(v => v.id === selectedVisitId) || null;
  }, [selectedVisitId, visits]);

  const handleSelectVisit = (id: string) => {
    setSelectedVisitId(id);
    setView('detail');
  };

  const handleGoBack = () => {
    if (view === 'detail') {
      setView('list');
      setSelectedVisitId(null);
    } else if (view === 'form') {
      if (isEditing && selectedVisit) {
        setView('detail');
      } else {
        setView('list');
      }
      setIsEditing(false);
    }
  };

  const handleNewVisit = () => {
    setSelectedVisitId(null);
    setIsEditing(false);
    setView('form');
  };

  const handleEditVisit = () => {
    if (selectedVisit) {
      setIsEditing(true);
      setView('form');
    }
  };
  
  const handleEditVisitFromList = (id: string) => {
    setSelectedVisitId(id);
    setIsEditing(true);
    setView('form');
  };

  const handleDeleteVisit = (id: string) => {
    if (window.confirm('Are you sure you want to delete this visit?')) {
      setVisits(prevVisits => prevVisits.filter(v => v.id !== id));
      if (selectedVisitId === id) {
          setView('list');
          setSelectedVisitId(null);
      }
    }
  };

  const handleSaveVisit = (visit: Omit<Visit, 'id' | 'timestamp' | 'lastModified'> & { id?: string }) => {
    if (visit.id) {
      // Editing existing visit
      setVisits(prevVisits => prevVisits.map(v => v.id === visit.id ? { ...v, ...visit, timestamp: v.timestamp, lastModified: new Date().toISOString() } : v));
    } else {
      // Creating new visit
      const newVisit: Visit = {
        ...visit,
        id: new Date().toISOString() + Math.random(),
        timestamp: new Date().toISOString(),
      };
      setVisits(prevVisits => [newVisit, ...prevVisits]);
    }
    setView('list');
    setSelectedVisitId(null);
    setIsEditing(false);
  };

  const handleToggleRevisitSuccess = (id: string) => {
    setVisits(prevVisits => 
      prevVisits.map(v => 
        v.id === id 
          ? { ...v, isRevisitSuccessful: !v.isRevisitSuccessful, lastModified: new Date().toISOString() } 
          : v
      )
    );
  };
  
  const renderContent = () => {
    switch (view) {
      case 'detail':
        return selectedVisit && (
          <VisitDetail
            visit={selectedVisit}
            onBack={handleGoBack}
            onEdit={handleEditVisit}
            onDelete={() => handleDeleteVisit(selectedVisit.id)}
            onToggleRevisitSuccess={() => handleToggleRevisitSuccess(selectedVisit.id)}
          />
        );
      case 'form':
        return (
          <VisitForm
            onSave={handleSaveVisit}
            onCancel={handleGoBack}
            initialVisit={isEditing ? selectedVisit : null}
          />
        );
      case 'list':
      default:
        return (
          <VisitList
            visits={visits}
            onSelectVisit={handleSelectVisit}
            onNewVisit={handleNewVisit}
            setVisits={setVisits}
            onEditVisit={handleEditVisitFromList}
            onDeleteVisit={handleDeleteVisit}
          />
        );
    }
  };

  return (
    <div className="bg-brand-light-gray dark:bg-black min-h-screen font-sans">
      <div className="max-w-lg mx-auto bg-white dark:bg-brand-dark-gray min-h-screen shadow-2xl flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;