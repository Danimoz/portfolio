'use client';

import { SubmitButton } from "@/components/SubmitButton";
import { useRef } from "react";
import { sendEmail } from "@/lib/actions";
import toast from "react-hot-toast";

export default function ContactForm(){
  const formRef = useRef<HTMLFormElement>(null);
  
  async function action(formData: FormData){
    const response = await sendEmail(formData);
    if (response.status === 200) {
      toast.success('Email sent successfuly!');
      formRef.current?.reset();
    } else toast.error('Something went wrong. Please try again later.');
  }
  
  return (
    <form ref={formRef} action={action} className="my-10">
      <div>
        <label htmlFor="name" className="block mb-1">Name:</label>
        <input type="text" id="name" name="name" className="p-3 w-full bg-transparent border-2 border-slate-500 rounded mb-4" required />
      </div>

      <div>
        <label htmlFor="email" className="block mb-1">Email:</label>
        <input type="email" id="email" name="email" className="p-3 w-full bg-transparent border-2 border-slate-500 rounded mb-4" required />
      </div>

      <div>
        <label htmlFor="message" className="block mb-1">Message:</label>
        <textarea id="message" name="message" rows={4} cols={50} className="p-3 w-full bg-transparent border-2 border-slate-500 rounded mb-4" required />
      </div>

      <SubmitButton buttonText="Send Message" />
    </form>
  )
}