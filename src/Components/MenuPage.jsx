import MenuCard from "../../components/MenuCard";
import { useMenus } from "../../hooks/useMenus";

export default function MenuPage() {
  const { menus, loading } = useMenus();

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {menus.map((m) => (
        <MenuCard
          key={m.id}
          name={m.name}
          price={m.price}
          image={m.imageUrl}
        />
      ))}
    </div>
  );
}
