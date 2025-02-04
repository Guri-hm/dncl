import ChallengePage from '@/app/components/ChallengePage';
import { ProcessEnum } from '@/app/enum';
import { Challenge, TreeItems } from '@/app/types';
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

const practiceAssignment: Challenge = {
  items: [
    {
      id: uuidv4(),
      line: "aを表示する",
      children: [],
      lineTokens: ["a"],
      processIndex: ProcessEnum.Output,
      fixed: true
    }
  ],
  task: "コンソールに'30'と表示しましょう",
  hint: "代入文を使い，変数aに値を入れます.",
  answer: ["30", "20"],
};


const allChallengesItems: { [key: string]: Challenge | null } = {
  "1": practiceAssignment,
  "2": null
};

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
