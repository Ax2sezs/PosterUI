import { useState } from "react";
import { baseUrl, deleteVideo } from "../api/api";

function formatBytes(b) {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    if (b < 1024 ** 3) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
    return `${(b / 1024 ** 3).toFixed(2)} GB`;
}

function formatDuration(s) {
    if (!s) return null;
    const m = Math.floor(s / 60);
    return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
}

export default function VideoPlayer({ video, onDeleted }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        if (!confirm("Delete this video? This cannot be undone.")) return;
        setDeleting(true);
        setError(null);
        try {
            await deleteVideo(video.id);
            onDeleted?.(video.id);
        } catch {
            setError("Delete failed. Please try again.");
            setDeleting(false);
        }
    };

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
            <div className="bg-black">
                <video
                    key={video.id}
                    controls
                    preload="metadata"
                    poster={video.thumbnailUrl ? `${baseUrl}${video.thumbnailUrl}` : undefined}
                    className="w-full max-h-64 object-contain"
                >
                    <source src={`${baseUrl}${video.videoUrl}`} type={video.mimeType} />
                </video>
            </div>

            <div className="p-3">
                {video.title && (
                    <p className="text-sm font-medium text-gray-800 mb-1 truncate">{video.title}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{video.mimeType?.split("/")[1]?.toUpperCase()}</span>
                    <span>{formatBytes(video.fileSize)}</span>
                    {video.duration != null && <span>{formatDuration(video.duration)}</span>}
                </div>

                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="mt-2 w-full rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                >
                    {deleting ? "Deleting…" : "Delete"}
                </button>
            </div>
        </div>
    );
}
