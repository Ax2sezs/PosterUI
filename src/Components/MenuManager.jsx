// import React, { useState, useCallback } from "react";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
// import SortableMenuItem from "./SortableMenuItem";
// import { replaceMenuImage, deleteMenuImage, updateMenuCategory } from "../api/api";

// // นำ Modal ออกมาเป็น Component ย่อยเพื่อไม่ให้ไฟล์หลักยาวเกินไป (หรือแยกไฟล์ก็ได้)
// import LinkModal from "./Modals/LinkModal";
// import DeleteModal from "./Modals/DeleteModal";
// import ReplacePreviewModal from "./Modals/ReplacePreviewModal";
// export default function MenuManager({ initialMenus, pages, pageId, onReload }) {
//     const [menus, setMenus] = useState(initialMenus);

//     // --- Centralized Modal State ---
//     const [activeMenu, setActiveMenu] = useState(null); // เก็บข้อมูลเมนูที่กำลังถูกจัดการ
//     const [modalType, setModalType] = useState(null);   // 'link' | 'delete' | 'replace'
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [previewUrl, setPreviewUrl] = useState(null);

//     // --- Handlers (ใช้ useCallback เพื่อให้ React.memo ในลูกทำงานได้เต็มที่) ---
//     const openLinkModal = useCallback((menu) => {
//         setActiveMenu(menu);
//         setModalType('link');
//     }, []);

//     const openDeleteModal = useCallback((menu) => {
//         setActiveMenu(menu);
//         setModalType('delete');
//     }, []);

//     const handleFileSelect = useCallback((e, menu) => {
//         const file = e.target.files[0];
//         if (file) {
//             setSelectedFile(file);
//             setPreviewUrl(URL.createObjectURL(file));
//             setActiveMenu(menu);
//             setModalType('replace');
//         }
//         e.target.value = null;
//     }, []);

//     const closeModal = () => {
//         setModalType(null);
//         setActiveMenu(null);
//         if (previewUrl) URL.revokeObjectURL(previewUrl);
//     };

//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             <DndContext collisionDetection={closestCenter} onDragEnd={/* handle drag end */}>
//                 <SortableContext items={menus} strategy={verticalListSortingStrategy}>
//                     <div className="space-y-3">
//                         {menus.map((menu, index) => (
//                             <SortableMenuItem
//                                 key={menu.id}
//                                 index={index}
//                                 menu={menu}
//                                 menus={menus} // ส่ง list ทั้งหมดไปหา linkedPage
//                                 onOpenLink={openLinkModal}
//                                 onOpenDelete={openDeleteModal}
//                                 onFileSelect={handleFileSelect}
//                             />
//                         ))}
//                     </div>
//                 </SortableContext>
//             </DndContext>

//             {/* --- Global Modals (Render แค่ 1 ชุดเสมอ) --- */}
//             {modalType === 'link' && (
//                 <LinkModal
//                     menu={activeMenu}
//                     menus={menus}
//                     pages={pages}
//                     onClose={closeModal}
//                     onUpdate={onReload}
//                 />
//             )}

//             {modalType === 'delete' && (
//                 <DeleteModal
//                     menu={activeMenu}
//                     onClose={closeModal}
//                     onConfirm={async () => {
//                         await deleteMenuImage(activeMenu.id);
//                         onReload();
//                         closeModal();
//                     }}
//                 />
//             )}

//             {modalType === 'replace' && (
//                 <ReplacePreviewModal
//                     menu={activeMenu}
//                     previewUrl={previewUrl}
//                     file={selectedFile}
//                     onClose={closeModal}
//                     onConfirm={async () => {
//                         await replaceMenuImage(activeMenu.id, selectedFile, pageId);
//                         onReload();
//                         closeModal();
//                     }}
//                 />
//             )}
//         </div>
//     );
// }