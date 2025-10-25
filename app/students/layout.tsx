// app/students/layout.tsx
import '../globals.css';
import DashboardLayout from './components/DashboardLayout';
import { getCurrentUser } from '../../actions/userActions'; // ← Use same import as page

// Function to convert MongoDB objects to plain objects
function convertUserToPlainObject(user: any) {
  if (!user) return null;
  return JSON.parse(JSON.stringify(user));
}

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user data using the same function as the page
  const user = await getCurrentUser();
  
  // Convert MongoDB objects to plain objects
  const plainUser = convertUserToPlainObject(user);

  return (
    <DashboardLayout user={plainUser}>
      {children}
    </DashboardLayout>
  );
}