import { FC } from "react";
import { clsx } from "clsx";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import styles from "./SimpleSortableItem.module.scss";

type Item = {
    id: number;
    text: string;
};
export type SimpleSortableItemProps = {
    item: Item;
};

export const SimpleSortableItem: FC<SimpleSortableItemProps> = ({ item }) => {
    const {
        isDragging,
        // 並び替えのつまみ部分に設定するプロパティ
        setActivatorNodeRef,
        attributes,
        listeners,
        // DOM全体に対して設定するプロパティ
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: item.id,
    });

    return (
        <div
            className={clsx(styles.ItemWrapper, {
                [styles._active]: isDragging,
            })}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            <div className={styles.Item} ref={setNodeRef}>
                <span
                    ref={setActivatorNodeRef}
                    className="mdi mdi-drag"
                    style={{
                        backgroundColor: 'red',
                        cursor: isDragging ? "grabbing" : "grab",
                    }}
                    {...attributes}
                    {...listeners}
                >aaa</span>
                <div className={styles.Item__content}>{JSON.stringify(item)}</div>
            </div>
        </div>
    );
};
