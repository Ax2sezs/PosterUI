import { Info } from "lucide-react";
import { baseUrl } from "../api/api";

export default function MenuPosterPage({ menus, loading }) {

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Loading Menu</p>
      </div>
    );
  }

    if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <span className=""><Info/></span>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400">Menu not available</p>
      </div>
    );
  }

  // ฟังก์ชันวาร์ปไปยังรูปที่ระบุ
  const handleScrollTo = (categoryId) => {
    if (!categoryId) return;
    const element = document.getElementById(`preview-menu-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Flash effect ให้รู้ว่าวาร์ปมาตัวไหน
      element.classList.add("brightness-125", "transition-all", "duration-500");
      setTimeout(() => element.classList.remove("brightness-125"), 1000);
    }
  };

  return (
    <div className="flex flex-col bg-white">
      {menus.map((menu) => (
        <div
          key={menu.id}
          id={`preview-menu-${menu.id}`}
          className="w-full relative group overflow-hidden"
          onClick={() => handleScrollTo(menu.category)}
        >
          <img
            src={`${baseUrl}${menu.imageUrl}`}
            alt="Menu Item"
            className="w-full h-auto block transform transition-transform group-active:scale-95"
            loading="lazy"
          />
          {/* แสดง Icon ลิงก์เล็กๆ ในหน้า User ให้รู้ว่ากดได้ */}
         
        </div>
      ))}
    </div>
  );
}