const REPO_OWNER = 'MarioLizarraga'
const REPO_NAME = 'ace-stellar'

// Token is baked in at build time via VITE_GH_TOKEN env var.
// Falls back to localStorage for local development.
const BUILT_IN_TOKEN = import.meta.env.VITE_GH_TOKEN as string | undefined

function getToken(): string | null {
  return BUILT_IN_TOKEN || localStorage.getItem('ace-stellar-gh-token') || null
}

export function isGitHubConfigured(): boolean {
  return !!getToken()
}

export function hasBakedToken(): boolean {
  return !!BUILT_IN_TOKEN
}

export function setGitHubToken(token: string) {
  localStorage.setItem('ace-stellar-gh-token', token)
}

export function clearGitHubToken() {
  localStorage.removeItem('ace-stellar-gh-token')
}

// UTF-8 safe base64 encoding (btoa only handles Latin1)
function utf8ToBase64(str: string): string {
  return btoa(
    new TextEncoder().encode(str).reduce((data, byte) => data + String.fromCharCode(byte), '')
  )
}

interface GitHubFileResponse {
  content: string
  sha: string
}

async function getFile(path: string): Promise<GitHubFileResponse> {
  const token = getToken()
  if (!token) throw new Error('GitHub token not configured')

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    { headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' } },
  )
  if (!response.ok) throw new Error(`GitHub API error: ${response.status}`)
  const data = await response.json()
  return { content: atob(data.content), sha: data.sha }
}

async function updateFile(path: string, content: string, sha: string, message: string): Promise<void> {
  const token = getToken()
  if (!token) throw new Error('GitHub token not configured')

  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
      body: JSON.stringify({ message, content: utf8ToBase64(content), sha }),
    },
  )
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || `GitHub API error: ${response.status}`)
  }
}

export interface SavedLocationData {
  id: string
  name: string
  lat: number
  lng: number
  bortle: number
}

const LOCATIONS_PATH = 'src/data/locations.json'

export async function addLocationToRepo(location: SavedLocationData): Promise<void> {
  const file = await getFile(LOCATIONS_PATH)
  const locations: SavedLocationData[] = JSON.parse(file.content)
  locations.push(location)
  const newContent = JSON.stringify(locations, null, 2) + '\n'
  await updateFile(LOCATIONS_PATH, newContent, file.sha, `feat: add location "${location.name}"`)
}

export async function removeLocationFromRepo(id: string): Promise<void> {
  const file = await getFile(LOCATIONS_PATH)
  const locations: SavedLocationData[] = JSON.parse(file.content)
  const filtered = locations.filter((l) => l.id !== id)
  if (filtered.length === locations.length) return
  const removed = locations.find((l) => l.id === id)
  const newContent = JSON.stringify(filtered, null, 2) + '\n'
  await updateFile(LOCATIONS_PATH, newContent, file.sha, `feat: remove location "${removed?.name || id}"`)
}

// --- Photos CRUD ---

import type { Photo } from '../types'

const PHOTOS_PATH = 'src/data/photos.json'

export async function addPhotoToRepo(photo: Photo): Promise<void> {
  const file = await getFile(PHOTOS_PATH)
  const photos: Photo[] = JSON.parse(file.content)
  photos.push(photo)
  const newContent = JSON.stringify(photos, null, 2) + '\n'
  await updateFile(PHOTOS_PATH, newContent, file.sha, `feat: add photo "${photo.title}"`)
}

export async function removePhotoFromRepo(id: string): Promise<void> {
  const file = await getFile(PHOTOS_PATH)
  const photos: Photo[] = JSON.parse(file.content)
  const filtered = photos.filter((p) => p.id !== id)
  if (filtered.length === photos.length) return
  const removed = photos.find((p) => p.id === id)
  const newContent = JSON.stringify(filtered, null, 2) + '\n'
  await updateFile(PHOTOS_PATH, newContent, file.sha, `feat: remove photo "${removed?.title || id}"`)
}

export async function updatePhotoInRepo(updatedPhoto: Photo): Promise<void> {
  const file = await getFile(PHOTOS_PATH)
  const photos: Photo[] = JSON.parse(file.content)
  const idx = photos.findIndex((p) => p.id === updatedPhoto.id)
  if (idx === -1) throw new Error('Photo not found')
  photos[idx] = updatedPhoto
  const newContent = JSON.stringify(photos, null, 2) + '\n'
  await updateFile(PHOTOS_PATH, newContent, file.sha, `feat: update photo "${updatedPhoto.title}"`)
}

export async function uploadImageToRepo(
  fileName: string,
  base64Content: string,
): Promise<string> {
  const token = getToken()
  if (!token) throw new Error('GitHub token not configured')

  const path = `public/photos/${fileName}`
  const response = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.v3+json' },
      body: JSON.stringify({
        message: `feat: upload photo ${fileName}`,
        content: base64Content,
      }),
    },
  )
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || `Upload failed: ${response.status}`)
  }
  return `${import.meta.env.BASE_URL}photos/${fileName}`
}

export async function verifyToken(): Promise<boolean> {
  const token = getToken()
  if (!token) return false
  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return response.ok
  } catch {
    return false
  }
}
