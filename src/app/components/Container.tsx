import React, { CSSProperties, forwardRef } from "react";
import classNames from "classnames";

import styles from "./Container.module.scss";

export interface Props {
    children: React.ReactNode;
    label?: string;
    style?: React.CSSProperties;
    horizontal?: boolean;
    hover?: boolean;
    handleProps?: React.HTMLAttributes<any>;
    scrollable?: boolean;
    onClick?(): void;
}

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
    active?: {
        fill: string;
        background: string;
    };
    cursor?: CSSProperties["cursor"];
}

export const Action = forwardRef<HTMLButtonElement, ActionProps>(
    ({ active, className, cursor, style, ...props }, ref) => {
        return (
            <button
                ref={ref}
                {...props}
                className={classNames(styles.Action, className)}
                tabIndex={0}
                style={
                    {
                        ...style,
                        cursor,
                        "--fill": active?.fill,
                        "--background": active?.background
                    } as CSSProperties
                }
            />
        );
    }
);

export const Handle = forwardRef<HTMLButtonElement, ActionProps>(
    (props, ref) => {
        return (
            <Action
                ref={ref}
                cursor="grab"
                data-cypress="draggable-handle"
                {...props}
            >
                <svg viewBox="0 0 20 20" width="12">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                </svg>
            </Action>
        );
    }
);

export const Container = forwardRef<HTMLDivElement, Props>(
    (
        {
            children,
            handleProps,
            horizontal,
            hover,
            onClick,
            label,
            style,
            scrollable,
            ...props
        }: Props,
        ref
    ) => {
        const Component = onClick ? "button" : "div";

        return (
            <Component
                {...props}
                ref={ref}
                style={
                    {
                        ...style,
                    } as React.CSSProperties
                }
                onClick={onClick}
                tabIndex={onClick ? 0 : undefined}
            >
                {label ? (
                    <div className={styles.Header}>
                        {label}
                        <div className={styles.Actions}>
                            <Handle {...handleProps} />
                        </div>
                    </div>
                ) : null}
                {children}
            </Component>
        );
    }
);
