import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus } from '@phosphor-icons/react';
import SortableItem from './SortableItem.jsx';

export default function AppendReorderList({
  label,
  fields,
  errors,
  rootError,
  min = 2,
  max = 20,
  placeholder = (i) => `Item ${i + 1}`,
  onAppend,
  onRemove,
  onReorder,
  register,
  fieldName,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div>
      {label && (
        <label className="mb-3 block text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onReorder}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {fields.map((field, index) => (
              <SortableItem
                key={field.id}
                id={field.id}
                index={index}
                placeholder={typeof placeholder === 'function' ? placeholder(index) : placeholder}
                error={errors?.[index]?.text?.message}
                canRemove={fields.length > min}
                onRemove={() => onRemove(index)}
                register={register}
                fieldName={fieldName}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {rootError && (
        <p className="mt-2 text-xs" style={{ color: 'var(--color-danger-500)' }}>
          {rootError}
        </p>
      )}

      {fields.length < max && (
        <button
          type="button"
          onClick={onAppend}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          <Plus size={16} />
          Add option
        </button>
      )}
    </div>
  );
}
