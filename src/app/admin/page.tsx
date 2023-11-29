import { getCategories } from "@/lib/actions";
import CategoryForm from "./categoryForm";
import CompositionForm from "./compositionForm";
import ProjectForm from "./projectForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
}


export default async function AdminPage(){
  const compositionCategories = await getCategories();

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 container mx-auto">
      <CompositionForm categories={JSON.stringify(compositionCategories.data)} />
      <ProjectForm />
      <CategoryForm />
    </section>
  )
}