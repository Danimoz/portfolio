'use client';

import { SubmitButton } from "@/components/SubmitButton";
import { addCategory } from "@/lib/actions";
import toast from "react-hot-toast";

export default function CategoryForm(){
  async function action(formData: FormData) {
    const result = await addCategory(formData);
    if (result?.status === 201) {
      toast.success('Category added succesfully');
    } else if (result?.status === 400) {
      toast.error('Error creating category');
    }
  }

  return (
    <form className="py-8" action={action}>
      <h2 className="text-4xl font-bold my-6">Add Category</h2>

      <div>
        <label htmlFor="name" className="block mb-1">Name:</label>
        <input type="text" id="name" name="name" className="p-3 text-gray-950 w-full rounded mb-4"required />
      </div>

      <SubmitButton buttonText="Add Category" />
    </form>
  )
}