import { useEffect, useState } from "react";
import { getMenu } from "../api/menu";
import { ImageOff } from "lucide-react";

export default function MenuPosterPage() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenu()
      .then((data) => setMenus(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <ImageOff size={48} />
        <p className="mt-2">ยังไม่มีเมนู</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-4 space-y-4">
      {menus
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((m) => (
          <div
            key={m.id}
            className="rounded-xl overflow-hidden shadow bg-base-100"
          >
            <img
              src={`https://tangtohkin.com${m.imageUrl}`}
              alt="menu"
              className="w-full object-contain"
            />
          </div>
        ))}
    </div>
  );
}
