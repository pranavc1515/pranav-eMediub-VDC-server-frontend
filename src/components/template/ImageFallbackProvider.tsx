import { ReactNode, useEffect } from 'react'

interface ImageFallbackProviderProps {
    children: ReactNode
    fallbackColor?: string
    fallbackTextColor?: string
}

const ImageFallbackProvider = ({
    children,
    fallbackColor = '#f5f5f5',
    fallbackTextColor = '#666',
}: ImageFallbackProviderProps) => {
    useEffect(() => {
        // Create a style for placeholder images
        const style = document.createElement('style')
        style.innerHTML = `
            .img-placeholder {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: ${fallbackColor};
                color: ${fallbackTextColor};
                font-size: 14px;
                border-radius: 4px;
                text-align: center;
                padding: 10px;
            }
        `
        document.head.appendChild(style)

        // Handle all image error events globally
        const handleImageError = (event: Event) => {
            const img = event.target as HTMLImageElement
            if (!img.dataset.hasPlaceholder) {
                // Save original dimensions
                const width = img.width || 100
                const height = img.height || 100
                const alt = img.alt || 'Image'

                // Create placeholder div
                const placeholder = document.createElement('div')
                placeholder.className = 'img-placeholder'
                placeholder.style.width = `${width}px`
                placeholder.style.height = `${height}px`
                placeholder.textContent = alt

                // Replace image with placeholder
                img.parentNode?.insertBefore(placeholder, img)
                img.style.display = 'none'
                img.dataset.hasPlaceholder = 'true'
            }
        }

        // Add global listener for image errors
        document.addEventListener(
            'error',
            (event) => {
                if (event.target instanceof HTMLImageElement) {
                    handleImageError(event)
                }
            },
            true,
        )

        return () => {
            document.removeEventListener('error', handleImageError, true)
            document.head.removeChild(style)
        }
    }, [fallbackColor, fallbackTextColor])

    return <>{children}</>
}

export default ImageFallbackProvider
