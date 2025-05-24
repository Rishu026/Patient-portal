// Custom cross-tab communication implementation
// Uses localStorage for reliable cross-tab communication

export type MessageData = {
  type: string
  payload?: any
  action?: "add" | "update" | "delete"
  timestamp?: number
}

export class CrossTabCommunication {
  private channelName: string
  private listeners: ((data: MessageData) => void)[] = []
  private localStorageKey: string
  private lastProcessedTimestamp = 0

  constructor(channelName: string) {
    this.channelName = channelName
    this.localStorageKey = `cross-tab-${channelName}`

    if (typeof window !== "undefined") {
      // Listen for storage events
      window.addEventListener("storage", this.handleStorageEvent)
    }
  }

  private handleStorageEvent = (event: StorageEvent) => {
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
  }

  private notifyListeners(data: MessageData) {
    this.listeners.forEach((listener) => listener(data))
  }

  public postMessage(data: MessageData) {
    if (typeof window !== "undefined") {
      // Add timestamp if not present
      if (!data.timestamp) {
        data.timestamp = Date.now()
      }

      // Use localStorage for communication
      const messageWithTimestamp = {
        message: data,
        timestamp: data.timestamp,
      }

      localStorage.setItem(this.localStorageKey, JSON.stringify(messageWithTimestamp))

      // Immediately remove to trigger another storage event for the next message with the same data
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
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", this.handleStorageEvent)
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
