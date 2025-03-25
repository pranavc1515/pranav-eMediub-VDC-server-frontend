import { useState } from 'react'
import type { DetailedHTMLProps, ImgHTMLAttributes } from 'react'

interface PlaceholderImageProps
    extends DetailedHTMLProps<
        ImgHTMLAttributes<HTMLImageElement>,
        HTMLImageElement
    > {
    fallbackWidth?: number | string
    fallbackHeight?: number | string
    fallbackText?: string
    fallbackColor?: string
    fallbackTextColor?: string
}

const PlaceholderImage = ({
    src,
    alt = '',
    fallbackWidth = '100%',
    fallbackHeight = '200px',
    fallbackText,
    fallbackColor = '#f5f5f5',
    fallbackTextColor = '#666',
    className = '',
    ...rest
}: PlaceholderImageProps) => {
    const [isError, setIsError] = useState(false)

    const handleError = () => {
        setIsError(true)
    }

    if (isError || !src) {
        return (
            <div
                className={`placeholder-image ${className}`}
                style={{
                    width: fallbackWidth,
                    height: fallbackHeight,
                    backgroundColor: fallbackColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: fallbackTextColor,
                    borderRadius: '4px',
                    fontSize: '14px',
                    ...rest.style,
                }}
                {...rest}
            >
                {fallbackText || alt || 'Image placeholder'}
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={alt}
            onError={handleError}
            className={className}
            {...rest}
        />
    )
}

export default PlaceholderImage 