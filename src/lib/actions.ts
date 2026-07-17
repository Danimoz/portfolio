'use server'

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import connectToDb from './mongo';
import { Composition, CompositionCategory, Project } from './models';
import { revalidatePath } from 'next/cache';
import { ICategory, IComposition, IProject } from '@/types';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/EmailTemplate';

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
  api_key: process.env.CLOUDINARY_API_KEY as string, 
  api_secret: process.env.CLOUDINARY_API_SECRET as string,  
});

class ActionInputError extends Error {}

function actionFailure(error: unknown, fallbackMessage: string) {
  const isInputError =
    error instanceof ActionInputError || error instanceof mongoose.Error.ValidationError

  return {
    status: isInputError ? 400 : 500,
    message: isInputError && error instanceof Error ? error.message : fallbackMessage,
  }
}

function requiredText(formData: FormData, field: string) {
  const value = formData.get(field)
  if (typeof value !== 'string' || !value.trim()) throw new ActionInputError(`${field} is required`)
  return value.trim()
}

function optionalText(formData: FormData, field: string) {
  const value = formData.get(field)
  return typeof value === 'string' ? value.trim() : ''
}

async function uploadProjectImage(image: File) {
  if (!image.size) throw new ActionInputError('A project image is required')

  const buffer = Buffer.from(await image.arrayBuffer())
  return new Promise<UploadApiResponse>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'portfolio', resource_type: 'image' }, (error, result) => {
        if (error) reject(error)
        else if (result) resolve(result)
        else reject(new Error('Cloudinary did not return an upload result'))
      })
      .end(buffer)
  })
}

function projectFields(formData: FormData, image: string) {
  return {
    name: requiredText(formData, 'name'),
    description: requiredText(formData, 'description'),
    image,
    link: requiredText(formData, 'link'),
    tech: requiredText(formData, 'tech'),
    role: requiredText(formData, 'role'),
  }
}

function compositionFields(formData: FormData) {
  const categories = formData.getAll('categories').map(String)
  if (!categories.length || categories.some((id) => !mongoose.isValidObjectId(id))) {
    throw new ActionInputError('Select at least one valid category')
  }

  return {
    title: requiredText(formData, 'title'),
    duration: requiredText(formData, 'duration'),
    yearOfComposition: requiredText(formData, 'yearOfComposition'),
    instrumentation: requiredText(formData, 'instrumentation'),
    noteFromComposer: optionalText(formData, 'noteFromComposer'),
    compositionText: optionalText(formData, 'compositionText'),
    youtubeLinks: optionalText(formData, 'youtubeLinks'),
    categories: categories.map((id) => new mongoose.Types.ObjectId(id)),
  }
}

async function removeCloudinaryImage(publicId?: string) {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Could not remove replaced Cloudinary image:', error)
  }
}

function cloudinaryPublicId(url: string) {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean)
    const uploadIndex = segments.indexOf('upload')
    if (uploadIndex === -1) return undefined
    const assetSegments = segments.slice(uploadIndex + 1)
    if (/^v\d+$/.test(assetSegments[0] ?? '')) assetSegments.shift()
    return decodeURIComponent(assetSegments.join('/').replace(/\.[^/.]+$/, ''))
  } catch {
    return undefined
  }
}


export async function addProject(project: FormData){
  let uploadedPublicId: string | undefined

  try {
    const image = project.get('image')
    if (!(image instanceof File)) throw new ActionInputError('A project image is required')

    await connectToDb()
    const upload = await uploadProjectImage(image)
    uploadedPublicId = upload.public_id
    await Project.create(projectFields(project, upload.secure_url))
    revalidatePath('/projects')
    revalidatePath('/admin')
    return { status: 201, message: 'Project added successfully' }
  } catch(error) {
    await removeCloudinaryImage(uploadedPublicId)
    console.error('Could not add project:', error)
    return actionFailure(error, 'The project could not be added because of a server error.')
  }
}

