import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex bg-neutral-950 min-h-screen">
      {/* Sidebar - fixed */}
      <div className="sticky top-0 h-screen flex-shrink-0">
        <Sidebar />
      </div>

      {/* Main screen */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar - fixed */}
        <div className="sticky top-0 z-20">
          <Topbar />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto p-3">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;