import { useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
interface Block {
    id: UniqueIdentifier;
    code: string;
}

const SortableContainer = ({
    id,
    items,
    label,
}: {
    id: string;
    items: Block[];
    label: string;
}) => {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div>
            <h3 className="text-xl font-bold text-center">{label}</h3>
            <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
                <div
                    ref={setNodeRef}
                    className="w-full border-2 border-gray-500/75 p-5 mt-2 rounded-md"
                >
                    {items.map((item: Block) => (
                        <SortableItem key={item.id} id={item.id} value={item.code} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
};

export default SortableContainer;
