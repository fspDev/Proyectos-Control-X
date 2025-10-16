import React, { useState, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useSearch } from '../contexts/SearchContext';
import { useUsers } from '../hooks/useUsers';
import NotionCard from '../components/ui/NotionCard';
import Dropdown from '../components/ui/Dropdown';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import EventFormModal from '../components/events/EventFormModal';
import EventDetailModal from '../components/events/EventDetailModal';
import { Event } from '../types';
import { PlusIcon, EllipsisVerticalIcon, PencilIcon, TrashIcon, FilterIcon } from '../assets/icons';

const TableViewPage: React.FC = () => {
  const { events, isLoading, error, addEvent, updateEvent, removeEvent } = useEvents();
  const { users } = useUsers();
  const { searchQuery } = useSearch();

  const [statusFilter, setStatusFilter] = useState<Event['estado'] | 'All'>('All');
  const [clientFilter, setClientFilter] = useState<string>('All');

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);

  const clients = useMemo(() => ['All', ...Array.from(new Set(events.map(e => e.cliente)))], [events]);
  const statuses: (Event['estado'] | 'All')[] = ['All', 'Negociación', 'Confirmado', 'Armado', 'Finalizado'];

  const filteredEvents = useMemo(() => {
    return events
      .filter(event => statusFilter === 'All' || event.estado === statusFilter)
      .filter(event => clientFilter === 'All' || event.cliente === clientFilter)
      .filter(event => {
        const query = searchQuery.toLowerCase();
        return (
          event.titulo.toLowerCase().includes(query) ||
          event.cliente.toLowerCase().includes(query) ||
          event.lugar.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(a.fechaEvento.start).getTime() - new Date(b.fechaEvento.start).getTime());
  }, [events, statusFilter, clientFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setSelectedEvent(null);
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (event: Event) => {
    setSelectedEvent(event);
    setFormModalOpen(true);
  };
  
  const handleOpenDeleteModal = (event: Event) => {
    setSelectedEvent(event);
    setConfirmModalOpen(true);
  };
  
  const handleSaveEvent = async (eventData: Omit<Event, 'id' | 'createdBy' | 'updatedAt'>, id?: string) => {
    if (id) {
      await updateEvent(id, eventData);
    } else {
      await addEvent(eventData);
    }
    setFormModalOpen(false);
  };
  
  const handleDeleteEvent = async () => {
    if (selectedEvent) {
      await removeEvent(selectedEvent.id);
    }
    setConfirmModalOpen(false);
  };

  const handleStatusChange = async (eventId: string, newStatus: Event['estado']) => {
    await updateEvent(eventId, { estado: newStatus });
  };

  const getStatusClass = (status: Event['estado']) => {
    switch (status) {
      case 'Negociación': return 'bg-yellow-900 text-yellow-300';
      case 'Confirmado': return 'bg-blue-900 text-blue-300';
      case 'Armado': return 'bg-purple-900 text-purple-300';
      case 'Finalizado': return 'bg-green-900 text-green-300';
      default: return 'bg-gray-700 text-gray-300';
    }
  };

  const handleEditFromDetail = (eventToEdit: Event) => {
    setViewingEvent(null);
    handleOpenEditModal(eventToEdit);
  };
  
  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="text-center py-10">
            <svg className="animate-spin h-8 w-8 text-notion-accent mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </td>
        </tr>
      );
    }
    if (error) {
      return <tr><td colSpan={6} className="text-center py-10 text-red-500">{error}</td></tr>;
    }
    if (filteredEvents.length === 0) {
      return <tr><td colSpan={6} className="text-center py-10 text-gray-500">No se encontraron eventos.</td></tr>;
    }
    return filteredEvents.map((event) => (
      <tr key={event.id} onClick={() => setViewingEvent(event)} className="border-b border-notion-border hover:bg-notion-hover cursor-pointer">
        <td className="px-6 py-4 font-medium whitespace-nowrap">{event.titulo}</td>
        <td className="px-6 py-4">{event.cliente}</td>
        <td className="px-6 py-4">{event.lugar}</td>
        <td className="px-6 py-4">{new Date(event.fechaEvento.start).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
          <Dropdown trigger={
            <button className={`px-2 py-1 text-xs font-medium rounded-full w-28 text-center transition-colors ${getStatusClass(event.estado)}`}>
              {event.estado}
            </button>
          }>
             {(statuses.filter(s => s !== 'All' && s !== event.estado) as Event['estado'][]).map(status => (
                <button
                    key={status}
                    onClick={() => handleStatusChange(event.id, status)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-notion-hover"
                >
                    {status}
                </button>
            ))}
          </Dropdown>
        </td>
        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
          <Dropdown trigger={<button className="p-2 rounded-full hover:bg-notion-hover"><EllipsisVerticalIcon className="h-5 w-5" /></button>}>
            <button onClick={() => handleOpenEditModal(event)} className="flex items-center w-full px-4 py-2 text-sm text-left text-gray-200 hover:bg-notion-hover"><PencilIcon className="h-4 w-4 mr-2" /> Editar</button>
            <button onClick={() => handleOpenDeleteModal(event)} className="flex items-center w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-notion-hover"><TrashIcon className="h-4 w-4 mr-2" /> Eliminar</button>
          </Dropdown>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Proyectos</h1>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 px-3 py-1.5 bg-notion-accent text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
          <PlusIcon className="h-4 w-4" /> Nuevo Evento
        </button>
      </div>
      <NotionCard title="Todos los Eventos">
        <div className="p-4 flex items-center gap-4 border-b border-notion-border">
          <FilterIcon className="h-5 w-5 text-gray-500" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Estado:</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as Event['estado'] | 'All')} className="text-sm bg-notion-sidebar rounded-md border-notion-border focus:ring-notion-accent focus:border-notion-accent">
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'Todos' : s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Cliente:</label>
            <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="text-sm bg-notion-sidebar rounded-md border-notion-border focus:ring-notion-accent focus:border-notion-accent">
              {clients.map(c => <option key={c} value={c}>{c === 'All' ? 'Todos' : c}</option>)}
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-notion-sidebar">
              <tr>
                <th scope="col" className="px-6 py-3">Evento</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Lugar</th>
                <th scope="col" className="px-6 py-3">Fecha Evento</th>
                <th scope="col" className="px-6 py-3">Estado</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {renderTableContent()}
            </tbody>
          </table>
        </div>
      </NotionCard>
      <EventFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setFormModalOpen(false)} 
        onSave={handleSaveEvent} 
        eventToEdit={selectedEvent} 
        defaultStartDate={null}
      />
      <ConfirmationModal isOpen={isConfirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={handleDeleteEvent} title="Eliminar Evento" message={`¿Estás seguro de que quieres eliminar "${selectedEvent?.titulo}"? Esta acción no se puede deshacer.`} />
      <EventDetailModal
        isOpen={!!viewingEvent}
        onClose={() => setViewingEvent(null)}
        event={viewingEvent}
        users={users}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
};

export default TableViewPage;