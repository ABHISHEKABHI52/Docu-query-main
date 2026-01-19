import { forwardRef, type ImgHTMLAttributes, useState } from 'react'
import './image.css'

const FALLBACK_IMAGE_URL = "https://placehold.co/600x400?text=Image+Not+Found";

export type ImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fittingType?: 'fill' | 'fit'
  originWidth?: number
  originHeight?: number
  focalPointX?: number
  focalPointY?: number
}

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, fittingType = 'fill', ...props }, ref) => {
    const [imgSrc, setImgSrc] = useState<string | undefined>(src)
    const [hasError, setHasError] = useState(false)

    if (!src) {
      return <div data-empty-image ref={ref} {...props} />
    }

    const handleError = () => {
      if (!hasError) {
        setHasError(true)
        setImgSrc(FALLBACK_IMAGE_URL)
      }
    }

    const style = {
      objectFit: fittingType === 'fill' ? 'cover' as const : 'contain' as const,
      ...props.style,
    }

    return (
      <img
        ref={ref}
        src={imgSrc}
        onError={handleError}
        data-error-image={hasError}
        style={style}
        {...props}
      />
    )
  }
)

Image.displayName = 'Image'
