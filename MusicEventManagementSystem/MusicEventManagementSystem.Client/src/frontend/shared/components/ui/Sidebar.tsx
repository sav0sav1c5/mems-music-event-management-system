import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/apiService";
import { 
  LogOut, BarChart3, BarChart2, Music, ChevronLeft, ChevronRight, Ticket, Calendar, PieChart, 
  PlaySquare, ListChecks, FileText, CalendarDays, Briefcase, Building2, ShoppingCart, CreditCard,
  Percent, Settings
} from "lucide-react";

const SideBar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(0);
  const [userDepartment, setUserDepartment] = useState<number>(1);
  const navigate = useNavigate();

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
      
      case 2: // EventOrganization
        return [
          { icon: <BarChart2 />, label: "Dashboard", path: "/event-organization/dashboard" },
          { icon: <Calendar />, label: "Events", path: "/event-organization/events" },
          { icon: <PlaySquare />, label: "Performances", path: "/event-organization/performances" },
          { icon: <ListChecks />, label: "Work Tasks", path: "/event-organization/work-tasks" },
          { icon: <CalendarDays />, label: "Calendar", path: "/event-organization/calendar" },
          { icon: <Briefcase />, label: "Resources", path: "/event-organization/resources" },
          { icon: <PieChart />, label: "Analytics", path: "/event-organization/analytics" },
        ];
      
      case 3: // PerformerCommunication
        return [
          { icon: <BarChart2 />, label: "Dashboard", path: "/performer-communication/dashboard" },
        ];
      
      case 4: // MediaCampaign
        return [
          { icon: <BarChart2 />, label: "Dashboard", path: "/media-campaign/dashboard" },
        ];
      
      case 5: // Client
        return [
          { icon: <Ticket size={20} />, label: "Events", path: "/client/browse-events" },
          { icon: <ShoppingCart size={20} />, label: "My Cart", path: "/client/my-cart" },
          { icon: <CreditCard size={20} />, label: "Checkout", path: "/client/checkout" },
          { icon: <FileText size={20} />, label: "My Orders", path: "/client/orders" },
        ];

      default:
        return [
          { icon: <BarChart2 />, label: "Dashboard", path: "/dashboard" },
        ];
    }
  };

  const menuItems = getMenuItems(userDepartment);

  const handleLogout = () => {
    authAPI.logout();
    navigate("/login");
  };

  const getDepartmentName = (department: number): string => {
    switch (department) {
      case 1: return "Ticket Sales";
      case 2: return "Event Organization";
      case 3: return "Artist Communication";
      case 4: return "Media Campaign";
      case 5: return "MEMS Client";
      default: return "MEMS";
    }
  };

  const getDepartmentColor = (department: number): string => {
    switch (department) {
      case 1: return "lime"; // Ticket Sales
      case 2: return "pink"; // Event Organization
      case 3: return "sky"; // Artist Communication
      case 4: return "purple"; // Media Campaign
      case 5: return "orange"; // Client - narandžasta
      default: return "neutral";
    }
  };

  const color = getDepartmentColor(userDepartment);

  return (
    <div
      className={`flex flex-col justify-between bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 text-white h-[calc(100vh-1.5rem)] my-3 ml-3 rounded-xl transition-all duration-300 shadow-lg ${
        isOpen ? "w-60" : "w-21"
      }`}
    >
      <div className="p-4 m-1">
        {/* Header */}
        <div className={`flex items-center justify-between mb-6 ${isOpen ? 'px-0.5' : 'pl-0.5'}`}>
          {isOpen && (
            <div className="transition-all duration-300">
              <div className="text-3xl font-black text-white tracking-tight">MEMS</div>
              <div className={`w-30 h-1 rounded-full mt-1 ${
                    color === 'lime' ? 'bg-lime-400' :
                    color === 'pink' ? 'bg-pink-400' :
                    color === 'sky' ? 'bg-sky-400' :
                    color === 'orange' ? 'bg-orange-400' :
                    'bg-purple-400'
              }`}></div>
              <div className="text-sm text-neutral-400 mt-1">
                {getDepartmentName(userDepartment)}
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 hover:bg-neutral-800 rounded-lg transition-all duration-200 text-neutral-400 border border-transparent ${
              color === 'lime' ? 'hover:text-lime-400 hover:border-lime-400/30' :
              color === 'pink' ? 'hover:text-pink-400 hover:border-pink-400/30' :
              color === 'sky' ? 'hover:text-sky-400 hover:border-sky-400/30' :
              color === 'orange' ? 'hover:text-orange-400 hover:border-orange-400/30' :
              'hover:text-purple-400 hover:border-purple-400/30'
            }`}
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const isActive = activeItem === index;
            
            return (
              <button
                key={index}
                onClick={() => {
                  setActiveItem(index);
                  navigate(item.path);
                }}
                className={`
                  flex items-center p-3 rounded-xl transition-all duration-200 w-full group
                  ${isOpen ? 'justify-start gap-3' : 'justify-center'}
                  ${
                    isActive
                      ? `${
                          color === 'lime' ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30' :
                          color === 'pink' ? 'bg-pink-400/20 text-pink-400 border border-pink-400/30' :
                          color === 'sky' ? 'bg-sky-400/20 text-sky-400 border border-sky-400/30' :
                          color === 'orange' ? 'bg-orange-400/20 text-orange-400 border border-orange-400/30' :
                          'bg-purple-400/20 text-purple-400 border border-purple-400/30'
                        }`
                      : "hover:bg-neutral-800 text-neutral-400 hover:text-white border border-transparent"
                  }
                `}
              >
                <div
                  className={`transition-all duration-200 flex-shrink-0 ${
                    isActive
                      ? `${
                          color === 'lime' ? 'text-lime-400' :
                          color === 'pink' ? 'text-pink-400' :
                          color === 'sky' ? 'text-sky-400' :
                          color === 'orange' ? 'text-orange-400' :
                          'text-purple-400'
                        }`
                      : "text-neutral-400 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </div>
                
                {/* Tekst se prikazuje samo kada je sidebar otvoren */}
                {isOpen && (
                  <span
                    className={`font-medium transition-all duration-200 text-base ${
                      isActive
                        ? `${
                            color === 'lime' ? 'text-lime-400' :
                            color === 'pink' ? 'text-pink-400' :
                            color === 'sky' ? 'text-sky-400' :
                            color === 'orange' ? 'text-orange-400' :
                            'text-purple-400'
                          }`
                        : "text-neutral-300 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                
                {/* Aktivni indikator - samo kada je sidebar otvoren */}
                {isActive && isOpen && (
                  <div className={`ml-auto w-2 h-2 rounded-full ${
                    color === 'lime' ? 'bg-lime-400' :
                    color === 'pink' ? 'bg-pink-400' :
                    color === 'sky' ? 'bg-sky-400' :
                    color === 'orange' ? 'bg-orange-400' :
                    'bg-purple-400'
                  }`}></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      {/* Footer with Logout */}
      <div className="p-3 border-t border-neutral-800 flex justify-center">
        <button
          onClick={handleLogout}
          className={`flex items-center justify-center p-3 bg-red-400/30 hover:bg-red-950/50 rounded-xl transition-all duration-200 
                    text-neutral-300 hover:text-red-300 border border-red-500 
                    hover:border-red-900/50 ${isOpen ? 'gap-3 w-full max-w-[200px]' : 'justify-center'}`}
        >
          <LogOut size={18} />
          {isOpen && <span className="font-medium text-base">Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default SideBar;