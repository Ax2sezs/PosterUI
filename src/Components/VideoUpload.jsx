import { useState, useRef, useCallback } from "react";
import { uploadVideo } from "../api/api";

const MAX_BYTES = 1024 * 1024 * 1024; // 1 GB
const ALLOWED_MIME = new Set(["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo", "video/x-matroska"]);
const ALLOWED_EXT = new Set([".mp4", ".webm", ".mov", ".avi", ".mkv"]);

function formatBytes(b) {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1024 ** 3) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function validate(file) {
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_MIME.has(file.type) || !ALLOWED_EXT.has(ext))
        return "Unsupported format. Allowed: MP4, WebM, MOV, AVI, MKV.";
    if (file.size > MAX_BYTES)
        return `File too large (${formatBytes(file.size)}). Maximum is 1 GB.`;
    return null;
}

export default function VideoUpload({ pageId, title, onUploaded }) {
    const [dragOver, setDragOver] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const inputRef = useRef(null);

    const handleFile = useCallback(async (file) => {
        setError(null);
        const err = validate(file);
        if (err) { setError(err); return; }

        setUploading(true);
        setProgress(0);
        try {
            const result = await uploadVideo(file, pageId, title, setProgress);
            onUploaded?.(result);
        } catch (e) {
            setError(e?.response?.data?.error ?? "Upload failed. Please try again.");
        } finally {
            setUploading(false);
            setProgress(0);
        }
    }, [pageId, title, onUploaded]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, [handleFile]);

    return (
        <div className="w-full">
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={[
                    "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-colors",
                    dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100",
                    uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                ].join(" ")}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
                    disabled={uploading}
                />

                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10l4.553-2.369A1 1 0 0121 8.557v6.886a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                </svg>

                {uploading ? (
                    <div className="w-full max-w-xs text-center">
                        <p className="text-sm text-gray-600 mb-2">Uploading… {progress}%</p>
                        <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-blue-500 transition-all duration-150"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-gray-700">Drag & drop a video here, or click to browse</p>
                        <p className="text-xs text-gray-400">MP4, WebM, MOV, AVI, MKV — up to 500 MB</p>
                    </>
                )}
            </div>

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
