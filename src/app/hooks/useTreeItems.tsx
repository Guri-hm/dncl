import { useCallback, useEffect, useState } from 'react'
import { TreeItems } from '@/app/types';

/**
 * ストロークを保存するローカルストレージのキー名。
 */
const STORAGE_KEY_ALL_STROKES = `${process.env.domain}${process.env.clientPort}/edit`;
/**
 * ストローク保存を扱うためのフック。
 */
export const useTreeItems = (defaultValue: TreeItems): [items: TreeItems, setItems: (items: TreeItems) => void] => {
    const [itemsInternal, setItemsInternal] = useState(defaultValue);

    useEffect(() => {
        const json: string = localStorage.getItem(STORAGE_KEY_ALL_STROKES) || "";
        if (json && json !== "undefined") {
            setItemsInternal(JSON.parse(json) as TreeItems);
        }
    }, [setItemsInternal]);

    const setItems = useCallback(
        (itemsStrage: TreeItems) => {
            localStorage.setItem(STORAGE_KEY_ALL_STROKES, JSON.stringify(itemsStrage));
            setItemsInternal(itemsStrage);
        },
        [setItemsInternal]
    );

    return [itemsInternal, setItems];
};

export const loadTreeItems = (): TreeItems | null => {
    if (typeof window !== 'undefined') {
        const json: string = localStorage.getItem(STORAGE_KEY_ALL_STROKES) || "";
        if (json && json !== "undefined") {
            return JSON.parse(json) as TreeItems;
        }
    }
    return null;
};

export const removeLocalStrage = () => {
    localStorage.removeItem(STORAGE_KEY_ALL_STROKES);

}
