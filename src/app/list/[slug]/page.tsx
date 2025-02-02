import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface SlugPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  return {
    title: `Page ${params.slug}`,
  };
}

export default function SlugPage({ params }: SlugPageProps) {
  const { slug } = params;

  if (!slug) {
    return notFound();
  }

  return (
    <div>
      <h1>{slug}</h1>
    </div>
  );
}
