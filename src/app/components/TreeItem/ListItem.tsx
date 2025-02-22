import React, { forwardRef, HTMLAttributes } from "react";
import classNames from "classnames";
import { Handle } from "./Handle";
import styles from "./TreeItem.module.scss";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";

export interface Props extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: DraggableAttributes & SyntheticListenerMap;
  value: string;
  wrapperRef?(node: HTMLLIElement): void;
}

const ListItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref
  ) => {
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={
          {

          } as React.CSSProperties
        }
        {...props}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          <Handle {...handleProps} />
          <span className={styles.Text}>{value}</span>
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  }
);


// コンポーネントの displayName を設定
ListItem.displayName = "ListItem";

export default ListItem;