'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function NotificationBell({ notifications, setNotifications }) {
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const [open, setOpen] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onDown = (e) => {
      if (!open) return;
      const withinBtn = btnRef.current && btnRef.current.contains(e.target);
      const withinPop = popRef.current && popRef.current.contains(e.target);
      if (!withinBtn && !withinPop) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [open]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const clearAll = () => setNotifications([]);
  const toggleOneRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 relative"
        aria-label="알림"
      >
        <Image src="/icons/bell.png" width={20} height={20} alt="알림" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full font-semibold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={popRef}
          className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-semibold">알림</span>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button onClick={markAllRead} className="text-xs text-gray-600 hover:text-gray-900">
                  모두 읽음
                </button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-600">
                  전체 삭제
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">새 알림이 없습니다.</div>
          ) : (
            <ul className="max-h-[60vh] overflow-auto divide-y">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`p-3 hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-amber-50' : ''}`}
                  onClick={() => toggleOneRead(n.id)}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                    <p className="text-sm text-gray-700 mt-0.5 break-words">{n.message}</p>
                    <p className="text-[11px] text-gray-500 mt-1">{formatRelativeTime(n.ts)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const d = Math.floor(hr / 24);
  return `${d}일 전`;
}
