import { Sun, Moon, Search } from "lucide-react";
import { useState, useEffect } from "react";

const TopBar = () => {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  // State for theme
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if user has theme preference in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
      applyTheme(savedTheme === 'dark');
    }
  }, []);

  const applyTheme = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    applyTheme(newDarkMode);
  };

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
    const colorMap = {
      1: { 
        text: "text-lime-400", 
        border: "border-lime-400", 
        hoverBorder: "hover:border-lime-400/50",
        hoverText: "hover:text-lime-400", 
        bg: "bg-lime-400",
        ring: "focus:ring-lime-400",
        badge: "bg-lime-400",
        groupHoverText: "group-hover:text-lime-400",
        groupHoverBorder: "group-hover:border-lime-400/30"
      },
      2: { 
        text: "text-pink-400", 
        border: "border-pink-400", 
        hoverBorder: "hover:border-pink-400/50",
        hoverText: "hover:text-pink-400", 
        bg: "bg-pink-400",
        ring: "focus:ring-pink-400",
        badge: "bg-pink-400",
        groupHoverText: "group-hover:text-pink-400",
        groupHoverBorder: "group-hover:border-pink-400/30"
      },
      3: { 
        text: "text-sky-400", 
        border: "border-sky-400", 
        hoverBorder: "hover:border-sky-400/50",
        hoverText: "hover:text-sky-400", 
        bg: "bg-sky-400",
        ring: "focus:ring-sky-400",
        badge: "bg-sky-400",
        groupHoverText: "group-hover:text-sky-400",
        groupHoverBorder: "group-hover:border-sky-400/30"
      },
      4: { 
        text: "text-purple-400", 
        border: "border-purple-400", 
        hoverBorder: "hover:border-purple-400/50",
        hoverText: "hover:text-purple-400", 
        bg: "bg-purple-400",
        ring: "focus:ring-purple-400",
        badge: "bg-purple-400",
        groupHoverText: "group-hover:text-purple-400",
        groupHoverBorder: "group-hover:border-purple-400/30"
      },
      5: { 
        text: "text-orange-400", 
        border: "border-orange-400", 
        hoverBorder: "hover:border-orange-400/50",
        hoverText: "hover:text-orange-400", 
        bg: "bg-orange-400",
        ring: "focus:ring-orange-400",
        badge: "bg-orange-400",
        groupHoverText: "group-hover:text-orange-400",
        groupHoverBorder: "group-hover:border-orange-400/30"
      }
    };
    
    return colorMap[dept as keyof typeof colorMap] || colorMap[1];
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
      {/* Desktop: Search on left */}
      <div className="relative w-1/2 mx-1 hidden lg:block">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-5 h-5`} />
        <input
          type="text"
          placeholder="Search..."
          className={`w-full pl-10 pr-2 py-2.5 rounded-2xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 ${colorClasses.ring} focus:border-transparent transition-all text-base`}
        />
      </div>

      {/* Mobile: Theme button on left */}
      <div className="lg:hidden">
        <button 
          onClick={toggleTheme}
          className={`p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl cursor-pointer transition-all duration-200 border border-neutral-700 ${colorClasses.hoverBorder} group`}
        >
          {isDark ? (
            <Sun className={`w-5 h-5 text-neutral-400 ${colorClasses.hoverText} transition-colors`} />
          ) : (
            <Moon className={`w-5 h-5 text-neutral-400 ${colorClasses.hoverText} transition-colors`} />
          )}
        </button>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Desktop: Theme Toggle */}
        <div className="relative hidden lg:block">
          <button 
            onClick={toggleTheme}
            className={`p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl cursor-pointer transition-all duration-200 border border-neutral-700 ${colorClasses.hoverBorder} group`}
          >
            {isDark ? (
              <Sun className={`w-5 h-5 text-neutral-400 ${colorClasses.hoverText} transition-colors`} />
            ) : (
              <Moon className={`w-5 h-5 text-neutral-400 ${colorClasses.hoverText} transition-colors`} />
            )}
          </button>
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