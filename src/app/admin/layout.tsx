import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  return <>{children}</>;
}
