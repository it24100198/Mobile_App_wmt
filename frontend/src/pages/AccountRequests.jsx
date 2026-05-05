import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveRegistrationRequest,
  getNextEmployeeId,
  getSections,
  listRegistrationRequests,
  rejectRegistrationRequest,
} from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'operator', label: 'Operator' },
  { value: 'employee', label: 'Employee' },
];

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString();
};

const getRequestedRole = (request) =>
  request?.requestedRole || request?.requestedDepartment || request?.assignedRole || '';

const statusLabel = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

const statusBadgeClass = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  rejected: 'bg-rose-100 text-rose-800 border-rose-200',
};

const emptyApproval = {
  request: null,
  employeeId: '',
  role: 'employee',
  productionSectionId: '',
};

export default function AccountRequests() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [approval, setApproval] = useState(emptyApproval);
  const [rejection, setRejection] = useState({ request: null, reason: '' });
  const [actionError, setActionError] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['registration-requests', 'pending'],
    queryFn: () => listRegistrationRequests('pending').then((res) => res.data),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => getSections().then((res) => res.data),
  });

  const nextEmployeeIdQuery = useQuery({
    queryKey: ['next-employee-id', approval.request?._id],
    queryFn: () => getNextEmployeeId().then((res) => res.data),
    enabled: Boolean(approval.request),
  });

  const visibleRequests = useMemo(
    () => requests.filter((request) => ['pending', 'approved', 'rejected'].includes(request.status)),
    [requests]
  );

  const suggestedEmployeeId = String(nextEmployeeIdQuery.data?.employeeId || '').trim();

  const updateRequestStatus = (id, status, extra = {}) => {
    qc.setQueryData(['registration-requests', 'pending'], (current = []) =>
      current.map((request) => (request._id === id ? { ...request, ...extra, status } : request))
    );
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, body }) => approveRegistrationRequest(id, body),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: ['registration-requests', 'pending'] });
      const previous = qc.getQueryData(['registration-requests', 'pending']);
      updateRequestStatus(id, 'approved');
      return { previous };
    },
    onSuccess: (res, { id }) => {
      updateRequestStatus(id, 'approved', res.data || {});
      setActionError('');
      setApproval(emptyApproval);
    },
    onError: (err, _variables, context) => {
      if (context?.previous) qc.setQueryData(['registration-requests', 'pending'], context.previous);
      setActionError(err.response?.data?.error || err.message || 'Could not approve request.');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, body }) => rejectRegistrationRequest(id, body),
    onMutate: async ({ id, body }) => {
      await qc.cancelQueries({ queryKey: ['registration-requests', 'pending'] });
      const previous = qc.getQueryData(['registration-requests', 'pending']);
      updateRequestStatus(id, 'rejected', { rejectionReason: body.rejectionReason });
      return { previous };
    },
    onSuccess: (res, { id }) => {
      updateRequestStatus(id, 'rejected', res.data || {});
      setActionError('');
      setRejection({ request: null, reason: '' });
    },
    onError: (err, _variables, context) => {
      if (context?.previous) qc.setQueryData(['registration-requests', 'pending'], context.previous);
      setActionError(err.response?.data?.error || err.message || 'Could not reject request.');
    },
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
        Only administrators can access account requests.
      </div>
    );
  }

  const openApproval = (request) => {
    setActionError('');
    setRejection({ request: null, reason: '' });
    setApproval({
      ...emptyApproval,
      request,
      role: request.assignedRole || 'employee',
    });
  };

  const openRejection = (request) => {
    setActionError('');
    setApproval(emptyApproval);
    setRejection({ request, reason: '' });
  };

  const onApprove = () => {
    if (!approval.request) return;
    if (!approval.role) {
      setActionError('Select a role before approving this request.');
      return;
    }

    setActionError('');
    approveMutation.mutate({
      id: approval.request._id,
      body: {
        employeeId: (approval.employeeId || suggestedEmployeeId).trim(),
        role: approval.role,
        productionSectionId: approval.productionSectionId || null,
      },
    });
  };

  const onReject = () => {
    if (!rejection.request) return;
    if (!rejection.reason.trim()) {
      setActionError('Rejection reason is required.');
      return;
    }

    setActionError('');
    rejectMutation.mutate({
      id: rejection.request._id,
      body: { rejectionReason: rejection.reason.trim() },
    });
  };

  const actionRequest = approval.request || rejection.request;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pending User Requests</h1>
        <p className="text-sm text-slate-500">Approve access, assign roles, or reject employee account requests.</p>
      </div>

      {actionError && !actionRequest && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-slate-500">Loading pending account requests...</div>
        ) : visibleRequests.length === 0 ? (
          <div className="p-6 text-slate-500">No pending registration requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Requested Role</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Requested Date</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRequests.map((request) => {
                  const requestedRole = getRequestedRole(request);
                  const isPending = request.status === 'pending';

                  return (
                    <tr key={request._id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{request.fullName}</div>
                        <div className="font-mono text-xs text-slate-400">{request._id.slice(-8).toUpperCase()}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{request.email}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {requestedRole ? requestedRole.replace(/_/g, ' ') : 'Not requested'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{request.phoneNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{formatDate(request.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${statusBadgeClass[request.status] || statusBadgeClass.pending}`}>
                          {statusLabel[request.status] || 'Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isPending ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openApproval(request)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejection(request)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {approval.request && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 sm:items-center">
          <div className="w-full max-w-lg rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Approve Request</h2>
                <p className="text-sm text-slate-500">{approval.request.fullName} - {approval.request.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setApproval(emptyApproval)}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {actionError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Employee ID</label>
                <input
                  value={approval.employeeId || suggestedEmployeeId}
                  onChange={(e) => setApproval((prev) => ({ ...prev, employeeId: e.target.value }))}
                  placeholder="EMP-001"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                {nextEmployeeIdQuery.isLoading && (
                  <p className="mt-1 text-xs text-slate-500">Generating next employee ID...</p>
                )}
                {nextEmployeeIdQuery.data?.employeeId && (
                  <p className="mt-1 text-xs text-slate-500">Suggested: {nextEmployeeIdQuery.data.employeeId}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Select Role</label>
                <select
                  value={approval.role}
                  onChange={(e) => setApproval((prev) => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Department / Section</label>
                <select
                  value={approval.productionSectionId}
                  onChange={(e) => setApproval((prev) => ({ ...prev, productionSectionId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="">Unassigned</option>
                  {sections.map((section) => (
                    <option key={section._id} value={section._id}>{section.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApproval(emptyApproval)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onApprove}
                  disabled={approveMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejection.request && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 px-4 sm:items-center">
          <div className="w-full max-w-lg rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">Reject Request</h2>
                <p className="text-sm text-slate-500">{rejection.request.fullName} - {rejection.request.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setRejection({ request: null, reason: '' })}
                className="text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {actionError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{actionError}</div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Rejection Reason</label>
                <textarea
                  value={rejection.reason}
                  onChange={(e) => setRejection((prev) => ({ ...prev, reason: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  placeholder="Enter the reason before rejecting this request"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejection({ request: null, reason: '' })}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onReject}
                  disabled={rejectMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Submit Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
