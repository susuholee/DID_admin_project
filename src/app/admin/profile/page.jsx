"use client";

import { useEffect, useState } from "react";

export default function AdminProfilePage() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // localStorage에서 로그인한 관리자 정보 불러오기
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");
    const current = admins[0]; // 현재 로그인된 관리자
    setUserInfo(current);
  }, []);

  if (!userInfo) {
    return (
      <div className="p-6">
        <p>관리자 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 정보</h1>

      {/* 프로필 카드 */}
      <div className="border rounded-xl shadow-md bg-white p-6">
        {/* 상단 프로필 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          {/* 아바타 */}
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-gray-600">
            {userInfo.userName?.[0] || "A"}
          </div>

          {/* 이름 / 아이디 */}
          <div>
            <h2 className="text-xl font-semibold">{userInfo.userName}</h2>
            <p className="text-gray-500">@{userInfo.userId}</p>
          </div>
        </div>

        {/* 정보 리스트 */}
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="w-24 font-semibold text-gray-700">회사명</span>
            <span>{userInfo.company}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-semibold text-gray-700">가입일</span>
            <span>{new Date(userInfo.createdAt).toLocaleString("ko-KR")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
