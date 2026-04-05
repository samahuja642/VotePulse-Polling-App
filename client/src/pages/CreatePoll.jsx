import { BarChart3 } from 'lucide-react';
import useCreatePollForm from '../hooks/useCreatePollForm.js';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import DateTimePicker from '../components/ui/DateTimePicker.jsx';
import AppendReorderList from '../components/ui/AppendReorderList.jsx';
import Button from '../components/ui/Button.jsx';
import FormError from '../components/ui/FormError.jsx';

export default function CreatePoll() {
  const { form, fieldArray, handleReorder, onSubmit, meta } = useCreatePollForm();
  const { register, formState: { errors, isSubmitting } } = form;
  const { fields, append, remove } = fieldArray;

  return (
    <div className="flex flex-1 justify-center py-8 px-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
            <BarChart3 size={22} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold">Create a new poll</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Set up your question and options, then share it with the world.
          </p>
        </div>

        <FormError message={errors.root?.message} />

        <form onSubmit={onSubmit} className="space-y-6">
          {/* Title & Description */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <Input
              label="Question / Title"
              id="title"
              placeholder="What do you want to ask?"
              required={meta.title}
              error={errors.title?.message}
              {...register('title')}
            />
            <Textarea
              label="Description"
              id="description"
              placeholder="Add some context to your poll…"
              required={meta.description}
              error={errors.description?.message}
              {...register('description')}
            />
          </div>

          {/* Options */}
          <div
            className="rounded-xl p-5"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <AppendReorderList
              label="Options"
              fields={fields}
              errors={errors.options}
              rootError={errors.options?.root?.message}
              min={2}
              max={20}
              placeholder={(i) => `Option ${i + 1}`}
              onAppend={() => append({ text: '' })}
              onRemove={remove}
              onReorder={handleReorder}
              register={register}
              fieldName="options"
            />
          </div>

          {/* Settings */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Settings
            </h2>

            <div className="space-y-3">
              <Checkbox
                label="Public poll"
                description="Visible on the Explore page"
                {...register('is_public')}
              />
              <Checkbox
                label="Allow multiple choices"
                description="Voters can select more than one option"
                {...register('multi_vote')}
              />
            </div>

            <DateTimePicker
              label="Expiry date"
              id="expires_at"
              required={meta.expires_at}
              error={errors.expires_at?.message}
              {...register('expires_at')}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            icon={BarChart3}
            loading={isSubmitting}
            loadingText="Creating poll…"
          >
            Create poll
          </Button>
        </form>
      </div>
    </div>
  );
}
