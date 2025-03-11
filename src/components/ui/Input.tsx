import { ComponentPropsWithRef, forwardRef } from 'react'

const inputStyles = 'p-3 pl-4 bg-white dark:bg-slate-800 rounded-md border border-transparent dark:border-white outline-none shadow-md placeholder:text-black dark:placeholder:text-slate-400 placeholder:text-sm'

type InputProps = ComponentPropsWithRef<'input'> & {
  className?: string
  pill?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, pill, ...props }, ref) => {
  return <input type='text' className={`${inputStyles} ${className ?? ''} ${pill ? 'rounded-full' : ''} `} ref={ref} {...props} />
})