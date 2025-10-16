import React, { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useUsers } from '../hooks/useUsers';
import NotionCard from '../components/ui/NotionCard';
import { CalendarIcon } from '../assets/icons';
import { Event } from '../types';
import EventDetailModal from '../components/events/EventDetailModal';
import EventFormModal from '../components/events/EventFormModal';

const DashboardPage: React.FC = () => {
  const { events, isLoading, error, addEvent, updateEvent } = useEvents();
  const { users } = useUsers();
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for comparison

    return events
      .filter(e => 
        (e.estado === 'Confirmado' || e.estado === 'Armado') && 
        new Date(e.fechaEvento.start) >= today
      )
      .sort((a, b) => new Date(a.fechaEvento.start).getTime() - new Date(b.fechaEvento.start).getTime());
  }, [events]);

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormModalOpen(true);
  };

  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdBy' | 'updatedAt'>, id?: string) => {
    if (id) {
      await updateEvent(id, eventData);
    } else {
      await addEvent(eventData);
    }
    setFormModalOpen(false);
  };

  const handleEditFromDetail = (eventToEdit: Event) => {
    setViewingEvent(null);
    handleOpenEditModal(eventToEdit);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
           <svg className="animate-spin h-8 w-8 text-notion-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }
    
    if (upcomingEvents.length > 0) {
      return (
        <ul className="space-y-4">
          {upcomingEvents.map(event => (
            <li 
              key={event.id} 
              onClick={() => setViewingEvent(event)}
              className="flex items-center p-3 -m-2 rounded-lg hover:bg-notion-hover cursor-pointer"
            >
              <div className="flex-shrink-0 mr-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-notion-sidebar">
                  <CalendarIcon className="h-5 w-5 text-notion-accent" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium">{event.titulo}</p>
                <p className="text-sm text-gray-400">
                  {new Date(event.fechaEvento.start).toLocaleDateString('es-ES', { timeZone: 'UTC' })}
                </p>
              </div>
            </li>
          ))}
        </ul>
      );
    }

    return <p className="text-gray-400">No hay próximos eventos confirmados o en armado.</p>;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <NotionCard title="Próximos Eventos">
        {renderContent()}
      </NotionCard>

      <EventDetailModal
        isOpen={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        event={viewingEvent}
        users={users}
        onEdit={handleEditFromDetail}
      />
      <EventFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        onSave={handleSaveEvent} 
        eventToEdit={selectedEvent} 
        defaultStartDate={null}
      />
    </div>
  );
};

export default DashboardPage;