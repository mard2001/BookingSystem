import React from 'react'
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getStoredUser } from '../../utils/LocalVariables';
import { BarChart, CalendarDaysIcon, ChevronDown, ChevronLeft, ChevronRight, LayoutDashboard, LogOutIcon, MapPin, MenuIcon, Settings, UserCircle2, Users, X } from 'lucide-react';
import { getDecryptedRole } from '../../utils/Crypto';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const user = getStoredUser();
  const role = getDecryptedRole();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const { pathname } = useLocation();
  const [userName, setUserName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});
  const [collapsed, setCollapsed] = useState(false); // desktop collapse state

  useEffect(() => {
    setUserName(user.firstName + " " + user.lastName);
  }, [])

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname])

  // Close submenus when collapsing
  useEffect(() => {
    if (collapsed) setOpenMenus({});
  }, [collapsed])

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard", roles: ["superadmin", "admin", "staff"] },
    // { label: "Bookings", icon: CalendarDaysIcon, path: "/bookings", roles: ["admin", "staff"] },
    {
      label: "Bookings", icon: CalendarDaysIcon, path: "/bookings", roles: ["superadmin", "admin", "staff"],
      children: [
        { label: "All Bookings", path: "/bookings" },
        { label: "Calendar View", path: "/bookings/calendar" },
        // { label: "Walk-ins", path: "/bookings/walkins" },
      ]
    },
    { label: "Courts", icon: MapPin, path: "/Courts", roles: ["superadmin", "admin", "staff"] },
    // {
    //   label: "Courts", icon: MapPin, path: "/courts", roles: ["admin", "staff"],
    //   children: [
    //     { label: "Court List", path: "/courts" },
    //     { label: "Availability", path: "/courts/availability" },
    //   ]
    // },
    { label: "Users", icon: Users, path: "/customers", roles: ["superadmin", "admin"] },
    { label: "My Profile", icon: UserCircle2, path: "/profile", roles: ["superadmin", "admin", "customer"] },
    // { label: "Settings", icon: Settings, path: "/settings", roles: ["superadmin", "admin"] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role));

  const toggleMenu = (label) => {
    if (collapsed) return; 
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const sidebarContent = (isCollapsed = false) => (
    <>
      {/* Brand header */}
      <div className='px-3 pt-6 pb-5 border-b border-white/10'>
        <div className="flex items-center justify-between">
          {/* Logo always visible */}
          <div className={`flex items-center gap-2 ${isCollapsed ? "justify-center w-full" : ""}`}>
            <a href="/">
              <img src="/images/ylayaSmashRallyTransparent3.png" className="w-9 shrink-0" />
            </a>
            {!isCollapsed && (
              <div>
                <p className="font-bold text-sm whitespace-nowrap text-white/90">Ylaya Smash Rally</p>
                <p className="text-xs text-white/60">Admin Portal</p>
              </div>
            )}
          </div>
          {/* Close button - mobile only */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/10 text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Section label */}
      <div className="px-5 pt-8 pb-2">
        {!isCollapsed && (
            <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-white/50">
              Navigation
            </p>
        )}
      </div>


      {/* Navigation List */}
      <div className={`flex-1 px-2 space-y-0.5 overflow-y-auto ${isCollapsed ? "pt-6" : "pt-1"}`}>
        {visibleNavItems.map(item => {
          const isActive = pathname === item.path || item.children?.some(child => pathname === child.path);

          return (
            <div key={item.path}>
              {item.children ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center w-full px-3 py-2.5 my-1.5 rounded-md hover:cursor-pointer
                    border-l-4 transition-all duration-200 text-white/80 text-sm
                    ${isCollapsed ? "justify-center" : "justify-between"}
                    ${isActive
                      ? "bg-primary/20 font-semibold border-primary"
                      : "border-transparent hover:bg-primary/10 hover:border-primary/50 hover:text-white/90"}`}
                >
                  <span className={`flex items-center ${isCollapsed ? "" : "gap-2"}`}>
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!isCollapsed && item.label}
                  </span>
                  {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openMenus[item.label] ? "rotate-180" : ""}`} />
                  )}
                </button>
              ) : (
                <Link
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={`flex items-center px-3 py-2.5 my-1.5 rounded-lg hover:cursor-pointer
                    border-l-4 transition-all duration-200 text-white/80 text-sm
                    ${isCollapsed ? "justify-center" : "gap-2"}
                    ${isActive
                      ? "bg-primary/20 font-semibold border-primary"
                      : "border-transparent hover:bg-primary/10 hover:border-primary/50 hover:text-white/90"}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && item.label}
                </Link>
              )}

              {/* Sub-items - hidden when collapsed */}
              {!isCollapsed && item.children && openMenus[item.label] && (
                <div className="pl-8 flex flex-col gap-1">
                  {item.children.map(child => {
                    const isChildActive = pathname === child.path;
                    return (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`text-xs text-white/80 px-3 py-2.5 rounded-lg hover:cursor-pointer
                          border-l-4 transition-all duration-200
                          ${isChildActive
                            ? "bg-primary/20 font-semibold border-primary"
                            : "border-transparent hover:bg-primary/10 hover:border-primary/50 hover:text-white/90"}`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* User Profile Card */}
      {userName && (
        <div className={`mx-2 mb-4 p-3 rounded-lg bg-white/5 border border-white/10 ${isCollapsed ? "flex justify-center" : ""}`}>
          {isCollapsed ? (
            // Collapsed: just avatar with tooltip
            <div title={userName} className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/20 cursor-pointer">
              <span className="text-slate-400 text-xs font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          ) : (
            // Expanded: full profile
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center ring-1 ring-white/20 shrink-0">
                <span className="text-slate-400 text-xs font-semibold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 px-2">
                <p className='text-sm text-white/90 truncate'>{userName}</p>
                <p className='text-[10px] text-white/50 capitalize'>{role}</p>
              </div>
              <div onClick={onLogout} className='hover:bg-primary/20 p-2 rounded-lg hover:cursor-pointer'>
                <LogOutIcon className='w-4 h-4' />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )

  const onLogout = async () => {
    await handleLogout();
    navigate("/");
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className='lg:hidden fixed top-3 left-4 z-[9999] p-2 bg-primary text-white rounded-lg shadow-lg border border-white/10'
      >
        <MenuIcon className='w-5 h-5' />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className='lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]'
        />
      )}

      {/* Sidebar - desktop */}
      <aside className={`hidden lg:flex flex-col h-full bg-primary-darker text-white shrink-0
        transition-all duration-300 ease-in-out relative
        ${collapsed ? "w-18" : "w-65"}`}>

        {sidebarContent(collapsed)}

        {/* Collapse toggle button */}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3 top-8 w-6 h-6 bg-primary-darker border border-white/20 rounded-full
            flex items-center justify-center text-white/60 hover:text-white hover:border-white/50
            transition-all duration-200 z-10"
        >
          {collapsed
            ? <ChevronRight className="w-3 h-3" />
            : <ChevronLeft className="w-3 h-3" />
          }
        </button>
      </aside>

      {/* Sidebar - mobile (always full width, never collapsed) */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 w-72 flex flex-col bg-primary-darker text-white shrink-0
        z-[9999] transition-transform duration-300 ease-in-out
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent(false)}
      </aside>
    </>
  )
}