import { IProject } from "@/types";
import mongoose, { Schema, model } from "mongoose";

const projectSchema = new Schema<IProject>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  link: { type: String, required: true },
  tech: { type: String, required: true },
  role: { type: String, required: true },
  date: { type: Date, default: Date.now },
});


const compositionCategorySchema = new Schema({ 
  name: { type: String, required: true },
  _id: { type: Schema.Types.ObjectId, }
})

const compositionSchema = new Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  yearOfComposition: { type: String, required: true },
  instrumentation: { type: String, required: true },
  noteFromComposer: String,
  compositionText: String,
  youtubeLinks: String,
  categories: [{ type: Schema.Types.ObjectId, ref: 'CompositionCategory' }],
})


export const Project = mongoose.models.Project || model("Project", projectSchema);
export const Composition = mongoose.models.Composition || model("Composition", compositionSchema);
export const CompositionCategory = mongoose.models.CompositionCategory || model("CompositionCategory", compositionCategorySchema);