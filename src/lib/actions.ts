'use server'

import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import connectToDb from './mongo';
import { Composition, CompositionCategory, Project } from './models';
import { revalidatePath } from 'next/cache';
import { ICategory, IComposition, IProject } from '@/types';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import { EmailTemplate } from '@/components/EmailTemplate';
import type { JSONContent } from '@tiptap/core';
import { getWorkStoryImages, getWorkStoryYouTubeVideos, hasWorkStoryBody } from './workStory';
import { generateHTML } from '@tiptap/html';
import { workStoryExtensions } from './workStoryExtensions';
import { getYouTubeVideoId } from './youtube';

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string, 
  api_key: process.env.CLOUDINARY_API_KEY as string, 
  api_secret: process.env.CLOUDINARY_API_SECRET as string,  
});

class ActionInputError extends Error {}

function actionFailure(error: unknown, fallbackMessage: string) {
  const isDuplicateKeyError =
    typeof error === 'object' && error !== null && 'code' in error && error.code === 11000
  const isInputError =
    error instanceof ActionInputError ||
    error instanceof mongoose.Error.ValidationError ||
    isDuplicateKeyError

  return {
    status: isInputError ? 400 : 500,
    message: isDuplicateKeyError
      ? 'That Work Story slug is already in use.'
      : isInputError && error instanceof Error
        ? error.message
        : fallbackMessage,
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uploadPortfolioImage(image: File, missingMessage: string) {
  if (!image.size) throw new ActionInputError(missingMessage)
  if (!image.type.startsWith('image/')) throw new ActionInputError('Choose a valid image file')
  if (image.size > 10 * 1024 * 1024) throw new ActionInputError('Images must be smaller than 10 MB')

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
  const name = requiredText(formData, 'name')
  const story = formData.get('story') === 'true'
  const requestedSlug = optionalText(formData, 'slug')
  const slug = story ? slugify(requestedSlug || name) : undefined
  let storyDocument: JSONContent | undefined

  if (story) {
    const rawDocument = requiredText(formData, 'storyDocument')
    try {
      storyDocument = JSON.parse(rawDocument) as JSONContent
    } catch {
      throw new ActionInputError('The Work Story document is invalid')
    }

    if (!storyDocument || storyDocument.type !== 'doc' || !Array.isArray(storyDocument.content)) {
      throw new ActionInputError('The Work Story document is invalid')
    }

    if (!hasWorkStoryBody(storyDocument)) {
      throw new ActionInputError('The Work Story needs content beneath its headings')
    }

    for (const imageNode of getWorkStoryImages(storyDocument)) {
      if (typeof imageNode.alt !== 'string' || !imageNode.alt.trim()) {
        throw new ActionInputError('Every Work Story image needs a useful description')
      }

      try {
        if (typeof imageNode.src !== 'string') throw new Error('Missing source')
        const imageUrl = new URL(imageNode.src)
        if (!['http:', 'https:'].includes(imageUrl.protocol)) throw new Error('Unsupported protocol')
      } catch {
        throw new ActionInputError('Every Work Story image needs a valid remote URL')
      }
    }

    for (const videoNode of getWorkStoryYouTubeVideos(storyDocument)) {
      if (
        typeof videoNode.videoId !== 'string' ||
        getYouTubeVideoId(videoNode.videoId) !== videoNode.videoId
      ) {
        throw new ActionInputError('Every Work Story video needs a valid YouTube URL')
      }

      if (typeof videoNode.title !== 'string' || !videoNode.title.trim()) {
        throw new ActionInputError('Every Work Story video needs a useful title')
      }
    }

    try {
      generateHTML(storyDocument, workStoryExtensions)
    } catch {
      throw new ActionInputError('The Work Story contains unsupported formatting')
    }
  }

  if (story && !slug) throw new ActionInputError('A valid Work Story slug is required')

  return {
    name,
    description: requiredText(formData, 'description'),
    image,
    link: requiredText(formData, 'link'),
    tech: requiredText(formData, 'tech'),
    role: requiredText(formData, 'role'),
    story,
    ...(story ? { slug, storyDocument } : {}),
  }
}

function purchaseLinks(formData: FormData) {
  const lines = optionalText(formData, 'scorePurchaseLinks')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  return lines.map((line, index) => {
    const separator = line.indexOf('|')
    const label = separator === -1 ? '' : line.slice(0, separator).trim()
    const url = separator === -1 ? '' : line.slice(separator + 1).trim()

    if (!label || !url) {
      throw new ActionInputError(`Score link ${index + 1} must use Publisher name | https://…`)
    }

    try {
      const parsed = new URL(url)
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported protocol')
    } catch {
      throw new ActionInputError(`Score link ${index + 1} needs a valid http or https URL`)
    }

    return { label, url }
  })
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
    scorePurchaseLinks: purchaseLinks(formData),
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
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'res.cloudinary.com') return undefined
    const segments = parsed.pathname.split('/').filter(Boolean)
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
    const upload = await uploadPortfolioImage(image, 'A project image is required')
    uploadedPublicId = upload.public_id
    const fields = projectFields(project, upload.secure_url)
    await Project.create(fields)
    revalidatePath('/projects')
    if (fields.story && fields.slug) revalidatePath(`/projects/${fields.slug}`)
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
    const existingStoryImages = existing.storyDocument
      ? getWorkStoryImages(existing.storyDocument as JSONContent)
          .map((imageNode) => imageNode.src)
          .filter((src): src is string => typeof src === 'string')
      : []

    const replacement = project.get('image')
    let image = existing.image
    if (replacement instanceof File && replacement.size > 0) {
      const upload = await uploadPortfolioImage(replacement, 'Choose a replacement project image')
      replacementPublicId = upload.public_id
      image = upload.secure_url
    }

    const fields = projectFields(project, image)
    const update = fields.story
      ? { $set: fields }
      : { $set: fields, $unset: { slug: 1, storyContent: 1, storyDocument: 1 } }
    const updated = await Project.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })
    if (!updated) throw new Error('Project no longer exists')

    if (replacementPublicId) await removeCloudinaryImage(cloudinaryPublicId(existing.image))
    const nextStoryImages = fields.storyDocument
      ? new Set(getWorkStoryImages(fields.storyDocument).map((imageNode) => imageNode.src))
      : new Set()
    await Promise.all(
      existingStoryImages
        .filter((url) => !nextStoryImages.has(url))
        .map((url) => removeCloudinaryImage(cloudinaryPublicId(url))),
    )
    revalidatePath('/projects')
    if (existing.slug) revalidatePath(`/projects/${existing.slug}`)
    if (updated.story && updated.slug) revalidatePath(`/projects/${updated.slug}`)
    revalidatePath('/admin')
    return { status: 200, message: 'Project updated successfully' }
  } catch (error) {
    await removeCloudinaryImage(replacementPublicId)
    console.error('Could not update project:', error)
    return actionFailure(error, 'The project could not be updated because of a server error.')
  }
}

export async function uploadStoryImage(formData: FormData) {
  let uploadedPublicId: string | undefined

  try {
    const image = formData.get('image')
    if (!(image instanceof File)) throw new ActionInputError('Choose an image to upload')
    const upload = await uploadPortfolioImage(image, 'Choose an image to upload')
    uploadedPublicId = upload.public_id
    return { status: 201, message: 'Image uploaded.', url: upload.secure_url }
  } catch (error) {
    await removeCloudinaryImage(uploadedPublicId)
    console.error('Could not upload Work Story image:', error)
    return {
      ...actionFailure(error, 'The image could not be uploaded because of a server error.'),
      url: undefined,
    }
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

export async function getProjectBySlug(slug: string) {
  try {
    await connectToDb()
    const project: IProject | null = await Project.findOne({ story: true, slug })
    if (!project) return { status: 404, data: null }
    return { status: 200, data: project }
  } catch (error) {
    console.error('Could not load Work Story:', error)
    return { status: 500, data: null }
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
