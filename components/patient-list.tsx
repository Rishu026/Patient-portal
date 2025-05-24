"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Eye, Trash2 } from "lucide-react"
import { PatientForm } from "./patient-form"
import { PatientView } from "./patient-view"
import { deletePatient, updatePatient, type Patient } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"

interface PatientListProps {
  patients: Patient[]
  onUpdate: () => void
}

export function PatientList({ patients, onUpdate }: PatientListProps) {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const { toast } = useToast()

  const handleEdit = async (patientData: Patient) => {
    try {
      if (selectedPatient?.id) {
        await updatePatient(selectedPatient.id, patientData)
        setIsEditOpen(false)
        onUpdate()
        toast({
          title: "Success",
          description: "Patient updated successfully!",
        })
      }
    } catch (error) {
      console.error("Error updating patient:", error)
      toast({
        title: "Error",
        description: "Failed to update patient. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id)
        onUpdate()
        toast({
          title: "Success",
          description: "Patient deleted successfully!",
        })
      } catch (error) {
        console.error("Error deleting patient:", error)
        toast({
          title: "Error",
          description: "Failed to delete patient. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div>
      {patients.length === 0 ? (
        <div className="text-center py-10 border rounded-md bg-gray-50">
          <p className="text-muted-foreground">No patients found. Add your first patient to get started.</p>
        </div>
      ) : (
        <Card className="border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell className="capitalize">{patient.gender}</TableCell>
                      <TableCell>{patient.contact}</TableCell>
                      <TableCell>
                        {patient.bloodGroup && patient.bloodGroup.trim() !== "" ? (
                          <Badge variant="outline">{patient.bloodGroup}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsViewOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsEditOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => patient.id && handleDelete(patient.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>View detailed information about this patient.</DialogDescription>
          </DialogHeader>
          {selectedPatient && <PatientView patient={selectedPatient} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Patient</DialogTitle>
            <DialogDescription>Make changes to the patient information.</DialogDescription>
          </DialogHeader>
          {selectedPatient && <PatientForm onSubmit={handleEdit} initialData={selectedPatient} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
