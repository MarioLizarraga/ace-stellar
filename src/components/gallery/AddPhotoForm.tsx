import { useState } from 'react'
import { CitySearch } from '../dashboard/CitySearch'
import type { Photo } from '../../types'

interface AddPhotoFormProps {
  onSubmit: (photo: Photo, imageFile: File | null) => void
  onCancel: () => void
  saving: boolean
}

const CATEGORIES: Photo['category'][] = ['moon', 'milky-way', 'deep-sky', 'landscape', 'planetary']

const categoryLabels: Record<string, string> = {
  'moon': 'Moon',
  'milky-way': 'Milky Way',
  'deep-sky': 'Deep Sky',
  'landscape': 'Landscape',
  'planetary': 'Planetary',
}

export function AddPhotoForm({ onSubmit, onCancel, saving }: AddPhotoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<Photo['category']>('moon')
  const [tags, setTags] = useState('')
  const [featured, setFeatured] = useState(false)

  // Location
  const [locationName, setLocationName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')

  // EXIF
  const [camera, setCamera] = useState('')
  const [lens, setLens] = useState('')
  const [focalLength, setFocalLength] = useState('')
  const [aperture, setAperture] = useState('')
  const [shutter, setShutter] = useState('')
  const [iso, setIso] = useState('')

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = () => setImagePreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function handleSubmit() {
    if (!title.trim() || !locationName.trim() || !lat || !lng) return

    const id = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36)
    const fileName = imageFile ? `${id}.${imageFile.name.split('.').pop()}` : ''
    const src = imageFile ? `${import.meta.env.BASE_URL}photos/${fileName}` : '/photos/placeholder.jpg'

    const photo: Photo = {
      id,
      title: title.trim(),
      description: description.trim() || undefined,
      src,
      thumbnail: src,
      date,
      location: {
        name: locationName.trim(),
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      exif: {
        camera: camera.trim() || 'Unknown',
        lens: lens.trim() || 'Unknown',
        focalLength: focalLength.trim() || 'Unknown',
        aperture: aperture.trim() || 'Unknown',
        shutter: shutter.trim() || 'Unknown',
        iso: parseInt(iso, 10) || 0,
      },
      featured,
    }

    onSubmit(photo, imageFile)
  }

  return (
    <div className="bg-bg-surface/50 border border-border rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-text-primary">Add Photo</h3>
        <button onClick={onCancel} className="text-text-muted hover:text-text-primary text-sm">Cancel</button>
      </div>

      {/* Image upload */}
      <div>
        <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Image</label>
        <div className="flex items-start gap-4">
          <label className="flex-1 border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent/40 transition-colors">
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            <p className="text-sm text-text-muted">{imageFile ? imageFile.name : 'Click to select image'}</p>
          </label>
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
          )}
        </div>
      </div>

      {/* Title + Description */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Full Moon Over Big Bend"
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Description / Story</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell the story behind this shot — conditions, the experience, what made it special..."
            rows={3}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary resize-y"
          />
        </div>
      </div>

      {/* Date + Category + Featured */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          />
        </div>
        <div>
          <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Photo['category'])}
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{categoryLabels[c]}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer pb-2">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded border-border bg-bg-primary"
            />
            <span className="text-sm text-text-primary">Featured</span>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Tags (comma-separated)</label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="full-moon, landscape, national-park"
          className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
        />
      </div>

      {/* Location */}
      <div>
        <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Location *</label>
        <div className="space-y-2">
          <CitySearch
            onSelect={(city) => {
              const name = city.admin1
                ? `${city.name}, ${city.admin1}, ${city.country}`
                : `${city.name}, ${city.country}`
              setLocationName(name)
              setLat(city.latitude.toString())
              setLng(city.longitude.toString())
            }}
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Location name *"
              className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
            <input
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="Latitude *"
              type="number"
              step="any"
              className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
            <input
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="Longitude *"
              type="number"
              step="any"
              className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* EXIF */}
      <div>
        <label className="text-xs tracking-widest uppercase text-text-muted mb-1 block">Camera Details</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <input value={camera} onChange={(e) => setCamera(e.target.value)} placeholder="Camera body" className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <input value={lens} onChange={(e) => setLens(e.target.value)} placeholder="Lens" className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <input value={focalLength} onChange={(e) => setFocalLength(e.target.value)} placeholder="Focal length" className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <input value={aperture} onChange={(e) => setAperture(e.target.value)} placeholder="Aperture (f/2.8)" className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <input value={shutter} onChange={(e) => setShutter(e.target.value)} placeholder="Shutter (1/250s)" className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
          <input value={iso} onChange={(e) => setIso(e.target.value)} placeholder="ISO" type="number" className="bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary" />
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={saving || !title.trim() || !locationName.trim() || !lat || !lng}
        className="w-full bg-accent text-white rounded-lg px-4 py-3 text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
      >
        {saving ? 'Uploading & saving...' : 'Add Photo'}
      </button>
    </div>
  )
}
