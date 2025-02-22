import React, { useEffect, useRef } from 'react';

export const FireworksEffect: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const bits = 80;
        const speed = 45;
        const bangs = 5;
        const colours = ["#03f", "#f03", "#0e0", "#93f", "#0cf", "#f93", "#f0c"];
        let bangheight: number[] = new Array(bangs);
        let intensity: number[] = new Array(bangs);
        let colour: number[] = new Array(bangs);
        let Xpos: { [key: string]: number } = {};
        let Ypos: { [key: string]: number } = {};
        let dX: { [key: string]: number } = {};
        let dY: { [key: string]: number } = {};
        let stars: { [key: string]: HTMLElement | undefined } = {};
        let decay: { [key: string]: number } = {};
        let swide = window.innerWidth;
        let shigh = window.innerHeight;

        const set_width = () => {
            if (containerRef.current) {
                swide = containerRef.current.offsetWidth;
                shigh = containerRef.current.offsetHeight;
            }
        };

        const createDiv = (char: string, size: number): HTMLDivElement => {
            const div = document.createElement("div");
            div.style.font = `${size}px monospace`;
            div.style.position = "absolute";
            div.style.backgroundColor = "transparent";
            div.appendChild(document.createTextNode(char));
            return div;
        };

        const write_fire = (N: number) => {
            stars[N + 'r'] = createDiv('|', 12);
            containerRef.current?.appendChild(stars[N + 'r']!);
            for (let i = bits * N; i < bits + bits * N; i++) {
                stars[i.toString()] = createDiv('*', 13);
                //初期状態を非表示にしないとsetTimerの処理が始まるまで表示されてしまう
                stars[i.toString()]!.style.visibility = "hidden"
                containerRef.current?.appendChild(stars[i.toString()]!);
            }
        };

        const launch = (N: number) => {
            colour[N] = Math.floor(Math.random() * colours.length);
            Xpos[N + 'r'] = swide * 0.5;
            Ypos[N + 'r'] = shigh - 5;
            bangheight[N] = Math.round((0.5 + Math.random()) * shigh * 0.4);
            dX[N + 'r'] = (Math.random() - 0.5) * swide / bangheight[N];
            if (dX[N + 'r'] > 1.25) stars[N + 'r']!.firstChild!.nodeValue = "/";
            else if (dX[N + 'r'] < -1.25) stars[N + 'r']!.firstChild!.nodeValue = "\\";
            else stars[N + 'r']!.firstChild!.nodeValue = "|";
            (stars[N + 'r'] as HTMLElement).style.color = colours[colour[N]];
        };

        const bang = (N: number) => {
            let A = 0;
            for (let i = bits * N; i < bits + bits * N; i++) {
                const Z = stars[i.toString()]!.style;
                Z.left = Xpos[i.toString()] + "px";
                Z.top = Ypos[i.toString()] + "px";
                if (decay[i.toString()]) decay[i.toString()]--;
                else A++;
                if (decay[i.toString()] === 15) Z.fontSize = "7px";
                else if (decay[i.toString()] === 7) Z.fontSize = "2px";
                else if (decay[i.toString()] === 1) Z.visibility = "hidden";
                if (decay[i.toString()] > 1 && Math.random() < 0.1) {
                    Z.visibility = "hidden";
                    setTimeout(() => { stars[i.toString()]!.style.visibility = "visible"; }, speed - 1);
                }
                Xpos[i.toString()] += dX[i.toString()];
                Ypos[i.toString()] += (dY[i.toString()] += 1.25 / intensity[N]);
            }
            if (A !== bits) setTimeout(() => bang(N), speed);
        };

        const stepthrough = (N: number) => {
            const oldx = Xpos[N + 'r'];
            const oldy = Ypos[N + 'r'];
            Xpos[N + 'r'] += dX[N + 'r'];
            Ypos[N + 'r'] -= 4;
            if (Ypos[N + 'r'] < bangheight[N]) {
                const M = Math.floor(Math.random() * 3 * colours.length);
                intensity[N] = 5 + Math.random() * 4;
                for (let i = N * bits; i < bits + bits * N; i++) {
                    Xpos[i.toString()] = Xpos[N + 'r'];
                    Ypos[i.toString()] = Ypos[N + 'r'];
                    dY[i.toString()] = (Math.random() - 0.5) * intensity[N];
                    dX[i.toString()] = (Math.random() - 0.5) * (intensity[N] - Math.abs(dY[i.toString()])) * 1.25;
                    decay[i.toString()] = 16 + Math.floor(Math.random() * 16);
                    const Z = stars[i.toString()]!;
                    if (M < colours.length) Z.style.color = colours[i % 2 ? colour[N] : M];
                    else if (M < 2 * colours.length) Z.style.color = colours[colour[N]];
                    else Z.style.color = colours[i % colours.length];
                    Z.style.fontSize = "13px";
                    Z.style.visibility = "visible";
                }
                bang(N);
                launch(N);
            }
            stars[N + 'r']!.style.left = oldx + "px";
            stars[N + 'r']!.style.top = oldy + "px";
        };

        const light_blue_touchpaper = () => {
            set_width();
            for (let i = 0; i < bangs; i++) {
                write_fire(i);
                launch(i);
                setInterval(() => stepthrough(i), speed);
            }
        };

        light_blue_touchpaper();
        window.onresize = set_width;
    }, []);

    return <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }} />;
};

