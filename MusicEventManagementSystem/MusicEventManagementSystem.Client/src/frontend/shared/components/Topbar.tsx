import { Bell, Search } from "lucide-react";

const TopBar = () => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const getDepartmentName = (dept: number) => {
    switch(dept) {
      case 1: return "Ticket Sales";
      case 2: return "Event Organisation";
      case 3: return "Artist Communication";
      case 4: return "Media Campaign";
      case 5: return "MEMS Client";
      default: return "User";
    }
  };

  const getDepartmentColor = (dept: number) => {
    switch(dept) {
      case 1: return "lime"; // Ticket Sales
      case 2: return "pink"; // Event Organisation
      case 3: return "sky"; // Artist Communication
      case 4: return "purple"; // Media Campaign
      case 5: return "orange"; // MEMS Client
      default: return "neutral";
    }
  };

  const getColorClasses = (dept: number) => {
    const color = getDepartmentColor(dept);
    
    return {
      text: `text-${color}-400`,
      border: `border-${color}-400`,
      hoverBorder: `hover:border-${color}-400/50`,
      hoverText: `hover:text-${color}-400`,
      bg: `bg-${color}-400`,
      ring: `focus:ring-${color}-400`,
      badge: `bg-${color}-400`,
      groupHoverText: `group-hover:text-${color}-400`,
      groupHoverBorder: `group-hover:border-${color}-400/30`
    };
  };

  const getDepartmentInitials = (dept: number) => {
    switch(dept) {
      case 1: return "TS";
      case 2: return "EO";
      case 3: return "AC";
      case 4: return "MC";
      case 5: return "CL";
      default: return "U";
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-between bg-neutral-900/80 backdrop-blur-sm border-b border-neutral-800 text-white px-6 py-4 mx-4 mt-4 rounded-2xl shadow-lg">
        <div className="text-neutral-400">Please log in</div>
      </div>
    );
  }

  const colorClasses = getColorClasses(user.department);

  return (
    <div className="flex items-center justify-between bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 text-white px-4 py-4 mx-3 mt-3 rounded-xl shadow-lg">
      {/* Search */}
      <div className="relative w-1/2 mx-1">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5`} />
        <input
          type="text"
          placeholder="Search..."
          className={`w-full pl-10 pr-2 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 ${colorClasses.ring} focus:border-transparent transition-all text-base`}
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button className={`p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl cursor-pointer transition-all duration-200 border border-neutral-700 ${colorClasses.hoverBorder} group`}>
            <Bell className={`w-5 h-5 text-neutral-400 ${colorClasses.hoverText} transition-colors`} />
          </button>
          <div className={`absolute -top-0.5 -right-0.5 w-2 h-2 ${colorClasses.badge} rounded-full border border-neutral-900`}></div>
        </div>

        {/* User Profile */}
        <div className={`flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer border border-neutral-700 ${colorClasses.groupHoverBorder} group`}>
          <div className={`w-8 h-8 rounded-full border-2 ${colorClasses.border} bg-neutral-700 flex items-center justify-center font-bold text-xs text-white`}>
            {getDepartmentInitials(user.department)}
          </div>
          <div className="text-xs">
            <div className={`font-semibold text-white ${colorClasses.groupHoverText} transition-colors text-sm`}>
              {user.firstName} {user.lastName}
            </div>
            <div className={`text-xs ${colorClasses.text}`}>
              {getDepartmentName(user.department)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;