import Sidebar from "./SideBar";
import Topbar from "./TopBar";
import BottomBar from "./BottomBar";
import { useState, useEffect } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  return (
    <div className="flex bg-neutral-950 min-h-screen">
      {/* Sidebar - hidden on mobile, shown on desktop */}
      {!isMobile && (
        <div className="sticky top-0 h-screen flex-shrink-0">
          <Sidebar />
        </div>
      )}

      {/* Main screen */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - fixed */}
        <div className="sticky top-0 z-20">
          <Topbar />
        </div>

        {/* Scrollable main content with bottom padding for mobile */}
        <main className={`flex-1 overflow-y-auto p-3 ${isMobile ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>

      {/* BottomBar - only on mobile */}
      {isMobile && <BottomBar />}
    </div>
  );
};

export default Layout;