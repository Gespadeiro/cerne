
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create a root first
const rootElement = document.getElementById("root");

// Make sure the element exists before rendering
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
