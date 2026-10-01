import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../shared/utils/cn'
import { PIN_LENGTH } from '../constants/loginMethods'

/**
 * Segmented numeric PIN input. Typing advances, Backspace goes back, a pasted
 * code fills every box, and `onComplete` fires once all digits are present.
 * The digits are rendered LTR in both languages (they are a code, not text).
 */
export function PinInput({ value, onChange, onComplete, disabled, invalid, autoFocus }) {
  const { t } = useTranslation()
  const inputs = useRef([])
  const digits = Array.from({ length: PIN_LENGTH }, (_, index) => value[index] || '')

  const commit = (next) => {
    const clean = next.replace(/\D/g, '').slice(0, PIN_LENGTH)
    onChange(clean)
    if (clean.length === PIN_LENGTH) onComplete?.(clean)
    return clean
  }

  const focusAt = (index) => inputs.current[Math.max(0, Math.min(PIN_LENGTH - 1, index))]?.focus()

  const handleInput = (index, raw) => {
    const typed = raw.replace(/\D/g, '')
    if (!typed) return
    // Supports both one key at a time and an OS autofill of the whole code.
    const next = (value.slice(0, index) + typed).slice(0, PIN_LENGTH)
    const clean = commit(next)
    focusAt(clean.length)
  }

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const removeAt = digits[index] ? index : index - 1
      if (removeAt < 0) return
      commit(value.slice(0, removeAt))
      focusAt(removeAt)
    } else if (event.key === 'ArrowLeft') {
      focusAt(index - 1)
    } else if (event.key === 'ArrowRight') {
      focusAt(index + 1)
    }
  }

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text')
    if (!pasted) return
    event.preventDefault()
    const clean = commit(pasted)
    focusAt(clean.length)
  }

  return (
    <div dir="ltr" className="flex justify-center gap-2" role="group" aria-label={t('auth.pin.label')}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          type="password"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={PIN_LENGTH}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={t('auth.pin.digit', { index: index + 1, total: PIN_LENGTH })}
          aria-invalid={invalid || undefined}
          onChange={(event) => handleInput(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-12 w-10 rounded-xl border bg-[var(--surface)] text-center font-latin text-xl font-bold text-[var(--text)] sm:w-11',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent',
            'disabled:opacity-60',
            invalid ? 'border-[var(--status-lost)]' : 'border-[var(--border)]',
            digit && !invalid && 'border-brand-accent'
          )}
        />
      ))}
    </div>
  )
}
