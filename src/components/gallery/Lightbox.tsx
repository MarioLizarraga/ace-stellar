import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import type { Photo } from '../../types'

interface LightboxProps {
  photos: Photo[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNavigate: (index: number) => void
  onDelete?: (id: string) => void
  onUpdate?: (photo: Photo) => void
}

const CATEGORIES: Photo['category'][] = ['moon', 'milky-way', 'deep-sky', 'landscape', 'planetary']
const categoryLabels: Record<string, string> = {
  'moon': 'Moon', 'milky-way': 'Milky Way', 'deep-sky': 'Deep Sky', 'landscape': 'Landscape', 'planetary': 'Planetary',
}

export function Lightbox({ photos, currentIndex, isOpen, onClose, onNavigate, onDelete, onUpdate }: LightboxProps) {
  const photo = photos[currentIndex]
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCategory, setEditCategory] = useState<Photo['category']>('moon')
  const [editTags, setEditTags] = useState('')
  const [editLocationName, setEditLocationName] = useState('')
  const [editLat, setEditLat] = useState('')
  const [editLng, setEditLng] = useState('')
  const [editCamera, setEditCamera] = useState('')
  const [editLens, setEditLens] = useState('')
  const [editFocalLength, setEditFocalLength] = useState('')
  const [editAperture, setEditAperture] = useState('')
  const [editShutter, setEditShutter] = useState('')
  const [editIso, setEditIso] = useState('')
  const [editFeatured, setEditFeatured] = useState(false)

