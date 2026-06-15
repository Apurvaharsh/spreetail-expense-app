import React, { useState, useEffect } from "react";
import api from "../services/api";

function ProfileModal({ isOpen, onClose }) {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.get("/auth/profile/stats")
        .then(res => {
          setProfileData(res.data);
        })
        .catch(err => {
          console.error("Failed to fetch profile stats", err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div 
        className="bg-surface border border-outline-variant rounded-2xl shadow-xl w-[90vw] sm:w-[500px] max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-xl py-lg border-b border-surface-container-high flex justify-between items-center bg-surface-container-lowest">
          <h2 className="font-display text-display text-on-surface">User Profile</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-xl">
          {isLoading || !profileData ? (
            <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-[32px] mb-md">progress_activity</span>
              <span>Loading profile data...</span>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center mb-xl">
                <div className="w-24 h-24 rounded-full bg-primary-container text-on-primary-container font-display text-[40px] flex items-center justify-center overflow-hidden border-4 border-surface shadow-sm mb-md uppercase">
                  {profileData.name.charAt(0)}
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{profileData.name}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Expense Engine Administrator</p>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md grid grid-cols-1 sm:grid-cols-2 gap-y-md gap-x-lg">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Name</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">{profileData.name}</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Email</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">{profileData.email}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Member Since</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">
                    {new Date(profileData.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="col-span-full h-px bg-surface-container-high my-sm"></div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Expenses Processed</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">{profileData.stats.expensesProcessed.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Imports Completed</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">{profileData.stats.importsCompleted.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Anomalies Reviewed</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">{profileData.stats.anomaliesReviewed.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Settlements Generated</span>
                  <span className="font-body-md text-body-md font-medium text-on-surface">{profileData.stats.settlementsGenerated.toLocaleString()}</span>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProfileModal;
