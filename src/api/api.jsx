import axios from "axios";


export const baseUrl = "https://apisupermenu.mmm2007.net"; // เปลี่ยนเป็น URL ของเซิร์ฟเวอร์จริง
// export const baseUrl = "http://localhost:5127"; // เปลี่ยนเป็น URL ของเซิร์ฟเวอร์จริง

const api = axios.create({
    baseURL: `${baseUrl}/api`,
});

/* ---------- แนบ Brand ให้ทุก request ---------- */
api.interceptors.request.use((config) => {
    const domain = localStorage.getItem("adminBrandDomain");
    if (domain) {
        config.headers["X-Brand-Id"] = domain;
    }
    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // ล้างของเล่นที่หมดอายุ
            localStorage.removeItem("accessToken");
            localStorage.removeItem("adminBrandDomain");

            // เด้งออกแบบไม่ต้องมีพิธีรีตอง
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

/* ---------- USER ---------- */
export const getMenu = async (pageId) => {
    const res = await api.get(`/admin/menu/${pageId}`);
    return res.data;
};

/* ---------- ADMIN MENU ---------- */
export const uploadMenuImage = async (files, pageId, category) => {
    const form = new FormData();

    for (const file of files) {
        form.append("files", file);
    }

    form.append("pageId", pageId);

    if (category) form.append("category", category);

    await api.post("/admin/menu/images", form);
};


export const updateMenuSort = async (items) => {
    await api.put("/admin/menu/images/sort", items);
};

export const deleteMenuImage = async (id) => {
    await api.delete(`/admin/menu/images/${id}`);
};

export const replaceMenuImage = async (id, file, pageId, category) => {
    const form = new FormData();

    form.append("file", file);
    form.append("pageId", pageId);

    if (category) form.append("category", category);

    await api.put(`/admin/menu/images/${id}/replace`, form, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

/* ---------- ADMIN BRAND ---------- */
export const getBrands = async () => {
    const res = await api.get("/admin/brands");
    return res.data;
};

export const createBrand = async (formData) => {
    const res = await api.post("/admin/brands", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const updateBrand = async (brandId, formData) => {
    const res = await api.put(`/admin/brands/${brandId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const updateMenuLink = async (menuId, categoryId, externalUrl, internalUrl) => {
    await api.post("/admin/menu/update-link", {
        menuId,
        categoryId,
        externalUrl,
        internalUrl
    });
};
export const getPages = async () => {
    const res = await api.get("/admin/menu");
    return res.data;
};

export const createPage = async (data) => {
    const res = await api.post("/admin/menu", data);
    return res.data;
};


/* ---------- USER ---------- */
export const getUsers = async () => {
    const res = await api.get("/auth/users");
    return res.data;
};

export const createUser = async (data) => {
    const res = await api.post("/auth", data);
    return res.data;
};

export const updateUserPassword = async (id, password) => {
    const res = await api.put(`/auth/${id}`, { password });
    return res.data;
};
export const generateThumbnails = async () => {
    const res = await api.post("/admin/menu/generate-thumbnails");
    return res.data;
};

