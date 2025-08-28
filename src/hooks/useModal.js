"use client";
import { useState, useCallback } from "react";

export default function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const openModal = useCallback((msg) => {
    setMessage(msg);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setMessage("");
  }, []);

  return { isOpen, message, openModal, closeModal };
}
