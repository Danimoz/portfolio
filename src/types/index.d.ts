export type IProject = {
  name: string,
  description: string,
  image: string,
  link: string,
  tech: string,
  role: string,
  date: Date
}


export type ICategory = {
  name: string,
  _id: string
}


export type IComposition = {
  title: string,
  duration: string,
  yearOfComposition: string,
  instrumentation: string,
  noteFromComposer: string,
  compositionText: string,
  youtubeLinks: string,
  categories: string[],
  _id: string
}

