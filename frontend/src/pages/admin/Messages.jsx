import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import contactService from '../../services/contact.service';

const statusLabels = {
  unread: { text: 'অপঠিত', color: 'bg-red-100 text-red-700 border-red-200' },
  read: { text: 'পঠিত', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  replied: { text: 'উত্তর দেওয়া হয়েছে', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
};

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await contactService.getAllMessages({
        status: statusFilter,
        page: pagination.page,
      });
      if (response.success && response.data) {
        setMessages(response.data.messages || []);
        setUnreadCount(response.data.unreadCount || 0);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (err) {
      setError(err.message || 'বার্তা তালিকা লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, pagination.page]);

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplySending(true);
    try {
      const res = await contactService.replyToMessage(selectedMessage._id, replyText.trim());
      if (res.success) {
        setSuccessMsg('রিপ্লাই সফলভাবে পাঠানো হয়েছে।');
        setSelectedMessage({ ...selectedMessage, adminReply: replyText.trim(), status: 'replied', repliedAt: new Date().toISOString() });
        setReplyText('');
        fetchMessages();
      }
    } catch (err) {
      alert(err.message || 'রিপ্লাই পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setReplySending(false);
    }
  };

  const handleViewMessage = async (msg) => {
    try {
      const response = await contactService.getMessageById(msg._id);
      if (response.success && response.data) {
        setSelectedMessage(response.data.message);
        setAdminNote(response.data.message.adminNote || '');
        setReplyText('');
        // Refresh list to update unread count
        fetchMessages();
      }
    } catch (err) {
      alert(err.message || 'বার্তাটি লোড করতে সমস্যা হয়েছে।');
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedMessage) return;
    try {
      const res = await contactService.updateMessageStatus(selectedMessage._id, status, adminNote);
      if (res.success) {
        setSuccessMsg(`বার্তার স্ট্যাটাস '${statusLabels[status].text}' করা হয়েছে।`);
        setSelectedMessage({ ...selectedMessage, status, adminNote });
        fetchMessages();
      }
    } catch (err) {
      alert(err.message || 'স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই বার্তাটি স্থায়ীভাবে মুছে ফেলতে চান?')) return;
    try {
      const res = await contactService.deleteMessage(id);
      if (res.success) {
        setSuccessMsg('বার্তাটি সফলভাবে মুছে ফেলা হয়েছে।');
        setSelectedMessage(null);
        fetchMessages();
      }
    } catch (err) {
      alert(err.message || 'বার্তা মুছতে সমস্যা হয়েছে।');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              📩 ভিজিটর বার্তা (Contact Messages)
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              ওয়েবসাইটের কন্টাক্ট ফর্ম থেকে আসা সকল বার্তা এখানে দেখুন এবং পরিচালনা করুন।
            </p>
          </div>
          {unreadCount > 0 && (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold shadow-sm">
              🔴 {unreadCount}টি অপঠিত বার্তা
            </span>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm flex items-center justify-between">
            <span>✅ {successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✖</button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">স্ট্যাটাস ফিল্টার:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs bg-white font-semibold focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">সব বার্তা (All Messages)</option>
              <option value="unread">অপঠিত (Unread)</option>
              <option value="read">পঠিত (Read)</option>
              <option value="replied">উত্তর দেওয়া হয়েছে (Replied)</option>
            </select>
          </div>
          <span className="text-xs text-gray-500 font-semibold self-end sm:self-auto">
            মোট বার্তা: <strong className="text-emerald-600">{pagination.total}</strong>টি
          </span>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-3">
            {/* Loading */}
            {loading && (
              <div className="py-16 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
                <p className="text-sm text-gray-600 mt-4 font-medium">বার্তা তালিকা লোড হচ্ছে...</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <span className="text-3xl">⚠️</span>
                <h3 className="text-lg font-bold text-red-800 mt-2">ত্রুটি ঘটেছে</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
                <button
                  onClick={fetchMessages}
                  className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl transition"
                >
                  পুনরায় চেষ্টা করুন
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && messages.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <span className="text-5xl">📭</span>
                <h3 className="text-xl font-bold text-gray-800 mt-3">কোনো বার্তা নেই</h3>
                <p className="text-sm text-gray-500 mt-1">আপনার ফিল্টার অনুযায়ী কোনো বার্তা পাওয়া যায়নি।</p>
              </div>
            )}

            {/* Message Cards */}
            {!loading && !error && messages.map((msg) => (
              <button
                key={msg._id}
                onClick={() => handleViewMessage(msg)}
                className={`w-full text-left bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${
                  selectedMessage?._id === msg._id
                    ? 'border-emerald-400 ring-2 ring-emerald-200'
                    : msg.status === 'unread'
                    ? 'border-red-200 bg-red-50/30'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {msg.status === 'unread' && (
                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></span>
                      )}
                      <h4 className="text-sm font-bold text-gray-900 truncate">{msg.name}</h4>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{msg.email}</p>
                    <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{msg.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md border ${statusLabels[msg.status].color}`}>
                      {statusLabels[msg.status].text}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))}

            {/* Pagination */}
            {!loading && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ◀ আগে
                </button>
                <span className="text-xs text-gray-600 font-semibold">
                  পৃষ্ঠা {pagination.page}/{pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  পরে ▶
                </button>
              </div>
            )}
          </div>

          {/* Message Detail Panel */}
          <div className="lg:col-span-3">
            {selectedMessage ? (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Detail Header */}
                <div className="bg-emerald-800 text-white p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold">{selectedMessage.name}</h3>
                      <p className="text-emerald-200 text-xs mt-0.5">{selectedMessage.email}</p>
                      {selectedMessage.phone && (
                        <p className="text-emerald-200 text-xs mt-0.5">📞 {selectedMessage.phone}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${statusLabels[selectedMessage.status].color}`}>
                      {statusLabels[selectedMessage.status].text}
                    </span>
                  </div>
                  <p className="text-emerald-300 text-[10px] mt-2">
                    🕐 বার্তা পাঠানো হয়েছে: {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                {/* Message Body */}
                <div className="p-5 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">বার্তা</h4>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Existing Admin Reply Display */}
                {selectedMessage.adminReply && (
                  <div className="p-5 border-b border-gray-100 bg-emerald-50/50">
                    <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      ✅ অ্যাডমিন রিপ্লাই
                      {selectedMessage.repliedAt && (
                        <span className="text-[10px] font-normal text-gray-500 normal-case">— {formatDate(selectedMessage.repliedAt)}</span>
                      )}
                    </h4>
                    <div className="text-sm text-emerald-900 leading-relaxed whitespace-pre-wrap bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
                      {selectedMessage.adminReply}
                    </div>
                  </div>
                )}

                {/* Reply Section */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      {selectedMessage.adminReply ? '📝 রিপ্লাই আপডেট করুন' : '💬 ইমেইলে রিপ্লাই লিখুন'}
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold normal-case">
                        📧 ভিজিটরের ইমেইলে যাবে ({selectedMessage.email})
                      </span>
                    </h4>

                    {/* Direct Mailto Button */}
                    <a
                      href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('গাড়ি লাগবে - আপনার বার্তার উত্তর')}&body=${encodeURIComponent(replyText || 'প্রিয় ' + selectedMessage.name + ',\n\n')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                      title="অ্যাডমিনের নিজস্ব Gmail/ইমেইল অ্যাপ থেকে লিখতে ক্লিক করুন"
                    >
                      <span>✉️ সরাসরি Gmail-এ লিখুন</span>
                      <span>↗</span>
                    </a>
                  </div>

                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    placeholder="ভিজিটরের বার্তার উত্তর এখানে লিখুন (এটি স্বয়ংক্রিয়ভাবে তার ইমেইলে চলে যাবে)..."
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || replySending}
                    className="mt-3 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {replySending ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        ইমেইল পাঠানো হচ্ছে...
                      </>
                    ) : (
                      <>
                        📧 ইমেইলে রিপ্লাই পাঠান (Send Email Reply)
                      </>
                    )}
                  </button>
                </div>

                {/* Admin Internal Note */}
                <div className="p-5 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">🔒 অভ্যন্তরীণ নোট (শুধু অ্যাডমিন দেখবে)</h4>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 text-sm bg-gray-50"
                    placeholder="অভ্যন্তরীণ নোট..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-5 flex flex-wrap gap-2">
                  {selectedMessage.status === 'unread' && (
                    <button
                      onClick={() => handleUpdateStatus('read')}
                      className="px-4 py-2 bg-yellow-500 text-white text-xs font-bold rounded-xl hover:bg-yellow-600 transition flex items-center gap-1.5"
                    >
                      👁️ পঠিত করুন
                    </button>
                  )}
                  {selectedMessage.status !== 'unread' && (
                    <button
                      onClick={() => handleUpdateStatus('unread')}
                      className="px-4 py-2 bg-gray-500 text-white text-xs font-bold rounded-xl hover:bg-gray-600 transition flex items-center gap-1.5"
                    >
                      🔴 অপঠিত করুন
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition flex items-center gap-1.5 ml-auto"
                  >
                    🗑️ মুছে ফেলুন
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center hidden lg:flex flex-col items-center justify-center min-h-[400px]">
                <span className="text-6xl">📨</span>
                <h3 className="text-xl font-bold text-gray-700 mt-4">বার্তা নির্বাচন করুন</h3>
                <p className="text-sm text-gray-500 mt-2">বাম দিক থেকে যেকোনো বার্তায় ক্লিক করলে বিস্তারিত এখানে দেখা যাবে।</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminMessages;
