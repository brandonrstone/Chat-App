import { format } from 'date-fns'

export const formatTimestamp = (timestamp: Date) => {
  if (!timestamp) return ''

  const messageDate = new Date(timestamp)
  const now = new Date()

  const isToday = messageDate.toDateString() === now.toDateString()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = messageDate.toDateString() === yesterday.toDateString()

  const timeFormat = format(messageDate, 'h:mm a') // e.g., '11:10 AM'

  if (isToday) return `Today at ${timeFormat}`
  if (isYesterday) return `Yesterday at ${timeFormat}`

  // Return format as --> '2/2/2024 at 7:00PM'
  return format(messageDate, "M/d/yyyy 'at' h:mm a")
}