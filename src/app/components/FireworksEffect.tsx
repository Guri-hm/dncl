import React, { useEffect } from 'react';

const FireworksEffect: React.FC = () => {
    useEffect(() => {
        const bits = 80;
        const speed = 45;
        const bangs = 5;
        const colours = ["#03f", "#f03", "#0e0", "#93f", "#0cf", "#f93", "#f0c"];
        let bangheight: number[] = new Array(bangs);
        let intensity: number[] = new Array(bangs);
        let colour: number[] = new Array(bangs);
        let Xpos: number[] = new Array(bangs);
        let Ypos: number[] = new Array(bangs);
        let dX: number[] = new Array(bangs);
        let dY: number[] = new Array(bangs);
        let stars: (HTMLElement | undefined)[] = new Array(bits * bangs);
        let decay: number[] = new Array(bits * bangs);
        let swide = window.innerWidth;
        let shigh = window.innerHeight;
        let boddie: HTMLDivElement;

        const set_width = () => {
            swide = window.innerWidth;
            shigh = window.innerHeight;
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
            stars[N * bits + bits] = createDiv('|', 12);
            boddie.appendChild(stars[N * bits + bits]!);
            for (let i = bits * N; i < bits + bits * N; i++) {
                stars[i] = createDiv('*', 13);
                boddie.appendChild(stars[i]!);
            }
        };

        const launch = (N: number) => {
            colour[N] = Math.floor(Math.random() * colours.length);
            Xpos[N * bits + bits] = swide * 0.5;
            Ypos[N * bits + bits] = shigh - 5;
            bangheight[N] = Math.round((0.5 + Math.random()) * shigh * 0.4);
            dX[N * bits + bits] = (Math.random() - 0.5) * swide / bangheight[N];
            if (dX[N * bits + bits] > 1.25) stars[N * bits + bits]!.firstChild!.nodeValue = "/";
            else if (dX[N * bits + bits] < -1.25) stars[N * bits + bits]!.firstChild!.nodeValue = "\\";
            else stars[N * bits + bits]!.firstChild!.nodeValue = "|";
            (stars[N * bits + bits] as HTMLElement).style.color = colours[colour[N]];
        };

        const bang = (N: number) => {
            let A = 0;
            for (let i = bits * N; i < bits + bits * N; i++) {
                const Z = stars[i]!.style;
                Z.left = Xpos[i] + "px";
                Z.top = Ypos[i] + "px";
                if (decay[i]) decay[i]--;
                else A++;
                if (decay[i] === 15) Z.fontSize = "7px";
                else if (decay[i] === 7) Z.fontSize = "2px";
                else if (decay[i] === 1) Z.visibility = "hidden";
                if (decay[i] > 1 && Math.random() < 0.1) {
                    Z.visibility = "hidden";
                    setTimeout(() => { stars[i]!.style.visibility = "visible"; }, speed - 1);
                }
                Xpos[i] += dX[i];
                Ypos[i] += (dY[i] += 1.25 / intensity[N]);
            }
            if (A !== bits) setTimeout(() => bang(N), speed);
        };

        const stepthrough = (N: number) => {
            const oldx = Xpos[N * bits + bits];
            const oldy = Ypos[N * bits + bits];
            Xpos[N * bits + bits] += dX[N * bits + bits];
            Ypos[N * bits + bits] -= 4;
            if (Ypos[N * bits + bits] < bangheight[N]) {
                const M = Math.floor(Math.random() * 3 * colours.length);
                intensity[N] = 5 + Math.random() * 4;
                for (let i = N * bits; i < bits + bits * N; i++) {
                    Xpos[i] = Xpos[N * bits + bits];
                    Ypos[i] = Ypos[N * bits + bits];
                    dY[i] = (Math.random() - 0.5) * intensity[N];
                    dX[i] = (Math.random() - 0.5) * (intensity[N] - Math.abs(dY[i])) * 1.25;
                    decay[i] = 16 + Math.floor(Math.random() * 16);
                    const Z = stars[i]!;
                    if (M < colours.length) Z.style.color = colours[i % 2 ? colour[N] : M];
                    else if (M < 2 * colours.length) Z.style.color = colours[colour[N]];
                    else Z.style.color = colours[i % colours.length];
                    Z.style.fontSize = "13px";
                    Z.style.visibility = "visible";
                }
                bang(N);
                launch(N);
            }
            stars[N * bits + bits]!.style.left = oldx + "px";
            stars[N * bits + bits]!.style.top = oldy + "px";
        };

        const light_blue_touchpaper = () => {
            boddie = document.createElement("div");
            boddie.style.position = "fixed";
            boddie.style.top = "0px";
            boddie.style.left = "0px";
            boddie.style.overflow = "visible";
            boddie.style.width = "1px";
            boddie.style.height = "1px";
            boddie.style.backgroundColor = "transparent";
            document.body.appendChild(boddie);
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

    return null;
};

export default FireworksEffect;