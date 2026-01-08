import { ShoppingCart, History, Home } from "lucide-react";

export default function UserLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="navbar bg-base-200 px-4">
        <div className="flex-1 text-xl font-bold">🍽 Restaurant</div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm">
            <Home size={18} />
          </button>
          <button className="btn btn-ghost btn-sm">
            <History size={18} />
          </button>
          <button className="btn btn-primary btn-sm">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>

      <main className="p-4">{children}</main>
    </div>
  );
}
