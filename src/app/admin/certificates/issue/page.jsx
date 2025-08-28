// src/app/certificates/issue/page.jsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// 더미 수료증 목록 (기관에서 정해준 수료증들)
const AVAILABLE_CERTIFICATES = [
  { id: "blockchain-basic", name: "블록체인 기초 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "blockchain-advanced", name: "블록체인 심화 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "smart-contract", name: "스마트컨트랙트 개발 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "did-system", name: "DID 인증 시스템 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "web3-architecture", name: "웹3 서비스 아키텍처 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "crypto-basics", name: "암호학 기초 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "nft-development", name: "NFT 개발 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "defi-basics", name: "DeFi 기초 과정 수료증", issuer: "경일IT게임아카데미" },
  { id: "frontend-react", name: "React 프론트엔드 개발 과정 수료증", issuer: "크로스허브" },
  { id: "backend-nodejs", name: "Node.js 백엔드 개발 과정 수료증", issuer: "크로스허브" },
  { id: "fullstack-web", name: "풀스택 웹 개발 과정 수료증", issuer: "크로스허브" },
  { id: "mobile-react-native", name: "React Native 모바일 개발 과정 수료증", issuer: "크로스허브" },
];

export default function IssueCertificatePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    certificateId: "",
    issuer: "", // 수료증 선택 시 기본값 자동 입력
    reason: "", // 발급 요청 사유
  });

  // 선택된 수료증 정보
  const selectedCertificate = useMemo(() => {
    return AVAILABLE_CERTIFICATES.find((cert) => cert.id === formData.certificateId);
  }, [formData.certificateId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "certificateId") {
      // 수료증 선택 시 발급 기관 자동 설정
      const selected = AVAILABLE_CERTIFICATES.find((cert) => cert.id === value);
      setFormData((prev) => ({ 
        ...prev, 
        certificateId: value, 
        issuer: selected?.issuer || "" 
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
    id: Date.now(),
    certificateId: formData.certificateId,
    certificateName: selectedCertificate?.name,
    issuer: formData.issuer,
    reason: formData.reason,
    requestedAt: new Date().toISOString(),
    status: 'pending',
  };
  
  console.log("발급 요청 데이터:", payload); //  저장할 데이터 확인

  // 알림 저장
  const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
  const newNotification = {
    id: Date.now(),
    title: '수료증 발급 요청',
    message: `${selectedCertificate?.name} 발급 요청이 제출되었습니다.`,
    ts: Date.now(),
    read: false,
  };
  
  const updatedNotifications = [newNotification, ...existingNotifications];
  localStorage.setItem('notifications', JSON.stringify(updatedNotifications));

  // 발급 요청 목록에 저장
  const existingRequests = JSON.parse(localStorage.getItem('certificate_requests') || '[]');
  console.log("기존 요청들:", existingRequests); //  기존 데이터 확인
  
  const updatedRequests = [payload, ...existingRequests];
  console.log("업데이트된 요청들:", updatedRequests); // 업데이트될 데이터 확인
  
  localStorage.setItem('certificate_requests', JSON.stringify(updatedRequests));
  
  // 저장 후 확인
  console.log("저장 후 확인:", localStorage.getItem('certificate_requests')); // 실제 저장된 데이터 확인

  router.push('/dashboard');
};
  const canSubmit = 
    formData.certificateId && 
    formData.issuer && 
    formData.reason.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">수료증 발급 요청</h1>
          <p className="text-gray-600">기관에서 승인한 수료증 목록에서 선택하여 발급을 요청할 수 있습니다.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-lg">
          {/* 수료증 선택 */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              수료증 종류 <span className="text-red-500">*</span>
            </label>
            <select
              name="certificateId"
              value={formData.certificateId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="" disabled>수료증을 선택하세요</option>
              {AVAILABLE_CERTIFICATES.map((cert) => (
                <option key={cert.id} value={cert.id}>
                  {cert.name} ({cert.issuer})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              기관에서 승인한 수료증만 발급 요청할 수 있습니다.
            </p>
          </div>

        

          {/* 발급 기관 */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              발급 기관 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="issuer"
              placeholder="경일IT게임아카데미"
              value={formData.issuer}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50"
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              수료증 선택 시 자동으로 입력됩니다.
            </p>
          </div>

          {/* 발급 요청 사유 */}
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              발급 요청 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reason"
              placeholder="수료증 발급이 필요한 사유를 입력해주세요. (예: 취업 준비용, 경력 증명용 등)"
              value={formData.reason}
              onChange={handleChange}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              관리자가 검토할 수 있도록 구체적인 사유를 입력해주세요.
            </p>
          </div>

          {/* 선택된 수료증 미리보기 */}
          {selectedCertificate && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">선택된 수료증</h3>
              <div className="bg-white rounded-lg p-4 border">
                <h4 className="font-semibold text-gray-900">{selectedCertificate.name}</h4>
                <p className="text-sm text-gray-600 mt-1">발급기관: {selectedCertificate.issuer}</p>
                <p className="text-sm text-gray-600">요청사유: {formData.reason || '미입력'}</p>
              </div>
            </div>
          )}

          {/* 제출 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-purple-600"
            >
              발급 요청하기
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              요청 후 관리자의 승인을 거쳐 수료증이 발급됩니다.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}