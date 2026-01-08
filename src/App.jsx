import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminMenuPage from "./pages/AdminMenuPage.jsx";
import MenuPosterPage from "./pages/MenuPosterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { getMenu, getBrands, baseUrl } from "./api/api";
import { Link2, HousePlus, Settings, User, LogOut } from "lucide-react";
import AdminUserPage from "./pages/AdminUserPage.jsx";

function App() {
  const [menus, setMenus] = useState([]);
  const [brands, setBrands] = useState([]);
  const [currentDomain, setCurrentDomain] = useState(localStorage.getItem("adminBrandDomain") || "");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");

  // โหลดเมนู
  const loadMenu = useCallback(async () => {
    if (!currentDomain) return;
    try {
      const data = await getMenu();
      const mapped = data.map(m => ({
        ...m,
        categoryHref: m.category ? `/page/${m.category}` : "#"
      }));
      setMenus(mapped);
    } catch (err) {
      console.error("Load Menu Error:", err);
    } finally {
      setLoading(false);
    }
  }, [currentDomain]);

  // โหลดแบรนด์
  const loadBrands = useCallback(async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      console.error("Load Brands Error:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");
    setUserRole(role);
    if (!token) return;

    loadBrands();
  }, [loadBrands]);


  useEffect(() => {
    if (currentDomain) {
      localStorage.setItem("adminBrandDomain", currentDomain);
      loadMenu();
    }
  }, [currentDomain, loadMenu]);

  // 🔹 Login Success Handler
  const handleLoginSuccess = (user) => {
    localStorage.setItem("userRole", user.role);
    setUserRole(user.role);
    loadBrands();

  };

  const currentBrand = brands.find(b => String(b.id) === String(currentDomain));

  // Admin Panel
  const AdminPanel = () => {
    const navigate = useNavigate(); // ✅ เรียก hook ภายใน function body

    return (
      <div className="flex h-screen bg-stone-100 overflow-hidden font-sans text-slate-900">
        <div className="w-2/3 h-full overflow-y-auto border-r border-stone-200 bg-white shadow-xl z-10">
          <div className="p-4 bg-stone-900 text-white flex justify-between items-center sticky top-0 z-20 shadow-md">
            <div className="flex justify-between w-full items-center gap-4 bg-stone-800 px-4 py-2 rounded-xl">
              <div className="flex gap-5 items-center">
                {currentBrand?.logoUrl ? (
                  <img
                    src={`${baseUrl}${currentBrand.logoUrl}`}
                    className="w-8 h-8 rounded-lg object-contain bg-white p-1"
                    alt="brand logo"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black">?</div>
                )}

                <select
                  className="select select-sm select-primary rounded-xl bg-white w-60 text-gray-800 border-none focus:outline-none"
                  value={currentDomain}
                  onChange={(e) => setCurrentDomain(e.target.value)}
                >
                  <option value="" disabled>เลือกแบรนด์</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>
                      <img
                        src={`${baseUrl}${b.logoUrl}`}
                        alt={b.name} className="mr-2 w-8 h-8" />
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentBrand?.domain ? (
                <div className="bg-white px-4 py-1 w-1/2 rounded-full items-center justify-center relative flex">
                  <Link2 className="absolute left-3 top-1.5 z-10 text-stone-700" size={20} />
                  <a
                    href={`https://${currentBrand?.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 hover:text-blue-400 underline underline-offset-2 truncate max-w-[160px]"
                    title={currentBrand.domain}
                  >
                    {currentBrand.domain}
                  </a>
                </div>
              ) : (
                <div className="bg-white px-4 py-1 w-1/2 rounded-full items-center justify-center relative flex">
                  <Link2 className="absolute left-3 top-1.5 z-10 text-stone-700" size={20} />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-700 hover:text-blue-400 truncate max-w-[160px]"
                    title="ยังไม่ได้ตั้งค่าโดเมน"
                  >
                    ยังไม่ได้ตั้งค่าโดเมน
                  </a>
                </div>
              )}

              <button
                className="w-8 h-8 hover:text-warning"
                onClick={() => document.dispatchEvent(new CustomEvent("open-edit-brand", { detail: currentBrand }))}
              >
                <Settings />
              </button>

              <button
                onClick={() => document.dispatchEvent(new CustomEvent("open-create-brand"))}
                className="btn btn-sm btn-primary rounded-xl shadow-lg"
              >
                <HousePlus /> เพิ่มแบรนด์
              </button>

              {userRole === "Admin" && (
                <button
                  onClick={() => navigate("/user")}
                  className="btn btn-sm btn-circle btn-primary shadow-lg"
                >
                  <User />
                </button>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("userRole");
                  setUserRole("");
                  navigate("/login", { replace: true });
                }}
                className="btn btn-sm btn-circle btn-error shadow-lg"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>

          <AdminMenuPage
            menus={menus}
            setMenus={setMenus}
            brands={brands}
            setBrands={setBrands}
            currentDomain={currentDomain}
            setCurrentDomain={setCurrentDomain}
            onReload={loadMenu}
            onReloadBrands={loadBrands}
          />
        </div>

        <div className="flex-1 h-full overflow-y-auto bg-stone-200 flex flex-col items-center justify-center p-8 bg-[radial-gradient(#d1d1d1_1px,transparent_1px)] [background-size:20px_20px]">
          <div className="mb-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
            <span className="flex h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-stone-500 font-bold text-xs uppercase tracking-widest">Live Mobile View</span>
          </div>
          <div className="relative mx-auto border-[12px] border-stone-900 rounded-[3rem] h-[750px] w-[360px] shadow-2xl bg-white overflow-hidden ring-4 ring-stone-800/10">
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center items-end pb-1 z-5">
              <div className="w-30 h-5 bg-stone-900 rounded-b-xl border-x border-b border-stone-800"></div>
            </div>
            <div className="h-full overflow-y-auto">
              <MenuPosterPage menus={menus} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage onLoginSuccess={handleLoginSuccess} loadBrands={loadBrands}/>}
        />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/user"
          element={
            <PrivateRoute roleRequired="Admin">
              <AdminUserPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