  // Reset edit state when photo changes
  useEffect(() => {
    if (photo) {
      setEditTitle(photo.title)
      setEditDescription(photo.description || '')
      setEditDate(photo.date)
      setEditCategory(photo.category)
      setEditTags(photo.tags.join(', '))
      setEditLocationName(photo.location.name)
      setEditLat(photo.location.lat.toString())
      setEditLng(photo.location.lng.toString())
      setEditCamera(photo.exif.camera)
      setEditLens(photo.exif.lens)
      setEditFocalLength(photo.exif.focalLength)
      setEditAperture(photo.exif.aperture)
      setEditShutter(photo.exif.shutter)
      setEditIso(photo.exif.iso.toString())
      setEditFeatured(photo.featured)
    }
    setEditing(false)
    setConfirmDelete(false)
  }, [photo])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (editing) return
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1)
      if (e.key === 'ArrowRight' && currentIndex < photos.length - 1) onNavigate(currentIndex + 1)
    },
    [currentIndex, photos.length, onClose, onNavigate, editing],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  function handleSaveEdit() {
    if (!photo || !onUpdate) return
    const updated: Photo = {
      ...photo,
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      date: editDate,
      category: editCategory,
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
      location: {
        name: editLocationName.trim(),
        lat: parseFloat(editLat) || photo.location.lat,
        lng: parseFloat(editLng) || photo.location.lng,
      },
      exif: {
        camera: editCamera.trim() || 'Unknown',
        lens: editLens.trim() || 'Unknown',
        focalLength: editFocalLength.trim() || 'Unknown',
        aperture: editAperture.trim() || 'Unknown',
        shutter: editShutter.trim() || 'Unknown',
        iso: parseInt(editIso, 10) || 0,
      },
      featured: editFeatured,
    }
    onUpdate(updated)
    setEditing(false)
  }

  if (!isOpen || !photo) return null

  const content = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, zIndex: 99999 }}
        className="bg-black flex"
        onClick={editing ? undefined : onClose}
      >
        {/* Close button */}
        <button
          onClick={() => { setEditing(false); onClose() }}
          className="absolute top-6 left-6 z-10 text-white/60 hover:text-white text-2xl w-10 h-10 flex items-center justify-center"
        >
          ✕
        </button>

        {/* Left arrow */}
        {!editing && currentIndex > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1) }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white text-5xl"
          >
            ‹
          </button>
        )}

        {/* Right arrow */}
        {!editing && currentIndex < photos.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1) }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/40 hover:text-white text-5xl md:right-[340px]"
          >
            ›
          </button>
        )}

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
          <motion.img
            key={photo.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={photo.src}
            alt={photo.title}
            className="max-h-[95vh] max-w-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>

        {/* Detail / Edit panel */}
        <motion.div
          initial={{ x: 320 }}
          animate={{ x: 0 }}
          className="hidden md:flex md:flex-col w-80 bg-[#0a0a1a] border-l border-[#2a2a4a] overflow-y-auto shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pt-8 flex-1">
            {/* Action buttons */}
            <div className="flex gap-2 mb-4">
              {onUpdate && (
                <button
                  onClick={() => { setEditing(!editing); setConfirmDelete(false) }}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                    editing ? 'border-accent text-accent' : 'border-[#2a2a4a] text-[#6b7280] hover:text-[#e8e8ff]'
                  }`}
                >
                  {editing ? 'Cancel Edit' : 'Edit'}
                </button>
              )}
              {onDelete && (
                confirmDelete ? (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { onDelete(photo.id); onClose() }}
                      className="text-[10px] px-2 py-1 rounded border border-red-500/50 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[10px] px-2 py-1 rounded border border-[#2a2a4a] text-[#6b7280] hover:text-[#e8e8ff] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="text-[10px] px-2 py-1 rounded border border-[#2a2a4a] text-[#6b7280] hover:text-red-400 hover:border-red-500/50 transition-colors"
                  >
                    Delete
                  </button>
                )
              )}
            </div>

            {editing ? (
              /* Edit form */
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Title</label>
                  <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Description</label>
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff] resize-y" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Date Taken</label>
                  <input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Category</label>
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value as Photo['category'])}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Tags (comma-separated)</label>
                  <input value={editTags} onChange={(e) => setEditTags(e.target.value)}
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Location</label>
                  <input value={editLocationName} onChange={(e) => setEditLocationName(e.target.value)} placeholder="Location name"
                    className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff] mb-1" />
                  <div className="flex gap-1">
                    <input value={editLat} onChange={(e) => setEditLat(e.target.value)} placeholder="Lat" type="number" step="any"
                      className="flex-1 bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                    <input value={editLng} onChange={(e) => setEditLng(e.target.value)} placeholder="Lng" type="number" step="any"
                      className="flex-1 bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-[#6b7280] mb-1 block">Camera Details</label>
                  <div className="space-y-1">
                    <input value={editCamera} onChange={(e) => setEditCamera(e.target.value)} placeholder="Camera"
                      className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                    <input value={editLens} onChange={(e) => setEditLens(e.target.value)} placeholder="Lens"
                      className="w-full bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                    <div className="flex gap-1">
                      <input value={editFocalLength} onChange={(e) => setEditFocalLength(e.target.value)} placeholder="Focal"
                        className="flex-1 bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                      <input value={editAperture} onChange={(e) => setEditAperture(e.target.value)} placeholder="f/"
                        className="flex-1 bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                    </div>
                    <div className="flex gap-1">
                      <input value={editShutter} onChange={(e) => setEditShutter(e.target.value)} placeholder="Shutter"
                        className="flex-1 bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                      <input value={editIso} onChange={(e) => setEditIso(e.target.value)} placeholder="ISO" type="number"
                        className="flex-1 bg-[#111] border border-[#2a2a4a] rounded px-2 py-1.5 text-sm text-[#e8e8ff]" />
                    </div>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editFeatured} onChange={(e) => setEditFeatured(e.target.checked)}
                    className="w-4 h-4 rounded" />
                  <span className="text-sm text-[#e8e8ff]">Featured</span>
                </label>
                <button
                  onClick={handleSaveEdit}
                  className="w-full bg-[#4a6fa5] text-white rounded py-2 text-sm font-medium hover:bg-[#4a6fa5]/80 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              /* View mode */
              <>
                <h2 className="text-lg font-semibold text-[#e8e8ff] mb-2">{photo.title}</h2>

                {photo.description && (
                  <p className="text-[#6b7280] text-sm mb-4 leading-relaxed">{photo.description}</p>
                )}

                <p className="text-[#6b7280] text-sm mb-1">{photo.location.name}</p>
                <p className="text-[#6b7280] text-xs mb-1">
                  {photo.location.lat.toFixed(4)}, {photo.location.lng.toFixed(4)}
                </p>
                <p className="text-[#6b7280] text-xs mb-6">
                  {new Date(photo.date + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <div className="space-y-3 mb-6">
                  <h3 className="text-xs tracking-widest uppercase text-[#6b7280]">Camera Details</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ['Camera', photo.exif.camera],
                      ['Lens', photo.exif.lens],
                      ['Focal Length', photo.exif.focalLength],
                      ['Aperture', photo.exif.aperture],
                      ['Shutter', photo.exif.shutter],
                      ['ISO', String(photo.exif.iso)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-[#6b7280]">{label}</span>
                        <span className="text-[#e8e8ff]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-[#1a1a3e] border border-[#2a2a4a] rounded-full text-xs text-[#6b7280]">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return createPortal(content, document.body)
}
