'use client';

import { SubmitButton } from "@/components/SubmitButton";
import { addComposition } from "@/lib/actions";
import { ICategory } from "@/types";
import toast from "react-hot-toast";

interface CompositionFormProps {
  categories: string;
}

export default function CompositionForm({ categories }: CompositionFormProps) {
  async function action(formData: FormData) {
    const result = await addComposition(formData);
    if (result?.status === 201) {
      toast.success('Composition added succesfully');
    } else if (result?.status === 400) {
      toast.error('Error creating composition');
    }
  }

  const categoriesArray: ICategory[] = JSON.parse(categories);

  return (
    <form action={action}>
      <h2 className="text-4xl font-bold my-6">Add Composition</h2>
      <div>
        <label htmlFor="title" className="block mb-1">Title:</label>
        <input type="text" id="title" name="title" className="p-3 w-full text-gray-950 rounded mb-4" required />
      </div>
      <div>
        <label htmlFor="duration" className="block mb-1">Duration:</label>
        <input type="text" id="duration" name="duration" className="p-3 w-full text-gray-950 rounded mb-4" required />
      </div>
      <div>
        <label htmlFor="yearOfComposition" className="block mb-1">Year Of Composition:</label>
        <input type="text" id="yearOfComposition" name="yearOfComposition" className="p-3 w-full text-gray-950 rounded mb-4" required />
      </div>
      <div>
        <label htmlFor="instrumentation" className="block mb-1">Instrumentation:</label>
        <input type="text" id="instrumentation" name="instrumentation" placeholder='SATB AND PIANO' className="p-3 text-gray-950 w-full rounded mb-4"required />
      </div>
      <div>
        <label htmlFor="noteFromComposer" className="block mb-1">Note From Composer:</label>
        <textarea id="noteFromComposer" name="noteFromComposer" rows={4} cols={50} className="p-3 w-full text-gray-950 rounded mb-4" />
      </div>
      <div>
        <label htmlFor="compositionText" className="block mb-1">Text:</label>
        <textarea id="compositionText" name="compositionText" rows={4} cols={60} className="p-3 w-full text-gray-950 rounded mb-4" />
      </div>
      <div>
        <label htmlFor="youtubeLinks" className="block mb-1">YouTube Links:</label>
        <input type="text" id="youtubeLinks" name="youtubeLinks" placeholder='Links separated by comma' className="p-3 text-gray-950 w-full rounded mb-4" />
      </div>
      <div>
        <label htmlFor="categories" className="block mb-1">Categories:</label>
        <select id="categories" name="categories" className="p-3 w-full text-gray-950 rounded mb-4" multiple required>
          {categoriesArray.map((category: ICategory) => (
            <option key={category._id} value={category._id}>{category.name}</option>
          ))}
        </select>
      </div>

      <SubmitButton buttonText="Add Composition" />
    </form>
  )
}