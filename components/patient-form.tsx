"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Patient } from "@/lib/db"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PatientFormProps {
  onSubmit: (data: Patient) => void
  initialData?: Patient
}

export function PatientForm({ onSubmit, initialData }: PatientFormProps) {
  const [formData, setFormData] = useState<Patient>({
    name: initialData?.name || "",
    age: initialData?.age || 0,
    gender: initialData?.gender || "",
    contact: initialData?.contact || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    medicalHistory: initialData?.medicalHistory || "",
    bloodGroup: initialData?.bloodGroup || "",
    allergies: initialData?.allergies || "",
  })

  const [errors, setErrors] = useState<{
    contact?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Clear previous errors when field is edited
    if (name === "contact") {
      setErrors((prev) => ({ ...prev, contact: undefined }))
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? (value ? Number.parseInt(value) : 0) : value,
    }))
  }

  const handleSelectChange = (value: string, name: string) => {
    console.log(`Setting ${name} to:`, value) // Add debug logging
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = (): boolean => {
    const newErrors: { contact?: string } = {}

    // Validate phone number (10-12 digits)
    const contactRegex = /^\d{10,12}$/
    if (!contactRegex.test(formData.contact.replace(/[^0-9]/g, ""))) {
      newErrors.contact = "Phone number must be 10-12 digits"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Format phone number to remove non-digit characters before submission
      const formattedData = {
        ...formData,
        contact: formData.contact.replace(/[^0-9]/g, ""),
      }
      console.log("Submitting patient data:", formattedData) // Add debug logging
      onSubmit(formattedData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="medical">Medical Info</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" name="age" type="number" value={formData.age || ""} onChange={handleChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange(value, "gender")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number * (10-12 digits)</Label>
              <Input
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                required
                className={errors.contact ? "border-red-500" : ""}
              />
              {errors.contact && (
                <Alert variant="destructive" className="py-2 mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.contact}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(value) => handleSelectChange(value, "bloodGroup")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" value={formData.address} onChange={handleChange} rows={2} />
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              rows={2}
              placeholder="List any allergies..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              rows={4}
              placeholder="Previous conditions, surgeries, medications..."
            />
          </div>
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full mt-6">
        {initialData ? "Update Patient" : "Add Patient"}
      </Button>
    </form>
  )
}
