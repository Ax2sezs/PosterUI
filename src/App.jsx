import { useEffect, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import AdminMenuPage from "./pages/AdminMenuPage.jsx";
import MenuPosterPage from "./pages/MenuPosterPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PrivateRoute from "./PrivateRoute.jsx";
import { getMenu, getBrands, baseUrl, getPages, createPage } from "./api/api";
import { Link2, HousePlus, Settings, User, LogOut, X, Menu, Book, BookCheck, BookOpen, Plus } from "lucide-react";
import AdminUserPage from "./pages/AdminUserPage.jsx";

function App() {
  const [menus, setMenus] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState("");
  const [currentDomain, setCurrentDomain] = useState(localStorage.getItem("adminBrandDomain") || "");
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || "");
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


  // 1. ปรับ loadPages ให้รีเซ็ต currentPage และรับ domain เข้ามาตรงๆ
  const loadPages = useCallback(async (domainToLoad) => {
    if (!domainToLoad) return;

    try {
      // แนะนำให้ส่ง domain ไปที่ API ด้วยถ้า api.js ของคุณรองรับ
      const data = await getPages(domainToLoad);
      setPages(data);

      if (data.length > 0) {
        // บังคับเปลี่ยน Page เป็นหน้าแรกของแบรนด์ใหม่เสมอ 
        setCurrentPage(data[0].id);
      } else {
        // ถ้าแบรนด์ใหม่ไม่มี Page เลย ให้เคลียร์ค่าทิ้ง
        setCurrentPage("");
        setMenus([]);
      }
    } catch (err) {
      console.error("Load Pages Error:", err);
    }
  }, []);

  // 2. ปรับ loadMenu ให้แน่ใจว่าโหลดจาก domain ปัจจุบันจริงๆ
  const loadMenu = useCallback(async (pageId, domain) => {
    if (!domain || !pageId) return;

    try {
      setLoading(true);
      // แนะนำให้ส่ง domain เข้าไปบังคับค่าใน api.js ด้วย
      const data = await getMenu(pageId, domain);
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
  }, []);

  // 3. ผูก useEffect ให้เรียกทำงานใหม่เมื่อตัวแปรเปลี่ยน
  useEffect(() => {
    if (currentDomain) {
      localStorage.setItem("adminBrandDomain", currentDomain);
      loadPages(currentDomain);
    }
  }, [currentDomain, loadPages]);

  useEffect(() => {
    // โหลดเมนูเมื่อมีทั้งเพจและโดเมนแล้วเท่านั้น
    if (currentPage && currentDomain) {
      loadMenu(currentPage, currentDomain);
    }
  }, [currentPage, currentDomain, loadMenu]);

  // 🔹 Login Success Handler
  const handleLoginSuccess = (user) => {
    localStorage.setItem("userRole", user.role);
    setUserRole(user.role);
    loadBrands();

  };

  const currentBrand = brands.find(b => String(b.id) === String(currentDomain));

  // Admin Panel
  // --- ส่วนของ AdminPanel ที่ปรับปรุงใหม่ ---

  const AdminPanel = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCreatePageModalOpen, setIsCreatePageModalOpen] = useState(false);
    const [newPageTitle, setNewPageTitle] = useState("");
    const [newPageSlug, setNewPageSlug] = useState(""); // เพิ่มอันนี้
    const navigate = useNavigate();

    return (
      <div className="flex h-screen bg-stone-100 overflow-hidden font-sans text-slate-900">
        <div className="w-2/3 h-full overflow-y-auto border-r border-stone-200 bg-white shadow-xl z-10 flex flex-col">

          {/* 🔹 NEW DESIGN HEADER */}
          <div className="p-4 bg-stone-900 text-white sticky top-0 z-30 shadow-lg">
            <div className="flex items-center justify-between gap-4 bg-stone-800/50 p-2 rounded-2xl border border-white/5">

              {/* LEFT: Logo & Brand Selector */}
              <div className="flex items-center gap-3 pl-2">
                <div className="relative flex-shrink-0">
                  {currentBrand?.logoUrl ? (
                    <img
                      src={`${baseUrl}${currentBrand.logoUrl}`}
                      className="w-9 h-9 rounded-xl object-contain bg-white p-1 shadow-inner"
                      alt="logo"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center font-black text-white">?</div>
                  )}
                </div>

                <select
                  className="select select-sm bg-white border-none focus:outline-none text-sm text-black w-48 "
                  value={currentDomain}
                  onChange={(e) => setCurrentDomain(e.target.value)}
                >
                  <option value="" disabled className="text-stone-900">เลือกแบรนด์</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id} className="text-stone-900 hover:bg-gray-200">
                      <img
                        src={`${baseUrl}${b.logoUrl}`}
                        alt={b.name} className="mr-2 w-8 h-8" />
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* MIDDLE: Address Bar Style (Domain / Page) */}
              <div className="flex-1 flex items-center bg-white rounded-xl px-4 border border-white/10 mx-2 overflow-hidden">
                <Link2 size={16} className="text-stone-500 mr-3 flex-shrink-0" />

                <div className="flex items-center gap-2 truncate pl-10">
                  {currentBrand?.domain ? (
                    <a
                      href={`https://${currentBrand.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline underline-offset-4 truncate font-medium"
                    >
                      {currentBrand.domain}
                    </a>
                  ) : (
                    <span className="text-stone-500 italic">No domain set</span>
                  )}

                  <span className="text-stone-600 font-light mx-1 text-xl">/</span>
                  <div className="bg-gray-200 px-3 text-gray-800 rounded-2xl hover:bg-gray-400 transition ease-in-out">
                    <select
                      className="px-1"
                      value={currentPage}
                      onChange={(e) => setCurrentPage(e.target.value)}
                    >
                      {pages.map(p => (
                        <option key={p.id} value={p.id} className="text-stone-900">{p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
              <div className="flex gap-3">
                <div className="tooltip tooltip-bottom" data-tip='เพิ่ม Page ใหม่'>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false); // ปิดเมนู hamburger
                      setIsCreatePageModalOpen(true); // เปิด modal สร้างหน้า
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:scale-105 text-stone-700 transition-colors"
                  >
                    <BookOpen size={24} className="text-blue-500" />
                    {/* <span className="text-sm font-medium">เพิ่ม Page ใหม่</span> */}
                  </button>
                </div>

                <div className="tooltip tooltip-bottom" data-tip='ตั้งค่าแบรนด์'>
                  <button onClick={() => {
                    setIsMenuOpen(false);
                    document.dispatchEvent(new CustomEvent("open-edit-brand", { detail: currentBrand }));
                  }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:scale-105 text-stone-700 transition-colors"
                  >
                    <Settings size={24} className="text-amber-500" />

                    {/* <span className="text-sm font-medium">ตั้งค่าแบรนด์</span> */}
                  </button>
                </div>
              </div>
              {/* RIGHT: Hamburger Actions */}
              <div className="relative pr-1">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`btn btn-sm btn-circle transition-all duration-300 ${isMenuOpen ? 'btn-primary rotate-90' : 'btn-ghost text-white'}`}
                >
                  {isMenuOpen ? <X /> : <Menu />}
                </button>

                {isMenuOpen && (
                  <>
                    {/* Overlay to close menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-stone-200 py-2 z-50 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                      <div className="px-4 py-2 mb-1 border-b border-stone-50">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Management</p>
                      </div>

                      {/* แก้ไขปุ่ม "เพิ่ม Page ใหม่" ในเมนูเดิม */}


                      <button onClick={() => {
                        setIsMenuOpen(false);
                        document.dispatchEvent(new CustomEvent("open-create-brand"));
                      }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 text-stone-700 transition-colors">
                        <Plus size={18} className="text-green-500" />
                        <span className="text-sm font-medium">เพิ่มแบรนด์</span>
                      </button>



                      {userRole === "Admin" && (
                        <button onClick={() => { setIsMenuOpen(false); navigate("/user"); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-stone-50 text-stone-700 transition-colors border-t border-stone-50 mt-1">
                          <User size={18} className="text-purple-500" />
                          <span className="text-sm font-medium">จัดการ User</span>
                        </button>
                      )}

                      <div className="h-px bg-stone-100 my-1"></div>

                      <button onClick={() => {
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("userRole");
                        setUserRole("");
                        navigate("/login", { replace: true });
                      }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm font-bold">ออกจากระบบ</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* 🔹 CREATE PAGE MODAL */}
          {/* 🔹 CREATE PAGE MODAL (Separate Title & Slug) */}
          {isCreatePageModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsCreatePageModalOpen(false)}
              ></div>

              <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900">สร้างหน้าใหม่</h3>
                      <p className="text-xs text-stone-500 font-medium">ตั้งค่าชื่อหน้าและที่อยู่ URL ของคุณ</p>
                    </div>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newPageTitle.trim() || !newPageSlug.trim()) return;

                      // ส่งค่าทั้ง Title และ Slug ไปที่ API
                      const page = await createPage({
                        title: newPageTitle,
                        slug: newPageSlug.startsWith('/') ? newPageSlug.substring(1) : newPageSlug
                      });

                      await loadPages();
                      setCurrentPage(page.id);
                      setNewPageTitle("");
                      setNewPageSlug("");
                      setIsCreatePageModalOpen(false);
                    }}
                    className="space-y-5"
                  >
                    {/* ช่องกรอก Title */}
                    <div>
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1 mb-2 block">
                        ชื่อหน้าที่แสดง (Title)
                      </label>
                      <input
                        autoFocus
                        type="text"
                        placeholder="example"
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-stone-800"
                        value={newPageTitle}
                        onChange={(e) => {
                          setNewPageTitle(e.target.value);
                          // ถ้ายังไม่ได้แก้ slug เอง ให้มันเจนตาม title ไปก่อน
                          setNewPageSlug(e.target.value.toLowerCase().trim().replace(/\s+/g, "-"));
                        }}
                      />
                    </div>

                    {/* ช่องกรอก Slug */}
                    <div>
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] ml-1 mb-2 block">
                        ที่อยู่ URL (Slug)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">/</span>
                        <input
                          type="text"
                          placeholder="example"
                          className="w-full pl-7 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm text-blue-600"
                          value={newPageSlug}
                          onChange={(e) => setNewPageSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                        />
                      </div>
                      <p className="mt-1.5 ml-1 text-[10px] text-stone-400 italic">* ใช้ภาษาอังกฤษและขีดกลางเท่านั้น</p>
                    </div>

                    {/* Real-time Preview */}
                    <div className="bg-stone-900 rounded-2xl p-4 shadow-inner">
                      <p className="text-[9px] text-stone-500 font-black uppercase mb-1 tracking-widest">URL Preview</p>
                      <p className="text-xs text-stone-300 truncate font-mono">
                        https://{currentBrand?.domain || 'yourdomain.com'}/<span className="text-blue-400">{newPageSlug || '...'}</span>
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCreatePageModalOpen(false);
                          setNewPageTitle("");
                          setNewPageSlug("");
                        }}
                        className="flex-1 px-4 py-3 rounded-2xl font-bold text-stone-500 hover:bg-stone-100 transition-colors"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="submit"
                        disabled={!newPageTitle.trim() || !newPageSlug.trim()}
                        className="flex-[2] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 disabled:opacity-50 disabled:shadow-none transition-all"
                      >
                        สร้างหน้า
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <AdminMenuPage
              pageId={currentPage}
              pages={pages}
              menus={menus}
              setMenus={setMenus}
              brands={brands}
              setBrands={setBrands}
              currentDomain={currentDomain}
              setCurrentDomain={setCurrentDomain}
              onReload={() => loadMenu(currentPage, currentDomain)}
              onReloadBrands={loadBrands}
            />
          </div>
        </div>

        {/* RIGHT SIDE: Live Mobile View (คงเดิม) */}
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
          element={<LoginPage onLoginSuccess={handleLoginSuccess} loadBrands={loadBrands} />}
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
