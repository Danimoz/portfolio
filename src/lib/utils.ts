import { IProject } from "@/types"
import { getPlaiceholder } from "plaiceholder"
import toast  from "react-hot-toast"


interface NotificationProps {
  type: 'error' | 'success'
  message: string
}

export const notify = ({ type, message }: NotificationProps) => {
  try {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  } catch (error) {
    console.error('Error occurred in notify function:', error);
  }
}

export const separateStringWithCommas = (value: string) => { 
  const values = value.split(',')
  return values.map(tech => tech.trim())
}


async function getBase64(imageUrl: string){
  try {
    const response = await fetch(imageUrl)
    const buffer = await response.arrayBuffer()
    const { base64 } = await getPlaiceholder(Buffer.from(buffer))
    return base64
  } catch(error) {
    console.error(error)
  }
}


export async function getMultipleBase64(projects: IProject[]){
  const base64promises = projects.map(photo => getBase64(photo.image))
  const result = await Promise.all(base64promises)
  const blurredImages = result.map((image, index) => ({ ...projects[index], blurredImage: image }))
  return blurredImages
}