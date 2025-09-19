import React, { forwardRef, HTMLAttributes, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { Action } from "./Action";
import { Handle } from "./Handle";
import { Remove } from "./Remove";
import { Edit } from "./Edit";
import styles from "./TreeItem.module.scss";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { Tooltip, Typography } from "@mui/material";

export interface Props extends HTMLAttributes<HTMLLIElement> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  fixed?: boolean;
  canEdit?: boolean; // 編集可能かどうかのフラグを追加
  onCollapse?(): void;
  onRemove?(): void;
  onEdit?(): void; // 編集ボタンのハンドラを追加
  wrapperRef?(node: HTMLLIElement): void;
}

const TreeItem = forwardRef<HTMLDivElement, Props>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      attributes,
      listeners,
      indentationWidth,
      indicator,
      collapsed,
      onCollapse,
      onRemove,
      onEdit, // 編集ハンドラを追加
      style,
      value,
      wrapperRef,
      fixed = false,
      canEdit = true, // デフォルトは編集可能
      ...props
    },
    ref
  ) => {
    // fixedがtrueの場合は強制的にcanEditをfalseにする
    const effectiveCanEdit = fixed ? false : canEdit;
    const textRef = useRef<HTMLSpanElement | null>(null);
    const [isEllipsis, setIsEllipsis] = useState(false);
    const [tooltipOpen, setTooltipOpen] = useState(false);

    const checkEllipsis = () => {
      const el = textRef.current;
      if (!el) { setIsEllipsis(false); return false; }
      const ell = el.scrollWidth > el.clientWidth;
      setIsEllipsis(ell);
      return ell;
    };

    useEffect(() => {
      // 初回と value 変更時に判定
      checkEllipsis();
    }, [value]);

    useEffect(() => {
      // リサイズ時に判定して tooltip が開いていたら閉じる
      let timeoutId: number | undefined;
      const onResize = () => {
        if (timeoutId) window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          const ell = checkEllipsis();
          if (!ell) setTooltipOpen(false);
        }, 100);
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        if (timeoutId) window.clearTimeout(timeoutId);
      };
    }, []);
    const handleMouseEnter = () => {
      const ell = checkEllipsis();
      if (ell) setTooltipOpen(true);
    };
    const handleMouseLeave = () => setTooltipOpen(false);
    const handleFocus = () => { if (checkEllipsis()) setTooltipOpen(true); };
    const handleBlur = () => setTooltipOpen(false);

    return (
      <li
        className={classNames(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction
        )}
        ref={wrapperRef}
        style={
          {
            "--spacing": `${indentationWidth * depth}px`,
          } as React.CSSProperties
        }
        {...props}
      >
        <div className={styles.TreeItem} ref={ref} style={style}>
          {fixed ?
            null
            :
            <Handle {...attributes} {...listeners} />
          }
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={classNames(
                styles.Collapse,
                collapsed && styles.collapsed
              )}
            >
              {collapseIcon}
            </Action>
          )}
          <Tooltip title={value || ''} arrow open={tooltipOpen && isEllipsis}>
            <Typography
              component="span"
              className={styles.Text}
              ref={textRef}
              noWrap
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onTouchStart={handleMouseEnter}
              onTouchEnd={handleMouseLeave}
            >
              {value}
            </Typography>
          </Tooltip>
          {!clone && !fixed && effectiveCanEdit && (
            <Edit onClick={onEdit} />
          )}
          {!clone && !fixed && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}

        </div>
      </li>
    );
  }
);

const collapseIcon = (
  <svg width="10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 41">
    <path d="M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z" />
  </svg>
);

// コンポーネントの displayName を設定
TreeItem.displayName = "TreeItem";

export default TreeItem;