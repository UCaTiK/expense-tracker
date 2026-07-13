import { useEffect, useRef, useState } from 'react';
import BottomNav from './components/layout/BottomNav';
import FabAddButton from './components/layout/FabAddButton';
import HomeScreen from './screens/Home/HomeScreen';
import PurchaseFormScreen from './screens/PurchaseForm/PurchaseFormScreen';
import PurchaseViewScreen from './screens/PurchaseView/PurchaseViewScreen';
import CategoriesScreen from './screens/Categories/CategoriesScreen';
import SettingsScreen from './screens/Settings/SettingsScreen';
import AnalyticsScreen from './screens/Analytics/AnalyticsScreen';
import CategoryDetailScreen from './screens/Analytics/CategoryDetailScreen';
import TagsScreen from './screens/Tags/TagsScreen';
import PlacesScreen from './screens/Places/PlacesScreen';

const TAB_SCREENS = new Set(['home', 'analytics', 'settings']);
const INITIAL_ROUTE = { screen: 'home' };

export default function App() {
  const [route, setRoute] = useState(INITIAL_ROUTE);

  // Home's viewed month and scroll position live here (not inside
  // HomeScreen) because navigating to purchaseView/purchaseForm and back
  // unmounts and remounts HomeScreen — local state there would reset every
  // time you open a purchase and come back.
  const [homeMonthAnchor, setHomeMonthAnchor] = useState(() => new Date());
  const homeScrollPositionRef = useRef(0);

  // Every forward navigation pushes a real browser history entry (route
  // stored as its state); going back anywhere in the app calls
  // history.back() instead of directly restoring a route. That makes the
  // Android back gesture/button and the in-app back/cancel buttons
  // literally the same action — both just fire a popstate event that this
  // listener turns back into a route. Once popped past the very first
  // screen there's nothing left to go back to, so the gesture exits the
  // app exactly like a normal browser tab would.
  useEffect(() => {
    window.history.replaceState(INITIAL_ROUTE, '');
    const onPopState = (event) => setRoute(event.state || INITIAL_ROUTE);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (screen, params = {}) => {
    const nextRoute = { screen, ...params };
    window.history.pushState(nextRoute, '');
    setRoute(nextRoute);
  };

  const goBack = () => window.history.back();

  const openPurchaseForm = (purchaseId) => navigate('purchaseForm', { purchaseId });
  const openPurchaseView = (purchaseId) => navigate('purchaseView', { purchaseId });

  // Tapping the "Главная" tab is a deliberate "go home" action — unlike
  // returning from a purchase's View/Edit (which preserves whatever month
  // and scroll position you had), it always resets to the current month,
  // even if you were already on Home looking at an older one.
  const goToHomeTab = () => {
    setHomeMonthAnchor(new Date());
    homeScrollPositionRef.current = 0;
    navigate('home');
  };

  let screen;
  switch (route.screen) {
    case 'purchaseForm':
      screen = (
        <PurchaseFormScreen
          purchaseId={route.purchaseId}
          // Both "cancel" and "save and done" just go back — Form was
          // always pushed on top of either Home (new purchase) or View
          // (editing), so one step back naturally lands on the right
          // screen, and View re-fetches by id so it shows the fresh data.
          onDone={() => goBack()}
          onCancel={() => goBack()}
        />
      );
      break;
    case 'purchaseView':
      screen = (
        <PurchaseViewScreen
          purchaseId={route.purchaseId}
          onEdit={(id) => openPurchaseForm(id)}
          onBack={() => goBack()}
          onDeleted={() => goBack()}
        />
      );
      break;
    case 'categories':
      screen = <CategoriesScreen onBack={() => goBack()} />;
      break;
    case 'settings':
      screen = (
        <SettingsScreen
          onOpenCategories={() => navigate('categories')}
          onOpenTags={() => navigate('tags')}
          onOpenPlaces={() => navigate('places')}
        />
      );
      break;
    case 'tags':
      screen = <TagsScreen onBack={() => goBack()} />;
      break;
    case 'places':
      screen = <PlacesScreen onBack={() => goBack()} />;
      break;
    case 'analytics':
      screen = (
        <AnalyticsScreen
          onSelectCategory={(categoryId, periodType, anchorDate) =>
            navigate('categoryDetail', { categoryId, periodType, anchorDate })
          }
        />
      );
      break;
    case 'categoryDetail':
      screen = (
        <CategoryDetailScreen
          categoryId={route.categoryId}
          initialPeriodType={route.periodType}
          initialAnchorDate={route.anchorDate}
          onBack={() => goBack()}
          onSelectPurchase={(id) => openPurchaseView(id)}
        />
      );
      break;
    case 'home':
    default:
      screen = (
        <HomeScreen
          onSelectPurchase={(id) => openPurchaseView(id)}
          monthAnchor={homeMonthAnchor}
          onMonthAnchorChange={setHomeMonthAnchor}
          scrollPositionRef={homeScrollPositionRef}
        />
      );
  }

  const showChrome = TAB_SCREENS.has(route.screen);

  return (
    <div>
      {screen}
      {showChrome && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: '0 16px calc(12px + env(safe-area-inset-bottom))',
          }}
        >
          {route.screen === 'home' && <FabAddButton onClick={() => openPurchaseForm(null)} />}
          <BottomNav current={route.screen} onNavigate={(s) => (s === 'home' ? goToHomeTab() : navigate(s))} />
        </div>
      )}
    </div>
  );
}
