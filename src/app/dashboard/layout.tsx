import { AuthGuard } from "@/components/auth-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["master_admin", "sub_admin"]}>
      <div className="min-h-screen bg-gray-50">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-bold">Sistematize — Admin</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
