import { RefreshCw, ArrowRight, X } from "lucide-react";
import { baseUrl } from "../../api/api";

export default function ReplacePreviewModal({ menu, previewUrl, onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
                <div className="p-6 bg-stone-50 border-b flex justify-between items-center">
                    <h3 className="font-black text-xl flex items-center gap-2">
                        <RefreshCw className="text-blue-500" /> ตรวจสอบรูปภาพใหม่
                    </h3>
                    <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm"><X /></button>
                </div>
                
                <div className="p-10 flex flex-col md:flex-row items-center gap-8 justify-center">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">รูปเดิม</p>
                        <img src={`${baseUrl}${menu.imageUrl}`} className="w-40 h-40 object-cover rounded-2xl border opacity-40" alt="Old" />
                    </div>
                    <ArrowRight className="text-stone-300 rotate-90 md:rotate-0" size={32} />
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-primary uppercase mb-2">รูปใหม่</p>
                        <img src={previewUrl} className="w-40 h-40 object-cover rounded-2xl border-4 border-primary shadow-xl animate-in zoom-in-90" alt="New" />
                    </div>
                </div>

                <div className="p-6 bg-stone-50 flex justify-center gap-3">
                    <button className="btn bg-white border-stone-200 text-stone-500 hover:bg-stone-100" onClick={onClose}>ยกเลิก</button>
                    <button className="btn btn-primary px-10 shadow-lg shadow-primary/20" onClick={onConfirm}>
                        ยืนยันการเปลี่ยนรูป
                    </button>
                </div>
            </div>
        </div>
    );
}