// src/app/admin/certificate-requests/page.jsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/UI/Modal';

export default function AdminCertificateRequestsPage() {
  const router = useRouter();

  // 헤더용 사용자
  const [user, setUser] = useState(null);
  useEffect(() => {
    const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (cu) setUser(cu);
  }, []);
  const displayName = useMemo(
    () => (user?.isKakaoUser ? user?.nickname : user?.name) || '관리자',
    [user]
  );

  // 알림 (헤더에 주입) - 로컬스토리지 연동
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (Array.isArray(saved) && saved.length) setNotifications(saved);
  }, []);
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);
  const pushNotif = (title, message) =>
    setNotifications((prev) => [
      { id: Date.now(), title, message, ts: Date.now(), read: false },
      ...prev,
    ]);

  // 탭 상태
  const [activeTab, setActiveTab] = useState('all'); // all | issue | revoke
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | approved | rejected

  // UI 상태들
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [userFilter, setUserFilter] = useState('all');

  const itemsPerPage = 5; // 5개로 고정

  // 처리 모달 상태
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [requestToProcess, setRequestToProcess] = useState(null);
  const [processType, setProcessType] = useState(''); // 'approve' | 'reject'
  const [processReason, setProcessReason] = useState('');

  // 경고 모달 상태
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  // 요청 데이터 - 로컬스토리지 연동
  const [issueRequests, setIssueRequests] = useState([]);
  const [revokeRequests, setRevokeRequests] = useState([]);

  // 초기 로드 플래그 (선언 위치를 위로 올려 TDZ 이슈 해결)
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // 더미 데이터 초기화 함수 (한 번만 실행) - 대기중인 요청만
  const initializeDummyData = () => {
    const savedCertificateRequests = JSON.parse(localStorage.getItem('admin_certificate_requests') || '[]');
    const savedRevokeRequests = JSON.parse(localStorage.getItem('admin_revoke_requests') || '[]');

    // 더미 데이터가 이미 있는지 확인
    const hasIssueData = savedCertificateRequests.length > 0;
    const hasRevokeData = savedRevokeRequests.length > 0;

    // 더미 데이터가 없는 경우에만 추가 (대기중인 요청만)
    if (!hasIssueData) {
      const dummyIssueRequests = [
        {
          id: Date.now() - 1000,
          userId: 'user001',
          userName: '김철수',
          userEmail: 'kimcs@email.com',
          certificateName: '블록체인 기초 과정 수료증',
          certificateId: 'CERT-BLOCKCHAIN-001',
          reason:
            '이직을 준비 중인데, 블록체인 분야 전문성을 어필하기 위해 수료증이 필요합니다. 특히 핀테크 회사 지원을 위해 꼭 필요한 자격증명서입니다.',
          requestedAt: '2025-08-28T10:30:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 2000,
          userId: 'user002',
          userName: '박영희',
          userEmail: 'park.yh@email.com',
          certificateName: 'React 프론트엔드 개발 과정 수료증',
          certificateId: 'CERT-REACT-002',
          reason:
            '프리랜서 개발자로 활동하면서 클라이언트들에게 제출할 포트폴리오와 함께 전문성을 증명할 수 있는 자료로 활용하고 싶습니다.',
          requestedAt: '2025-08-27T14:20:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 3000,
          userId: 'user003',
          userName: '이민호',
          userEmail: 'lee.mh@email.com',
          certificateName: 'AI/ML 기초 과정 수료증',
          certificateId: 'CERT-AI-003',
          reason:
            '대학원 진학을 위한 자기소개서 작성 시 AI 분야 학습 경험을 증명하는 자료로 사용하고 싶습니다. 인공지능학과 대학원 입학에 도움이 될 것 같습니다.',
          requestedAt: '2025-08-26T09:15:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 4000,
          userId: 'user004',
          userName: '정수진',
          userEmail: 'jung.sj@email.com',
          certificateName: 'Node.js 백엔드 개발 과정 수료증',
          certificateId: 'CERT-NODE-004',
          reason:
            '회사에서 연말 승진 심사를 앞두고 있는데, 개인적으로 학습한 기술 스택에 대한 공식적인 증명서가 필요합니다. 승진 평가 시 자기계발 노력을 어필하고 싶습니다.',
          requestedAt: '2025-08-25T16:45:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 5000,
          userId: 'user005',
          userName: '최동욱',
          userEmail: 'choi.dw@email.com',
          certificateName: 'DeFi 고급 과정 수료증',
          certificateId: 'CERT-DEFI-005',
          reason:
            '블록체인 스타트업 창업을 준비하고 있어서 투자자들과 파트너들에게 DeFi 분야 전문성을 증명할 수 있는 자료가 필요합니다.',
          requestedAt: '2025-08-28T08:15:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 6000,
          userId: 'user006',
          userName: '윤하늘',
          userEmail: 'yoon.sky@email.com',
          certificateName: '웹 보안 전문가 과정 수료증',
          certificateId: 'CERT-SEC-006',
          reason: '사내 보안 담당자로서 직무 전문성 인증이 필요합니다.',
          requestedAt: '2025-08-24T11:10:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 7000,
          userId: 'user007',
          userName: '김나연',
          userEmail: 'kim.ny@email.com',
          certificateName: 'UX/UI 디자인 과정 수료증',
          certificateId: 'CERT-UX-007',
          reason: '포트폴리오와 함께 제출할 공식 증빙 자료가 필요합니다.',
          requestedAt: '2025-08-23T09:40:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 8000,
          userId: 'user008',
          userName: '박준형',
          userEmail: 'park.jh@email.com',
          certificateName: '클라우드 아키텍처 과정 수료증',
          certificateId: 'CERT-CLOUD-008',
          reason: '클라우드 아키텍트 포지션 지원 시 학습 증명에 사용하려 합니다.',
          requestedAt: '2025-08-22T15:25:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 9000,
          userId: 'user009',
          userName: '장서현',
          userEmail: 'jang.sh@email.com',
          certificateName: '데이터 분석 기초 과정 수료증',
          certificateId: 'CERT-DATA-009',
          reason: '데이터 관련 직무 이직 준비를 위한 증빙입니다.',
          requestedAt: '2025-08-21T13:50:00.000Z',
          status: 'pending',
        },
        {
          id: Date.now() - 10000,
          userId: 'user010',
          userName: '홍길동',
          userEmail: 'hong.gd@email.com',
          certificateName: '스마트 컨트랙트 전문가 과정 수료증',
          certificateId: 'CERT-SMART-010',
          reason: '블록체인 전문 인력으로 이직하기 위해 필요합니다.',
          requestedAt: '2025-08-20T18:00:00.000Z',
          status: 'pending',
        },
      ];
      localStorage.setItem('admin_certificate_requests', JSON.stringify(dummyIssueRequests));
      setIssueRequests(dummyIssueRequests);
    } else {
      setIssueRequests(savedCertificateRequests);
    }

    if (!hasRevokeData) {
      const dummyRevokeRequests = [
      {
        id: Date.now() - 11000,
        userId: 'user006',
        userName: '김하늘',
        userEmail: 'kim.hn@email.com',
        certificateName: '블록체인 기초 과정 수료증',
        certificateId: 'CERT-BLOCKCHAIN-001',
        reason: '개인정보 보호를 위해 이전 수료증을 삭제하고 싶습니다.',
        requestedAt: '2025-08-27T11:10:00.000Z',
        status: 'pending'
      },
      {
        id: Date.now() - 12000,
        userId: 'user007',
        userName: '이도현',
        userEmail: 'lee.dh@email.com',
        certificateName: 'React 프론트엔드 개발 과정 수료증',
        certificateId: 'CERT-REACT-002',
        reason: '새로운 수료증을 발급받아서 이전 것을 폐기 요청합니다.',
        requestedAt: '2025-08-26T15:25:00.000Z',
        status: 'pending'
      },
      {
        id: Date.now() - 13000,
        userId: 'user013',
        userName: '박민지',
        userEmail: 'park.mj@email.com',
        certificateName: 'AI/ML 기초 과정 수료증',
        certificateId: 'CERT-AI-003',
        reason: '학습 과정 중단으로 수료증 삭제를 요청합니다.',
        requestedAt: '2025-08-25T09:30:00.000Z',
        status: 'pending'
      },
      {
        id: Date.now() - 14000,
        userId: 'user014',
        userName: '정우성',
        userEmail: 'jung.ws@email.com',
        certificateName: 'Node.js 백엔드 개발 과정 수료증',
        certificateId: 'CERT-NODE-004',
        reason: '수정된 이름으로 새 수료증 발급 예정입니다.',
        requestedAt: '2025-08-24T14:00:00.000Z',
        status: 'pending'
      },
      {
        id: Date.now() - 15000,
        userId: 'user015',
        userName: '한지민',
        userEmail: 'han.jm@email.com',
        certificateName: 'DeFi 고급 과정 수료증',
        certificateId: 'CERT-DEFI-005',
        reason: '불필요한 인증서 폐기 요청합니다.',
        requestedAt: '2025-08-23T16:45:00.000Z',
        status: 'pending'
      },
      {
        id: Date.now() - 16000,
        userId: 'user016',
        userName: '윤아라',
        userEmail: 'yoon.ar@email.com',
        certificateName: '웹 보안 전문가 과정 수료증',
        certificateId: 'CERT-SEC-006',
        reason: '개인정보 보호 차원에서 폐기 요청합니다.',
        requestedAt: '2025-08-22T12:20:00.000Z',
        status: 'pending'
      }
    ];
      localStorage.setItem('admin_revoke_requests', JSON.stringify(dummyRevokeRequests));
      setRevokeRequests(dummyRevokeRequests);
    } else {
      setRevokeRequests(savedRevokeRequests);
    }
  };

  // 데이터 로드 함수 (새로고침용)
  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const savedCertificateRequests = JSON.parse(localStorage.getItem('admin_certificate_requests') || '[]');
      const savedRevokeRequests = JSON.parse(localStorage.getItem('admin_revoke_requests') || '[]');

      setIssueRequests(savedCertificateRequests);
      setRevokeRequests(savedRevokeRequests);

      setIsLoading(false);
    }, 800);
  };

  // 초기 로드 (더미 데이터 초기화)
  useEffect(() => {
    initializeDummyData();
    setIsInitialLoad(false);
  }, []);

  // 페이지에 포커스될 때마다 데이터 새로고침
  useEffect(() => {
    const handleFocus = () => {
      loadData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 요청 데이터 변경 시 로컬스토리지 저장
  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('admin_certificate_requests', JSON.stringify(issueRequests));
    }
  }, [issueRequests, isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
      localStorage.setItem('admin_revoke_requests', JSON.stringify(revokeRequests));
    }
  }, [revokeRequests, isInitialLoad]);

  // 현재 탭에 따른 데이터 - 대기중인 요청만 필터링
  const currentRequests = useMemo(() => {
    // 대기중인 요청만 필터링
    const pendingIssueRequests = issueRequests.filter((req) => req.status === 'pending');
    const pendingRevokeRequests = revokeRequests.filter((req) => req.status === 'pending');

    if (activeTab === 'all') {
      // 전체: 대기중인 발급과 폐기 요청을 합치고 타입 정보 추가
      const allIssueRequests = pendingIssueRequests.map((req) => ({ ...req, requestType: 'issue' }));
      const allRevokeRequests = pendingRevokeRequests.map((req) => ({ ...req, requestType: 'revoke' }));
      return [...allIssueRequests, ...allRevokeRequests];
    } else if (activeTab === 'issue') {
      return pendingIssueRequests.map((req) => ({ ...req, requestType: 'issue' }));
    } else {
      return pendingRevokeRequests.map((req) => ({ ...req, requestType: 'revoke' }));
    }
  }, [activeTab, issueRequests, revokeRequests]);

  // 사용자 목록 (필터용)
  const users = [...new Set(currentRequests.map((req) => req.userName))];

  // 필터링 및 정렬
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = currentRequests.filter((req) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (req.certificateName && req.certificateName.toLowerCase().includes(searchLower)) ||
        (req.certificateId && req.certificateId.toLowerCase().includes(searchLower)) ||
        (req.userName && req.userName.toLowerCase().includes(searchLower)) ||
        (req.userEmail && req.userEmail.toLowerCase().includes(searchLower));
      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
      const matchesUser = userFilter === 'all' || req.userName === userFilter;

      // 날짜 필터링
      if (dateRange.start || dateRange.end) {
        const reqDate = new Date(req.requestedAt);
        if (dateRange.start && reqDate < new Date(dateRange.start)) return false;
        if (dateRange.end && reqDate > new Date(dateRange.end)) return false;
      }

      return matchesSearch && matchesStatus && matchesUser;
    });

    return filtered.sort((a, b) => {
      const aValue = new Date(a.requestedAt);
      const bValue = new Date(b.requestedAt);

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [currentRequests, searchTerm, statusFilter, userFilter, dateRange, sortOrder]);

  // 페이지네이션을 위한 데이터 처리
  const totalPages = Math.ceil(filteredAndSortedRequests.length / itemsPerPage);
  const paginatedRequests = filteredAndSortedRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 통계 계산 - 대기중인 요청만 계산
  const stats = useMemo(() => {
    // 대기중인 요청만 필터링
    const pendingIssueRequests = issueRequests.filter((req) => req.status === 'pending');
    const pendingRevokeRequests = revokeRequests.filter((req) => req.status === 'pending');
    const allPendingRequests = [...pendingIssueRequests, ...pendingRevokeRequests];

    const total = allPendingRequests.length;
    const pending = total; // 모든 요청이 대기중
    const approved = 0; // 승인된 요청은 표시하지 않음
    const rejected = 0; // 거절된 요청은 표시하지 않음

    // 탭별 카운트 - 대기중인 것만
    const issueCount = pendingIssueRequests.length;
    const revokeCount = pendingRevokeRequests.length;

    return { total, pending, approved, rejected, issueCount, revokeCount };
  }, [issueRequests, revokeRequests]);

  // 상태별 스타일
  const getStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';

    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  // 요청 타입별 배지 스타일
  const getRequestTypeBadge = (requestType) => {
    switch (requestType) {
      case 'issue':
        return 'bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium';
      case 'revoke':
        return 'bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium';
      default:
        return 'bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium';
    }
  };

  const getRequestTypeText = (requestType) => {
    switch (requestType) {
      case 'issue':
        return '발급';
      case 'revoke':
        return '폐기';
      default:
        return '기타';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '대기중';
      case 'approved':
        return '승인됨';
      case 'rejected':
        return '거절됨';
      default:
        return '알 수 없음';
    }
  };

  // 처리 모달 열기
  const openProcessModal = (request, type) => {
    setRequestToProcess(request);
    setProcessType(type);
    setProcessReason('');
    setShowProcessModal(true);
  };

  // 처리 모달 닫기
  const closeProcessModal = () => {
    setShowProcessModal(false);
    setRequestToProcess(null);
    setProcessType('');
    setProcessReason('');
  };

  // 경고 모달 표시 함수
  const showWarning = (message) => {
    setWarningMessage(message);
    setShowWarningModal(true);
  };

  // 경고 모달 닫기
  const closeWarningModal = () => {
    setShowWarningModal(false);
    setWarningMessage('');
  };

 // 요청 처리 확정 - 처리된 요청은 목록에서 제거하고 대시보드용 기록 저장
  const confirmProcessRequest = () => {
    if (!requestToProcess) return;

    // 거절일 때만 사유 입력 필수
    if (processType === 'reject' && !processReason.trim()) {
      showWarning('거절 사유를 입력해주세요.');
      return;
    }

    const processedAt = new Date().toISOString();
    const action = processType === 'approve' ? 'approved' : 'rejected';

    // 처리된 요청 정보를 대시보드용으로 저장
    const processedRequest = {
      ...requestToProcess,
      action: action,
      processedAt: processedAt,
      processReason: processType === 'reject' ? processReason : null,
      processedBy: user?.name || user?.nickname || '관리자'
    };

    // 기존 처리된 요청 목록 가져오기
    const existingProcessed = JSON.parse(localStorage.getItem('admin_processed_requests') || '[]');
    
    // 새로운 처리된 요청을 맨 앞에 추가
    const updatedProcessed = [processedRequest, ...existingProcessed];
    
    // 로컬스토리지에 저장 (최대 50개까지만 보관)
    localStorage.setItem('admin_processed_requests', JSON.stringify(updatedProcessed.slice(0, 50)));

    // 기존 대기중 목록에서 제거
    if (requestToProcess.requestType === 'issue') {
      setIssueRequests((prev) => prev.filter((req) => req.id !== requestToProcess.id));
    } else {
      setRevokeRequests((prev) => prev.filter((req) => req.id !== requestToProcess.id));
    }

    // 알림 생성
    if (processType === 'approve') {
      pushNotif(
        '요청 승인 완료',
        `${requestToProcess.userName}님의 ${requestToProcess.certificateName} ${getRequestTypeText(
          requestToProcess.requestType
        )} 요청이 승인되었습니다.`
      );
    } else {
      pushNotif(
        '요청 거절 완료',
        `${requestToProcess.userName}님의 ${requestToProcess.certificateName} ${getRequestTypeText(
          requestToProcess.requestType
        )} 요청이 거절되었습니다.`
      );
    }

    // storage 이벤트 발생시켜서 대시보드 실시간 업데이트
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'admin_processed_requests',
      newValue: JSON.stringify(updatedProcessed.slice(0, 50))
    }));

    // 모달 닫기
    closeProcessModal();
  };

  // 스켈레톤 로더
  const RequestSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-2"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="h-16 bg-gray-200 rounded-lg"></div>
    </div>
  );

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* 상단 헤더 */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">수료증 요청 관리</h1>
            <p className="text-gray-600">사용자들의 수료증 발급 및 폐기 요청을 관리하세요.</p>
          </div>

          {/* 통계 카드 - 대기중 요청만 표시 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">전체 대기중 요청</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.issueCount}</div>
              <div className="text-sm text-gray-500">발급 대기중</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.revokeCount}</div>
              <div className="text-sm text-gray-500">폐기 대기중</div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="mb-6">
            <div className="border-b border-gray-200 bg-white rounded-t-xl">
              <nav className="-mb-px flex px-6">
                <button
                  onClick={() => {
                    setActiveTab('all');
                    setCurrentPage(1);
                  }}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'all' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  전체 요청 ({stats.total})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('issue');
                    setCurrentPage(1);
                  }}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'issue' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  발급 요청 ({stats.issueCount})
                </button>
                <button
                  onClick={() => {
                    setActiveTab('revoke');
                    setCurrentPage(1);
                  }}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'revoke' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  폐기 요청 ({stats.revokeCount})
                </button>
              </nav>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
            <div className="p-4">
              {/* 검색 및 액션 */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="수료증명, 사용자명, 이메일 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    필터
                  </button>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {sortOrder === 'asc' ? '오래된순' : '최신순'}
                  </button>
                  <button onClick={loadData} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    새로고침
                  </button>
                </div>
              </div>

              {/* 확장 필터 */}
              {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">사용자</label>
                      <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">전체 사용자</option>
                        {users.map((user) => (
                          <option key={user} value={user}>
                            {user}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 상태 필터 태그 - 대기중만 표시 */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  전체 대기중 ({stats.total})
                </button>
              </div>
            </div>
          </div>

          {/* 요청 목록 */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <RequestSkeleton key={i} />
              ))}
            </div>
          ) : paginatedRequests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">요청 내역이 없습니다</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? '검색 조건에 맞는 요청이 없어요.'
                  : `아직 ${activeTab === 'all' ? '' : activeTab === 'issue' ? '발급' : '폐기'} 요청이 없어요.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedRequests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{request.certificateName}</h3>
                        {activeTab === 'all' && (
                          <span className={getRequestTypeBadge(request.requestType)}>{getRequestTypeText(request.requestType)}</span>
                        )}
                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">대기중</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">요청자:</span>
                          <span className="ml-2 text-gray-900 font-medium">{request.userName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">이메일:</span>
                          <span className="ml-2 text-gray-900 font-medium">{request.userEmail}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">요청일:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {new Date(request.requestedAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-gray-500 text-sm">요청 사유:</span>
                        <p className="mt-1 text-gray-900 text-sm">{request.reason}</p>
                      </div>

                      {request.adminNote && (
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <span className="text-gray-500 text-sm">메모:</span>
                          <p className="mt-1 text-gray-900 text-sm">{request.adminNote}</p>
                        </div>
                      )}

                      {request.certificateId && <div className="text-xs text-gray-500">수료증 ID: {request.certificateId}</div>}
                    </div>

                    <div className="flex flex-col gap-2 ml-6">
                      <button
                        onClick={() => openProcessModal(request, 'approve')}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => openProcessModal(request, 'reject')}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        거절
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              >
                이전
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 border rounded-lg text-sm ${
                        currentPage === pageNum ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              >
                다음
              </button>
            </div>
          )}

          {/* 정보 표시 */}
          {filteredAndSortedRequests.length > 0 && (
            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                총 {filteredAndSortedRequests.length}개 중 {Math.min(currentPage * itemsPerPage, filteredAndSortedRequests.length)}개 표시 중
              </p>
            </div>
          )}
        </div>
      </main>

      {/* 처리 확인 모달 */}
      <Modal isOpen={showProcessModal} onClose={closeProcessModal} title={`요청 ${processType === 'approve' ? '승인' : '거절'}`} size="md">
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-2">수료증:</p>
            <p className="text-sm text-gray-600">{requestToProcess?.certificateName}</p>
          </div>

          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-2">요청자:</p>
            <p className="text-sm text-gray-600">
              {requestToProcess?.userName} ({requestToProcess?.userEmail})
            </p>
          </div>

          {processType === 'approve' ? (
            // 승인 확인
            <div className="mb-6">
              <p className="text-gray-700 text-center">위 요청을 승인하시겠습니까?</p>
            </div>
          ) : (
            // 거절 사유 입력
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">거절 사유 *</label>
              <textarea
                value={processReason}
                onChange={(e) => setProcessReason(e.target.value)}
                placeholder="거절 사유를 입력해주세요 (필수)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">* 거절 사유는 사용자에게 전달됩니다.</p>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={closeProcessModal}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={confirmProcessRequest}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium ${
                processType === 'approve' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {processType === 'approve' ? '승인 확정' : '거절 확정'}
            </button>
          </div>
        </div>
      </Modal>

      {/* 경고 모달 */}
      <Modal isOpen={showWarningModal} onClose={closeWarningModal} title="알림" size="sm">
        <div className="p-6">
          <p className="text-gray-700 mb-6 text-center">{warningMessage}</p>

          <button
            onClick={closeWarningModal}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            확인
          </button>
        </div>
      </Modal>
    </>
  );
}