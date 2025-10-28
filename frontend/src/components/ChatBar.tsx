import { useState, useRef } from 'react'
import { Plus, Mic, Send, Image as ImageIcon, X, Check } from 'lucide-react'
import './ChatBar.css'

interface ChatBarProps {
  onEventCreated: () => void
}

export default function ChatBar({ onEventCreated }: ChatBarProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showPlusMenu, setShowPlusMenu] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Try Chrome!')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('')
      
      setMessage(transcript)
    }

    recognition.onerror = () => {
      setIsRecording(false)
      alert('Voice input failed. Please try again.')
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      setShowPlusMenu(false)
    }
  }

  const handleSend = async () => {
    if (!message.trim() && !selectedImage) return

    setLoading(true)

    try {
      if (selectedImage) {
        // Upload image
        const formData = new FormData()
        formData.append('file', selectedImage)

        const res = await fetch('/api/upload/image', {
          method: 'POST',
          body: formData
        })

        const data = await res.json()

        // Save extracted events
        if (data.actions && data.actions.length > 0) {
          for (const action of data.actions) {
            await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(action)
            })
          }
        }

        // Clear image
        setSelectedImage(null)
        setImagePreview(null)
        onEventCreated()
      }

      if (message.trim()) {
        // Send text message
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, conversation_history: [] })
        })

        await res.json()
        onEventCreated()
      }

      setMessage('')
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to process request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-bar">
      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <button
              className="remove-image-btn"
              onClick={() => {
                setSelectedImage(null)
                setImagePreview(null)
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <button
            className="plus-btn"
            onClick={() => setShowPlusMenu(!showPlusMenu)}
          >
            <Plus size={20} />
          </button>

          {showPlusMenu && (
            <div className="plus-menu">
              <button
                className="plus-menu-item"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={18} />
                <span>Upload Image</span>
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />

          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask TimeBox to plan your day..."
            disabled={loading || isRecording}
            className="chat-input"
          />

          {isRecording ? (
            <div className="waveform-container">
              <div className="waveform">
                <div className="wave-bar" style={{ animationDelay: '0s' }} />
                <div className="wave-bar" style={{ animationDelay: '0.1s' }} />
                <div className="wave-bar" style={{ animationDelay: '0.2s' }} />
                <div className="wave-bar" style={{ animationDelay: '0.3s' }} />
                <div className="wave-bar" style={{ animationDelay: '0.4s' }} />
              </div>
              <button
                className="stop-btn"
                onClick={() => setIsRecording(false)}
              >
                <Check size={18} />
              </button>
            </div>
          ) : (
            <>
              <button
                className="mic-btn"
                onClick={startVoiceRecording}
                disabled={loading}
              >
                <Mic size={20} />
              </button>

              <button
                className="send-btn"
                onClick={handleSend}
                disabled={loading || (!message.trim() && !selectedImage)}
              >
                <Send size={20} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}