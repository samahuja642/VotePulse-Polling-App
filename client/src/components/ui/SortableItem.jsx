import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DotsSixVertical, Trash } from '@phosphor-icons/react';
import Input from './Input.jsx';

export default function SortableItem({ id, index, placeholder, error, canRemove, onRemove, register, fieldName }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        type="button"
        className="flex h-10 cursor-grab items-center active:cursor-grabbing"
        style={{ color: 'var(--text-tertiary)' }}
        {...attributes}
        {...listeners}
      >
        <DotsSixVertical size={16} />
      </button>
      <div className="flex-1">
        <Input
          id={`${fieldName}.${index}.text`}
          placeholder={placeholder}
          error={error}
          {...register(`${fieldName}.${index}.text`)}
        />
      </div>
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950"
          style={{ color: 'var(--color-danger-500)' }}
        >
          <Trash size={16} />
        </button>
      )}
    </div>
  );
}
