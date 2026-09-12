"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  User,
  Mail,
  Camera,
  Save,
  Loader2,
  Shield,
  Monitor,
  Settings,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function StudentProfile() {
  const { isLoaded, user } = useUser();
  const [currentTab, setCurrentTab] = useState("#profile");

  // Profile State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (isLoaded && user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
      setPreviewPhoto(user.imageUrl || null);
    }
    
    const hash = window.location.hash;
    if (hash) {
      setCurrentTab(hash);
    }
  }, [isLoaded, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (profilePhoto) {
        await user.setProfileImage({ file: profilePhoto });
      }
      
      await user.update({
        firstName: formData.firstName,
        lastName: formData.lastName
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.errors?.[0]?.message || "Failed to update profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "#profile", name: "Profile Details", icon: User },
    { id: "#password", name: "Security", icon: Shield },
    { id: "#sessions", name: "Active Sessions", icon: Monitor },
    { id: "#settings", name: "Settings", icon: Settings },
  ];

  if (!isLoaded || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      {/* Page Header with Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Manage your personal profile, security, and active sessions.
          </p>
        </div>

        {/* Horizontal Tabs (Top Right) */}
        <div className="flex space-x-1 bg-card-hover/80 p-1.5 rounded-xl w-full lg:w-max overflow-x-auto border border-border/60 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                window.location.hash = tab.id;
              }}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                currentTab === tab.id
                  ? "bg-card text-accent shadow-sm ring-1 ring-slate-900/5 font-semibold"
                  : "text-text-muted hover:text-text hover:bg-card-hover/50"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${currentTab === tab.id ? "text-accent" : "text-text-muted"}`}
              />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 min-w-0">
        
        {/* Profile Edit Tab */}
        {currentTab === "#profile" && (
          <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border-soft flex items-center gap-3 bg-card-hover">
              <User className="text-accent w-5 h-5" />
              <h2 className="font-semibold text-text">Profile Details</h2>
            </div>
            
            <div className="p-8 sm:p-10">
              <form onSubmit={handleSubmitProfile} className="space-y-8">
                
                {/* Profile Photo Section */}
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border-soft">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-card-hover border-4 border-border shadow-lg relative">
                      {previewPhoto ? (
                        <img
                          src={previewPhoto}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-accent/10 text-accent">
                          <User size={48} />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="photo-upload"
                      className="absolute bottom-0 right-0 bg-accent text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-accent-hover transition-colors"
                    >
                      <Camera size={18} />
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text font-headline">
                      Profile Photo
                    </h3>
                    <p className="text-sm text-text-muted mt-1 max-w-sm">
                      Upload a new Profile Picture.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <label
                        htmlFor="photo-upload"
                        className="px-4 py-2 border border-border-soft text-text text-sm font-medium rounded-lg cursor-pointer hover:bg-card-hover transition-colors"
                      >
                        Change Photo
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text">
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-lg bg-bg text-text focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                        placeholder="John"
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text">
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <User className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-lg bg-bg text-text focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <Mail className="h-5 w-5" />
                      </div>
                      <input
                        type="email"
                        value={user.primaryEmailAddress?.emailAddress || ""}
                        disabled
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-lg bg-bg/50 text-text-muted cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                      Email address is managed by Clerk and cannot be changed here.
                    </p>
                  </div>

                  {/* Role */}
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-sm font-medium text-text">
                      Role
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
                        <Shield className="h-5 w-5" />
                      </div>
                      <input
                        type="text"
                        value="Student"
                        disabled
                        className="block w-full pl-10 pr-3 py-2.5 border border-border-soft rounded-lg bg-bg/50 text-text-muted cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {message.text && (
                  <div
                    className={`p-4 rounded-lg flex items-center gap-3 ${
                      message.type === "success"
                        ? "bg-green-500/10 text-green-500 border border-green-500/20"
                        : "bg-red-500/10 text-red-500 border border-red-500/20"
                    }`}
                  >
                    {message.type === "success" ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 shrink-0" />
                    )}
                    <p className="text-sm font-medium">{message.text}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-border-soft">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-accent text-bg px-6 py-2.5 rounded-lg font-semibold hover:bg-accent-hover transition-all focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-card disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {currentTab !== "#profile" && (
           <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden p-12 flex flex-col items-center justify-center text-center">
              <Shield className="w-12 h-12 text-text-muted mb-4 opacity-50" />
              <h2 className="text-xl font-bold text-text font-headline">Managed by Clerk</h2>
              <p className="text-text-muted mt-2 max-w-sm">
                Advanced security settings, multi-factor authentication, and active session management are handled automatically by Clerk in this version.
              </p>
           </div>
        )}

      </div>
    </div>
  );
}
