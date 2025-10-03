import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LogOut, BarChart3, Building2, Music, Ticket, Percent, Settings, PieChart,
  Home, Menu, X
} from "lucide-react";

const BottomBar = () => {
  const [activeItem, setActiveItem] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [userDepartment, setUserDepartment] = useState<number>(1);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get user's department from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserDepartment(user.department);
      } catch {
        // Handle parse error
      }
    }
  }, []);

  const getMenuItems = (department: number) => {
    switch (department) {
      case 1: // TicketSales
        return [
          { icon: <BarChart3 size={20} />, label: "Dashboard", path: "/ticket-sales/dashboard" },
          { icon: <Building2 size={20} />, label: "Infrastructure", path: "/ticket-sales/infrastructure" },
          { icon: <Music size={20} />, label: "Performances", path: "/ticket-sales/performances" },
          { icon: <Ticket size={20} />, label: "Ticket Types", path: "/ticket-sales/ticket-types" },
          { icon: <Percent size={20} />, label: "Special Offers", path: "/ticket-sales/special-offers" },
          { icon: <Settings size={20} />, label: "Pricing Rules", path: "/ticket-sales/pricing-rules" },
          { icon: <PieChart size={20} />, label: "Analytics", path: "/ticket-sales/analytics" },
        ];
      
      case 5: // Client
        return [
          { icon: <Ticket size={20} />, label: "Events", path: "/client/browse-events" },
          { icon: <Home size={20} />, label: "My Cart", path: "/client/my-cart" },
          { icon: <Home size={20} />, label: "Checkout", path: "/client/checkout" },
          { icon: <Home size={20} />, label: "My Orders", path: "/client/orders" },
        ];

      default:
        return [
          { icon: <BarChart3 size={20} />, label: "Dashboard", path: "/dashboard" },
        ];
    }
  };

  const menuItems = getMenuItems(userDepartment);
  const mainItems = menuItems.slice(0, 4); // Show first 4 items in bottom bar
  const moreItems = menuItems.slice(4); // Remaining items in expanded menu

  useEffect(() => {
    // Find active item based on current path
    const activeIndex = menuItems.findIndex(item => item.path === location.pathname);
    if (activeIndex !== -1) {
      setActiveItem(activeIndex);
    }
  }, [location.pathname, menuItems]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getDepartmentColor = (department: number): string => {
    switch (department) {
      case 1: return "lime";
      case 2: return "pink";
      case 3: return "sky";
      case 4: return "purple";
      case 5: return "orange";
      default: return "neutral";
    }
  };

  const color = getDepartmentColor(userDepartment);

  const handleNavigation = (path: string, index: number) => {
    setActiveItem(index);
    navigate(path);
    setShowMenu(false);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 z-50 lg:hidden">
        <div className="flex items-center justify-around py-2 px-4">
          {mainItems.map((item, index) => {
            const isActive = activeItem === index;
            return (
              <button
                key={index}
                onClick={() => handleNavigation(item.path, index)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 flex-1 max-w-[60px] ${
                  isActive
                    ? `${color === 'lime' ? 'text-lime-400' :
                        color === 'pink' ? 'text-pink-400' :
                        color === 'sky' ? 'text-sky-400' :
                        color === 'orange' ? 'text-orange-400' :
                        'text-purple-400'}`
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <div className={`p-1.5 rounded-lg ${
                  isActive 
                    ? `${color === 'lime' ? 'bg-lime-400/20' :
                        color === 'pink' ? 'bg-pink-400/20' :
                        color === 'sky' ? 'bg-sky-400/20' :
                        color === 'orange' ? 'bg-orange-400/20' :
                        'bg-purple-400/20'}`
                    : ''
                }`}>
                  {item.icon}
                </div>
                <span className="text-xs mt-1 font-medium truncate w-full text-center">
                  {item.label}
                </span>
              </button>
            );
          })}
          
          {/* More Menu Button */}
          {moreItems.length > 0 && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 flex-1 max-w-[60px] ${
                showMenu
                  ? `${color === 'lime' ? 'text-lime-400' :
                      color === 'pink' ? 'text-pink-400' :
                      color === 'sky' ? 'text-sky-400' :
                      color === 'orange' ? 'text-orange-400' :
                      'text-purple-400'}`
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <div className={`p-1.5 rounded-lg ${
                showMenu 
                  ? `${color === 'lime' ? 'bg-lime-400/20' :
                      color === 'pink' ? 'bg-pink-400/20' :
                      color === 'sky' ? 'bg-sky-400/20' :
                      color === 'orange' ? 'bg-orange-400/20' :
                      'bg-purple-400/20'}`
                  : ''
              }`}>
                {showMenu ? <X size={20} /> : <Menu size={20} />}
              </div>
              <span className="text-xs mt-1 font-medium">More</span>
            </button>
          )}
        </div>

        {/* Expanded Menu */}
        {showMenu && moreItems.length > 0 && (
          <div className="absolute bottom-full left-0 right-0 bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800 p-4">
            <div className="grid grid-cols-2 gap-2">
              {moreItems.map((item, index) => {
                const actualIndex = mainItems.length + index;
                const isActive = activeItem === actualIndex;
                return (
                  <button
                    key={actualIndex}
                    onClick={() => handleNavigation(item.path, actualIndex)}
                    className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? `${color === 'lime' ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30' :
                            color === 'pink' ? 'bg-pink-400/20 text-pink-400 border border-pink-400/30' :
                            color === 'sky' ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30' :
                            color === 'orange' ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
                            'bg-purple-400/20 text-purple-400 border border-purple-400/30'}`
                        : "hover:bg-neutral-800 text-neutral-400 hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                  </button>
                );
              })}
              
              {/* Logout in expanded menu */}
              <button
                onClick={handleLogout}
                className="flex items-center p-3 hover:bg-red-950/50 rounded-xl transition-all duration-200 text-red-400 hover:text-red-300 border border-transparent hover:border-red-900/50"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={18} />
                  <span className="font-medium text-sm">Sign Out</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for expanded menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMenu(false)}
        />
      )}
    </>
  );
};

export default BottomBar;