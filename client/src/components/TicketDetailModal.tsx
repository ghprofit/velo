'use client';

import { useGetTicketByIdQuery, useUpdateTicketStatusMutation, useUpdateTicketPriorityMutation, useAssignTicketMutation } from '@/state/api';

interface TicketDetailModalProps {
  ticketId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function TicketDetailModal({ ticketId, isOpen, onClose }: TicketDetailModalProps) {
  const { data: ticketData, isLoading } = useGetTicketByIdQuery(ticketId, {
    skip: !isOpen || !ticketId,
  });

  const [updateStatus] = useUpdateTicketStatusMutation();
  const [updatePriority] = useUpdateTicketPriorityMutation();
  const [assignTicket] = useAssignTicketMutation();

  if (!isOpen) return null;

  const ticket = ticketData?.data;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateStatus({ id: ticketId, status: newStatus }).unwrap();
    } catch {
      alert('Failed to update ticket status');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      await updatePriority({ id: ticketId, priority: newPriority }).unwrap();
    } catch {
      alert('Failed to update ticket priority');
    }
  };

  const handleAssignChange = async (assignedTo: string) => {
    try {
      await assignTicket({ id: ticketId, assignedTo }).unwrap();
    } catch {
      alert('Failed to assign ticket');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        {isLoading ? (
          <div className="py-12 text-center">Loading ticket details...</div>
        ) : ticket ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Ticket #{ticket.id.slice(0, 8)}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                <p className="text-gray-900">{ticket.email}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <p className="text-gray-900 font-semibold">{ticket.subject}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <p className="text-gray-900 whitespace-pre-wrap">{ticket.message}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={ticket.assignedTo || ''}
                  onChange={(e) => handleAssignChange(e.target.value)}
                  onBlur={(e) => {
                    if (e.target.value !== ticket.assignedTo) {
                      handleAssignChange(e.target.value);
                    }
                  }}
                  placeholder="Admin name or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Ticket Information</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Created:</span> {new Date(ticket.createdAt).toLocaleString()}</p>
                  <p><span className="font-medium">Updated:</span> {new Date(ticket.updatedAt).toLocaleString()}</p>
                  {ticket.resolvedAt && (
                    <p><span className="font-medium">Resolved:</span> {new Date(ticket.resolvedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-gray-600">Ticket not found</div>
        )}
      </div>
    </div>
  );
}
