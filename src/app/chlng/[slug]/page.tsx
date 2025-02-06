import ChallengePage from '@/app/components/ChallengePage';
import { allChallengesItems } from '@/app/components/Challenges';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface SlugPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Page ${slug}`,
  };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const challenge = allChallengesItems[slug];
  if (!challenge) {
    return notFound();
  }

  return (
    <ChallengePage challenge={challenge}></ChallengePage>
  );
}
