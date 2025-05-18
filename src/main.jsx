import React from 'react'
import ReactDOM from 'react-dom/client'
import Rubric from './components/Rubric'

function App() {
  return (
    <div>
      <h1>Hello, Feedback App!</h1>
      <Rubric />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
