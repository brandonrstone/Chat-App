import { ComponentPropsWithRef, forwardRef } from 'react'

const inputStyles = 'p-3 pl-4 rounded-md outline-none'

type InputProps = ComponentPropsWithRef<'input'> & {
  className?: string
  pill?: boolean
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, pill, ...props }, ref) => {
  return <input type='text' className={`${inputStyles} ${className ?? ''} ${pill ? 'rounded-full' : ''} `} ref={ref} {...props} />
})

export default Input