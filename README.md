### Patient Registration System

A frontend-only patient registration application built with Next.js and PGlite for in-browser SQL database functionality. This application allows healthcare providers to manage patient records without requiring a backend server.

## Demo for the project: [https://patient-portal-livid.vercel.app/](https://patient-portal-livid.vercel.app/)



## 📋 Features

### Core Functionality

- **Patient Management**

- Add new patients with comprehensive information (basic info + medical history)
- View detailed patient records with tabbed interface
- Edit existing patient information
- Delete patient records with confirmation
- Search patients by name or ID with real-time results





### Advanced Features

- **In-Browser Database**

- Powered by PGlite for SQL database capabilities
- No backend server required - runs entirely in the browser
- Automatic sample data generation for demonstration
- Persistent data storage using localStorage



- **SQL Query Interface**

- Interactive SQL playground for custom queries
- Pre-built query examples for common operations
- Real-time query execution and result display
- Code snippets showing how to use PGlite programmatically



- **Cross-Tab Synchronization**

- Real-time updates across multiple browser tabs
- Changes made in one tab instantly reflect in all open tabs
- Uses localStorage and BroadcastChannel API for reliable communication



- **Responsive Design**

- Works seamlessly on desktop, tablet, and mobile devices
- Clean, modern UI with blue and white color scheme
- Accessible design with proper ARIA labels and keyboard navigation





## 🚀 Technology Stack

- **Frontend Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: PGlite (PostgreSQL-compatible in-browser database)
- **State Management**: React Hooks and Context
- **Cross-Tab Communication**: Custom implementation using BroadcastChannel API + localStorage
- **Deployment**: Vercel (serverless deployment)


## 💻 Installation and Setup

### Prerequisites

- Node.js 18.x or later
- Yarn or npm package manager
- Modern web browser with JavaScript enabled


### Quick Start

1. **Clone the repository**

```shellscript
git clone https://github.com/yourusername/patient-registration-system.git
cd patient-registration-system
```


2. **Install dependencies**

```shellscript
yarn install
# or
npm install
```


3. **Start the development server**

```shellscript
yarn dev
# or
npm run dev
```


4. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to see the application.




### Build for Production

```shellscript
# Create production build
yarn build
# or
npm run build

# Start production server
yarn start
# or
npm start
```

## 📱 Usage Guide

### Getting Started

1. **Landing Page**: Start at the homepage which provides an overview of features
2. **Navigate to Patient Management**: Click "Go to Patient Management" to access the main application
3. **Sample Data**: The application comes with pre-loaded sample patients for demonstration


### Managing Patients

#### Adding a New Patient

1. Click the "Add Patient" button
2. Fill out the patient information in the tabbed form:

1. **Basic Info**: Name, age, gender, contact, email, blood group, address
2. **Medical Info**: Allergies and medical history



3. Click "Add Patient" to save


#### Viewing Patient Details

1. Click the eye icon (👁️) next to any patient in the list
2. View comprehensive patient information in a modal dialog
3. Information is organized in Basic Info and Medical Info tabs


#### Editing Patient Information

1. Click the edit icon (✏️) next to any patient
2. Modify the information in the pre-filled form
3. Click "Update Patient" to save changes


#### Deleting Patients

1. Click the trash icon (🗑️) next to any patient
2. Confirm the deletion in the popup dialog
3. Patient will be permanently removed


#### Searching Patients

1. Use the search box to find patients by name or ID
2. Results update in real-time as you type
3. Clear the search box to show all patients


### Using SQL Queries

1. **Navigate to SQL Tab**: Click on "SQL Queries" in the patient management page
2. **View Examples**: Check the "Query Examples" tab for common SQL operations
3. **Try the Playground**: Use the "SQL Playground" tab to write and execute custom queries
4. **Code Reference**: View the "Code Snippets" tab for implementation examples


### Cross-Tab Synchronization

1. Open the application in multiple browser tabs
2. Make changes in one tab (add, edit, or delete patients)
3. Observe that changes automatically appear in all other open tabs
4. No manual refresh required


## 📁 Project Structure

