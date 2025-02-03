import ChallengePage from '@/app/components/ChallengePage';
import { ProcessEnum } from '@/app/enum';
import { TreeItems } from '@/app/types';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'

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

const practiceAssignmentItems: TreeItems = [
  {
    id: uuidv4(),
    line: "aを表示する",
    children: [],
    lineTokens: [
      "a"
    ],
    processIndex: ProcessEnum.Output
  }
]


const allChallengesItems: { [key: string]: TreeItems | null } = {
  "1": practiceAssignmentItems,
  "2": null
};

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const items = allChallengesItems[slug];
  if (!items) {
    return notFound();
  }

  return (
    <ChallengePage initialItems={items}></ChallengePage>
  );
}
