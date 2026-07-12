import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import {
  ensureSeeded,
  dedupeDefaultCategories,
  migrateDefaultCategoriesV2,
  repairDefaultCategoryStyling,
} from './db/seed';
import './index.css';

// No React.StrictMode: it double-invokes effects in dev, which previously
// caused duplicate category seeding. ensureSeeded()'s singleton promise plus
// dedupeDefaultCategories() are the belt-and-suspenders guard against that.
// migrateDefaultCategoriesV2() reconciles an already-seeded install with the
// current DEFAULT_CATEGORIES definition (renames/resorts/archives/adds), and
// must run before repairDefaultCategoryStyling() so repair sees the
// up-to-date set of default categories.
async function bootstrap() {
  await ensureSeeded();
  await dedupeDefaultCategories();
  await migrateDefaultCategoriesV2();
  await repairDefaultCategoryStyling();
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}

bootstrap();
