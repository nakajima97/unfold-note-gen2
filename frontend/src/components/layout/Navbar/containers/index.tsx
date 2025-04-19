'use client';

import { useNavbarContainer } from './useNavbarContainer';
import Navbar from '@/components/layout/Navbar';

const NavbarContainer = () => {
  const { isLoggingOut, handleLogout } = useNavbarContainer();

  return <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />;
};

export default NavbarContainer;
