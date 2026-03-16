import React, { useState, useEffect } from "react";
import { X, Link, ArrowRight, ExternalLink, BookOpenCheck } from "lucide-react";
import { baseUrl, updateMenuCategory } from "../../api/api"; // ปรับ path ตามจริง

export default function LinkModal({ menu, menus, pages, onClose, onUpdate }) {
    const [linkType, setLinkType] = useState("category");
    const [externalUrl, setExternalUrl] = useState(menu.externalUrl || "");
    const [internalUrl, setInternalUrl] = useState(menu.internalUrl || "");
    const [loading, setLoading] = useState(false);

    // Sync state เมื่อเปิด Modal
    useEffect(() => {
        if (menu.externalUrl) setLinkType("external");
        else if (menu.internalUrl) setLinkType("internal");
        else setLinkType("category");
    }, [menu]);

    const handleConfirm = async (catId = null, ext = null, int = null) => {
        try {
            setLoading(true);
            // เรียก API (ปรับตามโครงสร้าง API ของคุณ)
            await updateMenuCategory(menu.id, catId, ext, int);
            onUpdate(); // Reload ข้อมูลที่ Parent
            onClose();
        } catch (error) {
            alert("Update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-6 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl">

                {/* LEFT: Preview ต้นทาง */}
                <div className="w-2/5 bg-stone-50 p-10 flex flex-col items-center justify-center border-r">
                    <img src={`${baseUrl}${menu.imageUrl}`} className="w-full rounded-2xl shadow-xl border-4 border-white mb-6" alt="Source" />
                    <div className="badge badge-primary font-bold">เมนูที่เลือก</div>
                </div>

                {/* RIGHT: Selection Form */}
                <div className="flex-1 flex flex-col">
                    <div className="p-6 border-b flex justify-between items-center bg-white">
                        <h3 className="font-black text-xl">เชื่อมลิงก์เมนู</h3>
                        <div className="flex gap-2">
                            {['category', 'external', 'internal'].map((type) => (
                                <button
                                    key={type}
                                    className={`btn btn-sm capitalize ${linkType === type ? "btn-primary" : "btn-outline"}`}
                                    onClick={() => setLinkType(type)}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="btn btn-ghost btn-circle">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8">
                        {linkType === "category" && (
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    className="btn btn-outline btn-block col-span-2 rounded-xl mb-4"
                                    onClick={() => handleConfirm(null, null, null)}
                                >
                                    ยกเลิกการเชื่อมลิงก์ทั้งหมด
                                </button>
                                {menus.map((p, idx) => (
                                    <div
                                        key={p.id}
                                        onClick={() => handleConfirm(p.id, null, null)}
                                        className={`relative group cursor-pointer rounded-2xl border-2 transition-all p-1 ${menu.category == p.id ? "border-primary bg-primary/5" : "border-stone-100 hover:border-stone-300"}`}
                                    >
                                        <img src={`${baseUrl}${p.imageUrl}`} className="w-full h-32 object-cover rounded-xl" alt="Category" />
                                        <span className="absolute top-3 left-3 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs">{idx + 1}</span>
                                        {menu.category == p.id && <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-xl"><Link className="text-primary" /></div>}
                                    </div>
                                ))}
                            </div>
                        )}

                        {linkType === "external" && (
                            <div className="flex flex-col gap-4 py-10">
                                <label className="text-sm font-bold text-stone-600">URL ภายนอก (เช่น Facebook, TikTok)</label>
                                <input
                                    type="url"
                                    className="input input-primary bg-white w-full border-2"
                                    value={externalUrl}
                                    onChange={(e) => setExternalUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                                <button className="btn btn-primary" disabled={!externalUrl || loading} onClick={() => handleConfirm(null, externalUrl, null)}>
                                    {loading ? "กำลังบันทึก..." : "ยืนยันการเชื่อมต่อ"}
                                </button>
                            </div>
                        )}

                        {linkType === "internal" && (
                            <div className="flex flex-col gap-4 py-10">
                                <label className="text-sm font-bold text-stone-600">เลือกหน้าภายในเว็บไซต์</label>
                                <select
                                    className="select select-primary bg-white w-full border-2"
                                    value={internalUrl}
                                    onChange={(e) => setInternalUrl(e.target.value)}
                                >
                                    <option value="">เลือกหน้า...</option>
                                    {pages.map(p => <option key={p.id} value={`/${p.slug}`}>{p.title || p.slug}</option>)}
                                </select>
                                <button className="btn btn-primary" disabled={!internalUrl || loading} onClick={() => handleConfirm(null, null, internalUrl)}>
                                    {loading ? "กำลังบันทึก..." : "ยืนยันการเชื่อมต่อ"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}