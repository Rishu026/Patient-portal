"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, ClipboardList, UserPlus, Database } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 flex flex-col">
      <header className="py-6 px-4 sm:px-6 lg:px-8 border-b bg-white border-blue-100">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Patient Registration System</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Manage Patient Records with PGlite</h2>
          <p className="text-xl text-gray-600 mb-8">
            A frontend-only patient registration system powered by PGlite for efficient data management
          </p>
          <Link href="/patients" passHref>
            <Button size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
              Go to Patient Management
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <UserPlus className="h-5 w-5 text-blue-600" />
                Register Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <p className="text-gray-600">
                Easily add new patients with comprehensive information including medical history and contact details.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <ClipboardList className="h-5 w-5 text-blue-600" />
                Manage Records
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <p className="text-gray-600">
                View, edit, and delete patient records with a clean and intuitive interface designed for efficiency.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-100 shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Database className="h-5 w-5 text-blue-600" />
                PGlite Powered
              </CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <p className="text-gray-600">
                Utilizes PGlite for frontend data storage, allowing for a serverless patient management experience.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t bg-white border-blue-100">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          <p>Patient Registration System © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  )
}
