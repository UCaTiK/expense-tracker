import CategoryIconGrid from '../../components/categories/CategoryIconGrid';
import { useTopLevelCategories } from '../../hooks/useCategories';
import { fieldLabelStyle } from '../../lib/formStyles';

export default function QuickForm({ categoryId, onChangeCategory }) {
  const categories = useTopLevelCategories();
  return (
    <div>
      <label style={fieldLabelStyle}>Категория</label>
      <CategoryIconGrid categories={categories || []} selectedId={categoryId} onSelect={onChangeCategory} />
    </div>
  );
}
