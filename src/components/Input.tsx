import { ComponentPropsWithRef, forwardRef } from 'react'

const inputStyles = 'p-3 pl-4 text-sm font-bold rounded-md outline-none shadow-md'

type InputProps = ComponentPropsWithRef<'input'> & {
  className?: string
  pill?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, pill, ...props }, ref) => {
  return <input type='text' className={`${inputStyles} ${className ?? ''} ${pill ? 'rounded-full' : ''} `} ref={ref} {...props} />
})

export default Input