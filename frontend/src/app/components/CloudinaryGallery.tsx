import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Image as ImageIcon, Loader2, Copy, Check, ExternalLink } from 'lucide-react';

interface CloudinaryImage {
  url: string;
  public_id: string;
  created_at: string;
  width?: number;
  height?: number;
}

export default function CloudinaryGallery() {
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : 'https://unigreen-backend.onrender.com');

  // Fetch images from backend
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/images`);
      const data = await res.json();
      if (data.success) {
        setImages(data.images);
      } else {
        console.warn('Failed to load pre-existing images, directory might be empty.');
      }
    } catch (err: any) {
      console.error('Error fetching images:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showError('Please upload an image file (PNG, JPG, WEBP, etc.).');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${apiBaseUrl}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload server error');
      }

      const data = await res.json();
      if (data.success) {
        showSuccess('Image successfully pushed to Cloudinary!');
        // Prepend new image to local list
        setImages((prev) => [
          {
            url: data.url,
            public_id: data.public_id,
            created_at: new Date().toISOString(),
            width: data.width,
            height: data.height,
          },
          ...prev,
        ]);
      } else {
        showError(data.error || 'Failed to upload image.');
      }
    } catch (err: any) {
      showError('Unable to connect to the backend. Ensure your backend server is running on port 5000.');
      console.error(err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 6000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <section id="cloudinary-gallery" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-black/40">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#00FF66]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className="text-[10px] tracking-widest text-[#00FF66] uppercase mb-3 inline-block px-3 py-1 rounded-full bg-[#00FF66]/10 border border-[#00FF66]/20"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Cloudinary Integration
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Push Photos directly onto <span className="text-[#00FF66] green-glow-text">Cloudinary</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg">
            This module connects your web interface directly to the backend Express server, uploading image assets into your Cloudinary folder (<code className="text-[#00FF66] bg-neutral-900/80 px-1.5 py-0.5 rounded font-mono text-sm">Unigreen-cloud-images</code>).
          </p>
        </div>

        {/* Feedback Messages */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center mb-8 max-w-xl mx-auto text-sm"
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-[#00FF66]/10 border border-[#00FF66]/20 text-[#00FF66] p-4 rounded-xl text-center mb-8 max-w-xl mx-auto text-sm"
            >
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Container */}
        <div className="max-w-2xl mx-auto mb-16">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 backdrop-blur-md relative overflow-hidden group ${dragActive
                ? 'border-[#00FF66] bg-[#00FF66]/5 shadow-[0_0_30px_rgba(0,255,102,0.1)]'
                : 'border-neutral-800 bg-[#0e0e0e]/80 hover:border-neutral-700'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />

            <div className="flex flex-col items-center justify-center gap-4">
              {uploading ? (
                <>
                  <div className="p-4 rounded-full bg-neutral-900 border border-neutral-800 text-[#00FF66] animate-pulse">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Uploading to Cloudinary...</h3>
                    <p className="text-sm text-neutral-500 mt-1">Please wait while we process your image.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-full bg-neutral-900 border border-[#00FF66]/10 text-[#00FF66] group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,255,102,0.03)] group-hover:shadow-[0_0_25px_rgba(0,255,102,0.1)]">
                    <Upload size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-[#00FF66] transition-colors duration-200">
                      Upload an Image
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      Drag & drop your file here, or click to browse
                    </p>
                  </div>
                  <span className="text-xs text-neutral-600 font-mono">
                    Supports PNG, JPG, JPEG, WEBP, GIF up to 10MB
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div>
          <h3
            className="text-xs tracking-widest text-neutral-500 uppercase mb-6 font-semibold"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Gallery ({images.length} assets uploaded)
          </h3>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-3">
              <Loader2 className="animate-spin text-[#00FF66]" size={28} />
              <span className="text-sm font-mono">Fetching images...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 border border-neutral-900 rounded-2xl bg-neutral-950/20 text-neutral-500 flex flex-col items-center justify-center gap-3">
              <ImageIcon size={32} className="text-neutral-700" />
              <p className="text-sm">No images uploaded yet.</p>
              <p className="text-xs text-neutral-600 max-w-xs">Upload your first image above to see it dynamically appear in this gallery grid.</p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {images.map((img) => (
                  <motion.div
                    key={img.public_id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="group relative rounded-xl border border-neutral-900 bg-neutral-950/80 overflow-hidden flex flex-col justify-between hover:border-neutral-700/80 transition-all duration-300"
                  >
                    {/* Image Aspect ratio box */}
                    <div className="aspect-[4/3] w-full overflow-hidden bg-neutral-900 relative">
                      <img
                        src={img.url}
                        alt={img.public_id}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-10">
                        <button
                          onClick={() => copyToClipboard(img.url, img.public_id)}
                          className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white hover:text-[#00FF66] hover:border-[#00FF66]/30 transition-all duration-200"
                          title="Copy Image URL"
                        >
                          {copiedId === img.public_id ? <Check size={16} className="text-[#00FF66]" /> : <Copy size={16} />}
                        </button>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white hover:text-[#00FF66] hover:border-[#00FF66]/30 transition-all duration-200"
                          title="Open Image"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 border-t border-neutral-900/50 flex flex-col gap-1 text-[11px] font-mono text-neutral-500 bg-black/30">
                      <div className="text-xs font-semibold text-neutral-300 truncate" title={img.public_id}>
                        {img.public_id.split('/').pop()}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span>{new Date(img.created_at).toLocaleDateString()}</span>
                        {img.width && img.height && (
                          <span>{img.width} × {img.height} px</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
