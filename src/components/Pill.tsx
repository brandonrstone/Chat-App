const PillColors = [
  'bg-primary/20 hover:bg-primary/40 hover:shadow-lg hover:shadow-primary/20',
  'bg-red-200 hover:bg-red-300  hover:shadow-lg hover:shadow-red-300/20',
  'bg-green-200 hover:bg-green-300  hover:shadow-lg hover:shadow-green-300/20',
  'bg-yellow-200 hover:bg-yellow-300 hover:shadow-lg hover:shadow-yellow-300/20',
  'bg-blue-200 hover:bg-blue-300 hover:shadow-lg hover:shadow-blue-300/20'
] as const

type PillProps = {
  displayName: string
  userId: string
  onClick: () => void
}

export function Pill({ displayName, userId, onClick }: PillProps) {
  // This generates a deterministic color index based on the user's Firebase ID
  const colorIndex = userId.split('').reduce((prevChar, currChar) => prevChar + currChar.charCodeAt(0), 0) % PillColors.length
  const color = PillColors[colorIndex]

  return <div className={`inline-block px-2.5 py-0.5 m-0.5 font-medium rounded-full cursor-pointer ${color} active:scale-95 transition-all duration-200`} onClick={onClick}>{displayName} </div>
}
