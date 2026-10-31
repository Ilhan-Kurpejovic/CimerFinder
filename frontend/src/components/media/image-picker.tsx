import { useRef, useState } from 'react'
import { Camera, ImagePlus, LoaderCircle, Star, X } from 'lucide-react'
import type { ImageSelection } from '@/lib/use-image-selection'
export function ImagePicker({
  selection,
  disabled = false,
}: {
  selection: ImageSelection
  disabled?: boolean
}) {
  const input = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const blocked = disabled || selection.busy
  return (
    <div className={'image-picker ' + (selection.purpose === 'avatar' ? 'avatar-picker' : '')}>
      <div className="image-picker-title">
        <strong>{selection.purpose === 'avatar' ? 'Profilna fotografija' : 'Fotografije prostora'}</strong>
        <span>
          {selection.values.length} / {selection.limit}
        </span>
      </div>
      <div className="image-preview-grid">
        {selection.values.map((url, index) => (
          <div className="image-preview-tile" key={url}>
            <img
              src={url}
              alt={
                selection.purpose === 'avatar'
                  ? 'Pregled profilne fotografije'
                  : 'Fotografija oglasa ' + (index + 1)
              }
            />
            <button
              className="image-remove"
              type="button"
              disabled={blocked}
              aria-label={'Ukloni fotografiju ' + (index + 1)}
              onClick={() => selection.remove(index)}
            >
              <X size={16} />
            </button>
            {selection.limit > 1 && (
              <button
                type="button"
                disabled={blocked || index === 0}
                className={'image-cover ' + (index === 0 ? 'active' : '')}
                onClick={() => selection.cover(index)}
                aria-label={'Postavi fotografiju ' + (index + 1) + ' kao naslovnu'}
              >
                <Star size={12} fill={index === 0 ? 'currentColor' : 'none'} />
                {index === 0 ? 'Naslovna' : 'Postavi kao naslovnu'}
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className={'image-drop-zone ' + (dragging ? 'is-dragging' : '')}
        type="button"
        disabled={blocked || (selection.limit > 1 && selection.values.length >= selection.limit)}
        onClick={() => input.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          if (!blocked) setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragging(false)
          if (!blocked) void selection.select(Array.from(event.dataTransfer.files))
        }}
      >
        <span>
          {selection.busy ? (
            <LoaderCircle className="spin" size={25} />
          ) : selection.purpose === 'avatar' ? (
            <Camera size={25} />
          ) : (
            <ImagePlus size={25} />
          )}
        </span>
        <strong>
          {selection.busy
            ? 'Obrađujem fotografije...'
            : selection.limit === 1 && selection.values.length
              ? 'Zamijeni fotografiju'
              : 'Dodaj fotografije'}
        </strong>
        <small>Izaberi sa uređaja ili prevuci ovdje</small>
        <small>JPG, PNG ili WebP · do 5 MB po fotografiji</small>
      </button>
      <input
        ref={input}
        className="sr-only"
        type="file"
        aria-label="Izaberi fotografije sa uređaja"
        accept="image/jpeg,image/png,image/webp"
        multiple={selection.limit > 1}
        disabled={blocked}
        onChange={(event) => {
          const files = Array.from(event.target.files || [])
          event.target.value = ''
          void selection.select(files)
        }}
      />
      {selection.error && (
        <p className="field-error" role="alert">
          {selection.error}
        </p>
      )}
      {selection.busy && (
        <p role="status" className="muted">
          Sačekaj da se upload završi prije čuvanja.
        </p>
      )}
      <p className="photo-save-hint">
        {selection.limit === 1
          ? 'Promjena se primjenjuje kada sačuvaš profil.'
          : 'Prva fotografija je naslovna. Izmjene se primjenjuju kada sačuvaš oglas.'}
      </p>
    </div>
  )
}
