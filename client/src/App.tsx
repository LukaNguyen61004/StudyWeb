import { Route, Routes } from 'react-router'
import SiteNav from './components/SiteNav'
import EditLessonPage from './pages/EditLessonPage'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import NewLessonPage from './pages/NewLessonPage'

function App() {
  return (
    <>
      <SiteNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lessons/new" element={<NewLessonPage />} />
        <Route path="/lessons/:lessonId" element={<LessonPage />} />
        <Route path="/lessons/:lessonId/edit" element={<EditLessonPage />} />
      </Routes>
    </>
  )
}

export default App
