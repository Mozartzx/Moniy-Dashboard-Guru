import Image from 'next/image';

export const phoneScreens = {
  pilih: { src: '/landing/screens/kondisi.webp', alt: 'Layar cerita Moniy: pilih salah satu dari tiga supplier dengan harga berbeda.' },
  event: { src: '/landing/screens/kejadian.webp', alt: 'Layar cerita Moniy: random event muncul dan kamu memilih tindakan.' },
  hasil: { src: '/landing/screens/hasil.webp', alt: 'Layar cerita Moniy: hasil dari supplier yang kamu pilih.' },
  ending: { src: '/landing/screens/ending.webp', alt: 'Layar akhir cerita Moniy: lencana Kancil Cerdik sebagai pencapaian.' },
} as const;

/** Bingkai ponsel; layar yang aktif ditentukan pemanggil lewat `index`. */
export function PhoneFrame({ screens, index }: { screens: ReadonlyArray<{ src: string; alt: string }>; index: number }) {
  return (
    <div className="nx-phone">
      <div className="nx-phone-screen">
        {screens.map((screen, i) => (
          <Image key={screen.src} src={screen.src} alt={screen.alt} width={780} height={1688} sizes="(max-width: 860px) 62vw, 300px" className="nx-screen" data-active={i === index} aria-hidden={i !== index} loading="eager" fetchPriority={i === 0 ? 'auto' : 'low'} />
        ))}
      </div>
    </div>
  );
}
