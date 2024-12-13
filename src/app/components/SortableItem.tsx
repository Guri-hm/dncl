import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import Item from "./Item";

const SortableItem = ({ id, value }: { id: UniqueIdentifier, value: string }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id });
    // console.log(`id:${id}`)
    // console.log(`value:${value}`)
    return (
        <div
            ref={setNodeRef}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            {...attributes}
            {...listeners}
        >
            <Item key={id} value={value} />
        </div>
    );
};

export default SortableItem;
