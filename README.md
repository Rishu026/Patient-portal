### Patient Registration System

A frontend-only patient registration application built with Next.js and PGlite for in-browser SQL database functionality. This application allows healthcare providers to manage patient records without requiring a backend server.





## 📋 Features

- **Patient Management**

- Add new patients with comprehensive information
- View detailed patient records
- Edit existing patient information
- Delete patient records
- Search patients by name or ID



- **In-Browser Database**

- Powered by PGlite for SQL database capabilities
- No backend server required
- Sample data generation for demonstration



- **SQL Query Interface**

- Interactive SQL playground
- Execute custom SQL queries
- View query results in real-time
- Example queries for common operations



- **Cross-Tab Synchronization**

- Real-time updates across browser tabs
- Changes made in one tab reflect in all open tabs



- **Responsive Design**

- Works on desktop, tablet, and mobile devices
- Clean, modern UI with blue and white color scheme





## 🚀 Technologies Used

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: PGlite (in-memory SQL database for browsers)
- **State Management**: React Hooks
- **Cross-Tab Communication**: Custom BroadcastChannel implementation


## 💻 Installation and Setup

### Prerequisites

- Node.js 18.x or later
- Yarn or npm package manager


### Installation Steps

1. Clone the repository

```shellscript
git clone https://github.com/yourusername/patient-registration-system.git
cd patient-registration-system
```


2. Install dependencies

```shellscript
yarn install
# or
npm install
```


3. Start the development server

```shellscript
yarn dev
# or
npm run dev
```


4. Open [http://localhost:3000](http://localhost:3000) in your browser


## 📱 Usage

### Landing Page

The landing page provides an overview of the application's features and a button to navigate to the patient management system.

### Patient Management

1. Navigate to the Patient Management page by clicking "Go to Patient Management" on the landing page
2. View the list of existing patients in the table
3. Search for patients using the search box (by name or ID)
4. Add a new patient:

1. Click the "Add Patient" button
2. Fill out the patient information form
3. Click "Add Patient" to save



5. View patient details by clicking the eye icon in the patient list
6. Edit a patient by clicking the edit icon and updating the information
7. Delete a patient by clicking the trash icon and confirming the deletion


### SQL Queries

1. Click on the "SQL Queries" tab in the Patient Management page
2. Use the examples provided in the "Query Examples" tab for reference
3. Write and execute custom SQL queries in the "SQL Playground" tab
4. View the "Code Snippets" tab for examples of how to use PGlite in your code


## 📁 Project Structure

```plaintext
patient-registration-system/
├── app/                      # Next.js app directory
│   ├── page.tsx              # Landing page
│   ├── patients/             # Patient management route
│   │   └── page.tsx          # Patient management page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/               # React components
│   ├── patient-form.tsx      # Patient form component
│   ├── patient-list.tsx      # Patient list component
│   ├── patient-view.tsx      # Patient details view
│   ├── sql-query-guide.tsx   # SQL query guide component
│   └── ui/                   # UI components (shadcn)
├── lib/                      # Utility functions and libraries
│   ├── db.ts                 # PGlite database setup and functions
│   ├── cross-tab.ts          # Cross-tab communication
│   └── utils.ts              # Utility functions
├── public/                   # Static assets
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies and scripts
```

## 🧠 Technical Implementation Details

### PGlite Database Setup

The application uses PGlite in in-memory mode to provide SQL database functionality entirely in the browser:

```typescript
// Create a PGlite instance with in-memory mode
db = new PGlite({
  filename: ":memory:",
});

// Create patients table
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
`);
```

### Cross-Tab Communication

To ensure changes are synchronized across multiple browser tabs, a custom communication system was implemented:

```typescript
export class CrossTabCommunication {
  private channelName: string;
  private nativeBroadcastChannel: BroadcastChannel | null = null;
  
  constructor(channelName: string) {
    this.channelName = channelName;
    
    // Try to use native BroadcastChannel API if available
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        this.nativeBroadcastChannel = new BroadcastChannel(channelName);
        // ... implementation details
      } catch (error) {
        // Fall back to localStorage
        this.setupLocalStorageFallback();
      }
    }
  }
  
  // ... rest of implementation
}
```

## 🚧 Challenges and Solutions

### Challenge: PGlite File System Access in Vercel

**Problem**: PGlite by default tries to use the file system for storage, which is not available in serverless environments like Vercel.

**Solution**: Configured PGlite to use in-memory mode, which doesn't require file system access. This allows the application to work in serverless environments but means data is not persisted between page refreshes.

### Challenge: Cross-Tab Communication

**Problem**: Changes made in one browser tab weren't reflected in other open tabs of the application.

**Solution**: Implemented a custom cross-tab communication system using the BroadcastChannel API with a localStorage fallback for older browsers.

### Challenge: Form Validation

**Problem**: Needed to implement client-side validation for patient information to ensure data integrity.

**Solution**: Created a custom validation system using React state to track and display errors.

### Challenge: SQL Query Execution in Browser

**Problem**: Needed to provide a way for users to execute custom SQL queries against the PGlite database.

**Solution**: Created an interactive SQL playground that executes queries against the PGlite instance and displays the results.

## 🌐 Deployment

### Vercel Deployment

The application is optimized for deployment on Vercel:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Vercel will automatically detect the Next.js project and configure the build settings
4. Deploy the application


**Important Considerations**:

- The application uses PGlite in in-memory mode, which means data will not persist between page refreshes in the deployed environment
- Sample data is automatically loaded on each initialization to provide a consistent starting point
- For a production application that requires data persistence, consider integrating with a backend database service


### Local Production Build

To test the production build locally:

1. Build the application:

```shellscript
yarn build
# or
npm run build
```


2. Start the production server:

```shellscript
yarn start
# or
npm start
```


3. Open [http://localhost:3000](http://localhost:3000) in your browser


## 🔮 Future Enhancements

- **Data Persistence**: Integrate with a backend database service for true data persistence
- **Authentication**: Add user authentication to protect patient data
- **Data Export**: Add functionality to export patient data as CSV or PDF
- **Appointment Scheduling**: Create a feature to schedule and manage patient appointments
- **Data Visualization**: Add charts and graphs to visualize patient statistics
- **Offline Support**: Implement service workers for offline functionality
- **Multi-language Support**: Add internationalization for multiple languages


## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Your Name - [Your GitHub Profile](https://github.com/yourusername)

## 🙏 Acknowledgments

- [PGlite](https://github.com/electric-sql/pglite) - For providing SQL database capabilities in the browser
- [Next.js](https://nextjs.org/) - For the React framework
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) - For the utility-first CSS framework