export async function updateProject(id: string, project: FormData) {
  let replacementPublicId: string | undefined

  try {
    if (!mongoose.isValidObjectId(id)) throw new ActionInputError('Invalid project id')
    await connectToDb()

    const existing = await Project.findById(id)
    if (!existing) return { status: 404, message: 'Project not found.' }

    const replacement = project.get('image')
    let image = existing.image
    if (replacement instanceof File && replacement.size > 0) {
      const upload = await uploadProjectImage(replacement)
      replacementPublicId = upload.public_id
      image = upload.secure_url
    }

    const updated = await Project.findByIdAndUpdate(id, projectFields(project, image), {
      new: true,
      runValidators: true,
    })
    if (!updated) throw new Error('Project no longer exists')

    if (replacementPublicId) await removeCloudinaryImage(cloudinaryPublicId(existing.image))
    revalidatePath('/projects')
    revalidatePath('/admin')
    return { status: 200, message: 'Project updated successfully' }
  } catch (error) {
    await removeCloudinaryImage(replacementPublicId)
    console.error('Could not update project:', error)
    return actionFailure(error, 'The project could not be updated because of a server error.')
  }
}


export async function getProjects(){
  try {
    await connectToDb();
    const projects: IProject[] = await Project.find().sort({ _id: -1 })
    return { status: 200, data: projects }
  } catch {
    return { status: 400, data: [] }
  }
}


export async function addComposition(composition: FormData){
  try {
    await connectToDb()
    await Composition.create(compositionFields(composition))
    revalidatePath('/music-catalog')
    revalidatePath('/admin')
    return { status: 201, message: 'Composition added successfully' }
  } catch (error) {
    console.error('Could not add composition:', error)
    return actionFailure(error, 'The composition could not be added because of a server error.')
  }
}

export async function updateComposition(id: string, composition: FormData) {
  try {
    if (!mongoose.isValidObjectId(id)) throw new ActionInputError('Invalid composition id')
    await connectToDb()
    const updated = await Composition.findByIdAndUpdate(id, compositionFields(composition), {
      new: true,
      runValidators: true,
    })
    if (!updated) return { status: 404, message: 'Composition not found.' }

    revalidatePath('/music-catalog')
    revalidatePath(`/music-catalog/${id}`)
    revalidatePath('/admin')
    return { status: 200, message: 'Composition updated successfully' }
  } catch (error) {
    console.error('Could not update composition:', error)
    return actionFailure(error, 'The composition could not be updated because of a server error.')
  }
}


export async function getCompositions(search?: string, category?: string){
  try {
    await connectToDb();
    const filters: Record<string, unknown> = {}
    if (search) filters.title = { $regex: search, $options: 'i' }
    if (category) filters.categories = category
    const compositions: IComposition[] = await Composition.find(filters)
    return { status: 200, data: compositions }
  } catch {
    return { status: 400, data: [] }
  }
}


export async function getSingleComposition(id: string){
  try {
    await connectToDb();
    const composition: IComposition | null = await Composition.findById(id)
    if (!composition) return { status: 404, data: null }
    return { status: 200, data: composition }
  } catch {
    return { status: 400, data: null }
  }
}


export async function addCategory(category: FormData){
  const data = Object.fromEntries(category.entries())
  try {
    await connectToDb();
    await CompositionCategory.create(data)
    revalidatePath('/admin')
    return { status: 201, message: 'Category added successfully' }
  } catch(error) {
    console.error(error)
    return { status: 400, message: 'An error occured' }
  }
}


export async function getCategories(){
  try {
    await connectToDb();
    const categories: ICategory[] = await CompositionCategory.find()
    return { status: 200, data: categories }
  } catch {
    return { status: 400, data: [] }
  }
}


export async function sendEmail(data: FormData){
  const resend = new Resend(process.env.RESEND_API_KEY as string)
  const name = data.get('name') as string
  const email = data.get('email') as string
  const message = data.get('message') as string
  
  try {
    await resend.emails.send({
      from: 'Danny <onboarding@resend.dev>',
      to: [`${process.env.EMAIL_USERNAME}`],
      subject: `Contact Message from ${name}`,
      react: EmailTemplate({ name, email, message }),
      reply_to: email,
      html: `<p style='whitespace: pre-line; font-size: 18px;'>${email} <br /> <br />${message} </p>`
    })

    return { status: 200, message: 'Email sent successfully!' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'An error occured' }
  }
}
