"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Search, RefreshCw, Home, Database } from "lucide-react"
import { initDB, addPatient, searchPatients, getAllPatients, type Patient } from "@/lib/db"
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

  useEffect(() => {
    let removeListener: (() => void) | null = null

    const setupDatabase = async () => {
      try {
        console.log("Initializing database...")
        await initDB()
        console.log("Database initialized, loading patients...")
        loadPatients()

        // Set up cross-tab communication
        if (typeof window !== "undefined") {
          const channel = getPatientChannel()
          if (channel) {
            removeListener = channel.onMessage((message: MessageData) => {
              if (message.type === "PATIENT_UPDATED") {
                loadPatients()
              }
            })
          }
        }
      } catch (error) {
        console.error("Database initialization error:", error)
        toast({
          title: "Error",
          description: "Failed to initialize database. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    setupDatabase()

    // Cleanup function
    return () => {
      if (removeListener) {
        removeListener()
      }
    }
  }, [])

  const loadPatients = async () => {
    try {
      const allPatients = await getAllPatients()
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
      await addPatient(patientData)
      loadPatients()
      setIsOpen(false)

      toast({
        title: "Success",
        description: "Patient added successfully!",
      })

      // Notify other tabs about the update
      const channel = getPatientChannel()
      if (channel) {
        channel.postMessage({ type: "PATIENT_UPDATED" })
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

  const notifyUpdate = () => {
    loadPatients()
    const channel = getPatientChannel()
    if (channel) {
      channel.postMessage({ type: "PATIENT_UPDATED" })
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
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                  <p>Initializing PGlite database...</p>
                </div>
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
