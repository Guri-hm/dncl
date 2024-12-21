import { useDroppable } from "@dnd-kit/core";
import { FC, ReactNode } from "react";

type DroppableProp = {
    children: ReactNode;
    id: string
};

export const Droppable: FC<DroppableProp> = ({ children, id }) => {
    const {
        setNodeRef,
        isOver
    } = useDroppable({
        id
    })

    return (
        <div
            ref={setNodeRef}

        >
            <div>
                <div>ドロップエリア</div>
                {children}
            </div>
        </div>
    )
}