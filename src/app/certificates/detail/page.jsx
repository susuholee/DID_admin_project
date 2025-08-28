// src/app/certificates/detail/page.jsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import NotificationBell from '@/components/UI/NotificationBell';

// Suspense로 감쌀 컴포넌트 분리
function CertificateDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateId = searchParams.get('id');

  const [certificate, setCertificate] = useState(null);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // 사용자 정보 로드
  useEffect(() => {
    const cu = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (cu) setUser(cu);
  }, []);

  // 알림 설정
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (Array.isArray(saved) && saved.length) setNotifications(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const pushNotif = (title, message) =>
    setNotifications((prev) => [
      { id: Date.now(), title, message, ts: Date.now(), read: false },
      ...prev,
    ]);

  // 수료증 데이터 로드
  useEffect(() => {
    if (!certificateId) {
      router.push('/certificates/my');
      return;
    }

    // sessionStorage에서 먼저 확인
    const saved = sessionStorage.getItem('selectedCertificate');
    if (saved) {
      const cert = JSON.parse(saved);
      if (cert.id == certificateId) {
        setCertificate(cert);
        return;
      }
    }

    // localStorage의 certificates에서 ID로 찾기
    const certificatesData = localStorage.getItem('userCertificates');
    if (certificatesData) {
      try {
        const certificates = JSON.parse(certificatesData);
        const foundCertificate = certificates.find(cert =>
          cert.id == certificateId
        );
        if (foundCertificate) {
          setCertificate(foundCertificate);
          return;
        }
      } catch (error) {
        console.error('Error parsing certificates:', error);
      }
    }

    // 찾지 못했으면 목록으로 돌아가기
    router.push('/certificates/my');
  }, [certificateId, router]);

  const displayName = user?.isKakaoUser ? user?.nickname : user?.name || '사용자';

  const getStatusBadge = (status) => {
    if (status === '유효') return 'bg-green-100 text-green-700 border-green-300';
    if (status === '폐기') return 'bg-gray-100 text-gray-600 border-gray-200';
    if (status === '만료') return 'bg-red-100 text-red-700 border-red-200';
    if (status === '대기중') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  // 액션 핸들러들
  const handleShare = async () => {
    const publicKey = certificate.publicKey || '0x1234567890abcdef';
    const certificateName = certificate.title;

    const url = `${window.location.origin}/did/${publicKey}/${certificateName}`;

    setShareUrl(url);
    setShareModalOpen(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      pushNotif('링크 복사 완료', '공유 링크가 클립보드에 복사되었습니다.');
    } catch {
      pushNotif('복사 실패', '브라우저 보안 정책으로 복사에 실패했습니다.');
    }
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setShareUrl('');
  };

  const handleRevoke = async () => {
    if (!revokeReason.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const revokeRequest = {
        id: Date.now(),
        certificateId: certificate.id,
        certificateName: certificate.title,
        issuer: certificate.issuer,
        reason: revokeReason.trim(),
        requestedAt: new Date().toISOString(),
        status: 'pending'
      };

      const existingRevokeRequests = JSON.parse(localStorage.getItem('revokeRequests') || '[]');
      const updatedRevokeRequests = [revokeRequest, ...existingRevokeRequests];
      localStorage.setItem('revokeRequests', JSON.stringify(updatedRevokeRequests));

      pushNotif('폐기 요청 완료', `"${certificate.title}" 폐기 요청이 관리자에게 전송되었습니다.`);

      setRevokeModalOpen(false);
      setRevokeReason('');
    } catch (error) {
      pushNotif('폐기 요청 실패', '폐기 요청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const openRevokeModal = () => {
    setRevokeReason('');
    setRevokeModalOpen(true);
  };

  const closeRevokeModal = () => {
    setRevokeModalOpen(false);
    setRevokeReason('');
  };

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">수료증을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        user={user}
        displayName={displayName}
        NotificationBell={NotificationBell}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <button
            onClick={() => router.back()}
            className="mb-6 text-gray-600 hover:text-gray-900 transition-colors"
          >
            돌아가기
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    {certificate.title}
                  </h1>
                  <p className="text-indigo-100 text-lg">
                    {certificate.issuer}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusBadge(certificate.status)} bg-white`}>
                    {certificate.status}
                  </span>

                  <div className="flex gap-2">
                    {certificate.status === '유효' && (
                      <>
                        <button
                          onClick={handleShare}
                          className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
                        >
                          공유하기
                        </button>

                        <button
                          onClick={openRevokeModal}
                          className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors backdrop-blur-sm"
                        >
                          폐기 요청
                        </button>
                      </>
                    )}

                    {certificate.status === '폐기' && (
                      <div className="px-4 py-2 bg-gray-200 text-black rounded-lg">
                        폐기된 수료증
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <img
                  src={certificate.imageUrl}
                  alt={certificate.title}
                  className="w-full h-auto min-h-[600px] max-h-[800px] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div
                  className="hidden w-full h-96 bg-gray-50 flex-col items-center justify-center border-2 border-dashed border-gray-200"
                  style={{ display: 'none' }}
                >
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-white text-2xl font-bold">VC</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Verifiable Credential
                  </h3>
                  <p className="text-gray-600 text-sm">
                    블록체인에 안전하게 저장된 검증 가능한 자격증명입니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 공유 링크 모달 */}
      {shareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                공유 링크
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  생성된 공유 링크
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 pr-12 bg-gray-50/50 text-sm font-mono text-gray-700 focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 transition-colors"
                    title="복사"
                  >
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  이 링크를 통해 다른 사람들이 수료증을 검증할 수 있습니다.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeShareModal}
                  className="px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-300 font-medium"
                >
                  닫기
                </button>
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium shadow-lg transform hover:-translate-y-0.5"
                >
                  복사하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 폐기 요청 모달 */}
      {revokeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                폐기 요청
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  폐기 사유를 입력해주세요
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  rows={4}
                  placeholder="예) 오타가 있어요 / 정보 변경 필요 / 분실"
                  className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all duration-300 bg-gray-50/50"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeRevokeModal}
                  disabled={submitting}
                  className="px-6 py-3 border-2 border-gray-200 rounded-2xl text-gray-700 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 font-medium"
                >
                  취소
                </button>
                <button
                  onClick={handleRevoke}
                  disabled={!revokeReason.trim() || submitting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transform hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      요청 중...
                    </span>
                  ) : (
                    '폐기 요청'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Loading fallback 컴포넌트
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 불러오는 중...</p>
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function CertificateDetailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CertificateDetailContent />
    </Suspense>
  );
}