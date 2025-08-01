import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
import type { CreateCategoryInput, Category } from '../../../server/src/schema';

export function CreateKeyboardsCategory() {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createKeyboardsCategory = async () => {
    setIsCreating(true);
    setError(null);
    setResult(null);

    try {
      const categoryData: CreateCategoryInput = {
        name: 'Keyboards',
        slug: 'keyboards',
        description: null
      };

      console.log('Creating Keyboards category with data:', categoryData);
      const createdCategory = await trpc.createCategory.mutate(categoryData);
      
      setResult(createdCategory);
      console.log('Keyboards category created successfully:', createdCategory);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create category';
      setError(errorMessage);
      console.error('Failed to create Keyboards category:', err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h2 className="text-xl font-semibold">Create Keyboards Category</h2>
      
      <div className="space-y-2">
        <p><strong>Name:</strong> "Keyboards"</p>
        <p><strong>Slug:</strong> "keyboards"</p>
        <p><strong>Description:</strong> null</p>
      </div>

      <Button 
        onClick={createKeyboardsCategory} 
        disabled={isCreating || result !== null}
        className="w-full"
      >
        {isCreating ? 'Creating Keyboards Category...' : 
         result ? 'Keyboards Category Created ✓' : 
         'Create Keyboards Category'}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <h3 className="font-semibold text-green-800 mb-2">Category Created Successfully!</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>ID:</strong> {result.id}</p>
            <p><strong>Name:</strong> {result.name}</p>
            <p><strong>Slug:</strong> {result.slug}</p>
            <p><strong>Description:</strong> {result.description || 'null'}</p>
            <p><strong>Created:</strong> {result.created_at.toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}