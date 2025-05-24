"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Search, RefreshCw, Home, Database, Trash2 } from "lucide-react"
import { initDB, addPatient, searchPatients, getAllPatients, clearAllData, type Patient } from "@/lib/db"
import { PatientForm } from "@/components/patient-form"
import { PatientList } from "@/components/patient-list"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { getPatientChannel, type MessageData } from "@/lib/cross-tab"
import { SqlQueryGuide } from "@/components/sql-query-guide"
import Link from "next/link"

export default function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("patients")
  const { toast } = useToast()
  const [initError, setInitError] = useState<string | null>(null)
  let removeListener: (() => void) | null = null

  // Function to load patients data
  const loadPatients = async () => {
    try {
      const allPatients = await getAllPatients()
      console.log("Loaded patients:", allPatients)
      setPatients(allPatients)
    } catch (error) {
      console.error("Error loading patients:", error)
      toast({
        title: "Error",
        description: "Failed to load patients data.",
        variant: "destructive",
      })
    }
  }

  const setupDatabase = async () => {
    try {
      console.log("Starting database initialization...")
      setInitError(null)

      // Add a timeout to catch hanging initialization
      const initPromise = initDB()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database initialization timeout")), 10000),
      )

      await Promise.race([initPromise, timeoutPromise])
      console.log("Database initialized successfully, loading patients...")

      await loadPatients()
      console.log("Patients loaded successfully")

      // Set up cross-tab communication
      if (typeof window !== "undefined") {
        const channel = getPatientChannel()
        if (channel) {
          removeListener = channel.onMessage((message: MessageData) => {
            console.log("Received cross-tab update notification:", message)
            if (message.type === "PATIENT_UPDATED") {
              loadPatients()
            }
          })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error("Database initialization error:", error)
      setInitError(errorMessage)
      toast({
        title: "Database Error",
        description: `Failed to initialize database: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setupDatabase()

    // Cleanup function
    return () => {
      if (removeListener) {
        removeListener()
      }
    }
  }, [])

  const handleSearch = async () => {
    setIsRefreshing(true)
    try {
      if (searchTerm.trim() === "") {
        await loadPatients()
        return
      }

      const results = await searchPatients(searchTerm)
      setPatients(results)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search Error",
        description: "Failed to search patients. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAddPatient = async (patientData: Patient) => {
    try {
      const newPatient = await addPatient(patientData)
      await loadPatients()
      setIsOpen(false)

      toast({
        title: "Success",
        description: "Patient added successfully!",
      })

      // Notify other tabs about the update
      const channel = getPatientChannel()
      if (channel) {
        channel.postMessage({
          type: "PATIENT_UPDATED",
          action: "add",
          timestamp: Date.now(),
        })
      }
    } catch (error) {
      console.error("Error adding patient:", error)
      toast({
        title: "Error",
        description: "Failed to add patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadPatients()
    setIsRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Patient data has been refreshed.",
    })
  }

  const handleClearData = async () => {
    if (confirm("Are you sure you want to clear all patient data? This action cannot be undone.")) {
      try {
        await clearAllData()
        await loadPatients()
        toast({
          title: "Success",
          description: "All patient data has been cleared.",
        })

        // Notify other tabs about the update
        const channel = getPatientChannel()
        if (channel) {
          channel.postMessage({
            type: "PATIENT_UPDATED",
            action: "delete",
            timestamp: Date.now(),
          })
        }
      } catch (error) {
        console.error("Error clearing data:", error)
        toast({
          title: "Error",
          description: "Failed to clear data. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const notifyUpdate = () => {
    loadPatients()
    const channel = getPatientChannel()
    if (channel) {
      channel.postMessage({
        type: "PATIENT_UPDATED",
        timestamp: Date.now(),
      })
    }
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h1 className="text-2xl font-bold text-blue-800">Patient Management</h1>
        <Link href="/" passHref>
          <Button variant="outline" size="sm" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-100">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2 bg-blue-50">
          <TabsTrigger value="patients" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
            Patient Records
          </TabsTrigger>
          <TabsTrigger value="sql" className="data-[state=active]:bg-white data-[state=active]:text-blue-700">
            <Database className="h-4 w-4 mr-2" />
            SQL Queries
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "patients" ? (
        <Card className="w-full shadow-md border-blue-100">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="text-blue-800">Patient Records</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("Current state:", { patients, isLoading, initError })
                    console.log("LocalStorage patients:", localStorage.getItem("patients"))
                  }}
                  className="flex items-center gap-1 border-gray-200 text-gray-700 hover:bg-gray-100"
                >
                  Debug Info
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearData}
                  className="flex items-center gap-1 border-red-200 text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                  <p>Initializing PGlite database...</p>
                  <p className="text-sm text-gray-500">This may take a few moments...</p>
                </div>
              </div>
            ) : initError ? (
              <div className="flex flex-col items-center justify-center h-40 space-y-4">
                <div className="text-red-600 text-center">
                  <h3 className="font-semibold">Database Initialization Failed</h3>
                  <p className="text-sm mt-2">{initError}</p>
                </div>
                <Button
                  onClick={() => {
                    setIsLoading(true)
                    setInitError(null)
                    setupDatabase()
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry Initialization
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-2 w-full max-w-sm">
                    <Input
                      placeholder="Search patients by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full border-blue-200 focus-visible:ring-blue-400"
                    />
                    <Button
                      variant="outline"
                      onClick={handleSearch}
                      disabled={isRefreshing}
                      className="border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>

                  <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="h-4 w-4" />
                        Add Patient
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Add New Patient</DialogTitle>
                      </DialogHeader>
                      <PatientForm onSubmit={handleAddPatient} />
                    </DialogContent>
                  </Dialog>
                </div>

                <PatientList patients={patients} onUpdate={notifyUpdate} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <SqlQueryGuide />
      )}
      <Toaster />
    </main>
  )
}
