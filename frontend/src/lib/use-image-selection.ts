import { useEffect, useRef, useState } from 'react'
import { apiMessage } from './api-client'
import { mediaApi } from './media-api'
import type { UploadedImage } from './media-api'
export function useImageSelection(initial: string[], purpose: 'avatar' | 'listing', limit: number) {
  const [values, setValues] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const baseline = useRef(initial)
  const current = useRef(initial)
  const created = useRef<UploadedImage[]>([])
  const mounted = useRef(true)
  const working = useRef(false)
  const discard = (asset: UploadedImage) => {
    void mediaApi.remove(asset.id).catch(() => {
      /* Already attached/deleted assets remain controlled by the server. */
    })
  }
  const change = (next: string[]) => {
    current.current = next
    setValues(next)
  }
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      for (const asset of created.current) if (!baseline.current.includes(asset.url)) discard(asset)
    }
  }, [])
  const select = async (files: File[]) => {
    if (working.current || !files.length) return
    if ((limit === 1 ? files.length : current.current.length + files.length) > limit) {
      setError('Možeš dodati najviše ' + limit + (limit === 1 ? ' fotografiju.' : ' fotografija.'))
      return
    }
    if (
      files.some(
        (file) =>
          !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024,
      )
    ) {
      setError('Izaberi JPG, PNG ili WebP fotografije do 5 MB.')
      return
    }
    working.current = true
    setBusy(true)
    setError('')
    try {
      for (const file of files) {
        const asset = await mediaApi.upload(file, purpose)
        if (!mounted.current) {
          discard(asset)
          continue
        }
        created.current.push(asset)
        const previous = current.current
        const next = limit === 1 ? [asset.url] : [...previous, asset.url]
        for (const old of created.current)
          if (previous.includes(old.url) && !next.includes(old.url) && !baseline.current.includes(old.url))
            discard(old)
        change(next)
      }
    } catch (cause) {
      if (mounted.current) setError(apiMessage(cause))
    } finally {
      working.current = false
      if (mounted.current) setBusy(false)
    }
  }
  const remove = (index: number) => {
    const url = current.current[index]
    const asset = created.current.find((image) => image.url === url)
    if (asset && !baseline.current.includes(url)) {
      discard(asset)
      created.current = created.current.filter((image) => image.id !== asset.id)
    }
    change(current.current.filter((_, at) => at !== index))
    setError('')
  }
  const cover = (index: number) => {
    const next = [...current.current]
    const [url] = next.splice(index, 1)
    next.unshift(url)
    change(next)
  }
  const reset = (next: string[]) => {
    for (const asset of created.current)
      if (!next.includes(asset.url) && !baseline.current.includes(asset.url)) discard(asset)
    created.current = created.current.filter(
      (asset) => next.includes(asset.url) || baseline.current.includes(asset.url),
    )
    change(next)
    setError('')
  }
  const commit = (saved: string[]) => {
    baseline.current = saved
    for (const asset of created.current) if (!saved.includes(asset.url)) discard(asset)
    created.current = created.current.filter((asset) => saved.includes(asset.url))
  }
  return { values, busy, error, select, remove, cover, reset, commit, limit, purpose }
}
export type ImageSelection = ReturnType<typeof useImageSelection>
