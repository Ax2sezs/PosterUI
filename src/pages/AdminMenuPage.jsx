import { useState, useEffect, useCallback } from "react";
import { createBrand, uploadMenuImage, updateMenuSort, updateMenuLink, updateBrand, baseUrl, generateThumbnails } from "../api/api";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Upload, PlusCircle, LayoutGrid, Save, X, Globe, Store, ImagePlus, TriangleAlert } from "lucide-react";
import SortableMenuItem from "../Components/SortableMenuItem";

export default function AdminMenuPage({ menus, setMenus, brands, setBrands, currentDomain, setCurrentDomain, onReload, pageId, pages }) {
    const [isCreating, setIsCreating] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: "", domain: "", logo: null });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoPreview, setLogoPreview] = useState(null);
    const [editingBrand, setEditingBrand] = useState(null); // null = create
    const [isUploading, setIsUploading] = useState(false);
    const [feedback, setFeedback] = useState({ open: false, type: "success", message: "" });
    const showFeedback = (type, message) => setFeedback({ open: true, type, message });
    // const [loading, setLoading] = useState(false);

    // const handleGenerate = async () => {
    //     if (!confirm("Generate thumbnails สำหรับรูปเก่าทั้งหมด?"))
    //         return;

    //     try {
    //         setLoading(true);
    //         await generateThumbnails();
    //         alert("Generate thumbnails เสร็จแล้ว 🎉");
    //     } catch (err) {
    //         console.error(err);
    //         alert("พังแล้ว ไปดู console เอาเอง 😅");
    //     } finally {
    //         setLoading(false);
    //     }
    // };


    // ฟังก์ชันจัดการสร้างแบรนด์
    const handleSubmitBrand = async (e) => {
        e.preventDefault();
        if (!newBrand.name || !newBrand.domain) {
            return showFeedback("warning", "กรุณากรอกชื่อและโดเมนให้ครบถ้วน");
        }

        setIsSubmitting(true);
        const form = new FormData();
        form.append("name", newBrand.name);
        form.append("domain", newBrand.domain);
        form.append("templateKey", "1");
        if (newBrand.logo) form.append("logo", newBrand.logo);

        try {
            let brand;

            if (editingBrand) {
                brand = await updateBrand(editingBrand.id, form);

                setBrands(prev =>
                    prev.map(b => b.id === brand.id ? brand : b)
                );
            } else {
                brand = await createBrand(form);
                setBrands(prev => [...prev, brand]);
                setCurrentDomain(brand.id);
            }

            closeModal();
            showFeedback("success", "บันทึกข้อมูลแบรนด์เรียบร้อย");

        } catch (err) {
            console.error(err);
            showFeedback("error", "บันทึกแบรนด์ไม่สำเร็จ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const closeModal = useCallback(() => {
        setIsCreating(false);
        setEditingBrand(null);
        setNewBrand({ name: "", domain: "", logo: null });
        setLogoPreview(null);
    }, []);


    const handleDragEnd = useCallback(async ({ active, over }) => {
        if (!over || active.id === over.id) return;

        const oldIndex = menus.findIndex(m => m.id === active.id);
        const newIndex = menus.findIndex(m => m.id === over.id);
        const newList = arrayMove(menus, oldIndex, newIndex);

        setMenus(newList);
        await updateMenuSort(newList.map((m, i) => ({ id: m.id, sortOrder: i + 1 })));
    }, [menus, setMenus]); // ใส่ dependency ให้ถูกต้อง

    const handleUpdateCategory = useCallback(async (menuId, categoryId, externalUrl, internalUrl) => {
        setMenus(prev =>
            prev.map(m =>
                m.id === menuId
                    ? {
                        ...m,
                        category: categoryId ?? null,
                        externalUrl: externalUrl ?? null,
                        internalUrl: internalUrl ?? null
                    }
                    : m
            )
        );

        await updateMenuLink(menuId, categoryId, externalUrl, internalUrl);
    }, [setMenus]);

    useEffect(() => {
        const open = () => setIsCreating(true);
        document.addEventListener("open-create-brand", open);
        return () => document.removeEventListener("open-create-brand", open);
    }, []);
    useEffect(() => {
        const openEdit = (e) => {
            const brand = e.detail;
            if (!brand) return;

            setEditingBrand(brand);
            setNewBrand({
                name: brand.name,
                domain: brand.domain,
                logo: null
            });
            setLogoPreview(
                brand.logoUrl
                    ? `${baseUrl}${brand.logoUrl}`
                    : null
            );
            setIsCreating(true);
        };

        document.addEventListener("open-edit-brand", openEdit);
        return () => document.removeEventListener("open-edit-brand", openEdit);
    }, []);
    const FeedbackModal = ({ isOpen, type, message, onClose }) => {
        if (!isOpen) return null;

        const config = {
            success: { icon: "🎉", color: "text-green-600", bg: "bg-green-50", btn: "btn-success" },
            error: { icon: "😅", color: "text-red-600", bg: "bg-red-50", btn: "btn-error" },
            warning: {
                icon: < TriangleAlert size={40}/>, color: "text-amber-600", bg: "bg-base-100"
            }
        };

        const style = config[type] || config.success;

        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-stone-100 p-8 text-center`}>
                    <div className="flex w-full justify-center pb-4">{style.icon}</div>
                    <h3 className={`text-xl font-bold mb-2 ${style.color}`}>
                        {type === 'success' ? 'สำเร็จ!' : 'เกิดข้อผิดพลาด'}
                    </h3>
                    <p className="text-stone-600 mb-6">{message}</p>
                    <button
                        onClick={onClose}
                        className={`btn w-full rounded-xl border-none text-white ${style.btn}`}
                    >
                        ตกลง
                    </button>
                </div>
            </div>
        );
    };
    return (
        <div className="p-8 space-y-6">
            <FeedbackModal
                isOpen={feedback.open}
                type={feedback.type}
                message={feedback.message}
                onClose={() => setFeedback({ ...feedback, open: false })}
            />
            {/* <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Generating..." : "Generate Thumbnails"}
            </button> */}

            {/* --- Section: Top Bar --- */}
            {/* <section className="flex flex-col md:flex-row gap-4 items-end bg-stone-50 p-6 rounded-2xl border border-stone-200 shadow-sm">
                <div className="form-control w-full md:w-1/2">
                    <label className="label text-xs font-bold uppercase text-stone-400">เลือกร้านค้า</label>
                    <select className="select select-bordered w-full bg-white shadow-sm" value={currentDomain} onChange={(e) => setCurrentDomain(e.target.value)}>
                        <option value="" disabled>--- โปรดเลือกแบรนด์ ---</option>
                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>

                <div className="flex gap-2">
                    {currentDomain && (
                        <label className="btn btn-primary shadow-lg shadow-blue-200 px-8">
                            <Upload size={18} /> เพิ่มรูปภาพเมนู
                            <input type="file" hidden onChange={async (e) => {
                                if (e.target.files[0]) {
                                    await uploadMenuImage(e.target.files[0]);
                                    onReload();
                                }
                            }} />
                        </label>
                    )}
                    <button className="btn btn-outline border-stone-300 hover:bg-stone-100 text-stone-600" onClick={() => setIsCreating(true)}>
                        <PlusCircle size={18} /> แบรนด์ใหม่
                    </button>
                </div>
            </section> */}

            {/* --- Section: Menu List --- */}
            {currentDomain && menus.length > 0 ? (
                <div className="space-y-4 animate-in fade-in duration-500">
                    <div className="flex items-center gap-2 border-b border-stone-100 pb-2 text-stone-400">
                        <LayoutGrid size={16} />
                        <span className="text-sm font-bold">จัดเรียงลำดับการแสดงผล (ลากเพื่อย้าย)</span>
                    </div>

                    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                        <SortableContext items={menus.map(m => m.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {menus.map((menu, index) => (
                                    <SortableMenuItem
                                        key={menu.id}
                                        pageId={pageId}
                                        menu={menu}
                                        menus={menus}
                                        index={index}
                                        pages={pages}
                                        onReload={onReload}
                                        onUpdateCategory={handleUpdateCategory}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            ) : (
                <div className="text-center py-24 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200">
                    <div className="text-stone-300 mb-2 font-medium">ยังไม่ได้เลือกแบรนด์ที่ต้องการจัดการ</div>
                    <p className="text-xs text-stone-400 uppercase tracking-widest">โปรดเลือกจากรายการด้านบน หรือกดสร้างแบรนด์ใหม่</p>
                </div>
            )}

            {/* --- MODAL: Create New Brand --- */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
                        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                            <h3 className="text-xl font-black text-stone-800">สร้างแบรนด์ใหม่</h3>
                            <button onClick={closeModal} className="btn bg-white border-hidden btn-circle btn-sm text-stone-400 hover:text-stone-800">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitBrand} className="p-8 space-y-5">
                            {/* ชื่อแบรนด์ */}
                            <div className="form-control w-full">
                                <label className="label font-bold text-stone-600 text-sm">ชื่อร้าน / ชื่อแบรนด์</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-3 z-10 text-stone-700" size={20} />
                                    <input
                                        type="text"
                                        placeholder="ชื่อร้าน / ชื่อเว็บไซต์"
                                        className="input border border-stone-500 text-stone-900 bg-white w-full pl-11 focus:ring-2 ring-primary/20"
                                        value={newBrand.name}
                                        onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* โดเมน */}
                            <div className="form-control w-full">
                                <label className="label font-bold text-stone-600 text-sm">โดเมน (URL Name)</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-3 z-10 text-stone-700" size={20} />
                                    <input
                                        type="text"
                                        placeholder="lnwzaza001.com"
                                        className="input border border-stone-500 bg-white w-full pl-11 focus:ring-2 ring-primary/20 font-mono"
                                        value={newBrand.domain}
                                        onChange={e => setNewBrand({ ...newBrand, domain: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* โลโก้ */}
                            <div className="form-control w-full">
                                <label className="label font-bold text-stone-600 text-sm">โลโก้ร้าน (Optional)</label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-50 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="logo preview"
                                                className="h-20 object-contain rounded-xl"
                                            />
                                        ) : (
                                            <>
                                                <ImagePlus
                                                    className="text-stone-300 group-hover:text-primary mb-2"
                                                    size={32}
                                                />
                                                <p className="text-xs text-stone-400">Click to upload brand logo</p>
                                            </>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={e => {
                                            const file = e.target.files[0];
                                            if (!file) return;

                                            setNewBrand({ ...newBrand, logo: file });
                                            setLogoPreview(URL.createObjectURL(file));
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={closeModal} className="btn flex-1 bg-stone-100 border-none text-stone-500 hover:bg-stone-200">
                                    ยกเลิก
                                </button>
                                <button type="submit" className="btn btn-primary flex-1 shadow-lg shadow-blue-100" disabled={isSubmitting}>
                                    {isSubmitting ? <span className="loading loading-spinner"></span> : <Save size={18} />}
                                    บันทึก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {currentDomain && (
                <label
                    className={`fixed bottom-8 right-[36%] z-50 btn btn-circle btn-lg shadow-2xl btn-primary 
    ${isUploading
                            ? 'cursor-not-allowed'
                            : 'shadow-blue-300'
                        }`}
                >
                    {isUploading ? (
                        <span className="loading loading-spinner loading-md"></span>
                    ) : (
                        <Upload size={22} />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={isUploading}
                        onChange={async (e) => {
                            const files = Array.from(e.target.files);

                            // จำกัดไม่เกิน 5 ไฟล์
                            if (files.length > 5) {
                                showFeedback("warning", "อัปโหลดได้ไม่เกิน 5 ไฟล์ต่อครั้ง"); // เปลี่ยนจาก alert                                e.target.value = null;
                                return;
                            }

                            // กันไฟล์ไม่ใช่รูป
                            const invalid = files.filter(f => !f.type.startsWith("image/"));
                            if (invalid.length) {
                                showFeedback("warning", "อัปโหลดได้เฉพาะไฟล์รูปภาพเท่านั้น"); // เปลี่ยนจาก alert                                e.target.value = null;
                                return;
                            }

                            try {
                                setIsUploading(true);
                                await uploadMenuImage(files, pageId);
                                await onReload();
                            } catch {
                                showFeedback("error", "อัปโหลดรูปภาพไม่สำเร็จ"); // เปลี่ยนจาก alert                            } finally {
                                setIsUploading(false);
                                e.target.value = null;
                            }
                        }}
                    />



                </label>
            )}


        </div>
    );
}