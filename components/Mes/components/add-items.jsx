"use client"


export default function AddItemsButton({ className = "", color = "blue", onClick, label = "Add Items +" }) {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  }

  return (
    <button onClick={onClick} className={`${colorClasses[color]} text-white px-4 py-1 max-h-10 rounded ${className}`}>
      {label}
    </button>
  )
}
