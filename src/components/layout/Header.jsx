'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useMemo } from 'react';
import NotificationBell from '../UI/NotificationBell';

export default function Header({
  user: userProp,
  displayName: displayNameProp,
  notifications: notificationsProp = [],
  setNotifications = () => {},
  onLogout,
}) {
  const pathname = usePathname();
  const router = useRouter();

  // ====== 상태 ======
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [localNotifications, setLocalNotifications] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const closeTimerRef = useRef(null);
  const menuWrapperRef = useRef(null);
  const headerRef = useRef(null);

  // ====== 관리자 상태 로드 ======
  useEffect(() => {
    const updateAdminState = () => {
      if (typeof window !== 'undefined') {
        const storedAdmin = localStorage.getItem('currentAdmin');
        if (storedAdmin && storedAdmin !== 'null') {
          const adminData = JSON.parse(storedAdmin);
          setCurrentAdmin(adminData);

          const adminNotifications =
            localStorage.getItem('adminNotifications') || '[]';
          setLocalNotifications(JSON.parse(adminNotifications));
        } else {
          setCurrentAdmin(null);
          setLocalNotifications([]);
        }
      }
    };

    updateAdminState();

    const handleStorageChange = (e) => {
      if (e.key === 'currentAdmin' || e.key === 'adminNotifications') {
        updateAdminState();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const handleCustomAdminChange = () => {
      updateAdminState();
    };
    window.addEventListener('adminStateChanged', handleCustomAdminChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('adminStateChanged', handleCustomAdminChange);
    };
  }, []);

  // ====== 스크롤 상태 ======
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const heroSectionHeight = window.innerHeight * 0.9;
      setIsScrolled(scrollPosition > heroSectionHeight);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ====== 기타 함수 ======
  const scheduleClose = () =>
    (closeTimerRef.current = setTimeout(() => setMenuOpen(false), 120));
  const cancelClose = () =>
    closeTimerRef.current && clearTimeout(closeTimerRef.current);
  const handleBlur = (e) => {
    if (!menuWrapperRef.current?.contains(e.relatedTarget)) setMenuOpen(false);
  };
  useEffect(() => () => cancelClose(), []);

  // ====== 사용자, 알림, 권한 ======
  const admin = userProp ?? currentAdmin;
  const displayName =
    displayNameProp ?? admin?.name ?? admin?.userId ?? '관리자';
  const notifications =
    notificationsProp.length > 0 ? notificationsProp : localNotifications;

  const isLoggedIn = !!(admin && (admin.userId || admin.name));
  const isSuperAdmin = admin?.role === 'SUPER_ADMIN';

  const isAdminRoute = useMemo(() => {
    return (
      pathname?.startsWith('/dashboard') ||
      pathname?.startsWith('/admin/') ||
      pathname?.startsWith('/certificates') ||
      pathname?.startsWith('/profile')
    );
  }, [pathname]);

  // ====== 핸들러 ======
  const handleWithdrawal = () => {
    if (isSuperAdmin) {
      alert('슈퍼관리자는 탈퇴할 수 없습니다.');
      return;
    }
    const confirmWithdrawal = confirm(
      '정말로 관리자 계정을 탈퇴하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.'
    );
    if (confirmWithdrawal) {
      const admins = JSON.parse(localStorage.getItem('admins') || '[]');
      const updatedAdmins = admins.filter(
        (adminItem) => adminItem.userId !== admin.userId
      );
      localStorage.setItem('admins', JSON.stringify(updatedAdmins));
      localStorage.removeItem('currentAdmin');
      alert('탈퇴가 완료되었습니다.');
      router.push('/admin');
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('currentAdmin');
      window.dispatchEvent(new Event('adminStateChanged'));
      router.push('/admin');
    }
  };

  // ====== UI 렌더링 ======
  return (
    <>
      {isAdminRoute && isLoggedIn ? (
        // ===== 관리자 헤더 =====
        <header className="fixed top-0 left-0 lg:left-64 w-full lg:w-[calc(100%-16rem)] h-16 bg-white border-b border-gray-200 shadow z-50 flex items-center justify-between px-6">
          <div className="flex items-center"></div>

          <div className="flex items-center gap-3 sm:gap-5">
            {/* 알림벨 (항상 표시) */}
            <NotificationBell
              notifications={notifications}
              setNotifications={setNotifications}
            />

            {/* 프로필 드롭다운 */}
            <div
              ref={menuWrapperRef}
              className="relative"
              tabIndex={0}
              onMouseEnter={() => {
                cancelClose();
                setMenuOpen(true);
              }}
              onMouseLeave={scheduleClose}
              onFocus={() => setMenuOpen(true)}
              onBlur={handleBlur}
            >
              <button
                type="button"
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 focus:outline-none p-1 rounded-lg hover:bg-gray-50"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <div className="text-left hidden sm:block">
                  <div className="text-sm text-gray-700 font-medium max-w-[8rem] truncate">
                    {displayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {isSuperAdmin ? '슈퍼관리자' : '관리자'}
                  </div>
                </div>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg ring-1 ring-gray-200 z-10 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <div className="text-sm font-medium text-gray-900">
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {admin?.email || admin?.userId}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {isSuperAdmin ? '슈퍼관리자 권한' : '관리자 권한'}
                    </div>
                  </div>

                  <Link href="/admin/profile">
                    <button className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <span>프로필 설정</span>
                    </button>
                  </Link>

                  {isSuperAdmin && (
                    <Link href="/admin/settings">
                      <button className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <span>시스템 설정</span>
                      </button>
                    </Link>
                  )}

                  <div className="border-t border-gray-100">
                    {!isSuperAdmin && (
                      <button
                        onClick={handleWithdrawal}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                      >
                        <span>계정 탈퇴</span>
                      </button>
                    )}

                    <button
                      role="menuitem"
                      tabIndex={0}
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <span>로그아웃</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      ) : (
        // ===== 일반 헤더 =====
        <header
          ref={headerRef}
          className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 flex flex-wrap justify-between items-center px-4 sm:px-6 py-4 gap-3 ${
            isScrolled ? 'bg-white shadow-md' : 'bg-transparent text-rose-500'
          }`}
        >
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link href="/" className="text-2xl font-bold">
              Sealium
            </Link>

            <nav
              className={`hidden md:flex gap-6 text-sm ${
                isScrolled ? 'text-black' : 'text-gray-200'
              }`}
            ></nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/admin/login"
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                isScrolled
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30 backdrop-blur-sm'
              }`}
            >
              관리자 로그인
            </Link>
          </div>
        </header>
      )}
    </>
  );
}
