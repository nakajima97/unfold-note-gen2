import AdminPageComponent from "@/features/admin/components/AdminPage";
import { useAdminContainer } from "./useAdminContainer";

export default function AdminContainer() {
  const adminProps = useAdminContainer();
  
  return <AdminPageComponent {...adminProps} />;
}
