import React, { CSSProperties, ReactNode } from 'react';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from "./TreeItem.module.scss";
import handleStyles from "./IconHandle.module.scss";
import { Props as ListItemProps } from './ListItem';
import { Handle } from './Handle';
import { StatementEnum } from '@/app/enum';
import SvgIcon from '@mui/material/SvgIcon';

interface Props extends ListItemProps {
  id: string;
  statementType: StatementEnum;
  isIcon: boolean;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

interface WordIconProps {
  text: string;
  sup?: string;
}
const WordIcon: React.FC<WordIconProps> = ({ text }) => {
  return (
    <SvgIcon viewBox="0 0 24 24">
      <text x="2" y="20" fontSize="20" >{text}</text>
    </SvgIcon>
  );
};
const WordWithLeftSupscriptIcon: React.FC<WordIconProps> = ({ text, sup }) => {
  return (
    <SvgIcon viewBox="0 0 24 24">
      <text x="0" y="8" fontSize="10" >{sup}</text>
      <text x="9" y="20" fontSize="17" >{text}</text>
    </SvgIcon>
  );
};
const WordWithRightSupscriptIcon: React.FC<WordIconProps> = ({ text, sup }) => {
  return (
    <SvgIcon viewBox="0 0 24 24">
      <text x="0" y="20" fontSize="17" >{text}</text>
      <text x="16" y="8" fontSize="10" >{sup}</text>
    </SvgIcon>
  );
};
export function LineIconItem({ id, value, statementType, isIcon, ...props }: Props) {
  const {
    attributes,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  let svg: ReactNode = null;
  switch (statementType) {
    case StatementEnum.Output:
      svg = <WordIcon text='表'></WordIcon>
      break;
    case StatementEnum.Input:
      svg = <WordIcon text='代'></WordIcon>
      break;
    case StatementEnum.Condition:
      svg = <WordIcon text='条'></WordIcon>
      break;
    case StatementEnum.ConditionalLoopPreTest:
      svg = <WordIcon text='繰'></WordIcon>
      break;
    case StatementEnum.ConditionalLoopPostTest:
      svg = <WordWithLeftSupscriptIcon text='繰' sup='条'></WordWithLeftSupscriptIcon>
      break;
    case StatementEnum.SequentialIteration:
      svg = <WordWithRightSupscriptIcon text='繰' sup='条'></WordWithRightSupscriptIcon>
      break;
    case StatementEnum.UserDefinedfunction:
      svg = <WordIcon text='定'></WordIcon>
      break;
    case StatementEnum.ExecuteUserDefinedFunction:
      svg = <WordIcon text='関'></WordIcon>
      break;
  }

  return (
    <li
      ref={setDroppableNodeRef}
      style={style}
      {...props}
      {...{ ...attributes, ...listeners }}

    >
      <div className={styles.TreeItem} ref={setDraggableNodeRef} style={style}>
        {isIcon ?
          <Handle {...{ ...attributes, ...listeners }} svg={svg} className={`${handleStyles.IconHandle}`} />
          :
          <Handle {...{ ...attributes, ...listeners }} />
        }
        <span>{value}</span>
      </div>
    </li>
  );
}