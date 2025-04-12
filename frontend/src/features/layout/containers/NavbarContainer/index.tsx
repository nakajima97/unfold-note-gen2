'use client';

import Navbar from '@/components/Navbar';
import { useNavbarContainer } from './useNavbarContainer';

const NavbarContainer = () => {
  const { isLoggingOut, handleLogout } = useNavbarContainer();

  return <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />;
};

export default NavbarContainer;
