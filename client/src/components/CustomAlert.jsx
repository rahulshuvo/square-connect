/* eslint-disable react/prop-types */
import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'

export function CustomAlert({ title, description }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <Alert className="fixed top-4 right-4 w-80 animate-in slide-in-from-right">
      <AlertTitle className="flex items-center justify-between">
        {title}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => {
            setIsVisible(false)
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        {description}
      </AlertDescription>
    </Alert>
  )
}

export default CustomAlert;