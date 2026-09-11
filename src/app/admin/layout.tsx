import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import SessionGuard from "@/components/auth/SessionGuard";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // NOTE: the dark-mode class is applied by AdminNavbar after hydration rather
  // than by a pre-paint inline script. Setting it on <html> before hydration
  // makes React report an attribute mismatch on the root element, and the fix
  // for that (suppressHydrationWarning) lives in the shared root layout,
  // outside this module.
  return <SessionGuard area="admin">{children}</SessionGuard>;
}
