export type IProject = {
  _id?: string,
  name: string,
  description: string,
  image: string,
  link: string,
  tech: string,
  role: string,
  story?: boolean,
  slug?: string,
  storyContent?: string,
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

