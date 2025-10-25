export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove server-side check - middleware handles redirects
  // await requireGuest(); // REMOVE THIS LINE
  
  return (
    <>
      {/* Remove the client-side script - middleware handles all redirects */}
      {children}
    </>
  );
}

// You can also remove this if not needed elsewhere
export const dynamic = 'force-dynamic';