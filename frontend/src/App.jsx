import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import HomePage from './pages/HomePage'
import GeneratorPage from './pages/GeneratorPage'
import SavedRecipesPage from './pages/SavedRecipesPage'
import AboutPage from './pages/AboutPage'
import SubscriptionPage from './pages/SubscriptionPage'
import { RecipeProvider } from './context/RecipeContext'

function App() {
  return (
    <RecipeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/generator" element={<GeneratorPage />} />
            <Route path="/saved" element={<SavedRecipesPage />} />
            <Route path="/pricing" element={<SubscriptionPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />
        <AuthModal />
      </div>
    </RecipeProvider>
  )
}

export default App
