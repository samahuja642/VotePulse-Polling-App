import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { createPollSchema } from '../lib/validators.js';
import { getFieldMeta } from '../lib/formUtils.js';
import api from '../lib/api.js';
import { extractApiError } from '../lib/apiError.js';

const meta = getFieldMeta(createPollSchema);
const CAPTCHA_ENABLED = !!import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function useCreatePollForm() {
  const navigate = useNavigate();
  const captchaTokenRef = useRef('');
  const captchaRef = useRef(null);

  const setCaptchaToken = useCallback((token) => {
    captchaTokenRef.current = token;
  }, []);

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
    if (CAPTCHA_ENABLED && !captchaTokenRef.current) {
      toast.error('Please complete the CAPTCHA');
      return;
    }

    try {
      const payload = {
        ...data,
        options: data.options.map((o) => o.text),
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        ...(CAPTCHA_ENABLED && { captchaToken: captchaTokenRef.current }),
      };
      const res = await api.post('/polls', payload);
      toast.success('Poll created!');
      navigate(`/polls/${res.data.data.id}`);
    } catch (err) {
      const { message, details } = extractApiError(err);
      if (details?.length) {
        details.forEach(({ path, message: msg }) => {
          form.setError(path || 'root', { message: msg });
        });
      } else {
        toast.error(message);
      }
    } finally {
      captchaRef.current?.reset();
    }
  });

  return { form, fieldArray, handleReorder, onSubmit, meta, setCaptchaToken, captchaRef };
}
