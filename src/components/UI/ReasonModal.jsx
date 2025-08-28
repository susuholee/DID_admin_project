"use client";

import { useRef, useEffect } from "react";

export default function ReasonModal({
  open,
  title = "사유 입력",
  placeholder = "분실/오타/정보 수정 등 사유를 입력하세요.",
  cancelText = "취소",
  confirmText = "제출",
  onClose,
  onSubmit,
}) {
  if (!open) return null;
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const handleConfirm = () => {
    const reason = ref.current?.value?.trim();
    if (!reason) return;
    onSubmit(reason);
  };

  return (
    <div aria-modal="true" role="dialog" className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-[320px] border border-gray-200">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>

        <textarea
          ref={ref}
          className="w-full min-h-[110px] border rounded-lg p-3 text-sm"
          placeholder={placeholder}
          required
        />

        <div className="mt-3 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-1 rounded border hover:bg-gray-50">
            {cancelText}
          </button>
          <button onClick={handleConfirm} className="bg-amber-400 text-white px-4 py-1 rounded hover:bg-amber-500">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
