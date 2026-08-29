"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Bell,
  Moon,
  Sun,
  Phone,
  Edit2,
  Save,
  X,
  Check,
  Palette,
  Languages,
} from "lucide-react";

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  emailNotifications: boolean;
  borrowConfirmationEmails: boolean;
  returnConfirmationEmails: boolean;
  dueReminderEmails: boolean;
  promotionalEmails: boolean;
  theme: string | null;
  language: string | null;
  createdAt: Date | null;
}

interface SettingsClientProps {
  user: User;
}

const SettingsClient = ({ user }: SettingsClientProps) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    fullName: user.fullName || "",
    phone: user.phone || "",
    bio: user.bio || "",
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: user.emailNotifications ?? true,
    borrowConfirmationEmails: user.borrowConfirmationEmails ?? true,
    returnConfirmationEmails: user.returnConfirmationEmails ?? true,
    dueReminderEmails: user.dueReminderEmails ?? true,
    promotionalEmails: user.promotionalEmails ?? false,
  });

  // Theme state - handle null
  const [theme, setTheme] = useState(user.theme || "dark");
  // Language state - handle null
  const [language, setLanguage] = useState(user.language || "en");
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("✨ Profile updated successfully!");
        setIsEditing(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationUpdate = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("🔔 Notification settings updated!");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update settings.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleThemeUpdate = async (newTheme: "dark" | "light") => {
    setTheme(newTheme);
    try {
      const response = await fetch("/api/user/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`🎨 Switched to ${newTheme} mode!`);
        router.refresh();
      }
    } catch (error) {
      toast.error("Failed to update theme.");
    }
  };

  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    setIsLanguageSaving(true);

    try {
      const response = await fetch("/api/user/language", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: newLanguage }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`🌍 Language updated to ${newLanguage}!`);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update language.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLanguageSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">⚙️ Settings</h1>
          <p className="text-light-100 mt-1">Manage your profile and preferences</p>
        </div>
        <button
          onClick={() => router.push("/my-profile")}
          className="text-light-200 hover:text-white transition-colors"
        >
          ← Back to Profile
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-dark-200 rounded-2xl p-6 mb-6 border border-dark-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-xl">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-white">👤 Profile Information</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-dark-300 text-light-100 rounded-lg hover:bg-dark-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleProfileUpdate}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-dark-100 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-light-100 text-sm block mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="Your full name"
              />
            ) : (
              <p className="text-white text-lg">{user.fullName}</p>
            )}
          </div>

          <div>
            <label className="text-light-100 text-sm block mb-1">Email</label>
            <p className="text-white text-lg">{user.email}</p>
            <p className="text-light-200 text-xs mt-1">✅ Verified</p>
          </div>

          <div>
            <label className="text-light-100 text-sm block mb-1">Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-primary"
                placeholder="+1 234 567 890"
              />
            ) : (
              <p className="text-light-100">{user.phone || "Not set"}</p>
            )}
          </div>

          <div>
            <label className="text-light-100 text-sm block mb-1">Bio</label>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:border-primary resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-light-100">{user.bio || "No bio yet"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-dark-200 rounded-2xl p-6 mb-6 border border-dark-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Bell className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">🔔 Notification Settings</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-xl">
            <div>
              <p className="text-white font-medium">Email Notifications</p>
              <p className="text-light-200 text-sm">Receive email updates</p>
            </div>
            <button
              onClick={() =>
                setNotifications({
                  ...notifications,
                  emailNotifications: !notifications.emailNotifications,
                })
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                notifications.emailNotifications ? "bg-primary" : "bg-dark-400"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  notifications.emailNotifications ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-xl">
              <div>
                <p className="text-white text-sm">📖 Borrow Confirmation</p>
                <p className="text-light-200 text-xs">Email when you borrow</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    borrowConfirmationEmails: !notifications.borrowConfirmationEmails,
                  })
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  notifications.borrowConfirmationEmails ? "bg-primary" : "bg-dark-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.borrowConfirmationEmails ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-xl">
              <div>
                <p className="text-white text-sm">✅ Return Confirmation</p>
                <p className="text-light-200 text-xs">Email when you return</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    returnConfirmationEmails: !notifications.returnConfirmationEmails,
                  })
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  notifications.returnConfirmationEmails ? "bg-primary" : "bg-dark-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.returnConfirmationEmails ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-xl">
              <div>
                <p className="text-white text-sm">⏰ Due Reminders</p>
                <p className="text-light-200 text-xs">Email 3 days before due</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    dueReminderEmails: !notifications.dueReminderEmails,
                  })
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  notifications.dueReminderEmails ? "bg-primary" : "bg-dark-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.dueReminderEmails ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-dark-300/50 rounded-xl">
              <div>
                <p className="text-white text-sm">📨 Promotional Emails</p>
                <p className="text-light-200 text-xs">News & updates</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({
                    ...notifications,
                    promotionalEmails: !notifications.promotionalEmails,
                  })
                }
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  notifications.promotionalEmails ? "bg-primary" : "bg-dark-400"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                    notifications.promotionalEmails ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleNotificationUpdate}
            disabled={isSaving}
            className="w-full mt-2 py-2 bg-primary/10 text-primary rounded-xl font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "💾 Save Notification Settings"}
          </button>
        </div>
      </div>

      {/* Theme & Language */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-200 rounded-2xl p-6 border border-dark-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <Palette className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">🎨 Theme</h2>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleThemeUpdate("dark")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/10"
                  : "border-dark-400 hover:border-dark-300"
              }`}
            >
              <Moon className="w-6 h-6 text-light-100 mx-auto mb-2" />
              <p className="text-light-100 text-sm">Dark</p>
              {theme === "dark" && (
                <Check className="w-4 h-4 text-primary mx-auto mt-1" />
              )}
            </button>
            <button
              onClick={() => handleThemeUpdate("light")}
              className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/10"
                  : "border-dark-400 hover:border-dark-300"
              }`}
            >
              <Sun className="w-6 h-6 text-light-100 mx-auto mb-2" />
              <p className="text-light-100 text-sm">Light</p>
              {theme === "light" && (
                <Check className="w-4 h-4 text-primary mx-auto mt-1" />
              )}
            </button>
          </div>
        </div>

        <div className="bg-dark-200 rounded-2xl p-6 border border-dark-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <Languages className="w-5 h-5 text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">🌍 Language</h2>
          </div>
          <select
            value={language}
            onChange={handleLanguageChange}
            disabled={isLanguageSaving}
            className="w-full px-4 py-3 bg-dark-300 border border-dark-400 rounded-xl text-white focus:outline-none focus:border-primary disabled:opacity-50"
          >
            <option value="en">🇬🇧 English</option>
            <option value="es">🇪🇸 Spanish</option>
            <option value="fr">🇫🇷 French</option>
            <option value="de">🇩🇪 German</option>
            <option value="ar">🇸🇦 Arabic</option>
            <option value="am">🇪🇹 Amharic</option>
          </select>
          {isLanguageSaving && (
            <p className="text-light-200 text-xs mt-2">Saving language preference...</p>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-white font-semibold">Account Status</p>
            <p className="text-light-100 text-sm">
              ✅ Active • Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsClient;