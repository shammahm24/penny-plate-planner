import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, User, Settings, ShoppingCart, BarChart3, ChefHat, DollarSign } from 'lucide-react';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  currentUser: any;
  onProfileUpdate: (data: any) => void;
}

export function Header({ currentUser, onProfileUpdate }: HeaderProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/recipes', label: 'Recipes', icon: ChefHat },
    { path: '/shopping', label: 'Shopping', icon: ShoppingCart },
    { path: '/nutrition', label: 'Nutrition', icon: User },
    { path: '/price-tracker', label: 'Prices', icon: DollarSign },
  ];

  return (
    <>
      <header className="gradient-primary shadow-soft text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20 p-0"
                onClick={() => router.push('/')}
              >
                <h1 className="text-2xl font-bold text-white">🍞 Bread & Butter</h1>
              </Button>
              <p className="text-white/80 hidden md:block">Smart nutrition meets smart budgeting</p>
            </div>
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Button 
                  key={path}
                  variant="ghost" 
                  className={`text-white hover:bg-white/20 ${isActive(path) ? 'bg-white/20' : ''}`}
                  onClick={() => router.push(path)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </Button>
              ))}
            </nav>
            {/* Mobile: Avatar + Hamburger */}
            <div className="flex items-center space-x-2 md:space-x-4">
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
              {/* Hamburger for mobile */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 md:hidden"
                    aria-label="Open menu"
                  >
                    <Menu className="w-7 h-7" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-white text-foreground p-0 w-64">
                  <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                  <SheetDescription className="sr-only">Use this menu to navigate between pages and access your profile.</SheetDescription>
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b font-bold text-lg">Menu</div>
                    <nav className="flex flex-col p-2 gap-1">
                      {navLinks.map(({ path, label, icon: Icon }) => (
                        <Button
                          key={path}
                          variant="ghost"
                          className={`justify-start w-full text-left text-lg ${isActive(path) ? 'bg-accent text-accent-foreground' : ''}`}
                          onClick={() => {
                            setMobileMenuOpen(false);
                            router.push(path);
                          }}
                        >
                          <Icon className="w-5 h-5 mr-2" />
                          {label}
                        </Button>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
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