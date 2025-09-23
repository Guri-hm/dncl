import React, { CSSProperties } from 'react';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ListItem, { Props as ListItemProps } from './ListItem';

interface Props extends ListItemProps {
  id: string;
  disabled?: boolean;
  remaining?: number;
  maxUsage?: number;
}

const animateLayoutChanges: AnimateLayoutChanges = ({ isSorting, wasDragging }) =>
  isSorting || wasDragging ? false : true;

export function FragmentsListItem({ id, disabled, ...props }: Props) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    animateLayoutChanges,
  });
  const appliedAttributes = disabled ? undefined : attributes;
  const appliedListeners = disabled ? undefined : listeners;
  const draggableRef = disabled ? undefined : setDraggableNodeRef;

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };
  return (
    <ListItem
      ref={draggableRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      ghost={isDragging}
      disabled={disabled}
      disableInteraction={isSorting}
      attributes={appliedAttributes}
      listeners={appliedListeners}
      {...props}
    />
  );
}
