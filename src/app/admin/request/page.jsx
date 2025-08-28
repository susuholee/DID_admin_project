"use client";
import React, { useState, useEffect, useMemo } from "react";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import LoadingSpinner from "@/components/UI/Spinner";
import Input from "@/components/UI/Input";

// 요청 상태별 배지 스타일
const getStatusBadge = (approved, rejected) => {
  if (approved) {
    return "bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium";
  }
  if (rejected) {
    return "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium";
  }
  return "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium";
};

const getStatusText = (approved, rejected) => {
  if (approved) return "승인됨";
  if (rejected) return "거절됨";
  return "승인 대기";
};

export default function AdminRequestPage() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  
  // 확인 모달 상태
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState("");
  
  // 결과 모달 상태
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  
  // 거절 사유 입력 상태
  const [rejectionReason, setRejectionReason] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // 페이지 로드 시 요청 목록 불러오기
  useEffect(() => {
    loadRequests();
  }, []);

  // 필터링 및 정렬
  useEffect(() => {
    let filtered = [...requests];

    // 검색 필터
    if (searchTerm.trim()) {
      filtered = filtered.filter(request => 
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter(request => {
        if (statusFilter === "pending") return !request.approved && !request.rejected;
        if (statusFilter === "approved") return request.approved;
        if (statusFilter === "rejected") return request.rejected;
        return true;
      });
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

    setFilteredRequests(filtered);
  }, [requests, searchTerm, statusFilter, sortBy]);

  // 통계 계산
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => !r.approved && !r.rejected).length;
    const approved = requests.filter(r => r.approved).length;
    const rejected = requests.filter(r => r.rejected).length;
    return { total, pending, approved, rejected };
  }, [requests]);

  const loadRequests = () => {
    setLoading(true);
    try {
      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      setRequests(admins);
    } catch (error) {
      console.error("요청 목록 로드 실패:", error);
      setResultMessage("요청 목록을 불러오는 중 오류가 발생했습니다.");
      setShowResultModal(true);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setActionType("");
    setSelectedRequest(null);
    setRejectionReason(""); // 거절 사유 초기화
  };

  const closeResultModal = () => {
    setShowResultModal(false);
    setResultMessage("");
  };

  const handleAction = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    // 거절 시 사유가 입력되지 않으면 경고
    if (actionType === "reject" && !rejectionReason.trim()) {
      alert("거절 사유를 입력해주세요.");
      return;
    }

    setProcessing(selectedRequest.userId);
    setShowConfirmModal(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      const updatedAdmins = admins.map(admin => {
        if (admin.userId === selectedRequest.userId) {
          return {
            ...admin,
            approved: actionType === "approve",
            rejected: actionType === "reject",
            rejectionReason: actionType === "reject" ? rejectionReason.trim() : undefined,
            processedAt: new Date().toISOString()
          };
        }
        return admin;
      });

      localStorage.setItem("admins", JSON.stringify(updatedAdmins));
      setRequests(updatedAdmins);
      
      setResultMessage(
        actionType === "approve" 
          ? "가입이 승인되었습니다." 
          : `가입이 거절되었습니다.\n사유: ${rejectionReason}`
      );
      setShowResultModal(true);

    } catch (error) {
      console.error("처리 중 오류:", error);
      setResultMessage("처리 중 오류가 발생했습니다. 다시 시도해주세요.");
      setShowResultModal(true);
    } finally {
      setProcessing(null);
      setSelectedRequest(null);
      setActionType("");
      setRejectionReason("");
    }
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
        <LoadingSpinner message="요청 목록을 불러오는 중..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">관리자 가입 요청 관리</h1>
          <p className="text-gray-600">관리자 가입 요청을 승인 또는 거절할 수 있습니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">전체 요청</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">승인 대기</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">승인됨</h3>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">거절됨</h3>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">전체 상태</option>
                <option value="pending">승인 대기</option>
                <option value="approved">승인됨</option>
                <option value="rejected">거절됨</option>
              </select>
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

        {/* 요청 목록 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg mb-2">가입 요청이 없습니다</p>
              <p className="text-sm">새로운 관리자 가입 요청을 기다리고 있습니다.</p>
            </div>
          ) : (
            <div>
              {/* 헤더 */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div>관리자 정보</div>
                  <div className="hidden md:block">회사명</div>
                  <div className="hidden md:block">요청일시</div>
                  <div className="hidden md:block">상태</div>
                  <div className="hidden md:block text-right">작업</div>
                </div>
              </div>
              
              {/* 목록 */}
              <div className="divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <div key={request.userId} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {/* 관리자 정보 */}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {request.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {request.userId}
                        </div>
                        {/* 모바일에서 추가 정보 표시 */}
                        <div className="md:hidden mt-2 space-y-2">
                          <div className="text-xs text-gray-600">
                            회사: {request.company}
                          </div>
                          <div className="text-xs text-gray-600">
                            요청일: {formatDate(request.createdAt)}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={getStatusBadge(request.approved, request.rejected)}>
                              {getStatusText(request.approved, request.rejected)}
                            </span>
                            {/* 거절 사유 버튼 (모바일) */}
                            {request.rejected && request.rejectionReason && (
                              <button
                                onClick={() => {
                                  setResultMessage(`거절 사유:\n${request.rejectionReason}`);
                                  setShowResultModal(true);
                                }}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                              >
                                사유 보기
                              </button>
                            )}
                          </div>
                          {/* 작업 버튼 (모바일) */}
                          <div className="flex gap-2">
                            {!request.approved && !request.rejected && (
                              <>
                                <Button
                                  onClick={() => handleAction(request, "approve")}
                                  disabled={processing === request.userId}
                                  className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs"
                                >
                                  {processing === request.userId ? (
                                    <LoadingSpinner size="xs" />
                                  ) : (
                                    "승인"
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleAction(request, "reject")}
                                  disabled={processing === request.userId}
                                  className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs"
                                >
                                  거절
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* 회사명 - 데스크탑에서만 표시 */}
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-900">{request.company}</div>
                      </div>
                      
                      {/* 요청일시 - 데스크탑에서만 표시 */}
                      <div className="hidden md:block">
                        <div className="text-sm text-gray-900">
                          {formatDate(request.createdAt)}
                        </div>
                      </div>
                      
                      {/* 상태 - 데스크탑에서만 표시 */}
                      <div className="hidden md:block">
                        <div>
                          <span className={getStatusBadge(request.approved, request.rejected)}>
                            {getStatusText(request.approved, request.rejected)}
                          </span>
                          {/* 거절된 경우 사유 표시 */}
                          {request.rejected && request.rejectionReason && (
                            <div className="mt-1">
                              <button
                                onClick={() => {
                                  setResultMessage(`거절 사유:\n${request.rejectionReason}`);
                                  setShowResultModal(true);
                                }}
                                className="text-xs text-red-600 hover:text-red-800 underline"
                              >
                                사유 보기
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 작업 - 데스크탑에서만 표시 */}
                      <div className="hidden md:block">
                        <div className="flex justify-end gap-2">
                          {!request.approved && !request.rejected && (
                            <>
                              <Button
                                onClick={() => handleAction(request, "approve")}
                                disabled={processing === request.userId}
                                className="bg-green-100 text-green-800 hover:bg-green-200 px-3 py-1 rounded text-xs"
                              >
                                {processing === request.userId ? (
                                  <LoadingSpinner size="xs" />
                                ) : (
                                  "승인"
                                )}
                              </Button>
                              <Button
                                onClick={() => handleAction(request, "reject")}
                                disabled={processing === request.userId}
                                className="bg-red-100 text-red-800 hover:bg-red-200 px-3 py-1 rounded text-xs"
                              >
                                거절
                              </Button>
                            </>
                          )}
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

      {/* 확인 모달 */}
      <Modal isOpen={showConfirmModal} onClose={closeConfirmModal}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {actionType === "approve" ? "가입 승인" : "가입 거절"}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedRequest && (
              actionType === "approve" 
                ? `${selectedRequest.userName}님의 관리자 가입을 승인하시겠습니까?`
                : `${selectedRequest.userName}님의 관리자 가입을 거절하시겠습니까?`
            )}
          </p>
          
          {/* 거절 시 사유 입력 필드 */}
          {actionType === "reject" && (
            <div className="mb-6">
              <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
                거절 사유 *
              </label>
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectionReason.length}/500자
              </p>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={closeConfirmModal}
              className="bg-gray-300 text-gray-700 hover:bg-gray-400 px-4 py-2 rounded"
            >
              취소
            </button>
            <button
              onClick={confirmAction}
              disabled={actionType === "reject" && !rejectionReason.trim()}
              className={`px-4 py-2 rounded text-white ${
                actionType === "approve" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : actionType === "reject" && !rejectionReason.trim()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {actionType === "approve" ? "승인" : "거절"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 결과 모달 */}
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