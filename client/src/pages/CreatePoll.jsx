import useCreatePollForm from '../hooks/useCreatePollForm.js';
import Input from '../components/ui/Input.jsx';
import Textarea from '../components/ui/Textarea.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import DateTimePicker from '../components/ui/DateTimePicker.jsx';
import AppendReorderList from '../components/ui/AppendReorderList.jsx';
import Button from '../components/ui/Button.jsx';
import FormError from '../components/ui/FormError.jsx';
import Turnstile from '../components/ui/Turnstile.jsx';

function FormSection({ label, children }) {
  return (
    <div className="space-y-5">
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.15em]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

export default function CreatePoll() {
  const { form, fieldArray, handleReorder, onSubmit, meta, setCaptchaToken, captchaRef } = useCreatePollForm();
  const { register, formState: { errors, isSubmitting } } = form;
  const { fields, append, remove } = fieldArray;

  return (
    <div className="flex flex-1 justify-center px-4 py-10">
      <div className="w-full max-w-xl">

        <div className="mb-10">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--text)' }}>
            New poll
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Set a question, add options, configure and publish.
          </p>
        </div>

        <FormError message={errors.root?.message} />

        <form onSubmit={onSubmit} className="space-y-10">

          <FormSection label="Question">
            <Input
              id="title"
              placeholder="What do you want to ask?"
              required={meta.title}
              error={errors.title?.message}
              {...register('title')}
            />
            <Textarea
              id="description"
              placeholder="Add context… (optional)"
              required={meta.description}
              error={errors.description?.message}
              {...register('description')}
            />
          </FormSection>

          <div
            className="h-px w-full"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <FormSection label="Options">
            <AppendReorderList
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
          </FormSection>

          <div
            className="h-px w-full"
            style={{ backgroundColor: 'var(--border)' }}
          />

          <FormSection label="Settings">
            <div className="space-y-4">
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
              <Checkbox
                label="Show results to voters"
                description="Respondents can see vote counts after voting"
                {...register('show_results')}
              />
            </div>
            <DateTimePicker
              label="Expiry date"
              id="expires_at"
              required={meta.expires_at}
              error={errors.expires_at?.message}
              {...register('expires_at')}
            />
          </FormSection>

          <Turnstile ref={captchaRef} onToken={setCaptchaToken} />

          <Button type="submit" loading={isSubmitting} loadingText="Creating…">
            Create poll
          </Button>

        </form>
      </div>
    </div>
  );
}
