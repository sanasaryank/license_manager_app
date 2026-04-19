import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Checkbox } from '../ui/Checkbox';
import { TranslationEditor } from './TranslationEditor';
import { IconPlus, IconTrash } from '../ui/Icons';

/** Manages the `items` field array of a Customer Tag form */
export function TagItemsEditor() {
  const { t } = useTranslation();
  const { register, control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const itemErrors = (errors.items as any)?.[index];
        return (
          <div key={field.id} className="rounded-md border p-4 relative">
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
              title={t('common.remove')}
            >
              <IconTrash className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-3">
              <Input
                label={t('customerTags.itemId')}
                {...register(`items.${index}.id`)}
                error={itemErrors?.id?.message}
                required
              />
              <TranslationEditor prefix={`items.${index}.name`} label={t('customerTags.itemName')} />
              <Input
                label={t('customerTags.itemDescription')}
                {...register(`items.${index}.description`)}
                error={itemErrors?.description?.message}
              />
              <Checkbox
                label={t('customerTags.itemBlocked')}
                {...register(`items.${index}.isBlocked`)}
              />
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        leftIcon={<IconPlus />}
        onClick={() =>
          append({ id: '', name: { ARM: '', ENG: '', RUS: '' }, description: '', isBlocked: false })
        }
      >
        {t('customerTags.addItem')}
      </Button>
    </div>
  );
}
