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
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  value: string;
  wrapperRef?(node: HTMLLIElement): void;
  disabled?: boolean;
  remaining?: number;
  maxUsage?: number;
}

const ListItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      disableSelection,
      disableInteraction,
      ghost,
      attributes,
      listeners,
      style,
      value,
      wrapperRef,
      disabled,
      remaining,
      maxUsage,
      ...rest
    }: Props,
    ref
  ) => {
    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
          disabled && styles.disabled
        )}
        {...attributes}
        {...listeners}
        ref={wrapperRef}
        style={{
          ...style as React.CSSProperties,
          cursor: "grab",
          // touch でのドラッグを安定させる（ブラウザの既定タッチ処理を無効化）
          touchAction: "none",
          // テキスト選択や長押し選択を防ぐとより安定する
          userSelect: "none",
        }}
        {...rest}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          {!disabled && attributes ?
            <Handle /> :
            // <Handle {...attributes} {...listeners} /> :
            <span className={styles.HandlePlaceholder} />
          }
          <span className={styles.Text}>{value}</span>
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
          {/* 残り回数表示 */}
          {typeof maxUsage === 'number' ? (
            <span className={styles.Usage}>
              {(typeof remaining === 'number' ? remaining : maxUsage)}/{maxUsage}
            </span>
          ) : null}
        </div>
      </li>
    );
  }
);


// コンポーネントの displayName を設定
ListItem.displayName = "ListItem";

export default ListItem;