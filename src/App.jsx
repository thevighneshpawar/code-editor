import './App.css'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Toaster } from 'react-hot-toast'

import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {




  return (
    <>

      <div>

        <Toaster
          position="top-right"
        />
      </div>

      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
