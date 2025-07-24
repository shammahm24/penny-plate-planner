import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, ShoppingCart, BarChart3, ChefHat, DollarSign } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  currentUser: any;
  onProfileUpdate: (data: any) => void;
}

export function Header({ currentUser, onProfileUpdate }: HeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="gradient-primary shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-0"
                onClick={() => navigate('/')}
              >
                <h1 className="text-2xl font-bold text-white">🍞 Bread & Butter</h1>
              </Button>
              <p className="text-white/80 hidden md:block">Smart nutrition meets smart budgeting</p>
            </div>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-white/20 ${isActive('/') ? 'bg-white/20' : ''}`}
                onClick={() => navigate('/')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-white/20 ${isActive('/recipes') ? 'bg-white/20' : ''}`}
                onClick={() => navigate('/recipes')}
              >
                <ChefHat className="w-4 h-4 mr-2" />
                Recipes
              </Button>
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-white/20 ${isActive('/shopping') ? 'bg-white/20' : ''}`}
                onClick={() => navigate('/shopping')}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Shopping
              </Button>
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-white/20 ${isActive('/nutrition') ? 'bg-white/20' : ''}`}
                onClick={() => navigate('/nutrition')}
              >
                <User className="w-4 h-4 mr-2" />
                Nutrition
              </Button>
              <Button 
                variant="ghost" 
                className={`text-white hover:bg-white/20 ${isActive('/price-tracker') ? 'bg-white/20' : ''}`}
                onClick={() => navigate('/price-tracker')}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Prices
              </Button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setShowProfileModal(true)}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-white/20 text-white">
                    {currentUser?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <ProfileModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        currentUser={currentUser}
        onSave={onProfileUpdate}
      />
    </>
  );
}