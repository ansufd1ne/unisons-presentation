import type { ImageMetadata } from 'astro';

type Img = ImageMetadata;
export type Block =
  | { t: 'lead'; text: string }
  | { t: 'text'; label: string; title?: string; paras?: string[]; items?: string[]; after?: string[]; links?: { label: string; href: string; external?: boolean }[]; note?: string; plain?: boolean }
  | { t: 'image'; img: Img; alt: string; caption?: string; narrow?: boolean }
  | { t: 'gallery'; title?: string; cols?: number; items: { img: Img; alt: string; caption?: string }[] }
  | { t: 'facts'; label: string; title?: string; items: [string, string][]; plain?: boolean }
  | { t: 'videos'; label: string; title?: string; ids: string[] }
  | { t: 'cards'; label: string; title?: string; items: { title: string; text?: string; href: string; img?: Img; external?: boolean }[] }
  | { t: 'people'; label: string; title?: string; items: { name: string; role: string; email?: string; phone?: string }[] }
  | { t: 'timeline'; label: string; title?: string; items: { year: string; title: string; text: string }[] }
  | { t: 'team'; groups: { title: string; people: { name: string; role: string; img?: Img; email?: string }[] }[] }
  | { t: 'downloads'; label: string; title?: string; items: { title: string; desc: string; href: string; meta?: string; external?: boolean }[] }
  | { t: 'shelf'; label: string; title?: string; items: { title: string; author?: string; text?: string; img?: Img; alt?: string }[] }
  | { t: 'listen'; label: string; title?: string; items: { label: string; href: string }[] }
  | { t: 'episodes'; label: string; title?: string; items: { id: string; title: string; meta?: string; short: string; href: string; img?: Img; alt?: string }[] }
  | { t: 'marquee'; words: string[] }
  | { t: 'map'; query: string; address: string; title?: string }
  | { t: 'funding'; img: Img; alt: string; text: string };

export interface PageDef {
  label: string;               // surtitre (rubrique)
  title: string;               // H1
  sub?: string;
  seo: { title: string; description: string };
  hero?: { img: Img; alt: string };
  blocks: Block[];
  noindex?: boolean;
}
