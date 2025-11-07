import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './global.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <body>
  <h1 class="text-3xl font-bold underline text-red-300">
    Hello world!
  </h1>
</body>
  )
}

export default App
