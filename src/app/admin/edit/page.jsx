"use client";
import React, { useEffect, useState, useMemo } from "react";
import Input from "@/components/UI/Input";
import Button from "@/components/UI/Button";
import Modal from "@/components/UI/Modal";
import LoadingSpinner from "@/components/UI/Spinner";

export default function AdminProfile() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");
    const current = admins[0]; // 로그인된 사용자 가정
    setUserInfo(current);
  }, []);

  // ===== 유효성 검사 =====
  const userNameValid = useMemo(() => {
    if (!userInfo) return false;
    const trimmed = userInfo.userName;
    const regex = /^[가-힣a-zA-Z0-9]{2,20}$/;
    return (
      trimmed === trimmed.trim() &&
      trimmed.length >= 2 &&
      trimmed.length <= 20 &&
      regex.test(trimmed) &&
      !/(.)\1{2,}/.test(trimmed)
    );
  }, [userInfo?.userName]);

  const companyValid = useMemo(() => {
    if (!userInfo) return false;
    const trimmed = userInfo.company;
    return trimmed === trimmed.trim() && trimmed.length >= 2;
  }, [userInfo?.company]);

  const pwdValid = useMemo(() => {
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':",.<>?]).{8,}$/;
    return regex.test(newPassword);
  }, [newPassword]);

  const pwdOk = useMemo(
    () =>
      pwdValid &&
      newPassword === confirmPassword &&
      newPassword !== userInfo?.password,
    [pwdValid, newPassword, confirmPassword, userInfo]
  );

  const handleChange = (field, value) => {
    setUserInfo({ ...userInfo, [field]: value });
  };

  const showErrorModal = (msg) => {
    setModalMessage(msg);
    setShowModal(true);
  };


