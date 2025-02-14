import { Timestamp, FieldValue } from 'firebase/firestore'
import { format } from 'date-fns'

export const formatTimestamp = (timestamp: Date | FieldValue | Timestamp | null | undefined) => {
  if (!timestamp) return ''

  // Handle Firestore Timestamp and FieldValue types
  let messageDate: Date
  if (timestamp instanceof Timestamp) {
    // Convert Firestore Timestamp to Date
    messageDate = timestamp.toDate()
  } else if (timestamp instanceof FieldValue) {
    // If it's FieldValue (e.g., serverTimestamp), return empty or handle accordingly
    return ''
  } else {
    // For Date or other cases
    messageDate = new Date(timestamp)
  }

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