import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createPollSchema } from '../lib/validators.js';
import { getFieldMeta } from '../lib/formUtils.js';
import api from '../lib/api.js';

const meta = getFieldMeta(createPollSchema);

export default function useCreatePollForm() {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      title: '',
      description: '',
      is_public: true,
      multi_vote: false,
      show_results: false,
      expires_at: '',
      options: [{ text: '' }, { text: '' }],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const handleReorder = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = fieldArray.fields.findIndex((f) => f.id === active.id);
    const newIndex = fieldArray.fields.findIndex((f) => f.id === over.id);
    fieldArray.move(oldIndex, newIndex);
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const payload = {
        ...data,
        options: data.options.map((o) => o.text),
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
      };
      const res = await api.post('/polls', payload);
      toast.success('Poll created!');
      navigate(`/polls/${res.data.data.id}`);
    } catch (err) {
      const error = err.response?.data?.error;
      const details = error?.details;
      if (details?.length) {
        details.forEach(({ path, message }) => {
          form.setError(path || 'root', { message });
        });
      } else {
        toast.error(error?.message || 'Something went wrong');
      }
    }
  });

  return { form, fieldArray, handleReorder, onSubmit, meta };
}
