'use client';

import { SubmitButton } from "@/components/SubmitButton";
import { addProject } from "@/lib/actions";
import toast from "react-hot-toast";

export default function ProjectForm() {
  
  async function action(formData: FormData) {
    const result = await addProject(formData);
    if (result?.status === 201) {
      toast.success('Project added succesfully');
    }
  }

  return (
    <form action={action}>
      <h2 className="text-4xl font-bold my-6">Add Project</h2>
      <div>
        <label htmlFor="name" className="block mb-1">Name:</label>
        <input type="text" id="name" name="name" className="p-3 text-gray-950 w-full rounded mb-4"required />
      </div>
      <div>
        <label htmlFor="description" className="block mb-1">Description:</label>
        <textarea id="description" name="description" rows={4} cols={50} className="p-3 text-gray-950 w-full rounded mb-4"required />
      </div>
      <div>
        <label htmlFor="role" className="block mb-1">Role:</label>
        <input type="text" id="role" name="role" className="p-3 text-gray-950 w-full rounded mb-4"required />
      </div>
      <div>
        <label htmlFor="link" className="block mb-1">Link:</label>
        <input type="url" id="link" name="link" className="p-3 text-gray-950 w-full rounded mb-4" />
      </div>
      <div>
        <label htmlFor="image" className="block mb-1">Image:</label>
        <input type="file" id="image" name="image" className="p-3 text-white w-full rounded mb-4" accept="image/*"/>
      </div>
      <div>
        <label htmlFor="tech" className="block mb-1">Tech:</label>
        <input type="text" id="tech" name="tech" className="p-3 text-gray-950 w-full rounded mb-4" required />
      </div>

      <SubmitButton buttonText="Add Project" />
    </form>
  )
}