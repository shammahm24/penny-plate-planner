"use client";
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Dashboard } from "../components/Dashboard";
import { ProfileModal } from "../components/ProfileModal";
import { useToast } from "../components/ui/use-toast";

const DEMO_EMAIL = "demo@user.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Define types for user and profile data
interface User {
  id: string;
  email: string;
  username: string;
  isFirstTime: boolean;
  // Add other fields as needed
}

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { toast } = useToast();

  // Use localStorage to persist modal state per user
  useEffect(() => {
    async function fetchDemoUser() {
      const res = await fetch(`${API_URL}/users`);
      const users: User[] = await res.json();
      const demoUser = users.find((u) => u.email === DEMO_EMAIL);
      setCurrentUser(demoUser ?? null);
      if (demoUser?.isFirstTime) {
        const modalKey = `profileModalShown_${demoUser.id}`;
        const hasSeen = typeof window !== 'undefined' && localStorage.getItem(modalKey);
        if (!hasSeen) {
          setShowProfileModal(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem(modalKey, 'true');
          }
        }
      }
    }
    fetchDemoUser();
  }, []);

  // When profile is updated, also clear the localStorage flag so modal can be shown again if needed
  const handleProfileUpdate = async (profileData: Record<string, unknown>) => {
    if (currentUser) {
      // Update user's first-time status
      await fetch(`${API_URL}/users/${currentUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFirstTime: false }),
      });
      // Save profile data
      await fetch(`${API_URL}/user-profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: currentUser.id, ...profileData }),
      });
      setCurrentUser((prev) => (prev ? { ...prev, isFirstTime: false } : null));
      // Remove the modal flag so it can be shown again if needed in the future
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`profileModalShown_${currentUser.id}`);
      }
      toast({
        title: "Profile Updated! 🎉",
        description: "Your nutrition and budget preferences have been saved.",
      });
    }
  };

  const handleOpenProfile = () => setShowProfileModal(true);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Bread & Butter...</h1>
          <p className="text-xl text-muted-foreground">Getting your nutrition dashboard ready!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} onProfileUpdate={handleProfileUpdate} />
      <Dashboard currentUser={currentUser} onOpenProfile={handleOpenProfile} />
      {showProfileModal && (
        <ProfileModal
          open={showProfileModal}
          onOpenChange={setShowProfileModal}
          currentUser={currentUser}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}
