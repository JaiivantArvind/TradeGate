import { useState, useEffect } from 'react'
import { Component as InteractiveGlobe } from '@/components/ui/interactive-globe'

const GLOBE_CONNECTIONS: { from: [number, number]; to: [number, number] }[] = [
  { from: [38.9, -77.0],  to: [39.9, 116.4]  }, // USA ↔ China
  { from: [38.9, -77.0],  to: [51.5, -0.1]   }, // USA ↔ UK
  { from: [38.9, -77.0],  to: [35.7, 139.7]  }, // USA ↔ Japan
  { from: [38.9, -77.0],  to: [52.5, 13.4]   }, // USA ↔ Germany
  { from: [51.5, -0.1],   to: [52.5, 13.4]   }, // UK ↔ Germany
  { from: [51.5, -0.1],   to: [28.6, 77.2]   }, // UK ↔ India
  { from: [48.9, 2.3],    to: [52.5, 13.4]   }, // France ↔ Germany
  { from: [39.9, 116.4],  to: [35.7, 139.7]  }, // China ↔ Japan
  { from: [39.9, 116.4],  to: [37.6, 126.9]  }, // China ↔ S.Korea
  { from: [39.9, 116.4],  to: [21.0, 105.8]  }, // China ↔ Vietnam
  { from: [39.9, 116.4],  to: [3.1,  101.7]  }, // China ↔ Malaysia
  { from: [28.6, 77.2],   to: [52.5, 13.4]   }, // India ↔ Germany
  { from: [3.1,  101.7],  to: [35.7, 139.7]  }, // Malaysia ↔ Japan
]

export default function GlobeBackground() {
  const [size, setSize] = useState(Math.max(window.innerWidth, window.innerHeight))

  useEffect(() => {
    function handleResize() {
      setSize(Math.max(window.innerWidth, window.innerHeight))
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden opacity-40">
      <InteractiveGlobe
        size={size}
        autoRotateSpeed={0.0008}
        arcColor="rgba(100, 180, 255, 0.2)"
        markerColor="rgba(100, 220, 255, 0.6)"
        markers={[]}
        connections={GLOBE_CONNECTIONS}
      />
    </div>
  )
}
