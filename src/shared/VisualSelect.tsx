import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from 'react'

export type VisualSelectOption = {
  readonly value: string
  readonly label: string
}

type VisualSelectProps = {
  readonly ariaDescribedBy?: string
  readonly ariaInvalid?: boolean
  readonly ariaLabelledBy: string
  readonly disabled?: boolean
  readonly id: string
  readonly onChange: (value: string) => void
  readonly options: readonly VisualSelectOption[]
  readonly required?: boolean
  readonly value: string
}

export function VisualSelect({
  ariaDescribedBy,
  ariaInvalid = false,
  ariaLabelledBy,
  disabled = false,
  id,
  onChange,
  options,
  required = false,
  value,
}: VisualSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const [isOpen, setIsOpen] = useState(false)
  const [opensUpward, setOpensUpward] = useState(false)
  const [activeIndex, setActiveIndex] = useState(Math.max(0, selectedIndex))

  useEffect(() => {
    if (!isOpen) return undefined

    const closeOnOutsideInteraction = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsideInteraction)
    return () => document.removeEventListener('pointerdown', closeOnOutsideInteraction)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    rootRef.current
      ?.querySelector<HTMLElement>(`[data-option-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  const open = () => {
    const bounds = rootRef.current?.getBoundingClientRect()
    const expectedPanelHeight = Math.min(256, window.innerHeight * 0.45)
    const reservedBottomSpace = window.innerWidth < 768 ? 80 : 16
    setOpensUpward(Boolean(
      bounds &&
      window.innerHeight - bounds.bottom - reservedBottomSpace < expectedPanelHeight &&
      bounds.top > expectedPanelHeight,
    ))
    setActiveIndex(Math.max(0, selectedIndex))
    setIsOpen(true)
  }

  const selectOption = (index: number) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setActiveIndex(index)
    setIsOpen(false)
  }

  const moveActiveOption = (direction: 1 | -1) => {
    if (!isOpen) {
      open()
      return
    }
    setActiveIndex((current) => Math.min(options.length - 1, Math.max(0, current + direction)))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveActiveOption(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        moveActiveOption(-1)
        break
      case 'Home':
        if (isOpen) {
          event.preventDefault()
          setActiveIndex(0)
        }
        break
      case 'End':
        if (isOpen) {
          event.preventDefault()
          setActiveIndex(options.length - 1)
        }
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (isOpen) selectOption(activeIndex)
        else open()
        break
      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          setIsOpen(false)
        }
        break
    }
  }

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsOpen(false)
  }

  const selectedOption = options[selectedIndex]
  const activeOptionId = isOpen && options[activeIndex]
    ? `${id}-option-${activeIndex}`
    : undefined

  return (
    <div
      className={`visual-select${isOpen ? ' is-open' : ''}${opensUpward ? ' opens-upward' : ''}`}
      onBlur={handleBlur}
      ref={rootRef}
    >
      <button
        aria-activedescendant={activeOptionId}
        aria-controls={`${id}-listbox`}
        aria-describedby={ariaDescribedBy}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={ariaInvalid || undefined}
        aria-labelledby={ariaLabelledBy}
        aria-required={required || undefined}
        className="visual-select__trigger"
        disabled={disabled}
        id={id}
        onClick={() => isOpen ? setIsOpen(false) : open()}
        onKeyDown={handleKeyDown}
        role="combobox"
        type="button"
      >
        <span>{selectedOption?.label ?? 'Selecciona una opción'}</span>
        <span aria-hidden="true" className="visual-select__chevron" />
      </button>

      {isOpen ? (
        <ul
          className="visual-select__list"
          id={`${id}-listbox`}
          aria-labelledby={ariaLabelledBy}
          role="listbox"
          tabIndex={-1}
        >
          {options.map((option, index) => (
            <li
              aria-selected={option.value === value}
              className={`visual-select__option${index === activeIndex ? ' is-active' : ''}${option.value === value ? ' is-selected' : ''}`}
              data-option-index={index}
              id={`${id}-option-${index}`}
              key={option.value}
              onClick={() => selectOption(index)}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setActiveIndex(index)}
              role="option"
            >
              <span>{option.label}</span>
              {option.value === value ? <span aria-hidden="true" className="visual-select__check">✓</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
