import { cloneElement, Suspense, useEffect, useState } from 'react'

export function DeferredSection({ children, fallback, rootMargin = '800px 0px' }) {
  const [anchorNode, setAnchorNode] = useState(null)
  const [shouldRender, setShouldRender] = useState(() => (
    typeof window === 'undefined' || !('IntersectionObserver' in window)
  ))

  useEffect(() => {
    if (shouldRender || !anchorNode) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldRender(true)
        observer.disconnect()
      },
      { rootMargin },
    )

    observer.observe(anchorNode)
    return () => observer.disconnect()
  }, [anchorNode, rootMargin, shouldRender])

  if (shouldRender) {
    return <Suspense fallback={fallback}>{children}</Suspense>
  }

  return cloneElement(fallback, { ref: setAnchorNode })
}
