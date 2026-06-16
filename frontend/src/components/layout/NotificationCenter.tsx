import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Trash2, Calendar, Pill, AlertTriangle, FileText, MessageSquare, BellOff, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Notification } from '../../types';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const typeToCategoryMap: Record<string, string> = {
  appointment: 'Appointments',
  medicine: 'Medicines',
  prescription: 'Medicines',
  emergency: 'Emergency Alerts',
  followup: 'Doctor Messages',
};

const getCategoryForType = (type: string, title: string = '') => {
  if (type === 'general') {
    if (title.toLowerCase().includes('report') || title.toLowerCase().includes('lab')) {
      return 'Reports';
    }
    return 'System Notifications';
  }
  return typeToCategoryMap[type] || 'System Notifications';
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Appointments':
      return <Calendar className="w-4 h-4 text-cyan-400" />;
    case 'Medicines':
      return <Pill className="w-4 h-4 text-emerald-400" />;
    case 'Reports':
      return <FileText className="w-4 h-4 text-blue-400" />;
    case 'Emergency Alerts':
      return <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />;
    case 'Doctor Messages':
      return <MessageSquare className="w-4 h-4 text-indigo-400" />;
    case 'System Notifications':
      return <Shield className="w-4 h-4 text-amber-400" />;
    default:
      return <Calendar className="w-4 h-4 text-slate-400" />;
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearAllNotifications,
    unreadCount
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const filters = ['All', 'Appointments', 'Medicines', 'Reports', 'Emergency Alerts', 'Doctor Messages', 'System Notifications'];

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'All') return true;
    const category = getCategoryForType(n.type, n.title);
    return category === activeFilter;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0b1120]/95 border-l border-white/5 shadow-2xl z-50 flex flex-col backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative">
                  <span className="text-lg font-semibold tracking-wide text-white font-sans">Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-3.5 bg-cyan-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter tags bar */}
            <div className="p-4 border-b border-white/5 flex gap-1.5 overflow-x-auto scrollbar-none select-none">
              {filters.map(filter => {
                const isActive = activeFilter === filter;
                const unreadCountForCat = filter === 'All'
                  ? unreadCount
                  : notifications.filter(n => !n.isRead && getCategoryForType(n.type, n.title) === filter).length;
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border-cyan-500/30'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    <span>{filter}</span>
                    {unreadCountForCat > 0 && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold leading-none ${
                        isActive ? 'bg-cyan-500 text-black' : 'bg-white/10 text-slate-300'
                      }`}>
                        {unreadCountForCat}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence initial={false}>
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notif: Notification) => {
                    const category = getCategoryForType(notif.type, notif.title);
                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-xl border transition-all flex gap-3 relative overflow-hidden ${
                          notif.isRead
                            ? 'bg-white/[0.02] border-white/5 opacity-70'
                            : 'bg-white/[0.05] border-cyan-500/20 shadow-glow-cyan'
                        }`}
                      >
                        {/* Status bar glow */}
                        {!notif.isRead && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-emerald-400" />
                        )}

                        <div className="p-2 bg-white/5 rounded-lg h-fit flex-shrink-0">
                          {getCategoryIcon(category)}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase font-sans">
                              {category}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <h4 className="text-sm font-medium text-slate-200 truncate">{notif.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed font-sans">{notif.message}</p>

                          <div className="flex items-center gap-3 pt-2">
                            {!notif.isRead && (
                              <button
                                onClick={() => markNotificationRead(notif.id)}
                                className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all"
                              >
                                <Check className="w-3 h-3" /> Mark read
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notif.id)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-all ml-auto"
                            >
                              <Trash2 className="w-3 h-3" /> Clear
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4"
                  >
                    <div className="p-4 bg-white/5 rounded-full text-slate-500">
                      <BellOff className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300">All caught up</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        No notifications in category "{activeFilter}"
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default NotificationCenter;
