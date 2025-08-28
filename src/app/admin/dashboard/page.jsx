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
        pendingRequests: myRequests.filter(
          (req) => req.status === "pending"
        ).length,
      }));
    }
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
      {/* 왼쪽 사이드바 */}

      {/* 오른쪽 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col">

        {/* 메인 */}
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* 메인 콘텐츠 */}
            <section className="col-span-1 lg:col-span-8 space-y-4 lg:space-y-6">
              {/* 통계 카드 */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  {isSuperAdmin ? "시스템 현황" : "내 관리 현황"}
                </h3>

                {isSuperAdmin ? (
                  /* 슈퍼관리자용 통계 */
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
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
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600 mb-2 font-medium">
                        내가 발급한 수료증
                      </p>
                      <p className="text-3xl font-bold text-blue-700">
                        {stats.myCertificates}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-2 font-medium">
                        오늘 발급
                      </p>
                      <p className="text-3xl font-bold text-green-700">
                        {stats.todayIssued}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <p className="text-sm text-purple-600 mb-2 font-medium">
                        이번 달 발급
                      </p>
                      <p className="text-3xl font-bold text-purple-700">
                        {stats.monthlyIssued}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-xl">
                      <p className="text-sm text-orange-600 mb-2 font-medium">
                        승인 대기
                      </p>
                      <p className="text-3xl font-bold text-orange-700">
                        {stats.pendingRequests}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* 오른쪽 보조 패널 */}
            <aside className="col-span-1 lg:col-span-4 space-y-4 lg:space-y-6">
              {/* 알림, 최근 요청 같은 사이드 패널 추가 가능 */}
            </aside>
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
