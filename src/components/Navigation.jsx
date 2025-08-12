
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const NAVBAR_HEIGHT = 56; // AppBar の高さ

const Navigation = () => {

  const [open, setOpen] = useState(false);
  const sidebarRef = useRef(null);
  const buttonRef = useRef(null);

  const location = useLocation();

  useEffect(() => {
    // ページ遷移が起きたらサイドバーを閉じる
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <header className="border-b border-gray-800 flex items-center h-14 px-0">
        <div className="flex items-center relative">
          <button
            ref={buttonRef}
            onClick={() => setOpen(!open)}
            className="z-50 px-2 mx-2 bg-gray-800 text-white w-8 h-8 rounded-md"
          >
            {open ? <FiChevronLeft /> : <FiChevronRight />}
          </button>

          <aside
            ref={sidebarRef}
            className={`fixed top-14 left-0 h-[calc(100vh-56px)] w-64 bg-gray-900 text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out
              ${open ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <div className="h-14 flex items-center px-4 border-b border-gray-700">
              <p className="text-lg font-semibold">メニュー</p>
            </div>
            <div className="px-4 py-4 space-y-3">
              <Link to="/" className="block text-white hover:text-blue-400 text-base">ダッシュボード</Link>
              <Link to="/visit-record-form1" className="block text-white hover:text-blue-400 text-base">訪問記録フォーム</Link>
              <Link to="/visit-records" className="block text-white hover:text-blue-400 text-base">訪問記録表</Link>
              <Link to="/stores" className="block text-white hover:text-blue-400 text-base">店舗表</Link>
            </div>
          </aside>

          <Link to="/" className="ml-4 text-2xl text-white font-logo">
            <h1>オフまっぷ</h1>
          </Link>
        </div>
      </header>
    </>
  );
};

export default Navigation;
