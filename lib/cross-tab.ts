// Custom cross-tab communication implementation
// Uses native BroadcastChannel API with localStorage fallback

export type MessageData = {
  type: string
  payload?: any
}

export class CrossTabCommunication {
  private channelName: string
  private nativeBroadcastChannel: BroadcastChannel | null = null
  private listeners: ((data: MessageData) => void)[] = []
  private localStorageKey: string
  private lastProcessedTimestamp = 0

  constructor(channelName: string) {
    this.channelName = channelName
    this.localStorageKey = `cross-tab-${channelName}`

    // Try to use native BroadcastChannel API if available
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.nativeBroadcastChannel = new BroadcastChannel(channelName)
        this.nativeBroadcastChannel.onmessage = (event) => {
          this.notifyListeners(event.data)
        }
      } catch (error) {
        console.warn("Native BroadcastChannel failed, falling back to localStorage:", error)
        this.setupLocalStorageFallback()
      }
    } else if (typeof window !== "undefined") {
      this.setupLocalStorageFallback()
    }
  }

  private setupLocalStorageFallback() {
    if (typeof window !== "undefined") {
      // Listen for storage events
      window.addEventListener("storage", (event) => {
        if (event.key === this.localStorageKey) {
          try {
            const data = JSON.parse(event.newValue || "{}")
            // Only process if it's newer than the last processed message
            if (data.timestamp > this.lastProcessedTimestamp) {
              this.lastProcessedTimestamp = data.timestamp
              this.notifyListeners(data.message)
            }
          } catch (error) {
            console.error("Error parsing cross-tab message:", error)
          }
        }
      })
    }
  }

  private notifyListeners(data: MessageData) {
    this.listeners.forEach((listener) => listener(data))
  }

  public postMessage(data: MessageData) {
    if (this.nativeBroadcastChannel) {
      // Use native BroadcastChannel
      this.nativeBroadcastChannel.postMessage(data)
    } else if (typeof window !== "undefined") {
      // Use localStorage fallback
      const messageWithTimestamp = {
        message: data,
        timestamp: Date.now(),
      }
      localStorage.setItem(this.localStorageKey, JSON.stringify(messageWithTimestamp))
      // Immediately remove to trigger another storage event for the next message
      setTimeout(() => {
        localStorage.removeItem(this.localStorageKey)
      }, 100)
    }
  }

  public onMessage(callback: (data: MessageData) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  public close() {
    if (this.nativeBroadcastChannel) {
      this.nativeBroadcastChannel.close()
    }
    this.listeners = []
  }
}

// Create and export a singleton instance
let patientChannel: CrossTabCommunication | null = null

export function getPatientChannel() {
  if (typeof window !== "undefined" && !patientChannel) {
    patientChannel = new CrossTabCommunication("patient-updates")
  }
  return patientChannel
}
