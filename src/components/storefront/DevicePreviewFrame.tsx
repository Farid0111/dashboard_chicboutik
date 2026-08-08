import type { ReactNode } from 'react'
import { Smartphone, Tablet, Monitor } from 'lucide-react'

export type ViewportMode = 'mobile' | 'tablet' | 'desktop'

interface DeviceToggleProps {
  value: ViewportMode
  onChange: (mode: ViewportMode) => void
}

const modes: { id: ViewportMode; label: string; icon: typeof Smartphone }[] = [
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'tablet', label: 'Tablette', icon: Tablet },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
]

export function DeviceToggle({ value, onChange }: DeviceToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
      {modes.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition ${
            value === id
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          title={label}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

interface DevicePreviewFrameProps {
  mode: ViewportMode
  children: ReactNode
}

const frameConfig: Record<
  ViewportMode,
  { width: string; height: string; label: string; bezel: string }
> = {
  mobile: {
    width: '390px',
    height: 'min(844px, calc(100vh - 14rem))',
    label: 'iPhone — 390 px',
    bezel: 'rounded-[2.5rem] p-3',
  },
  tablet: {
    width: '768px',
    height: 'min(1024px, calc(100vh - 14rem))',
    label: 'Tablette — 768 px',
    bezel: 'rounded-2xl p-2',
  },
  desktop: { width: '100%', height: 'auto', label: 'Desktop — pleine largeur', bezel: '' },
}

export default function DevicePreviewFrame({ mode, children }: DevicePreviewFrameProps) {
  const { width, height, label, bezel } = frameConfig[mode]

  if (mode === 'desktop') {
    return (
      <div className="w-full">
        <p className="mb-2 text-center text-xs text-gray-400">{label}</p>
        {children}
      </div>
    )
  }

  const bezelWidth = mode === 'mobile' ? 'calc(390px + 24px)' : 'calc(768px + 16px)'

  return (
    <div className="flex flex-col items-center py-4">
      <p className="mb-3 text-xs font-medium text-gray-500">{label}</p>
      <div
        className={`relative flex shrink-0 flex-col bg-gray-900 shadow-2xl ${bezel}`}
        style={{ width: bezelWidth, height }}
      >
        {mode === 'mobile' && (
          <div className="pointer-events-none absolute left-1/2 top-5 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-gray-900" />
        )}
        <div
          className={`min-h-0 flex-1 overflow-hidden bg-white ${
            mode === 'mobile' ? 'rounded-[2rem]' : 'rounded-xl'
          }`}
          style={{ width }}
        >
          <div
            className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
