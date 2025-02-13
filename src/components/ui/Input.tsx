import { ComponentPropsWithRef, forwardRef } from 'react'

const inputStyles = 'p-3 pl-4 bg-white dark:bg-slate-800 rounded-md shadow-md placeholder:text-black dark:outline-white dark:border outline-0 dark:placeholder:text-white placeholder:text-sm'

type InputProps = ComponentPropsWithRef<'input'> & {
  className?: string
  pill?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, pill, ...props }, ref) => {
  return <input type='text' className={`${inputStyles} ${className ?? ''} ${pill ? 'rounded-full' : ''} `} ref={ref} {...props} />
})