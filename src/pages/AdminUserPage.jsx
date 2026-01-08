import { useEffect, useState } from "react";
import { getUsers, createUser, updateUserPassword } from "../api/api";
import { useNavigate } from "react-router-dom";
import { UserPlus, Shield, Users, Key, Trash2, X, Save, UserCheck, MoreVertical, ChevronRight, ChevronLeft } from "lucide-react";

export default function AdminUserPage() {
    const [users, setUsers] = useState([]);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [form, setForm] = useState({ username: "", password: "", role: "Admin" });
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const loadUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { loadUsers(); }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createUser(form);
            setForm({ username: "", password: "", role: "Admin" });
            setIsCreateOpen(false);
            loadUsers();
        } catch (err) {
            alert("Failed to create user");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (!newPassword) return;
        setLoading(true);
        try {
            await updateUserPassword(selectedUser.id, newPassword);
            setIsPasswordOpen(false);
            setNewPassword("");
            alert("Password updated successfully");
        } catch (err) {
            alert("Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-stone-50 min-h-screen font-sans text-slate-900">

            {/* Header & Stats */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <button className="w-10 h-10 rounded-full bg-primary text-center text-white flex items-center justify-center mb-2 hover:bg-primary-focus transition-colors"
                        onClick={() => navigate(-1)}>
                        <ChevronLeft size={20} />
                </button>
                <h1 className="text-3xl font-black tracking-tight text-stone-900">User Management</h1>
                <p className="text-stone-500 text-sm font-medium">จัดการสิทธิ์การเข้าถึงระบบและบัญชีผู้ใช้งาน</p>
            </div>
            <button
                className="btn btn-primary shadow-blue-200 px-6"
                onClick={() => setIsCreateOpen(true)}
            >
                <UserPlus size={18} /> เพิ่มผู้ใช้งานใหม่
            </button>
        </div>


            {/* User Table */ }
    <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
        <table className="table w-full border-separate border-spacing-y-0">
            <thead className="bg-stone-50/50">
                <tr className="text-stone-400 uppercase text-[10px] tracking-[0.15em]">
                    <th className="py-5 pl-8">Username</th>
                    <th>Access Role</th>
                    <th className="text-right pr-8">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
                {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="py-4 pl-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center font-black text-stone-400 text-sm">
                                    {u.username.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="font-bold text-stone-800">{u.username}</div>
                            </div>
                        </td>
                        <td>
                            <span className={`badge badge-sm font-bold py-3 px-4 rounded-xl border-none ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'
                                }`}>
                                {u.role}
                            </span>
                        </td>
                        <td className="text-right pr-8">
                            <div className="flex justify-end gap-2">
                                <button
                                    className="btn btn-warning px-4 rounded-2xl btn-sm text-white border-hidden"
                                    onClick={() => { setSelectedUser(u); setIsPasswordOpen(true); }}
                                >
                                    <Key size={16} />
                                </button>
                                <button className="btn btn-error btn-circle btn-sm text-white border-hidden">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {users.length === 0 && (
            <div className="text-center py-20 text-stone-300 italic">No users found in database</div>
        )}
    </div>

    {/* Modal: Create User */ }
    {
        isCreateOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border">
                    <div className="p-6 border-b flex justify-between items-center bg-stone-50">
                        <h3 className="text-xl font-black">เพิ่มผู้ใช้งาน</h3>
                        <button onClick={() => setIsCreateOpen(false)} className="btn btn-ghost btn-circle btn-sm"><X /></button>
                    </div>
                    <form onSubmit={handleCreateUser} className="p-8 space-y-4">
                        <div className="form-control">
                            <label className="label font-bold text-xs uppercase text-stone-400">ชื่อผู้ใช้งาน</label>
                            <input
                                className="input input-bordered w-full rounded-xl bg-stone-50 focus:bg-white"
                                placeholder="Username"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-xs uppercase text-stone-400">รหัสผ่าน</label>
                            <input
                                className="input input-bordered w-full rounded-xl bg-stone-50 focus:bg-white"
                                type="password"
                                placeholder="Password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label font-bold text-xs uppercase text-stone-400">ตำแหน่ง (Role)</label>
                            <select
                                className="select select-bordered w-full rounded-xl bg-stone-50"
                                value={form.role}
                                onChange={e => setForm({ ...form, role: e.target.value })}
                            >
                                <option value="Admin">Admin (Full Access)</option>
                                <option value="Editor">Editor (Limited Access)</option>
                            </select>
                        </div>
                        <div className="pt-4 flex gap-2">
                            <button type="button" className="btn flex-1 bg-stone-100 border-none text-stone-500 hover:bg-stone-200" onClick={() => setIsCreateOpen(false)}>ยกเลิก</button>
                            <button type="submit" className="btn btn-primary flex-1 shadow-lg shadow-blue-100" disabled={loading}>
                                {loading ? <span className="loading loading-spinner"></span> : "สร้างบัญชี"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    {/* Modal: Change Password */ }
    {
        isPasswordOpen && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden border">
                    <div className="p-8 text-center space-y-4">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto">
                            <Key size={32} />
                        </div>
                        <h3 className="text-2xl font-black">เปลี่ยนรหัสผ่าน</h3>
                        <p className="text-stone-400 text-sm">ผู้ใช้งาน: <span className="text-stone-800 font-bold">{selectedUser?.username}</span></p>

                        <form onSubmit={handleUpdatePassword} className="space-y-4 text-left">
                            <div className="form-control">
                                <input
                                    className="input input-primary w-full bg-white rounded-xl"
                                    type="text"
                                    placeholder="รหัสผ่านใหม่"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="button" className="btn flex-1 bg-stone-100 border-none text-stone-500 hover:bg-stone-200" onClick={() => setIsPasswordOpen(false)}>ยกเลิก</button>
                                <button type="submit" className="btn btn-primary flex-1 shadow-lg" disabled={loading}>
                                    {loading ? <span className="loading loading-spinner"></span> : "บันทึก"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
        </div >
    );
}