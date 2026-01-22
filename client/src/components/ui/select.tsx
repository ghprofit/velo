import * as React from "react"

const Select = React.forwardRef<HTMLDivElement, { value?: string; onValueChange?: (value: string) => void; children: React.ReactNode }>(
  ({ value, onValueChange, children }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const [currentValue, setCurrentValue] = React.useState(value || '')

    React.useEffect(() => {
      if (value !== undefined) {
        setCurrentValue(value)
      }
    }, [value])

    return (
      <div ref={ref} className="relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              isOpen,
              setIsOpen,
              currentValue,
              setCurrentValue,
              onValueChange,
            })
          }
          return child
        })}
      </div>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isOpen?: boolean;
    setIsOpen?: (open: boolean) => void;
    currentValue?: string;
    setCurrentValue?: (value: string) => void;
    onValueChange?: (value: string) => void;
  }
>(({ className = "", children, isOpen, setIsOpen, ...props }, ref) => {
  return (
    <button
      ref={ref}
      type="button"
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      onClick={() => setIsOpen?.(!isOpen)}
      {...props}
    >
      {children}
      <svg
        className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string; currentValue?: string }
>(({ placeholder, currentValue, ...props }, ref) => (
  <span ref={ref} {...props}>
    {currentValue || placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    isOpen?: boolean; 
    setIsOpen?: (open: boolean) => void;
    onValueChange?: (value: string) => void;
    setCurrentValue?: (value: string) => void;
  }
>(({ className = "", children, isOpen, setIsOpen, onValueChange, setCurrentValue, ...props }, ref) => {
  if (!isOpen) return null

  // Filter out internal props
  const divProps = { ...props }

  return (
    <div
      ref={ref}
      className={`absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md ${className}`}
      {...divProps}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<Record<string, unknown>>, {
              setIsOpen,
              onValueChange,
              setCurrentValue,
            })
          }
          return child
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    setIsOpen?: (open: boolean) => void;
    onValueChange?: (value: string) => void;
    setCurrentValue?: (value: string) => void;
  }
>(({ className = "", value, children, setIsOpen, onValueChange, setCurrentValue, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
      onClick={() => {
        setCurrentValue?.(value)
        onValueChange?.(value)
        setIsOpen?.(false)
      }}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
