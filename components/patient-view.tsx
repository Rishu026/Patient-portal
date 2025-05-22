"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Patient } from "@/lib/db"

interface PatientViewProps {
  patient: Patient
}

export function PatientView({ patient }: PatientViewProps) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="medical">Medical Info</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
            <p className="text-base">{patient.name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Age</h3>
            <p className="text-base">{patient.age}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
            <p className="text-base capitalize">{patient.gender}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Contact Number</h3>
            <p className="text-base">{patient.contact}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p className="text-base">{patient.email || "Not provided"}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Blood Group</h3>
            <p className="text-base">
              {patient.bloodGroup ? <Badge variant="outline">{patient.bloodGroup}</Badge> : "Not provided"}
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
          <p className="text-base">{patient.address || "Not provided"}</p>
        </div>
      </TabsContent>

      <TabsContent value="medical" className="space-y-4 pt-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Allergies</h3>
          <Card className="mt-1">
            <CardContent className="p-4">
              <p className="text-base whitespace-pre-wrap">{patient.allergies || "No allergies recorded"}</p>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Medical History</h3>
          <Card className="mt-1">
            <CardContent className="p-4">
              <p className="text-base whitespace-pre-wrap">{patient.medicalHistory || "No medical history recorded"}</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}
