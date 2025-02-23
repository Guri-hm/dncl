import { ChallengePage, getChallengeById } from '@/app/components/Challenge';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `課題 ${slug}`,
  };
}

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const challenge = getChallengeById(slug);
  if (!challenge) {
    return notFound();
  }

  return (
    <ChallengePage challenge={challenge}></ChallengePage>
  );
}
