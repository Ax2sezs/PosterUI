import { Trash2 } from "lucide-react";

export default function DeleteModal({ onClose, onConfirm }) {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-stone-900/80 backdrop-blur-md p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black mb-2">ยืนยันการลบ?</h3>
                <p className="text-stone-500 text-sm mb-6">ข้อมูลรูปภาพนี้จะถูกลบถาวร</p>
                <div className="flex gap-3">
                    <button className="btn flex-1 bg-stone-100 border-none text-stone-500" onClick={onClose}>ยกเลิก</button>
                    <button className="btn flex-1 btn-error text-white" onClick={onConfirm}>ลบเลย</button>
                </div>
            </div>
        </div>
    );
}