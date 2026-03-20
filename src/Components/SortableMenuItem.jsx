import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    GripVertical, ImageUp, Link as LinkIcon, Trash2, ArrowRight,
    ExternalLink, RefreshCw, X, Link, BookOpenCheck
} from "lucide-react";
import { useState, useEffect, useMemo, memo } from "react";
import { replaceMenuImage, deleteMenuImage, baseUrl } from "../api/api";

const thumbCache = new Map();

const SortableMenuItem = ({ menu, menus, onReload, onUpdateCategory, pages, index, pageId }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: menu.id });

    // Modals Control
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isReplaceOpen, setIsReplaceOpen] = useState(false);

    // States
    const [thumb, setThumb] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isReplacing, setIsReplacing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Form States
    const [linkType, setLinkType] = useState("category");
    const [externalUrl, setExternalUrl] = useState("");
    const [internalUrl, setInternalUrl] = useState("");

    const isExternal = !!menu.externalUrl;
    const isInternal = !!menu.internalUrl;

    const linkedPage = useMemo(() =>
        menus.find(p => String(p.id) === String(menu.category)),
        [menus, menu.category]
    );


    useEffect(() => {
        let active = true;
        const loadThumb = async () => {
            const url = `${baseUrl}${menu.imageUrl}`;
            const t = await createThumbnail(url);
            if (active) setThumb(t);
        };
        loadThumb();
        return () => { active = false; };
    }, [menu.imageUrl]);

    // Sync state when opening Link Modal
    useEffect(() => {
        if (isModalOpen) {
            if (menu.externalUrl) {
                setLinkType("external");
                setExternalUrl(menu.externalUrl);
            } else if (menu.internalUrl) {
                setLinkType("internal");
                setInternalUrl(menu.internalUrl);
            } else {
                setLinkType("category");
                setInternalUrl("");
                setExternalUrl("");
            }
        }
    }, [isModalOpen, menu]);

    useEffect(() => {
        const img = new Image();
        img.src = `${baseUrl}${menu.imageUrl}`;
    }, [menu.imageUrl]);

    // --- Handlers ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (previewUrl) URL.revokeObjectURL(previewUrl); // Clean old preview
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setIsReplaceOpen(true);
        }
        e.target.value = null;
    };

    const handleConfirmReplace = async () => {
        try {
            setIsReplacing(true);
            await replaceMenuImage(menu.id, selectedFile, pageId);
            setIsReplaceOpen(false);
            if (previewUrl) URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
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
            <span className="font-mono text-stone-400 text-sm select-none w-4">{index + 1}</span>

            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 rounded-lg text-stone-300 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                <GripVertical size={24} />
            </div>

            <div className="flex-1 flex items-center gap-6 overflow-hidden">
                <div className="relative shrink-0">
                    <img
                        src={`${baseUrl}${menu.thumbnailUrl}`}
                        loading="lazy"
                        decoding="async"
                        className="w-24 h-24 object-cover rounded-xl"
                    />

            
                </div>

                {/* Status Indicator */}
                <div className="flex-1 overflow-hidden">
                    {linkedPage ? (
                        <div className="flex items-center gap-3 w-36 bg-blue-50/50 p-2 pr-4 rounded-2xl border border-blue-100">
                            <div className="p-1 bg-blue-500 rounded-full text-white shadow-sm">
                                <ArrowRight size={14} strokeWidth={3} />
                            </div>
                            <img
                                src={`${baseUrl}${linkedPage.thumbnailUrl}`}
                                width={96} height={96}
                                loading="lazy"
                                className="w-16 h-16 object-cover rounded-xl bg-stone-50 transform-gpu"
                                style={{ backfaceVisibility: 'hidden' }}
                                alt="menu"
                            />
                        </div>
                    ) : isExternal ? (
                        <a href={menu.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-emerald-50 p-2 pr-4 rounded-2xl border border-emerald-200 hover:bg-emerald-100 transition max-w-full">
                            <div className="p-1.5 bg-emerald-500 rounded-full text-white shrink-0">
                                <ExternalLink size={12} />
                            </div>
                            <div className="flex flex-col text-[10px] overflow-hidden">
                                <span className="font-bold text-emerald-700">External</span>
                                <span className="text-emerald-600 truncate">{menu.externalUrl}</span>
                            </div>
                        </a>
                    ) : isInternal ? (
                        <div className="inline-flex items-center gap-3 bg-indigo-50 p-2 pr-4 rounded-2xl border border-indigo-200 max-w-full">
                            <div className="p-1.5 bg-indigo-500 rounded-full text-white shrink-0">
                                <BookOpenCheck size={12} />
                            </div>
                            <div className="flex flex-col text-[10px] overflow-hidden">
                                <span className="font-bold text-indigo-700">Internal Page</span>
                                <span className="text-indigo-600 truncate">{menu.internalUrl}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-stone-300 text-xs italic flex items-center gap-2">
                            <ExternalLink size={12} /> ยังไม่ได้เชื่อมลิงก์
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
                <button
                    className={`btn btn-circle btn-sm ${linkedPage || isExternal || isInternal ? 'btn-primary' : 'bg-stone-100 text-primary border-none'}`}
                    onClick={() => setIsModalOpen(true)}
                >
                    <LinkIcon size={16} />
                </button>

                <label className="btn btn-circle btn-sm bg-stone-100 text-stone-600 border-none hover:bg-stone-200 cursor-pointer">
                    <ImageUp size={16} />
                    <input type="file" hidden onChange={handleFileSelect} accept="image/*" />
                </label>

                <div className="w-px h-6 bg-stone-200 my-auto mx-1"></div>

                <button className="btn btn-circle btn-sm bg-red-50 border-none text-red-400 hover:bg-red-100" onClick={() => setIsDeleteOpen(true)}>
                    <Trash2 size={16} />
                </button>
            </div>

            {/* MODAL: Replace Preview */}
            {isReplaceOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden border">
                        <div className="p-6 bg-stone-50 border-b flex justify-between items-center">
                            <h3 className="font-black text-xl flex items-center gap-2"><RefreshCw className="text-blue-500" /> เปลี่ยนรูปเมนู</h3>
                            <button onClick={() => { setIsReplaceOpen(false); URL.revokeObjectURL(previewUrl); }} className="btn btn-ghost btn-circle btn-sm"><X /></button>
                        </div>
                        <div className="p-8 flex flex-col md:flex-row items-center gap-8 justify-center">
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-stone-400 block mb-2 uppercase">รูปเก่า</span>
                                <img src={`${baseUrl}${menu.imageUrl}`} className="w-40 h-40 object-cover rounded-2xl border opacity-50" alt="old" />
                            </div>
                            <ArrowRight className="text-stone-300 rotate-90 md:rotate-0" size={32} />
                            <div className="text-center">
                                <span className="text-[10px] font-bold text-primary block mb-2 uppercase">รูปใหม่</span>
                                <img src={previewUrl} className="w-40 h-40 object-cover rounded-2xl border-4 border-primary shadow-xl" alt="new" />
                            </div>
                        </div>
                        <div className="p-6 bg-stone-50 flex justify-center gap-3">
                            <button className="btn bg-stone-100 border-none text-stone-500" onClick={() => setIsReplaceOpen(false)}>ยกเลิก</button>
                            <button className="btn btn-primary px-8" onClick={handleConfirmReplace} disabled={isReplacing}>
                                {isReplacing ? <span className="loading loading-spinner"></span> : "ยืนยันการเปลี่ยน"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Delete */}
            {isDeleteOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4 animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} /></div>
                        <h3 className="text-xl font-black mb-2">ลบรูปเมนู?</h3>
                        <p className="text-stone-500 text-sm mb-6">ข้อมูลจะถูกลบถาวร</p>
                        <div className="flex gap-3">
                            <button className="btn flex-1 text-stone-500 bg-stone-100 border-none" onClick={() => setIsDeleteOpen(false)}>ยกเลิก</button>
                            <button className="btn flex-1 btn-error text-white" onClick={async () => {
                                setIsDeleting(true);
                                await deleteMenuImage(menu.id);
                                setIsDeleteOpen(false);
                                onReload();
                                setIsDeleting(false);
                            }} disabled={isDeleting}>
                                {isDeleting ? "กำลังลบ..." : "ลบเลย"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL: Link Selector */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-6 animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-5xl h-[85vh] flex overflow-hidden shadow-2xl">
                        <div className="w-2/5 bg-stone-50 p-10 flex flex-col items-center justify-center border-r">
                            <img src={`${baseUrl}${menu.imageUrl}`} className="w-full aspect-square object-cover rounded-2xl shadow-xl border-4 border-white mb-6" alt="source" />
                            <div className="badge badge-primary font-bold">เมนูที่เลือก</div>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="p-6 border-b flex justify-between items-center bg-white">
                                <div className="flex gap-1">
                                    {["category", "external", "internal"].map((type) => (
                                        <button
                                            key={type}
                                            className={`btn btn-sm ${linkType === type ? "btn-primary" : "btn-ghost"}`}
                                            onClick={() => setLinkType(type)}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-circle btn-sm">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-stone-50/50">
                                {linkType === "category" && (
                                    <div className="space-y-4">
                                        <button onClick={() => { onUpdateCategory(menu.id, null, null, null); setIsModalOpen(false); }} className="btn btn-outline btn-block rounded-xl border-dashed">ยกเลิกการเชื่อมทั้งหมด</button>
                                        <div className="grid grid-cols-2 gap-4">
                                            {menus.map((p, idx) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => { onUpdateCategory(menu.id, p.id, null, null); setIsModalOpen(false); }}
                                                    className={`relative aspect-video rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${menu.category == p.id ? "border-primary ring-4 ring-primary/10" : "border-white hover:border-stone-200"}`}
                                                >
                                                    <span className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center backdrop-blur-sm">{idx + 1}</span>
                                                    <img src={`${baseUrl}${p.thumbnailUrl}`} className="w-full h-full object-cover" alt="cat" />
                                                    {menu.category == p.id && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Link className="text-white" /></div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {linkType === "external" && (
                                    <div className="h-full flex flex-col justify-center max-w-md mx-auto gap-4">
                                        <label className="text-xs font-bold text-stone-500 uppercase">External Destination URL</label>
                                        <input type="url" placeholder="https://..." className="input input-bordered input-primary bg-white w-full" value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} />
                                        <button className="btn btn-primary" disabled={!externalUrl} onClick={() => { onUpdateCategory(menu.id, null, externalUrl, null); setIsModalOpen(false); }}>บันทึก Link ภายนอก</button>
                                    </div>
                                )}

                                {linkType === "internal" && (
                                    <div className="h-full flex flex-col justify-center max-w-md mx-auto gap-4">
                                        <label className="text-xs font-bold text-stone-500 uppercase">Select Internal Page</label>
                                        <select className="select select-bordered select-primary bg-white w-full" value={internalUrl} onChange={(e) => setInternalUrl(e.target.value)}>
                                            <option value="">-- เลือกหน้า --</option>
                                            {pages.map((p) => <option key={p.id} value={`/${p.slug}`}>{p.title || p.slug}</option>)}
                                        </select>
                                        <button className="btn btn-primary" disabled={!internalUrl} onClick={() => { onUpdateCategory(menu.id, null, null, internalUrl); setIsModalOpen(false); }}>บันทึก Link ภายใน</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Optimized Memo ---
export default memo(SortableMenuItem, (prev, next) => {
    return (
        prev.index === next.index &&
        prev.menu.id === next.menu.id &&
        prev.menu.imageUrl === next.menu.imageUrl &&
        prev.menu.category === next.menu.category &&
        prev.menu.externalUrl === next.menu.externalUrl &&
        prev.menu.internalUrl === next.menu.internalUrl &&
        prev.isDragging === next.isDragging
    );
});