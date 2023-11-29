import Image from "next/image";
import slash from '@images/slash.png';
import slash2 from '@images/slash2.png';

export default function Lines(){
  return (
    <div>
      <div className="fixed top-0 right-0 -z-50">
        <Image src={slash} alt="slash" width={280} height={280} className="opacity-40" />
      </div>

      <div className="fixed top-12 right-0 -z-50">
        <Image src={slash2} alt="slash" width={280} height={280} className="opacity-40" />
      </div>
    </div>
  )
}