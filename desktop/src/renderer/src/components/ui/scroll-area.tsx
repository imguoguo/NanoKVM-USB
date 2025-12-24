import clsx from 'clsx'

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function ScrollArea({ className, children, ...props }: ScrollAreaProps) {
  return (
    <div
      data-slot="scroll-area"
      className={clsx('relative overflow-auto', className)}
      {...props}
    >
      <div data-slot="scroll-area-viewport" className="size-full rounded-[inherit]">
        {children}
      </div>
    </div>
  )
}
