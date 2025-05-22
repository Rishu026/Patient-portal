import { PGlite } from "@electric-sql/pglite"

// Create a PGlite instance with in-memory mode
let db: PGlite | null = null

// Patient interface
export interface Patient {
  id?: number
  name: string
  age: number
  gender: string
  contact: string
  email?: string
  address?: string
  bloodGroup?: string
  allergies?: string
  medicalHistory?: string
  createdAt?: Date
}

// Initialize the database
export async function initDB() {
  if (!db) {
    try {
      // Create a new PGlite instance with in-memory mode
      // This is crucial for Vercel deployment
      db = new PGlite({
        // Use in-memory mode for Vercel
        filename: ":memory:",
      })

      await db.waitReady

      console.log("PGlite instance created successfully in memory mode")

      // Create patients table if it doesn't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS patients (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          age INTEGER NOT NULL,
          gender TEXT NOT NULL,
          contact TEXT NOT NULL,
          email TEXT,
          address TEXT,
          bloodGroup TEXT,
          allergies TEXT,
          medicalHistory TEXT,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `)

      console.log("Patients table created successfully")

      // Add sample data (since we're in memory mode, we'll always need sample data)
      await addSampleData()

      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Error initializing database:", error)
      throw new Error("Failed to initialize database: " + error)
    }
  }
  return db
}

// Add a new patient
export async function addPatient(patientData: Patient) {
  if (!db) await initDB()

  try {
    const {
      name,
      age,
      gender,
      contact,
      email = "",
      address = "",
      bloodGroup = "",
      allergies = "",
      medicalHistory = "",
    } = patientData

    const result = await db!.query(
      `INSERT INTO patients (
        name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error adding patient:", error)
    throw error
  }
}

// Get all patients
export async function getAllPatients() {
  if (!db) await initDB()

  try {
    const result = await db!.query("SELECT * FROM patients ORDER BY id DESC")
    return result.rows
  } catch (error) {
    console.error("Error getting patients:", error)
    throw error
  }
}

// Search patients by name or ID
export async function searchPatients(searchTerm: string) {
  if (!db) await initDB()

  try {
    // Check if searchTerm is a number (potential ID)
    const isNumeric = !isNaN(Number(searchTerm))

    let query = `
      SELECT * FROM patients 
      WHERE name ILIKE $1
    `

    const params = [`%${searchTerm}%`]

    if (isNumeric) {
      query = `
        SELECT * FROM patients 
        WHERE name ILIKE $1 OR id = $2
      `
      params.push(searchTerm)
    }

    const result = await db!.query(query, params)
    return result.rows
  } catch (error) {
    console.error("Error searching patients:", error)
    throw error
  }
}

// Update a patient
export async function updatePatient(id: number, patientData: Patient) {
  if (!db) await initDB()

  try {
    const {
      name,
      age,
      gender,
      contact,
      email = "",
      address = "",
      bloodGroup = "",
      allergies = "",
      medicalHistory = "",
    } = patientData

    const result = await db!.query(
      `UPDATE patients 
       SET name = $1, age = $2, gender = $3, contact = $4, email = $5, 
           address = $6, bloodGroup = $7, allergies = $8, medicalHistory = $9
       WHERE id = $10
       RETURNING *`,
      [name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory, id],
    )

    return result.rows[0]
  } catch (error) {
    console.error("Error updating patient:", error)
    throw error
  }
}

// Delete a patient
export async function deletePatient(id: number) {
  if (!db) await initDB()

  try {
    await db!.query("DELETE FROM patients WHERE id = $1", [id])
    return true
  } catch (error) {
    console.error("Error deleting patient:", error)
    throw error
  }
}

// Add sample data
async function addSampleData() {
  try {
    // Check if we already have data
    const result = await db!.query("SELECT COUNT(*) FROM patients")
    if (Number.parseInt(result.rows[0].count) > 0) {
      console.log("Sample data already exists, skipping...")
      return
    }

    const samplePatients = [
      {
        name: "John Doe",
        age: 45,
        gender: "male",
        contact: "5551234567",
        email: "john.doe@example.com",
        address: "123 Main St, Anytown, USA",
        bloodGroup: "O+",
        allergies: "Penicillin\nPeanuts",
        medicalHistory:
          "Hypertension (diagnosed 2018)\nType 2 Diabetes (diagnosed 2019)\nCholesterol medication: Lipitor 20mg daily",
      },
      {
        name: "Jane Smith",
        age: 32,
        gender: "female",
        contact: "5559876543",
        email: "jane.smith@example.com",
        address: "456 Oak Ave, Somewhere, USA",
        bloodGroup: "A+",
        allergies: "Sulfa drugs",
        medicalHistory: "Asthma (childhood)\nMigraine headaches\nAppendectomy (2015)",
      },
      {
        name: "Robert Johnson",
        age: 58,
        gender: "male",
        contact: "5554567890",
        email: "robert.j@example.com",
        address: "789 Pine Rd, Elsewhere, USA",
        bloodGroup: "AB-",
        allergies: "None",
        medicalHistory: "Heart surgery - triple bypass (2018)\nArthritis\nHigh blood pressure",
      },
    ]

    for (const patient of samplePatients) {
      await addPatient(patient)
    }

    console.log("Sample data added successfully")
  } catch (error) {
    console.error("Error adding sample data:", error)
    throw error
  }
}
