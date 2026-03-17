import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names', () => {
    const result = cn('btn', 'btn-primary')
    expect(result).toBe('btn btn-primary')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('btn', isActive && 'active')
    expect(result).toBe('btn active')
  })

  it('filters out falsy values', () => {
    const result = cn('btn', false, null, undefined, 'btn-primary')
    expect(result).toBe('btn btn-primary')
  })

  it('merges Tailwind classes correctly', () => {
    // tw-merge should merge conflicting Tailwind classes
    const result = cn('px-2 py-1', 'px-4')
    expect(result).toBe('py-1 px-4')
  })
})
