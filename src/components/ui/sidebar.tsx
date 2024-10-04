'use client';
import React, { useEffect, useState } from 'react';
import { Nav } from './nav';
import {
  ChevronRight,
  LayoutDashboard,
  Settings,
  ShoppingCart,
  UsersRound,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Button } from './button';
import { useWindowWidth } from '@react-hook/window-size';
import { auth } from '../../../firebaseconfig'; // Import Firebase auth
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { User } from 'firebase/auth';

type Props = {};

export default function Sidebar({}: Props) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [user, setUser] = useState<User | null>(null); // Authentication state

  const onlyWidth = useWindowWidth();
  const mobileWidth = onlyWidth < 768;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  function toggleSidebar() {
    setIsCollapsed(!isCollapsed);
  }

  const handleAuthAction = async () => {
    if (user) {
      try {
        await signOut(auth);
        console.log('User logged out');
        setUser(null);
      } catch (error) {
        console.error('Error logging out:', error);
      }
    } else {
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  return (
    <div className="relative min-w-[80px] border-r px-3 pb-10 pt-24">
      {!mobileWidth && (
        <div className="absolute right-[-20px] top-7">
          <Button variant="secondary" className="rounded-full p-2" onClick={toggleSidebar}>
            <ChevronRight />
          </Button>
        </div>
      )}
      <Nav
        isCollapsed={mobileWidth ? true : isCollapsed}
        links={[
          {
            title: 'Dashboard',
            href: '/',
            icon: LayoutDashboard,
            variant: 'default',
          },
          {
            title: 'Users',
            href: '/users',
            icon: UsersRound,
            variant: 'ghost',
          },
          {
            title: 'Orders',
            href: '/orders',
            icon: ShoppingCart,
            variant: 'ghost',
          },
          {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
            variant: 'ghost',
          },
          {
            title: user ? 'Logout' : 'Login',
            href: '#',
            icon: user ? LogOut : LogIn,
            variant: 'ghost',
            onClick: handleAuthAction,
          },
        ]}
      />
    </div>
  );
}