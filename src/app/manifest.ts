import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JuniorWallet',
    short_name: 'Jr Wallet',
    description: 'The Smart Allowance Wallet',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#FECD00',
    icons: [
      {
        src: '/assets/JRwallet-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}

