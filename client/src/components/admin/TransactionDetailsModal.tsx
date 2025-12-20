'use client';

import { useGetTransactionByIdQuery } from '@/state/api';

interface TransactionDetailsModalProps {
  transactionId: string;
  onClose: () => void;
}

export default function TransactionDetailsModal({ transactionId, onClose }: TransactionDetailsModalProps) {
  const { data, isLoading } = useGetTransactionByIdQuery(transactionId);

  const transaction = data?.data;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : !transaction ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Transaction not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Transaction Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-medium text-gray-900">{transaction.transactionId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Intent ID</p>
                  <p className="font-medium text-gray-900">{transaction.paymentIntentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Amount</p>
                  <p className="font-medium text-gray-900">
                    ${transaction.amount.toFixed(2)} {transaction.currency}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Provider</p>
                  <p className="font-medium text-gray-900">{transaction.paymentProvider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    transaction.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    transaction.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(transaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator</h3>
              <div className="flex items-center gap-4 mb-4">
                {transaction.creator.profileImage ? (
                  <img
                    src={transaction.creator.profileImage}
                    alt={transaction.creator.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {transaction.creator.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{transaction.creator.name}</p>
                  <p className="text-sm text-gray-600">{transaction.creator.email}</p>
                </div>
              </div>
            </div>

            {/* Buyer Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyer</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium text-gray-900">{transaction.buyer.email || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Session ID</p>
                  <p className="font-medium text-gray-900 text-sm break-all">{transaction.buyer.sessionId}</p>
                </div>
                {transaction.buyer.ipAddress && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">IP Address</p>
                    <p className="font-medium text-gray-900">{transaction.buyer.ipAddress}</p>
                  </div>
                )}
                {transaction.buyer.fingerprint && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Fingerprint</p>
                    <p className="font-medium text-gray-900 text-sm break-all">
                      {transaction.buyer.fingerprint.slice(0, 20)}...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Content Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
              <div className="flex items-center gap-4">
                <img
                  src={transaction.content.thumbnailUrl}
                  alt={transaction.content.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">{transaction.content.title}</p>
                  <p className="text-sm text-gray-600 mt-1">Content ID: {transaction.content.id}</p>
                </div>
              </div>
            </div>

            {/* Access Info */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Access Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">View Count</p>
                  <p className="font-medium text-gray-900">{transaction.viewCount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Viewed</p>
                  <p className="font-medium text-gray-900">
                    {transaction.lastViewedAt
                      ? new Date(transaction.lastViewedAt).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Access Token</p>
                  <p className="font-mono text-sm text-gray-900 break-all bg-white p-2 rounded border border-gray-200">
                    {transaction.accessToken}
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
