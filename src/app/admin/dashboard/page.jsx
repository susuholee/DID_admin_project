"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";

// 메인 대시보드 컴포넌트
function DashboardContent() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({
    // 슈퍼관리자용 통계
    totalInstitutions: 0,
    totalAdmins: 0,
    pendingAdmins: 0,
    totalCertificates: 0,
    // 일반관리자용 통계
    todayIssued: 0,
    monthlyIssued: 0,
    myCertificates: 0,
    pendingRequests: 0,
  });
  
  const [recentProcessed, setRecentProcessed] = useState([]);

  // 관리자 데이터 로드
  useEffect(() => {
    const currentAdmin = JSON.parse(
      localStorage.getItem("currentAdmin") || "null"
    );

    if (!currentAdmin) {
      router.push("/admin");
    } else {
      setAdmin(currentAdmin);
      loadDashboardStats(currentAdmin);

      // 알림 로딩
      const savedNotifications = JSON.parse(
        localStorage.getItem("adminNotifications") || "[]"
      );
      setNotifications(savedNotifications);
    }
  }, [router]);

  // 페이지가 다시 포커스될 때 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      if (admin) {
        loadDashboardStats(admin);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [admin]);

  // storage 이벤트 감지하여 실시간 업데이트
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'admin_processed_requests' && admin) {
        loadRecentProcessed();
      }
      if ((e.key === 'admin_certificate_requests' || e.key === 'admin_revoke_requests') && admin) {
        loadDashboardStats(admin);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [admin]);

  const loadDashboardStats = (adminData) => {
    if (adminData.role === "SUPER_ADMIN") {
      // 슈퍼관리자 통계
      const institutions = JSON.parse(localStorage.getItem("institutions") || "[]");
      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      const certificates = JSON.parse(localStorage.getItem("certificates") || "[]");

      setStats((prev) => ({
        ...prev,
        totalInstitutions: institutions.length,
        totalAdmins: admins.length,
        pendingAdmins: admins.filter((admin) => !admin.approved).length,
        totalCertificates: certificates.length,
        todayIssued: certificates.filter(
          (cert) =>
            new Date(cert.issuedAt).toDateString() === new Date().toDateString()
        ).length,
        monthlyIssued: certificates.filter(
          (cert) => new Date(cert.issuedAt).getMonth() === new Date().getMonth()
        ).length,
      }));
    } else {
      // 일반관리자 통계
      const certificates = JSON.parse(localStorage.getItem("certificates") || "[]");
      const myCerts = certificates.filter(
        (cert) => cert.issuerId === adminData.userId
      );
      const requests = JSON.parse(
        localStorage.getItem("certificateRequests") || "[]"
      );
      const myRequests = requests.filter(
        (req) => req.institutionId === adminData.institutionId
      );

      // 대기중인 요청 계산 (수료증 요청 관리 페이지에서 사용하는 데이터)
      const issueRequests = JSON.parse(localStorage.getItem("admin_certificate_requests") || "[]");
      const revokeRequests = JSON.parse(localStorage.getItem("admin_revoke_requests") || "[]");
      const pendingCount = issueRequests.filter(req => req.status === 'pending').length +
                          revokeRequests.filter(req => req.status === 'pending').length;

      setStats((prev) => ({
        ...prev,
        myCertificates: myCerts.length,
        todayIssued: myCerts.filter(
          (cert) =>
            new Date(cert.issuedAt).toDateString() === new Date().toDateString()
        ).length,
        monthlyIssued: myCerts.filter(
          (cert) => new Date(cert.issuedAt).getMonth() === new Date().getMonth()
        ).length,
        pendingRequests: pendingCount,
      }));

      // 최근 처리된 요청들 로드
      loadRecentProcessed();
    }
  };

  const loadRecentProcessed = () => {
    // 최근 처리된 요청들을 로컬스토리지에서 가져오기
    const processedRequests = JSON.parse(localStorage.getItem('admin_processed_requests') || '[]');
    
    // 최근 7개만 가져와서 날짜순으로 정렬
    const recentRequests = processedRequests
      .sort((a, b) => new Date(b.processedAt) - new Date(a.processedAt))
      .slice(0, 7);
    
    setRecentProcessed(recentRequests);
  };

  const handleLogout = () => {
    localStorage.removeItem("currentAdmin");
    router.push("/admin");
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const isSuperAdmin = admin.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 max-w-7xl mx-auto w-full">
          {/* 환영 메시지 */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              환영합니다, {admin?.name || admin?.userId || "관리자"}님
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              {isSuperAdmin
                ? "수료증 발급 기관과 관리자를 관리하는 슈퍼관리자 대시보드입니다."
                : "수료증 발급 및 관리를 위한 관리자 대시보드입니다."}
            </p>
          </div>
          
          {/* 메인 그리드 */}
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                {isSuperAdmin ? "시스템 현황" : "내 관리 현황"}
              </h3>

              {isSuperAdmin ? (
                /* 슈퍼관리자용 통계 */
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600 mb-2 font-medium">
                      총 발급 기관
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {stats.totalInstitutions}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600 mb-2 font-medium">
                      총 관리자
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                      {stats.totalAdmins}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <p className="text-sm text-orange-600 mb-2 font-medium">
                      승인 대기
                    </p>
                    <p className="text-3xl font-bold text-orange-700">
                      {stats.pendingAdmins}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <p className="text-sm text-purple-600 mb-2 font-medium">
                      총 발급 수료증
                    </p>
                    <p className="text-3xl font-bold text-purple-700">
                      {stats.totalCertificates}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-xl">
                    <p className="text-sm text-indigo-600 mb-2 font-medium">
                      오늘 발급
                    </p>
                    <p className="text-3xl font-bold text-indigo-700">
                      {stats.todayIssued}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-pink-50 rounded-xl">
                    <p className="text-sm text-pink-600 mb-2 font-medium">
                      이번 달 발급
                    </p>
                    <p className="text-3xl font-bold text-pink-700">
                      {stats.monthlyIssued}
                    </p>
                  </div>
                </div>
              ) : (
                /* 일반관리자용 통계 */
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl border">
                    <p className="text-sm text-slate-600 mb-1 font-medium">
                      전체 수료증
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stats.myCertificates}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <p className="text-sm text-yellow-600 mb-1 font-medium">
                      승인 대기
                    </p>
                    <p className="text-2xl font-bold text-yellow-700">
                      {stats.pendingRequests}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-sm text-green-600 mb-1 font-medium">
                      유효 수료증
                    </p>
                    <p className="text-2xl font-bold text-green-700">
                      {Math.max(0, stats.myCertificates - 5)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                    <p className="text-sm text-red-600 mb-1 font-medium">
                      폐기 수료증
                    </p>
                    <p className="text-2xl font-bold text-red-700">
                      5
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1 font-medium">
                      재발급
                    </p>
                    <p className="text-2xl font-bold text-blue-700">
                      3
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 최근 처리한 수료증 내역 테이블 */}
            {!isSuperAdmin && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">최근 요청</h3>
                    <Link 
                      href="/admin/certificate-requests"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      전체 보기
                    </Link>
                  </div>
                </div>

                {recentProcessed.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    
                    </div>
                    <p className="text-sm text-gray-500 mb-2">아직 처리한 요청이 없습니다</p>
                    <p className="text-xs text-gray-400">수료증 요청을 승인하거나 거절하면 여기에 표시됩니다</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청 유형</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">과정명</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사유</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">요청일</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentProcessed.map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">
                                    {request.userName?.charAt(0) || 'U'}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{request.userName}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                request.requestType === 'issue' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : request.requestType === 'revoke'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {request.requestType === 'issue' ? '신규발급' : 
                                 request.requestType === 'revoke' ? '폐기요청' : '재발급'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs truncate">
                                {request.certificateName}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {request.reason || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.processedAt || request.requestedAt).toLocaleDateString('ko-KR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                request.action === 'approved' ? 'bg-green-100 text-green-700' :
                                request.action === 'rejected' ? 'bg-red-100 text-red-700' : 
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {request.action === 'approved' ? '승인됨' : 
                                 request.action === 'rejected' ? '거절됨' : '처리됨'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Loading fallback 컴포넌트
function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">대시보드를 불러오는 중...</p>
      </div>
    </div>
  );
}

// 메인 대시보드 페이지
export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
}

/* 유틸: 상대 시간 포맷 */
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