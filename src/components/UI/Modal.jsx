"use client";

export default function Modal({ isOpen, message, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
      <div className="text-black bg-white p-4 rounded-lg shadow-lg w-[320px] border border-gray-200">
        {message && <p className="mb-3 text-center">{message}</p>}
        {children ? (
          children
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-amber-400 text-white px-4 py-1 rounded hover:bg-amber-500"
            >
              확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
