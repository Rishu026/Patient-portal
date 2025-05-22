"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Code } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { initDB } from "@/lib/db"

export function SqlQueryGuide() {
  const [queryResult, setQueryResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM patients LIMIT 5;")

  const executeQuery = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const db = await initDB()
      const result = await db.query(sqlQuery)
      setQueryResult(JSON.stringify(result.rows, null, 2))
    } catch (err) {
      console.error("Query execution error:", err)
      setError(`Error executing query: ${err instanceof Error ? err.message : String(err)}`)
      setQueryResult("")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-blue-100 shadow-md">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Code className="h-5 w-5 text-blue-600" />
          SQL Query Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="examples" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="examples">Query Examples</TabsTrigger>
            <TabsTrigger value="playground">SQL Playground</TabsTrigger>
            <TabsTrigger value="code">Code Snippets</TabsTrigger>
          </TabsList>

          <TabsContent value="examples" className="p-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-blue-800">Common SQL Queries</h3>

              <div className="space-y-2">
                <h4 className="font-medium">Get all patients</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">SELECT * FROM patients;</pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Search patients by name</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  SELECT * FROM patients WHERE name ILIKE '%John%';
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Get patients by blood group</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  SELECT * FROM patients WHERE bloodGroup = 'O+';
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Get patients older than a certain age</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  SELECT * FROM patients WHERE age &gt; 50;
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Count patients by gender</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  SELECT gender, COUNT(*) FROM patients GROUP BY gender;
                </pre>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="playground" className="p-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-blue-800">Try SQL Queries</h3>
              <p className="text-sm text-gray-600">
                Enter your SQL query below and click "Execute" to run it against the PGlite database.
              </p>

              <div className="space-y-2">
                <Textarea
                  value={sqlQuery}
                  onChange={(e) => setSqlQuery(e.target.value)}
                  className="font-mono text-sm h-32"
                  placeholder="Enter SQL query..."
                />
                <Button onClick={executeQuery} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                  {isLoading ? "Executing..." : "Execute Query"}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {queryResult && (
                <div className="space-y-2">
                  <h4 className="font-medium">Result:</h4>
                  <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto max-h-64 overflow-y-auto">
                    {queryResult}
                  </pre>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="p-4 space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-blue-800">Using PGlite in Your Code</h3>

              <div className="space-y-2">
                <h4 className="font-medium">Initialize the database</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  {`import { initDB } from "@/lib/db";

// Get the database instance
const db = await initDB();`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Execute a simple query</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  {`// Execute a query
const result = await db.query("SELECT * FROM patients");
console.log(result.rows);`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Execute a parameterized query</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  {`// Using parameters (recommended for security)
const name = "John";
const result = await db.query(
  "SELECT * FROM patients WHERE name ILIKE $1",
  [\`%\${name}%\`]
);
console.log(result.rows);`}
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Insert data</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">
                  {`// Insert a new patient
const result = await db.query(
  \`INSERT INTO patients (
    name, age, gender, contact, email, bloodGroup
  ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *\`,
  ["Jane Doe", 35, "female", "5551234567", "jane@example.com", "AB+"]
);
const newPatient = result.rows[0];`}
                </pre>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
