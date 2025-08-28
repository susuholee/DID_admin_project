"use client";
import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import LoadingSpinner from "@/components/UI/Spinner";
import Input from "@/components/UI/Input";

export default function AdminListPage() {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 결과 모달 상태 (에러 표시용)
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // 페이지 로드 시 관리자 목록 불러오기
  useEffect(() => {
    loadAdmins();
  }, []);

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...admins];

    // 검색 필터
    if (searchTerm.trim()) {
      filtered = filtered.filter(admin => 
        admin.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "name") {
        return a.userName.localeCompare(b.userName);
      } else if (sortBy === "company") {
        return a.company.localeCompare(b.company);
      }
      return 0;
    });

    setFilteredAdmins(filtered);
  }, [admins, searchTerm, sortBy]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = admins.length;
    return { total };
  }, [admins]);

  const loadAdmins = () => {
    setLoading(true);
    try {
      // localStorage에서 승인된 관리자만 필터링
      const allAdmins = JSON.parse(localStorage.getItem("admins") || "[]");
      const approvedAdmins = allAdmins
        .filter(admin => admin.approved && !admin.rejected)
        .map(admin => ({
          ...admin,
          role: admin.role || "admin", // 기본값 설정
          isActive: admin.isActive !== false // 기본값은 활성
        }));
      setAdmins(approvedAdmins);
    } catch (error) {
      console.error("관리자 목록 로드 실패:", error);
      setResultMessage("관리자 목록을 불러오는 중 오류가 발생했습니다.");
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResultMessage("");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="관리자 목록을 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">관리자 목록</h1>
          <p className="text-gray-600">승인된 관리자 목록을 확인할 수 있습니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">전체 관리자</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="관리자명, 아이디, 회사명으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="newest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="name">이름순</option>
                <option value="company">회사순</option>
              </select>
            </div>
          </div>
        </div>

        {/* 관리자 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredAdmins.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">관리자가 없습니다</p>
              <p className="text-sm">승인된 관리자가 없거나 검색 조건에 맞는 관리자가 없습니다.</p>
            </div>
          ) : (
            <div>
              {/* 헤더 */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>관리자 정보</div>
                  <div className="hidden md:block">회사명</div>
                  <div className="hidden md:block">가입일시</div>
                </div>
              </div>
              
              {/* 목록 */}
              <div className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <div key={admin.userId} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* 관리자 정보 */}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {admin.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {admin.userId}
                        </div>
                        {/* 모바일에서 회사명과 가입일시 표시 */}
                        <div className="md:hidden mt-2 space-y-1">
                          <div className="text-xs text-gray-600">
                            회사: {admin.company}
                          </div>
                          <div className="text-xs text-gray-600">
                            가입: {formatDate(admin.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      {/* 회사명 - 데스크탑에서만 표시 */}
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-900">{admin.company}</div>
                      </div>
                      
                      {/* 가입일시 - 데스크탑에서만 표시 */}
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-900">
                          {formatDate(admin.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 결과 모달 (에러 표시용) */}
      <Modal isOpen={showResultModal} onClose={closeResultModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">알림</h3>
          <div className="text-gray-600 mb-6 whitespace-pre-line">{resultMessage}</div>
          <div className="flex justify-end">
            <button
              onClick={closeResultModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              확인
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}