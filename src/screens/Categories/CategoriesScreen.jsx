import { useState } from 'react';
import { Plus } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import CategoryAccordionItem from './CategoryAccordionItem';
import SortableItem from '../../components/common/SortableItem';
import { useCategoryTree } from '../../hooks/useCategories';
import { createCategory, reorderCategories } from '../../db/categories';
import { inputStyle } from '../../lib/formStyles';

export default function CategoriesScreen() {
  const tree = useCategoryTree({ includeArchived: true });
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const submitNewTop = async () => {
    const trimmed = newName.trim();
    if (trimmed) await createCategory({ name: trimmed, parentId: null });
    setNewName('');
    setAdding(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !tree) return;
    const ids = tree.map((c) => c.id);
    const newIds = arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id));
    await reorderCategories(newIds);
  };

  return (
    <div style={{ paddingBottom: 96 }}>
      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Категории</h1>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={(tree || []).map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(tree || []).map((cat) => (
              <SortableItem key={cat.id} id={cat.id}>
                {({ dragHandleProps }) => (
                  <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <CategoryAccordionItem category={cat} dragHandleProps={dragHandleProps} />
                  </div>
                )}
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div style={{ padding: '0 16px' }}>
        {adding ? (
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNewTop()}
            onBlur={submitNewTop}
            placeholder="Название категории"
            style={inputStyle}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              border: '0.5px dashed var(--border)',
              background: 'none',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            <Plus size={16} /> Новая категория
          </button>
        )}
      </div>
    </div>
  );
}
