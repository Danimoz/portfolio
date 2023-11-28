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


export async function addProject(project: FormData){
  const image = project.get('image') as File
  const arrayBuffer = await image.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  try {
    await connectToDb();

    const res: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'portfolio' }, function(error, result){
        if (error) {
          reject(error);
          return
        } 
        if (result) resolve(result)
      }).end(buffer)
    })
      
    const projectData = {
      name: project.get('name'),
      description: project.get('description'),
      image: res.secure_url,
      link: project.get('link'),
      tech: project.get('tech'),
      role: project.get('role'),
    }

    await Project.create(projectData)
    revalidatePath('/projects')
    return { status: 201, message: 'Project added successfully' }
    
  } catch(error) {
    console.error(error)
    return { status: 400, message: 'An error occured' }

  }
}


export async function getProjects(){
  try {
    await connectToDb();
    const projects: IProject[] = await Project.find()
    return { status: 200, data: projects }
  } catch(error) {
    return { status: 400, data: [] }
  }
}


export async function addComposition(composition: FormData){
  const data = Object.fromEntries(composition.entries())
  const categories = Array.from(composition.getAll('categories') as unknown as string[])
  const categoryIds = categories.map((categoryId: string) => new mongoose.Types.ObjectId(categoryId));
  try {
    await connectToDb();
    await Composition.create({ 
      title: data.title as string,
      duration: data.duration as string,
      yearOfComposition: data.yearOfComposition as string,
      instrumentation: data.instrumentation as string,
      noteFromComposer: data.noteFromComposer as string,
      compositionText: data.compositionText as string,
      categories: categoryIds,
      youtubeLinks: data.youtubeLinks as string,
    })
    revalidatePath('/music-catalog')
    return { status: 201, message: 'Composition added successfully' }
  } catch(error) { 
    return { status: 400, message: 'An error occured' }
  }
}


export async function getCompositions(search?: string, category?: string){
  try {
    await connectToDb();
    if (search) {
      const compositions: IComposition[] = await Composition.find({ title: { $regex: search, $options: 'i' } })
      return { status: 200, data: compositions }
    }
    if (category) {
      const compositions: IComposition[] = await Composition.find({ categories: category }).populate('categories')
      return { status: 200, data: compositions }
    }
    const compositions: IComposition[] = await Composition.find()
    return { status: 200, data: compositions }
  } catch(error) {
    return { status: 400, data: [] }
  }
}


export async function getSingleComposition(id: string){
  try {
    await connectToDb();
    const composition: IComposition | null = await Composition.findById(id)
    if (!composition) return { status: 404, data: null }
    return { status: 200, data: composition }
  } catch(error) {
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
    console.log(error)
    return { status: 400, message: 'An error occured' }
  }
}


export async function getCategories(){
  try {
    await connectToDb();
    const categories: ICategory[] = await CompositionCategory.find()
    return { status: 200, data: categories }
  } catch(error) {
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