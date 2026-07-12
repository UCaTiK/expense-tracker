import { useRef, useState } from 'react';
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

export default function App() {
  const [route, setRoute] = useState({ screen: 'home' });

  // Home's viewed month and scroll position live here (not inside
  // HomeScreen) because navigating to purchaseView/purchaseForm and back
  // unmounts and remounts HomeScreen — local state there would reset every
  // time you open a purchase and come back.
  const [homeMonthAnchor, setHomeMonthAnchor] = useState(() => new Date());
  const homeScrollPositionRef = useRef(0);

  const navigate = (screen, params = {}) => setRoute({ screen, ...params });

  // `cancelTo` is where the Cancel button on the form goes (one step back —
  // either a tab screen or the View screen being edited). `viewReturnTo` is
  // where the View screen's own Back button should ultimately go once the
  // save completes — threaded through unchanged from the View that launched
  // the edit, so repeated edit/save cycles never point Back at the View
  // screen itself (which would make Back a no-op loop).
  const openPurchaseForm = (purchaseId, cancelTo, viewReturnTo) =>
    navigate('purchaseForm', { purchaseId, cancelTo, viewReturnTo });

  const openPurchaseView = (purchaseId, returnTo = { screen: 'home' }) =>
    navigate('purchaseView', { purchaseId, returnTo });

  const goTo = (target) => navigate(target.screen, target);

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
          // Creating a new purchase goes straight back to where the FAB was
          // opened from (spec: adding an expense shouldn't detour through
          // the View screen). Editing an existing one still lands on View,
          // so the user can confirm what changed.
          onDone={(id) => (route.purchaseId ? openPurchaseView(id, route.viewReturnTo) : goTo(route.viewReturnTo))}
          onCancel={() => goTo(route.cancelTo)}
        />
      );
      break;
    case 'purchaseView':
      screen = (
        <PurchaseViewScreen
          purchaseId={route.purchaseId}
          onEdit={(id) =>
            openPurchaseForm(id, { screen: 'purchaseView', purchaseId: id, returnTo: route.returnTo }, route.returnTo)
          }
          onBack={() => goTo(route.returnTo)}
          onDeleted={() => goTo(route.returnTo)}
        />
      );
      break;
    case 'categories':
      screen = <CategoriesScreen onBack={() => navigate('settings')} />;
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
      screen = <TagsScreen onBack={() => navigate('settings')} />;
      break;
    case 'places':
      screen = <PlacesScreen onBack={() => navigate('settings')} />;
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
          onBack={() => navigate('analytics')}
          onSelectPurchase={(id) =>
            openPurchaseView(id, {
              screen: 'categoryDetail',
              categoryId: route.categoryId,
              periodType: route.periodType,
              anchorDate: route.anchorDate,
            })
          }
        />
      );
      break;
    case 'home':
    default:
      screen = (
        <HomeScreen
          onSelectPurchase={(id) => openPurchaseView(id, { screen: 'home' })}
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
          {route.screen === 'home' && (
            <FabAddButton onClick={() => openPurchaseForm(null, { screen: 'home' }, { screen: 'home' })} />
          )}
          <BottomNav current={route.screen} onNavigate={(s) => (s === 'home' ? goToHomeTab() : navigate(s))} />
        </div>
      )}
    </div>
  );
}
