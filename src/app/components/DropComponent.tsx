import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import SortDropContent from "../components/SortDropContent";
type Props = {
    elms: { id: UniqueIdentifier; name: string }[];
    activeElmId?: string;
    isDropContent?: boolean;
};
export default function DropComponent({
    elms,
    activeElmId,
    isDropContent = false,
}: Props) {
    const { isOver, setNodeRef: dropRef } = useDroppable({
        id: "droppable",
    });
    const dropStyle = {
        padding: "1rem 0 0 0",
        minHeight: "100px",
        width: "200px",
        border: isOver && !isDropContent ? "3px solid white" : ``,
    };
    return (
        <div style={{ margin: "2rem" }}>
            <div ref={dropRef} style={dropStyle}>
                {/* ドロップ領域内の要素群。SortableContextで囲むことで、並べ替えの設定ができる */}
                <SortableContext items={elms} strategy={rectSortingStrategy}>
                    {elms.map((elm) => {
                        return (
                            <SortDropContent
                                key={elm.id}
                                elm={elm}
                                isVirtual={elm.id === activeElmId}
                            ></SortDropContent>
                        );
                    })}
                </SortableContext>
            </div>
        </div>
    );
}