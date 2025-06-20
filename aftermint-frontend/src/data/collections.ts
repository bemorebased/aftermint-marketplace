export interface Collection { 
  id: string; // Contract address
  name: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  logoUrl: string;
  bannerUrl?: string; 
  floorPrice?: number;
  volume24h?: number;
  items?: number;
  owners?: number;
}

export const basedCollections: Collection[] = [
  {
    id: '0x949e7fe81c82d0b4f4c3e17f2ca1774848e4ae81',
    name: 'FancyFrogFamily',
    website: 'https://www.fancyfrogfamily.com/',
    twitter: 'https://x.com/IT4Station',
    telegram: undefined,
    logoUrl: 'https://www.fancyfrogfamily.com/images/logo/000_logo.png',
    bannerUrl: undefined,
  },
  {
    id: '0xd819b90f7a7f8e85639671d2951285573bbf8771',
    name: 'Based Pepe',
    website: undefined,
    twitter: 'https://x.com/basedpepenft',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1904884065343258624/Vba939p0_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1884239993247240192/1738075616/1500x500',
  },
  {
    id: '0xae6a76d106fd5f799a2501e1d563852da88c3db5',
    name: 'Gang Game Evolution',
    website: 'gangamevolutionbased.online',
    twitter: 'https://x.com/GanGamEvolution',
    telegram: 'https://t.co/DOIPPEYBNF',
    logoUrl: 'https://pbs.twimg.com/profile_images/1910058281579528192/YYuJqVlF_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1906940747347070976/1743485575/1500x500',
  },
  {
    id: '0x1639269ed4fe6ff1fc1218cc1cb485313eb50a21',
    name: 'LifeNodes',
    website: 'https://basedai.art/',
    twitter: 'https://x.com/BasedLifeNodes',
    telegram: 'https://t.me/lifenodes',
    logoUrl: 'https://pbs.twimg.com/profile_images/1912414230336180224/Q_K-eZn__400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1890893149934858241/1745573721/1500x500',
  },
  {
    id: '0x40b6184b901334c0a88f528c1a0a1de7a77490f1',
    name: 'KEKTECH',
    website: 'https://www.kektech.xyz/',
    twitter: 'https://x.com/KektechNFT',
    telegram: 'https://t.me/KEKTECH',
    logoUrl: 'https://pbs.twimg.com/profile_images/1907886210724364288/xNKmFj9s_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1907383327092359168/1743710496/1500x500',
  },
  {
    id: '0xa8a1087c73e9d6980b42df91149f96b99f75970e',
    name: 'Test Taco',
    website: 'nachonft.xyz',
    twitter: 'https://x.com/nachonft_xyz',
    telegram: undefined,
    logoUrl: 'https://3oh.myfilebase.com/ipfs/QmSK8KA8UbDYWBA5qA6BhabC6xwoc61VtyhrFmeoQ3b5QW.png',
    bannerUrl: 'https://www.nachonft.xyz/headers/test-tacos.png',
  },
  {
    id: '0xd4b1516eea9ccd966629c2972dab8683069ed7bc',
    name: 'BasedBeasts',
    website: 'https://www.basedbeasts.xyz/',
    twitter: 'https://x.com/TheDiscoFrog',
    telegram: undefined,
    logoUrl: 'https://ipfs.io/ipfs/QmZH1A4CWbqh9b1ueCUibUYZawDPy4GRkxXqKpujwvW7PM',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1743117866184929280/1742407630/1500x500',
  },
  {
    id: '0xa0c2262735c1872493c92ec39aff0d9b6894d8fd',
    name: 'PepperCorn Genesis',
    website: undefined,
    twitter: 'https://x.com/PepperCorn15953',
    telegram: 'https://t.me/peppercornisgudcoin',
    logoUrl: 'https://pbs.twimg.com/profile_images/1912790640988946433/93LxnMNB_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1908148796162445312/1744906164/1500x500',
  },
  {
    id: '0x92c2075f517890ed333086f3c4e2bfc3ebf57b5d',
    name: 'Dank Pepes',
    website: 'dankpepes.io',
    twitter: 'https://x.com/dank_pepes',
    telegram: 'The Dank Lounge',
    logoUrl: 'https://pbs.twimg.com/profile_images/1904732858323009536/TIWjPpin_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1900002904377102336/1745118780/1500x500',
  },
  {
    id: '0x22af27d00c53c0fba14446958864db7e3fe0852c',
    name: 'PixelPepes',
    website: undefined,
    twitter: 'https://x.com/pxlpepes',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1915049463825018881/2RLzSbBj_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1914470955058954240/1745335435/1500x500',
  },
  {
    id: '0xd81dcfbb84c6a29c0c074f701eceddf6cba7877f',
    name: 'Peps',
    website: undefined,
    twitter: 'https://x.com/RealPeposhi',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1903806957292810240/ur3Xm_Ax_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1355098383774605313/1742737936/1500x500',
  },
  {
    id: '0x2f3df3922990e63a239d712964795efd9a150dd1',
    name: 'KEKISTANIOS',
    website: undefined,
    twitter: 'https://x.com/kekistanio62517',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1896681606078750720/UiiHVSXO_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1896680553086115840/1741045445/1500x500',
  },
  {
    id: '0xd36199215717f858809b0e62441c1f81adbf3d2c',
    name: 'CosmicPond',
    website: 'https://cosmicpond.net/',
    twitter: 'https://x.com/CosmicPondNFT',
    telegram: 'https://t.me/CosmicPond',
    logoUrl: 'https://pbs.twimg.com/profile_images/1898913093465337856/p-bGc3Mq_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1898909967027146752/1741571137/1500x500',
  },
  {
    id: '0x853efb327ea5d8766265b78c5b9092e2a85a8f70',
    name: 'The Based Man Collection',
    website: undefined,
    twitter: 'https://x.com/carpetfrawg',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/media/GmeQSf5WoAAwvUo?format=jpg&name=large',
    bannerUrl: 'https://pbs.twimg.com/media/Gn2D7tfXIAALZwW?format=png&name=large',
  },
  {
    id: '0x44dF92D10E91fa4D7E9eAd9fF6A6224c88ae5152',
    name: 'Pepe Rocks',
    website: undefined,
    twitter: 'https://x.com/RocksPepe',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1910144664059166720/6A7cs9EQ_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1910144452397821952/1744249064/1500x500',
  },
  {
    id: '0xd480f4a34a1740a5b6fd2da0d3c6cc6a432b56f2',
    name: 'Based Whales',
    website: 'basedsea.xyz',
    twitter: 'https://x.com/basedsea_xyz',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1904857423279775746/4t3KvYGx_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1904857193629048834/1742988775/1500x500',
  },
  {
    id: '0x36003438a167d13043028d794290dda93fea1236',
    name: 'Lil Coalies',
    website: 'https://lilcoalies.com/',
    twitter: 'https://x.com/LilCoalies',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1915215931095265280/fckrzPoY_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1908363293020110848/1745458441/1500x500',
  },
  {
    id: '0xaf024210fdb085fc73b3f1ca1d7d722574f0133b',
    name: 'DEMWORLD',
    website: undefined,
    twitter: 'https://x.com/THEDEMWORLD',
    telegram: undefined,
    logoUrl: 'https://pbs.twimg.com/profile_images/1897011933347201024/_kV-yNOJ_400x400.jpg',
    bannerUrl: 'https://pbs.twimg.com/profile_banners/1897009617369989120/1741676552/1500x500',
  },
]; 