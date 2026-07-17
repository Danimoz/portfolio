type PageIntroProps = {
  title: string
  description: string
  label?: string
}

export default function PageIntro({ title, description, label }: PageIntroProps) {
  return (
    <header className="page-intro">
      {label ? <p className="page-intro__label">{label}</p> : null}
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}
