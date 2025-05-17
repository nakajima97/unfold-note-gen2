'use client';

import Navbar from '@/components/layout/Navbar';
import { useNavbarContainer } from './useNavbarContainer';

const NavbarContainer = () => {
  const { isLoggingOut, handleLogout, currentProjectUrlId } = useNavbarContainer();

  return <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} currentProjectUrlId={currentProjectUrlId} />;
};

export default NavbarContainer;
