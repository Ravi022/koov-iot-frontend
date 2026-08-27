// components/LogoutButton.tsx
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";


export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 bg-red-500 text-white p-1 px-2 rounded-lg shadow hover:bg-red-600 transition"
    >
      <LogOut size={18} />
      Logout
    </button>
  );
}
