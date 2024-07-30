import Image from 'next/image'

export const QuestionMarkIcon: React.FC = () => {
  return (
    <span className="inline">
      <Image src="/startup-finance/images/icons/questionMark.svg" alt="question mark tooltip"
        width={20}
        height={20}
        className="inline"
        />
    </span>
  );
};