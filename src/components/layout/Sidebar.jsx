'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const currentAdmin = JSON.parse(localStorage.getItem("currentAdmin") || "null");
    setAdmin(currentAdmin);

    const updatePendingCount = () => {
      if (currentAdmin?.role === "SUPER_ADMIN") {
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        const pendingAdmins = admins.filter(admin => !admin.approved && !admin.rejected);
        setPendingCount(pendingAdmins.length);
      }
    };

    updatePendingCount();

    const handleStorageChange = () => {
      updatePendingCount();
    };

    const handleFocus = () => {
      updatePendingCount();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleOverlayClick = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isSuperAdmin = admin?.role === "SUPER_ADMIN";

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const superAdminMenus = [
    {
      title: '대시보드',
      items: [
        { href: '/admin/dashboard', label: '통계 및 현황' }
      ]
    },
    {
      title: '발급 기관 관리',
      items: [
        { href: '/admin/institutions', label: '기관 목록' },
        { href: '/admin/institutions/create', label: '기관 등록' }
      ]
    },
    {
      title: '관리자 관리',
      items: [
        { 
          href: '/admin/request', 
          label: '가입 요청', 
          badge: pendingCount > 0 ? pendingCount : null 
        },
        { href: '/admin/list', label: '관리자 목록' },
      ]
    },
    {
      title: '수료증 관리',
      items: [
        { href: '/admin/certificates', label: '전체 현황' },
        { href: '/admin/certificates/stats', label: '발급 통계' },
      ]
    },
  ];

  const adminMenus = [
    {
      title: '대시보드',
      items: [
        { href: '/admin/dashboard', label: '대시보드' }
      ]
    },
    {
      title: '수료증 관리',
      items: [
        { href: '/admin/certificates/request', label: '수료증 요청 목록' }
      ]
    },
    {
      title: '사용자 관리',
      items: [
        { href: '/admin/userhistory', label: '사용자 정보 이력' }
      ]
    },
    {
      title: '통계 관리',
      items: [
        { href: '/admin/users', label: '수료증 통계 이력' }
      ]
    },
    {
      title: '계정 관리',
      items: [
        { href: '/admin/profile', label: '내 정보'},
        { href: '/admin/edit', label: '정보 수정' }
      ]
    }
  ];

  const menus = isSuperAdmin ? superAdminMenus : adminMenus;

  return (
    <>
      {/* 모바일 햄버거 메뉴 버튼 */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white border border-gray-200 shadow-sm hover:bg-gray-50"
        aria-label="메뉴 열기"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
          <div className="w-5 h-0.5 bg-gray-600"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
          <div className="w-5 h-0.5 bg-gray-600"></div>
        </div>
      </button>

      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform duration-300 ease-in-out
          w-80 lg:w-64 h-screen
          bg-white border-r border-gray-200 
          overflow-y-auto flex-shrink-0 
          top-0 left-0 z-40
        `}
      >
        {/* 상단 로고 */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <Link href="/admin/dashboard">
            <span className="text-2xl font-bold text-rose-600 tracking-tight">
              Sealium
            </span>
          </Link>
        </div>

        {/* 모바일 헤더 */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/admin/dashboard">
            <span className="text-xl font-bold text-rose-600 tracking-tight">
              Sealium
            </span>
          </Link>
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="메뉴 닫기"
          >
            <div className="w-6 h-6 relative">
              <div className="absolute top-1/2 left-1/2 w-5 h-0.5 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
              <div className="absolute top-1/2 left-1/2 w-5 h-0.5 bg-gray-600 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
            </div>
          </button>
        </div>

        {/* 관리자 정보 (모바일에서만 표시) */}
        {admin && (
          <div className="lg:hidden p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-rose-600 font-semibold text-sm">
                  {admin.userName?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{admin.userName}</p>
                <p className="text-xs text-gray-500">
                  {isSuperAdmin ? '슈퍼 관리자' : '관리자'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 메뉴 네비게이션 */}
        <nav className="p-4 pb-20">
          {menus.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={handleMenuClick}>
                      <div className={`
                        flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors
                        ${isActive(item.href) 
                          ? 'bg-rose-100 text-rose-700 font-medium' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                      `}>
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* 하단 로그아웃 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem('currentAdmin');
              window.location.href = '/admin';
            }}
            className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            <div className="w-3 h-3 mr-2 relative">
            </div>
            로그아웃
          </button>
        </div>
      </aside>
    </>
  );
}