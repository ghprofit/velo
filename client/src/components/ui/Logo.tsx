import { clsx } from 'clsx';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'icon' | 'secondary';
  theme?: 'light' | 'dark';
}

export default function Logo({
  className,
  size = 'md',
  variant = 'primary',
  theme = 'dark'
}: LogoProps) {
  const sizes = {
    sm: { height: 24, width: variant === 'icon' ? 24 : 95 },
    md: { height: 32, width: variant === 'icon' ? 32 : 126 },
    lg: { height: 40, width: variant === 'icon' ? 40 : 158 }
  };

  const logoPath = {
    primary: `/assets/logo_svgs/Primary_Logo(${theme === 'dark' ? 'black' : 'white'}).svg`,
    secondary: `/assets/logo_svgs/Secondary_Logo(${theme === 'dark' ? 'black' : 'white'}).svg`,
    icon: `/assets/logo_svgs/Brand_Icon(${theme === 'dark' ? 'black' : 'white'}).svg`
  };

  return (
    <div className={clsx('flex items-center', className)}>
      <Image
        src={logoPath[variant]}
        alt="VeloLink"
        width={sizes[size].width}
        height={sizes[size].height}
        priority
        className="object-contain"
      />
    </div>
  );
}
