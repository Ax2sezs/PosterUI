import { useEffect, useState } from "react";
import { getMenus, deleteMenu } from "../api/api";
import { Trash, Eye, EyeOff } from "lucide-react";

export default function AdminPosterPage() {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    getMenus().then(setPosters);
  }, []);

  async function handleDelete(id) {
    if (!confirm("ลบรูปนี้แน่ใจนะ")) return;
    await deleteMenu(id);
    setPosters((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      {posters.map((p) => (
        <div
          key={p.id}
          className="flex items-center gap-4 bg-base-100 p-4 rounded shadow"
        >
          <img
            src={p.imageUrl}
            className="w-32 h-20 object-cover rounded"
          />

          <div className="flex-1">
            <div className="text-sm text-gray-500">
              ลำดับที่ {p.sortOrder}
            </div>
          </div>

          <button className="btn btn-sm btn-ghost">
            {p.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>

          <button
            className="btn btn-sm btn-error btn-outline"
            onClick={() => handleDelete(p.id)}
          >
            <Trash size={18} />
          </button>
        </div>
      ))}
    </div>
  );
}
