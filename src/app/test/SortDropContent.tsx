import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
type Props = {
    elm: { id: UniqueIdentifier; name: string };
    isVirtual: boolean;
};
export default function SortDropContent({ elm, isVirtual }: Props) {
    const {
        isDragging,
        // 並び替えのつまみ部分に設定するプロパティ
        setActivatorNodeRef,
        listeners,
        // DOM全体に対して設定するプロパティ
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: elm.id });
    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            <p
                ref={setActivatorNodeRef}
                {...listeners}
                style={{
                    cursor: isDragging ? "grabbing" : "grab",
                    border: "1px solid",
                    margin: "0 0 1rem 0",
                    // 仮で生成されている要素の場合、薄くする。
                    opacity: isVirtual ? ".5" : "1",
                }}
            >
                {elm.name}
            </p>
        </div>
    );
}