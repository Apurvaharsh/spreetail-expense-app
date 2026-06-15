import React, { useState, useRef, useEffect } from "react";
import NotificationsMenu from "./NotificationsMenu";
import SettingsModal from "./SettingsModal";
import ProfileModal from "./ProfileModal";
import ImportHistoryDrawer from "./ImportHistoryDrawer";
import ProjectDocsModal from "./ProjectDocsModal";

function TopNav({ title, searchQuery, setSearchQuery, searchPlaceholder, centerContent }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isImportHistoryOpen, setIsImportHistoryOpen] = useState(false);
  const [isProjectDocsOpen, setIsProjectDocsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const avatarRef = useRef(null);

  useEffect(() => {
    import("../services/api").then((module) => {
      const api = module.default;
      api.get("/auth/profile/stats")
        .then(res => setProfileData(res.data))
        .catch(err => console.error("Failed to fetch profile stats for nav", err));
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (avatarRef.current && !avatarRef.current.contains(event.target)) {
        setIsAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  return (
    <>
      <header className="bg-surface shadow-sm flex justify-between items-center w-full px-lg py-sm h-16 sticky top-0 z-40 border-b border-outline-variant">
        
        {/* Left: Menu & Title */}
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hidden md:block hover:text-primary transition-colors" data-icon="menu">menu</span>
          <span className="font-headline-md text-headline-md text-on-surface ml-xs hidden sm:block">{title}</span>
        </div>

        {/* Center Content */}
        {centerContent ? (
          centerContent
        ) : searchPlaceholder ? (
          <div className="flex-1 w-full max-w-2xl mx-md lg:mx-xl relative hidden md:block">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[22px] pointer-events-none" data-icon="search">search</span>
            <input 
              className="w-full pl-12 pr-4 py-2.5 border border-outline-variant rounded-full font-body-md text-body-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-surface-container-lowest shadow-sm placeholder:text-on-surface-variant/70" 
              placeholder={searchPlaceholder}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        ) : (
          <div className="flex-1 w-full max-w-2xl mx-md lg:mx-xl relative hidden md:block"></div>
        )}

        {/* Right: Actions */}
        <div className="flex items-center gap-md shrink-0">
          <NotificationsMenu />
          
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low transition-colors text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="settings">settings</span>
          </button>
          
          <div className="relative" ref={avatarRef}>
            <div 
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
              className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container font-bold flex items-center justify-center overflow-hidden border border-outline-variant cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all select-none uppercase"
            >
              {profileData?.name ? profileData.name.charAt(0) : '?'}
            </div>
            
            {isAvatarMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[280px] bg-surface border border-outline-variant rounded-xl shadow-lg z-50 overflow-hidden flex flex-col transform origin-top-right transition-all">
                {/* Profile Header */}
                <div className="p-md flex items-center gap-md bg-surface-container-lowest border-b border-surface-container-high">
                  <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container font-display text-[20px] flex items-center justify-center shrink-0 border border-outline-variant uppercase">
                    {profileData?.name ? profileData.name.charAt(0) : '?'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-sm text-headline-sm text-on-surface leading-tight">{profileData?.name || "User"}</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant leading-tight mt-xs">Expense Engine Administrator</span>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-sm flex flex-col">
                  <button 
                    onClick={() => { setIsAvatarMenuOpen(false); setIsProfileOpen(true); }}
                    className="w-full text-left px-md py-sm font-body-md text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                    Profile
                  </button>
                </div>
                
                <div className="border-t border-surface-container-high py-sm">
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-md py-sm font-body-md text-error hover:bg-error/10 transition-colors flex items-center gap-sm"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Render Modals at root level */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <ImportHistoryDrawer isOpen={isImportHistoryOpen} onClose={() => setIsImportHistoryOpen(false)} />
      <ProjectDocsModal isOpen={isProjectDocsOpen} onClose={() => setIsProjectDocsOpen(false)} />
    </>
  );
}

export default TopNav;
