import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log("main.jsx executing");
const rootElement = document.getElementById('root');
console.log("Root element:", rootElement);

try {
  const root = createRoot(rootElement);
  console.log("Root created:", root);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  console.log("Render called");
} catch (e) {
  console.error("Error during render:", e);
}
