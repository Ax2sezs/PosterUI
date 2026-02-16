import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImageUp, Link as LinkIcon, Trash2, ArrowRight, ExternalLink, RefreshCw, X, Check, Image as ImageIcon, Link, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { replaceMenuImage, deleteMenuImage, baseUrl } from "../api/api";

export default function SortableMenuItem({ menu, onReload, onUpdateCategory, pages, index }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: menu.id });

    // Modals Control
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isReplaceOpen, setIsReplaceOpen] = useState(false);

    // States
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [linkType, setLinkType] = useState("category"); // category | external
    const [externalUrl, setExternalUrl] = useState("");
    const isExternal = !!menu.externalUrl;

    const linkedPage = pages.find(p => String(p.id) === String(menu.category));
    useEffect(() => {
        if (isModalOpen) {
            if (menu.externalUrl) {
                setLinkType("external");
                setExternalUrl(menu.externalUrl);
            } else {
                setLinkType("category");
                setExternalUrl("");
            }
        }
    }, [isModalOpen]);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsReplaceOpen(true);
        }
        e.target.value = null;
    };

    const handleConfirmReplace = async () => {
        try {
            setIsReplacing(true);
            await replaceMenuImage(menu.id, selectedFile);
            setIsReplaceOpen(false);
            onReload();
        } catch (error) {
            alert("Replace failed");
        } finally {
            setIsReplacing(false);
        }
    };

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? 'none' : transition,
        zIndex: isDragging ? 50 : 0,
        opacity: isDragging ? 0.8 : 1
    };


    return (
        <div ref={setNodeRef} style={style} className={`group flex items-center bg-white border border-stone-200 rounded-2xl p-3 gap-4 shadow-sm transition-all hover:shadow-md ${isDragging ? 'shadow-2xl ring-2 ring-primary' : ''}`}>
            <span className="font-mono text-stone-400 text-sm select-none">
                {index + 1}
            </span>
            <div
                {...attributes}
                {...listeners}
                className="
    cursor-grab active:cursor-grabbing
    p-2 rounded-lg
    text-stone-300
    group-hover:text-primary
    group-hover:bg-primary/10
    transition-all
  "
            >
                <GripVertical size={24} />
            </div>



            <div className="flex-1 flex items-center gap-6 overflow-hidden">
                <div className="relative shrink-0">
                    <img src={`${baseUrl}${menu.imageUrl}`} className="w-24 h-24 object-cover rounded-xl border bg-stone-50" />
                </div>

                {linkedPage ? (
                    /* ===== CATEGORY LINK ===== */
                    <div className="flex items-center gap-3 bg-blue-50/50 p-2 pr-4 rounded-2xl border border-blue-100">
                        <div className="p-1 bg-blue-500 rounded-full text-white shadow-sm">
                            <ArrowRight size={14} strokeWidth={3} />
                        </div>
                        <img
                            src={`${baseUrl}${linkedPage.imageUrl}`}
                            className="w-14 h-14 object-cover rounded-lg border-2 border-white shadow-sm"
                        />
                    </div>
                ) : isExternal ? (
                    /* ===== EXTERNAL LINK ===== */
                    <a
                        href={menu.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 hover:bg-emerald-100 transition"
                    >
                        <div className="p-2 bg-emerald-500 rounded-full text-white shadow-sm">
                            <ExternalLink size={14} />
                        </div>
                        <div className="flex flex-col text-xs">
                            <span className="font-bold text-emerald-700">External Link</span>
                            <span className="text-emerald-600 truncate max-w-[120px]">
                                {menu.externalUrl}
                            </span>
                        </div>
                    </a>
                ) : (
                    /* ===== NO LINK ===== */
                    <div className="text-stone-300 text-xs italic flex items-center gap-2">
                        <ExternalLink size={12} /> ยังไม่ได้เชื่อมลิงก์
                    </div>
                )}

            </div>

            <div className="flex gap-2">
                {/* เชื่อมลิงก์ */}
                <div className="tooltip tooltip-bottom" data-tip="เชื่อมลิงก์เมนู">
                    <button
                        className={`btn btn-circle btn-sm ${linkedPage||isExternal
                            ? 'btn-primary shadow-blue-100'
                            : 'bg-stone-100 text-primary border-none'
                            }`}
                        onClick={() => setIsModalOpen(true)}
                    >
                        <LinkIcon size={16} />
                    </button>
                </div>

                {/* เปลี่ยนรูป */}
                <div className="tooltip tooltip-bottom" data-tip="เปลี่ยนรูปเมนู">
                    <label className="btn btn-circle btn-sm bg-stone-100 text-stone-600 border-none hover:bg-stone-200 cursor-pointer">
                        <ImageUp size={16} />
                        <input type="file" hidden onChange={handleFileSelect} accept="image/*" />
                    </label>
                </div>

                <div className="w-0.5 h-6 bg-stone-200 my-auto mx-2"></div>

                {/* ลบ */}
                <div className="tooltip tooltip-bottom tooltip-error" data-tip="ลบเมนู">
                    <button
                        className="btn btn-circle btn-sm bg-red-50 border-none text-red-400 hover:bg-red-100"
                        onClick={() => setIsDeleteOpen(true)}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>


            {/* MODAL: Replace Preview */}
            {isReplaceOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border">
                        <div className="p-6 bg-stone-50 border-b flex justify-between items-center">
                            <h3 className="font-black text-xl flex items-center gap-2"><RefreshCw className="text-blue-500" /> ตรวจสอบก่อนเปลี่ยนรูป</h3>
                            <button onClick={() => setIsReplaceOpen(false)} className="btn btn-ghost btn-circle btn-sm"><X /></button>
                        </div>
                        <div className="p-8 flex flex-col md:flex-row items-center gap-8 justify-center">
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-stone-400 uppercase">รูปเก่า</span>
                                <img src={`${baseUrl}${menu.imageUrl}`} className="w-40 h-full object-cover rounded-2xl border shadow-sm opacity-50" />
                            </div>
                            <ArrowRight className="text-stone-300 rotate-90 md:rotate-0" size={32} />
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-primary uppercase">รูปใหม่</span>
                                <img src={previewUrl} className="w-40 h-full object-cover rounded-2xl border-4 border-primary shadow-xl animate-in zoom-in-95" />
                            </div>
                        </div>
                        <div className="p-6 bg-stone-50 flex justify-center gap-3">
                            <button className="btn bg-stone-100 border-none text-stone-500 hover:bg-stone-200" onClick={() => setIsReplaceOpen(false)}>ยกเลิก</button>
                            <button className="btn btn-primary px-8" onClick={handleConfirmReplace} disabled={isReplacing}>
                                {isReplacing ? <span className="loading loading-spinner"></span> : "ยืนยันการเปลี่ยน"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Delete Confirmation */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} />
                        </div>
                        <h3 className="text-xl font-black mb-2">ต้องการลบรูปนี้ใช่ไหม?</h3>
                        <p className="text-stone-500 text-sm mb-6">เมื่อลบแล้วจะไม่สามารถกู้คืนได้</p>
                        <div className="flex gap-3">
                            <button className="btn flex-1 bg-stone-100 border-none text-stone-500 hover:bg-stone-200" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</button>
                            <button className="btn flex-1 btn-error text-white" onClick={async () => {
                                setIsDeleting(true);
                                await deleteMenuImage(menu.id);
                                setIsDeleteOpen(false);
                                onReload();
                                setIsDeleting(false);
                            }} disabled={isDeleting}>
                                {isDeleting ? "กำลังลบ..." : "ใช่, ลบเลย"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Link Selector (โชว์ 2 ฝั่ง) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-6 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl">

                        {/* LEFT: ต้นทาง */}
                        <div className="w-2/5 bg-stone-50 p-10 flex flex-col items-center justify-center border-r">
                            <img
                                src={`${baseUrl}${menu.imageUrl}`}
                                className="w-full rounded-2xl shadow-xl border-4 border-white mb-6"
                            />
                            <div className="badge badge-primary font-bold">ต้นทาง</div>
                        </div>

                        {/* RIGHT */}
                        <div className="flex-1 flex flex-col">

                            {/* HEADER */}
                            <div className="p-6 border-b flex justify-between items-center bg-white">
                                <h3 className="font-black text-xl">เชื่อมลิงก์เมนู</h3>

                                <div className="flex gap-2">
                                    <button
                                        className={`btn btn-sm ${linkType === "category" ? "btn-primary" : "btn-outline"}`}
                                        onClick={() => setLinkType("category")}
                                    >
                                        Category
                                    </button>
                                    <button
                                        className={`btn btn-sm ${linkType === "external" ? "btn-primary" : "btn-outline"}`}
                                        onClick={() => setLinkType("external")}
                                    >
                                        External URL
                                    </button>
                                </div>

                                <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle">
                                    ✕
                                </button>
                            </div>

                            {/* ===== CATEGORY MODE ===== */}
                            {linkType === "category" && (
                                <>
                                    <div className="flex w-full justify-center p-4">
                                        <button
                                            onClick={() => {
                                                onUpdateCategory(menu.id, null, null);
                                                setIsModalOpen(false);
                                            }}
                                            className="btn btn-outline btn-block rounded-xl"
                                        >
                                            ยกเลิกการเชื่อมลิงก์
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 overflow-y-auto p-6 gap-4 bg-stone-50/50">
                                        {pages.map((p, index) => (
                                            <div
                                                key={p.id}
                                                onClick={() => {
                                                    onUpdateCategory(menu.id, p.id, null);
                                                    setIsModalOpen(false);
                                                }}
                                                className={`relative flex justify-center rounded-2xl border-2 cursor-pointer transition-all
                    ${menu.category == p.id
                                                        ? "border-primary bg-primary/5 shadow-md"
                                                        : "border-white bg-white hover:border-stone-200"
                                                    }`}
                                            >
                                                <span
                                                    className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-full 
                      ${menu.category == p.id ? "bg-primary" : "bg-stone-400/80"}
                      text-white text-xs font-black flex items-center justify-center shadow-md`}
                                                >
                                                    {index + 1}
                                                </span>

                                                <img
                                                    src={`${baseUrl}${p.imageUrl}`}
                                                    className="w-40 h-full object-cover rounded-xl"
                                                />

                                                {menu.category == p.id && (
                                                    <span className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center shadow-md">
                                                        <Link size={16} />
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* ===== EXTERNAL URL MODE ===== */}
                            {linkType === "external" && (
                                <div className="flex-1 flex flex-col justify-center p-10 gap-4">
                                    <label className="text-sm font-bold text-stone-600">
                                        URL ปลายทาง (Facebook, TikTok, Website)
                                    </label>

                                    <input
                                        type="url"
                                        placeholder="https://facebook.com/yourpage"
                                        className="input input-primary bg-white w-full"
                                        value={externalUrl}
                                        onChange={(e) => setExternalUrl(e.target.value)}
                                    />

                                    <button
                                        className="btn btn-primary mt-4"
                                        disabled={!externalUrl}
                                        onClick={() => {
                                            onUpdateCategory(menu.id, null, externalUrl);
                                            setIsModalOpen(false);
                                        }}
                                    >
                                        ยืนยันการเชื่อมลิงก์
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
}