"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationBell from "../UI/NotificationBell";

export default function AdminNav() {
  const [notifications, setNotifications] = useState([]);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // localStorage에서 로그인한 관리자 정보 불러오기
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");
    const current = admins[0]; // 현재 로그인된 관리자
    setUserInfo(current);

    // 테스트용 알림 데이터
    setNotifications([
      {
        id: 1,
        title: "새 보고서 등록됨",
        message: "2025년 8월 보고서가 업로드되었습니다.",
        ts: Date.now() - 1000 * 60 * 5,
        read: false,
      },
      {
        id: 2,
        title: "비밀번호 변경 완료",
        message: "계정 보안 강화를 위해 비밀번호를 변경했습니다.",
        ts: Date.now() - 1000 * 60 * 60 * 3,
        read: true,
      },
    ]);
  }, []);

  return (
    <div className="fixed top-4 right-6 flex items-center gap-4 z-50">
      {/* 알림벨 */}
      <NotificationBell
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* 관리자 이름 */}
      {userInfo && (
        <Link href="/admin/profile">
          <span className="text-gray-800 font-medium cursor-pointer hover:underline">
            {userInfo.userName}님
          </span>
        </Link>
      )}
    </div>
  );
}
