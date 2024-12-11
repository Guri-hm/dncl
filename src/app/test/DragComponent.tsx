import { useDraggable } from "@dnd-kit/core";
export default function DragComponent() {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: "draggable",
        data: { name: "test" },
    });
    const {
        attributes: attributes2,
        listeners: listeners2,
        setNodeRef: setNodeRef2,
        transform: transform2,
    } = useDraggable({
        id: "draggable2",
        data: { name: "test2" },
    });
    const {
        attributes: attributes3,
        listeners: listeners3,
        setNodeRef: setNodeRef3,
        transform: transform3,
    } = useDraggable({
        id: "draggable3",
        data: { name: "test3" },
    });
    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;
    const style2 = transform2
        ? {
            transform: `translate3d(${transform2.x}px, ${transform2.y}px, 0)`,
        }
        : undefined;
    const style3 = transform3
        ? {
            transform: `translate3d(${transform3.x}px, ${transform3.y}px, 0)`,
        }
        : undefined;
    return (
        <div>
            <button ref={setNodeRef} style={style} {...listeners} {...attributes}>
                テスト
            </button>
            <button ref={setNodeRef2} style={style2} {...listeners2} {...attributes2}>
                テスト2
            </button>
            <button ref={setNodeRef3} style={style3} {...listeners3} {...attributes3}>
                テスト3
            </button>
        </div>
    );
}