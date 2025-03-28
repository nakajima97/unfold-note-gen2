import AdminPageComponent from '@/features/admin/components/AdminPage';
import { useAdminContainer } from './useAdminContainer';

const AdminContainer = () => {
  const adminProps = useAdminContainer();

  return <AdminPageComponent {...adminProps} />;
};

export default AdminContainer;
