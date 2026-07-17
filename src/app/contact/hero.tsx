import Image from 'next/image'
import danny from '@images/danny.jpg'

export default function AboutPortrait() {
  return (
    <figure className="contact-portrait">
      <Image
        src={danny}
        alt="Daniel Azubuine"
        sizes="(max-width: 767px) 100vw, 42vw"
      />
    </figure>
  )
}