```plaintext
patient-registration-system/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Landing page
│   ├── patients/                 # Patient management route
│   │   ├── page.tsx              # Main patient management page
│   │   └── loading.tsx           # Loading component
│   ├── layout.tsx                # Root layout with theme provider
│   └── globals.css               # Global styles and Tailwind imports
├── components/                   # React components
│   ├── patient-form.tsx          # Patient form with validation
│   ├── patient-list.tsx          # Patient table with actions
│   ├── patient-view.tsx          # Patient details modal
│   ├── sql-query-guide.tsx       # SQL playground and examples
│   ├── theme-provider.tsx        # Theme context provider
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── toast.tsx
│       └── ...
├── lib/                          # Utility functions and core logic
│   ├── db.ts                     # PGlite database setup and operations
│   ├── cross-tab.ts              # Cross-tab communication system
│   └── utils.ts                  # Utility functions (cn, etc.)
├── public/                       # Static assets
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## 🔧 Technical Implementation

### Database Architecture

The application uses PGlite configured in in-memory mode for Vercel compatibility:

```typescript
// PGlite configuration for serverless deployment
db = new PGlite({
  filename: ":memory:",  // In-memory mode for Vercel
});

// Patient table schema
CREATE TABLE patients (
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
```

### Cross-Tab Synchronization

The application implements a robust cross-tab communication system:

```typescript
// Hybrid approach using BroadcastChannel + localStorage
export class CrossTabCommunication {
  constructor(channelName: string) {
    // Try BroadcastChannel first
    if ("BroadcastChannel" in window) {
      this.nativeBroadcastChannel = new BroadcastChannel(channelName);
    } else {
      // Fallback to localStorage events
      this.setupLocalStorageFallback();
    }
  }
  
  // Data persistence in localStorage for cross-tab sharing
  postMessage(data: MessageData) {
    // Store patient data in localStorage
    localStorage.setItem("patients", JSON.stringify(patients));
    // Notify other tabs
    this.broadcastMessage(data);
  }
}
```

### Form Validation

Client-side validation ensures data integrity:

```typescript
const validateForm = (): boolean => {
  const newErrors: { contact?: string } = {}
  
  // Phone number validation (10-12 digits)
  const contactRegex = /^\d{10,12}$/
  if (!contactRegex.test(formData.contact.replace(/[^0-9]/g, ""))) {
    newErrors.contact = "Phone number must be 10-12 digits"
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

## 🚧 Development Challenges & Solutions

### Challenge 1: Serverless Database Storage

**Problem**: PGlite's default file-based storage doesn't work in serverless environments like Vercel.

**Solution**: Configured PGlite to use in-memory mode with localStorage for data persistence across page refreshes.

```typescript
// Solution: In-memory mode + localStorage persistence
db = new PGlite({ filename: ":memory:" });
localStorage.setItem("patients", JSON.stringify(patientData));
```

### Challenge 2: Cross-Tab Data Synchronization

**Problem**: Each browser tab creates its own isolated database instance, preventing real-time synchronization.

**Solution**: Implemented a hybrid communication system using BroadcastChannel API with localStorage fallback, combined with shared data storage.

### Challenge 3: Blood Group Display Issues

**Problem**: Blood group values weren't displaying correctly due to improper null/empty string checking.

**Solution**: Enhanced the conditional rendering logic to properly handle empty strings and null values.

```typescript
// Fixed blood group display logic
{patient.bloodGroup && patient.bloodGroup !== "" ? (
  <Badge variant="outline">{patient.bloodGroup}</Badge>
) : (
  <span className="text-muted-foreground text-sm">-</span>
)}
```

### Challenge 4: Form State Management

**Problem**: Complex form with multiple tabs and validation requirements.

**Solution**: Implemented a centralized form state with React hooks and custom validation logic.


## 🔮 Future Enhancements

### Planned Features

- **Data Export**: CSV/PDF export functionality for patient records
- **Authentication**: User login system to protect patient data
- **Appointment Scheduling**: Calendar integration for patient appointments

### Technical Improvements

- **IndexedDB Integration**: Replace localStorage with IndexedDB for larger datasets
- **Backend Integration**: Optional backend API for true data persistence
- **Advanced Search**: Full-text search with filters and sorting
- **Audit Trail**: Track changes to patient records
- **Data Backup**: Export/import functionality for data backup

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
