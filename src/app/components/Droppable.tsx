import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";

type DroppableProp = {
    children: ReactNode;
    id: string
    style?: React.CSSProperties;
};

export const Droppable: FC<DroppableProp> = ({ children, id, style }) => {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    })

    return (
        <div
            ref={setNodeRef}
            className={isOver ? "bg-green-200" : ""}
            style={style}
        >
            <div>
                <div></div>
                {children}
            </div>
        </div>
    )
}