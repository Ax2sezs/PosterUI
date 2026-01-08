import { useEffect, useState } from "react";
import { getMenus } from "../api/menuApi";

export function useMenus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMenus()
      .then(setMenus)
      .finally(() => setLoading(false));
  }, []);

  return { menus, loading };
}
