import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageTransition } from '../components/layout/PageTransition'
import { PhotoGrid } from '../components/gallery/PhotoGrid'
import { FilterBar } from '../components/gallery/FilterBar'
import { Lightbox } from '../components/gallery/Lightbox'
import { AddPhotoForm } from '../components/gallery/AddPhotoForm'
import {
  isGitHubConfigured,
  addPhotoToRepo,
  removePhotoFromRepo,
  updatePhotoInRepo,
  uploadImageToRepo,
} from '../lib/github-api'
import photosData from '../data/photos.json'
import type { Photo } from '../types'

export function GalleryPage() {
  const [searchParams] = useSearchParams()
  const locationFilter = searchParams.get('location')

  const [photos, setPhotos] = useState(photosData as Photo[])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string | null>(locationFilter)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'featured'>('newest')
  const [lightboxIndex, setLightboxIndex] = useState(-1)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const ghConfigured = isGitHubConfigured()

  const categories = useMemo(
    () => [...new Set(photos.map((p) => p.category))],
    [photos],
  )

  const locations = useMemo(
    () => [...new Set(photos.map((p) => p.location.name))],
    [photos],
  )

  const filteredPhotos = useMemo(() => {
    let result = [...photos]

    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory)
    }
    if (activeLocation) {
      result = result.filter((p) => p.location.name === activeLocation)
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.date.localeCompare(a.date))
        break
      case 'oldest':
        result.sort((a, b) => a.date.localeCompare(b.date))
        break
      case 'featured':
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
    }

    return result
  }, [photos, activeCategory, activeLocation, sortBy])

  async function handleAddPhoto(photo: Photo, imageFile: File | null) {
    setSaving(true)
    setStatusMsg('Uploading...')

    try {
      // Upload image first if provided
      if (imageFile && ghConfigured) {
        const fileName = `${photo.id}.${imageFile.name.split('.').pop()}`
        const reader = new FileReader()
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(',')[1]) // strip data:image/...;base64, prefix
          }
          reader.readAsDataURL(imageFile)
        })
        const src = await uploadImageToRepo(fileName, base64)
        photo.src = src
        photo.thumbnail = src
      }

      // Optimistic UI
      setPhotos([...photos, photo])
      setShowAddForm(false)

      // Persist to repo
      if (ghConfigured) {
        setStatusMsg('Saving to GitHub...')
        await addPhotoToRepo(photo)
        setStatusMsg('Photo saved! Site will redeploy in ~30s.')
        setTimeout(() => setStatusMsg(null), 4000)
      } else {
        setStatusMsg('Photo added locally (connect GitHub to persist)')
        setTimeout(() => setStatusMsg(null), 4000)
      }
    } catch (err) {
      setStatusMsg(`Failed: ${err instanceof Error ? err.message : 'unknown error'}`)
      setTimeout(() => setStatusMsg(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletePhoto(id: string) {
    setPhotos(photos.filter((p) => p.id !== id))
    setLightboxIndex(-1)

    if (ghConfigured) {
      setSaving(true)
      setStatusMsg('Deleting from GitHub...')
      try {
        await removePhotoFromRepo(id)
        setStatusMsg('Photo deleted. Site will redeploy in ~30s.')
        setTimeout(() => setStatusMsg(null), 4000)
      } catch (err) {
        setStatusMsg(`Delete failed: ${err instanceof Error ? err.message : 'unknown error'}`)
        setTimeout(() => setStatusMsg(null), 5000)
      } finally {
        setSaving(false)
      }
    }
  }

  async function handleUpdatePhoto(updated: Photo) {
    setPhotos(photos.map((p) => p.id === updated.id ? updated : p))

    if (ghConfigured) {
      setSaving(true)
      setStatusMsg('Saving changes to GitHub...')
      try {
        await updatePhotoInRepo(updated)
        setStatusMsg('Photo updated. Site will redeploy in ~30s.')
        setTimeout(() => setStatusMsg(null), 4000)
      } catch (err) {
        setStatusMsg(`Update failed: ${err instanceof Error ? err.message : 'unknown error'}`)
        setTimeout(() => setStatusMsg(null), 5000)
      } finally {
        setSaving(false)
      }
    }
  }

  return (
    <PageTransition>
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extralight tracking-widest">
            GAL<span className="font-bold">LERY</span>
          </h1>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/ace.stellar.photography"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent text-sm hover:underline hidden sm:inline"
            >
              @ace.stellar.photography
            </a>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs text-accent hover:underline"
            >
              {showAddForm ? 'Cancel' : '+ Add Photo'}
            </button>
          </div>
        </div>

        {/* Status message */}
        {statusMsg && (
          <div className={`mb-4 text-xs px-3 py-2 rounded-lg border ${
            statusMsg.includes('Failed')
              ? 'bg-astro-red/10 border-astro-red/30 text-astro-red'
              : 'bg-accent/10 border-accent/30 text-accent'
          }`}>
            {saving && '⏳ '}{statusMsg}
          </div>
        )}

        {showAddForm && (
          <div className="mb-8">
            <AddPhotoForm
              onSubmit={handleAddPhoto}
              onCancel={() => setShowAddForm(false)}
              saving={saving}
            />
          </div>
        )}

        <FilterBar
          categories={categories}
          activeCategory={activeCategory}
          locations={locations}
          activeLocation={activeLocation}
          sortBy={sortBy}
          onCategoryChange={setActiveCategory}
          onLocationChange={setActiveLocation}
          onSortChange={setSortBy}
        />

        <PhotoGrid
          photos={filteredPhotos}
          onPhotoClick={setLightboxIndex}
        />

        <Lightbox
          photos={filteredPhotos}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex >= 0}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={setLightboxIndex}
          onDelete={handleDeletePhoto}
          onUpdate={handleUpdatePhoto}
        />
      </div>
    </PageTransition>
  )
}
