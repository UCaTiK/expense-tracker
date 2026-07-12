import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ensureSeeded, dedupeDefaultCategories, repairDefaultCategoryStyling } from './db/seed';
import './index.css';

// No React.StrictMode: it double-invokes effects in dev, which previously
// caused duplicate category seeding. ensureSeeded()'s singleton promise plus
// dedupeDefaultCategories() are the belt-and-suspenders guard against that.
// repairDefaultCategoryStyling() additionally self-heals default categories
// that ended up with a missing/invalid icon or color.
async function bootstrap() {
  await ensureSeeded();
  await dedupeDefaultCategories();
  await repairDefaultCategoryStyling();
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}

bootstrap();
