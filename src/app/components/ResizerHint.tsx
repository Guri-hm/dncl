// ...existing code...
"use client";
import React, { useEffect, useState } from "react";

export default function ResizerHint() {
    const [visible, setVisible] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let isPointerDown = false;
        const selectors = [".sash"]; // 検出対象セレクタ

        const elementIsResizer = (el: Element | null) => {
            if (!el) return false;
            return selectors.some((sel) => !!el.closest && !!el.closest(sel));
        };

        const onPointerMove = (e: PointerEvent) => {
            if (isPointerDown) {
                if (visible) setVisible(false);
                return;
            }
            const el = document.elementFromPoint(e.clientX, e.clientY) as Element | null;
            if (elementIsResizer(el)) {
                setPos({ x: e.clientX + 12, y: e.clientY + 12 });
                if (!visible) setVisible(true);
            } else {
                if (visible) setVisible(false);
            }
        };

        const onPointerDown = () => {
            isPointerDown = true;
            setVisible(false);
        };
        const onPointerUp = () => {
            isPointerDown = false;
        };

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerdown", onPointerDown, true);
        document.addEventListener("pointerup", onPointerUp, true);

        return () => {
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerdown", onPointerDown, true);
            document.removeEventListener("pointerup", onPointerUp, true);
        };
    }, [visible]);

    const tipStyle: React.CSSProperties = {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        transform: "translate(-50%, -100%)",
        pointerEvents: "none",
        backgroundColor: "white",
        color: "black",
        padding: "10px",
        borderRadius: 10,
        fontSize: "1rem",
        fontWeight: 400,
        zIndex: 9999,
        whiteSpace: "nowrap",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    };

    return visible ? <div aria-hidden style={tipStyle}>ドラッグで調節できます</div> : null;
}