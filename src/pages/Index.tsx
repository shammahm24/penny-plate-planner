import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard';
import { getUserByEmail, updateUser } from '@/api/users';
import { createOrUpdateProfile } from '@/api/userProfiles';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { toast } = useToast();

  // Simulate login with demo user on component mount
  useEffect(() => {
    const demoUser = getUserByEmail('demo@user.com');
    if (demoUser) {
      setCurrentUser(demoUser);
      if (demoUser.isFirstTime) {
        setShowProfileModal(true);
      }
    }
  }, []);

  const handleProfileUpdate = (profileData: any) => {
    if (currentUser) {
      // Update user's first-time status
      updateUser(currentUser.id, { isFirstTime: false });
      
      // Save profile data
      createOrUpdateProfile(currentUser.id, profileData);
      
      // Update current user state
      setCurrentUser(prev => prev ? { ...prev, isFirstTime: false } : null);
      
      toast({
        title: "Profile Updated! 🎉",
        description: "Your nutrition and budget preferences have been saved.",
      });
    }
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
  };

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
      <Header 
        currentUser={currentUser} 
        onProfileUpdate={handleProfileUpdate}
      />
      <Dashboard 
        currentUser={currentUser} 
        onOpenProfile={handleOpenProfile}
      />
    </div>
  );
};

export default Index;