// ===== 저장 =====
const handleSave = () => {
  if (!userNameValid) {
    showErrorModal("관리자명을 올바르게 입력해주세요.");
    return;
  }
  if (!companyValid) {
    showErrorModal("회사명을 올바르게 입력해주세요.");
    return;
  }

  if (currentPassword || newPassword || confirmPassword) {
    if (currentPassword !== userInfo.password) {
      showErrorModal("현재 비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!pwdValid) {
      showErrorModal(
        "새 비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다."
      );
      return;
    }
    if (newPassword === userInfo.password) {
      showErrorModal("이전에 사용한 비밀번호는 다시 사용할 수 없습니다.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorModal("새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
  }

  setLoading(true);
  try {
    const admins = JSON.parse(localStorage.getItem("admins") || "[]");

    const updatedAdmins = admins.map((admin) =>
      admin.userId === userInfo.userId
        ? {
            ...userInfo,
            password: newPassword ? newPassword : userInfo.password,
          }
        : admin
    );

    localStorage.setItem("admins", JSON.stringify(updatedAdmins));

    setModalMessage("내 정보가 성공적으로 수정되었습니다.");
    setShowModal(true);

    // 입력 초기화
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // === 여기서 분기 ===
    const isChanged = JSON.stringify(admins) !== JSON.stringify(updatedAdmins);

    if (isChanged) {
      window.location.href = "/admin";
    } else {
      window.location.href = "/admin/dashboard";
    }
  } catch (err) {
    showErrorModal("정보 수정 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};

  // ===== 탈퇴 =====
  const confirmDelete = () => {
    try {
      const admins = JSON.parse(localStorage.getItem("admins") || "[]");
      const updatedAdmins = admins.filter(
        (admin) => admin.userId !== userInfo.userId
      );

      localStorage.setItem("admins", JSON.stringify(updatedAdmins));

      setModalMessage("회원 탈퇴가 완료되었습니다.");
      setShowModal(true);

      window.location.href = "/admin";
    } catch (err) {
      showErrorModal("탈퇴 처리 중 오류가 발생했습니다.");
    } finally {
      setShowConfirmModal(false);
    }
  };

  if (!userInfo) return <p>로딩 중...</p>;

  return (
    <main className="min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-8 sm:flex sm:items-center sm:justify-center">
      <div className="w-full max-w-md mx-auto rounded-2xl bg-white shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">내 정보 관리</h1>

        <div className="space-y-4">
          {/* 아이디 */}
          <div>
            <label className="block text-sm font-medium mb-2">아이디</label>
            <Input
              value={userInfo.userId}
              disabled
              className="h-12 text-base bg-gray-100"
            />
          </div>

          {/* 관리자명 */}
          <div>
            <label className="block text-sm font-medium mb-2">관리자명</label>
            <Input
              value={userInfo.userName}
              onChange={(e) => handleChange("userName", e.target.value)}
              className={`h-12 text-base ${
                userNameValid ? "border-green-300" : "border-red-300"
              }`}
            />
            {!userNameValid && userInfo.userName && (
              <p className="text-xs text-red-600 mt-1">
                관리자명을 올바르게 입력해주세요
              </p>
            )}
            {userNameValid && (
              <p className="text-xs text-green-600 mt-1">
                사용 가능한 관리자명입니다
              </p>
            )}
          </div>

          {/* 회사명 */}
          <div>
            <label className="block text-sm font-medium mb-2">회사명</label>
            <Input
              value={userInfo.company}
              onChange={(e) => handleChange("company", e.target.value)}
              className={`h-12 text-base ${
                companyValid ? "border-green-300" : "border-red-300"
              }`}
            />
            {!companyValid && userInfo.company && (
              <p className="text-xs text-red-600 mt-1">
                회사명을 올바르게 입력해주세요
              </p>
            )}
            {companyValid && (
              <p className="text-xs text-green-600 mt-1">
                사용 가능한 회사명입니다
              </p>
            )}
          </div>

          {/* 비밀번호 변경 */}
          <div>
            <label className="block text-sm font-medium mb-2">현재 비밀번호</label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">새 비밀번호</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`h-12 text-base ${
                newPassword
                  ? pwdValid
                    ? "border-green-300"
                    : "border-red-300"
                  : ""
              }`}
            />
            {newPassword && !pwdValid && (
              <p className="text-xs text-red-600 mt-1">
                영문, 숫자, 특수문자를 포함하여 8자 이상 입력해주세요
              </p>
            )}
            {pwdValid && newPassword !== userInfo.password && (
              <p className="text-xs text-green-600 mt-1">
                안전한 비밀번호입니다
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              새 비밀번호 확인
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`h-12 text-base ${
                confirmPassword
                  ? pwdOk
                    ? "border-green-300"
                    : "border-red-300"
                  : ""
              }`}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                비밀번호가 일치하지 않습니다
              </p>
            )}
            {confirmPassword && pwdOk && (
              <p className="text-xs text-green-600 mt-1">
                비밀번호가 일치합니다
              </p>
            )}
          </div>
        </div>

        {/* 저장 & 탈퇴 버튼 */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-rose-400 text-white hover:bg-rose-500 px-6 py-2 rounded-lg disabled:bg-gray-300"
          >
            {loading ? <LoadingSpinner message="저장 중..." /> : "저장하기"}
          </Button>

          <Button
            onClick={() => setShowConfirmModal(true)}
            disabled={loading}
            className="bg-gray-300 text-gray-700 hover:bg-red-500 hover:text-white px-6 py-2 rounded-lg transition-colors"
          >
            탈퇴하기
          </Button>
        </div>
      </div>

      {/* 일반 알림 모달 */}
      <Modal
        isOpen={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />

    {/* 탈퇴 확인 모달 */}
    {showConfirmModal && (
    <Modal
        isOpen={showConfirmModal}
        message="정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onClose={() => setShowConfirmModal(false)}
    >
        <div className="flex justify-end gap-2">
        <Button
            onClick={() => setShowConfirmModal(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
        >
            아니오
        </Button>
        <Button
            onClick={confirmDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
            예
        </Button>
        </div>
    </Modal>
        )}
    </main>
  );
}
