import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
export function ListingGallery({
  urls,
  title,
  profile = false,
}: {
  urls: string[]
  title: string
  profile?: boolean
}) {
  const [selected, setSelected] = useState(0)
  const images = urls.length ? urls : ['/room-placeholder.svg']
  const active = Math.min(selected, images.length - 1)
  return (
    <div className="listing-gallery">
      <div className="gallery-main">
        <img
          className={'detail-image ' + (profile ? 'profile-image' : '')}
          src={images[active]}
          alt={title + ' — fotografija ' + (active + 1)}
        />
        {images.length > 1 && (
          <>
            <button
              className="gallery-arrow previous"
              aria-label="Prethodna fotografija"
              onClick={() => setSelected((active + images.length - 1) % images.length)}
            >
              <ChevronLeft size={21} />
            </button>
            <span className="gallery-counter">
              {active + 1} / {images.length}
            </span>
            <button
              className="gallery-arrow next"
              aria-label="Sljedeća fotografija"
              onClick={() => setSelected((active + 1) % images.length)}
            >
              <ChevronRight size={21} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((url, index) => (
            <button
              key={url}
              className={index === active ? 'active' : ''}
              aria-pressed={index === active}
              aria-label={'Prikaži fotografiju ' + (index + 1)}
              onClick={() => setSelected(index)}
            >
              <img src={url} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
