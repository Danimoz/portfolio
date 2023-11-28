import { FC } from "react"

interface EmailTemplateProps {
  message: string
  name: string
  email: string
}

export const EmailTemplate: FC<Readonly<EmailTemplateProps>> = ({ message, name, email }) => (
  <div className="bg-gray-100">
    <div className="max-w-2xl mx-auto p-4 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">New message from {name}</h1> 
      <p className="leading-loose text-lg">{message}</p>
      <p className="text-blue-500 hover:underline">Reply to {email}</p>
    </div>
  </div>
)