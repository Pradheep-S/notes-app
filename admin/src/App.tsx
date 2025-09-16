import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-foreground">
            Notes App Admin
          </h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Routes>
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h3 className="font-medium">Total Notes</h3>
          <p className="text-2xl font-bold mt-2">1,234</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-medium">Active Users</h3>
          <p className="text-2xl font-bold mt-2">567</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-medium">PDF Uploads</h3>
          <p className="text-2xl font-bold mt-2">89</p>
        </div>
      </div>
    </div>
  )
}

function NotesPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Notes Management</h2>
      <p className="text-muted-foreground">Notes management features coming soon...</p>
    </div>
  )
}

function UsersPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">User Management</h2>
      <p className="text-muted-foreground">User management features coming soon...</p>
    </div>
  )
}

export default App
