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
      // Use the object syntax for better compatibility
      db = new PGlite({
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

      // Check if we have data in localStorage first
      if (typeof window !== "undefined") {
        const storedPatients = localStorage.getItem("patients")
        if (storedPatients) {
          try {
            const patients = JSON.parse(storedPatients)
            if (Array.isArray(patients) && patients.length > 0) {
              console.log("Loading patients from localStorage:", patients.length)

              // Insert stored patients into the database directly (not using addPatient to avoid circular calls)
              for (const patient of patients) {
                await db.query(
                  `INSERT INTO patients (id, name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory) 
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                  [
                    patient.id,
                    patient.name,
                    patient.age,
                    patient.gender,
                    patient.contact,
                    patient.email || "",
                    patient.address || "",
                    patient.bloodGroup || "",
                    patient.allergies || "",
                    patient.medicalHistory || "",
                  ],
                )
              }

              // Reset the sequence to continue from the highest ID
              const maxId = Math.max(...patients.map((p: Patient) => p.id || 0))
              if (maxId > 0) {
                await db.query(`SELECT setval('patients_id_seq', $1)`, [maxId])
              }

              console.log("Patients loaded from localStorage successfully")
              return db
            }
          } catch (e) {
            console.error("Error parsing stored patients:", e)
            localStorage.removeItem("patients")
          }
        }
      }

      // Only add sample data if no data exists in localStorage
      await addSampleDataDirect()

      console.log("Database initialized successfully")
    } catch (error) {
      console.error("Error initializing database:", error)
      throw new Error("Failed to initialize database: " + error)
    }
  }
  return db
}

// Add sample data directly to database (used during initialization)
async function addSampleDataDirect() {
  if (!db) return

  try {
    console.log("Adding sample data directly...")

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

    // Insert sample patients directly into database
    for (const patient of samplePatients) {
      console.log("Inserting sample patient with blood group:", patient.bloodGroup)
      await db.query(
        `INSERT INTO patients (
          name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory
         ) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          patient.name,
          patient.age,
          patient.gender,
          patient.contact,
          patient.email,
          patient.address,
          patient.bloodGroup,
          patient.allergies,
          patient.medicalHistory,
        ],
      )
    }

    // Sync to localStorage after adding sample data
    await syncToLocalStorage()

    console.log("Sample data added successfully")
  } catch (error) {
    console.error("Error adding sample data:", error)
    throw error
  }
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

    console.log("Adding patient with blood group:", bloodGroup)
    console.log("Full patient data:", {
      name,
      age,
      gender,
      contact,
      email,
      address,
      bloodGroup,
      allergies,
      medicalHistory,
    })

    const result = await db!.query(
      `INSERT INTO patients (
        name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory],
    )

    // Update localStorage with all current patients
    await syncToLocalStorage()

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
    console.log("Retrieved patients from database:", result.rows)
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

    console.log("Updating patient with blood group:", bloodGroup)
    console.log("Full update data:", {
      name,
      age,
      gender,
      contact,
      email,
      address,
      bloodGroup,
      allergies,
      medicalHistory,
    })

    const result = await db!.query(
      `UPDATE patients 
       SET name = $1, age = $2, gender = $3, contact = $4, email = $5, 
           address = $6, bloodGroup = $7, allergies = $8, medicalHistory = $9
       WHERE id = $10
       RETURNING *`,
      [name, age, gender, contact, email, address, bloodGroup, allergies, medicalHistory, id],
    )

    // Update localStorage with all current patients
    await syncToLocalStorage()

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

    // Update localStorage with all current patients
    await syncToLocalStorage()

    return true
  } catch (error) {
    console.error("Error deleting patient:", error)
    throw error
  }
}

// Sync current database state to localStorage
async function syncToLocalStorage() {
  if (typeof window !== "undefined" && db) {
    try {
      const result = await db.query("SELECT * FROM patients ORDER BY id DESC")
      localStorage.setItem("patients", JSON.stringify(result.rows))
      console.log("Synced to localStorage:", result.rows.length, "patients")
    } catch (error) {
      console.error("Error syncing to localStorage:", error)
    }
  }
}

// Clear all data (useful for testing)
export async function clearAllData() {
  if (!db) await initDB()

  try {
    await db!.query("DELETE FROM patients")
    await db!.query("ALTER SEQUENCE patients_id_seq RESTART WITH 1")

    if (typeof window !== "undefined") {
      localStorage.removeItem("patients")
    }

    console.log("All data cleared successfully")
    return true
  } catch (error) {
    console.error("Error clearing data:", error)
    throw error
  }
}
