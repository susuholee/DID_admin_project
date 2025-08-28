import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray text-black">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="size-7 rounded-xl bg-white" />
            <span className="font-semibold">DID Certificates</span>
          </div>
          <p className="mt-3 text-sm">
            @ {new Date().getFullYear()} 경일IT게임 아카데미
          </p>
        </div>
        <div className="flex md:justify-end items-center gap-6 text-sm">
          <a href="#" className="hover:text-white">이용약관</a>
          <a href="#" className="hover:text-white">개인정보 처리방침</a>
          <a href="#" className="hover:text-white">고객센터</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;