// sketch.ts
import p5 from "p5";
import { Ball, spring, gravity, friction, backgroundColor, colors } from "./Balls";

const sketch = (p: p5) => {
	let numBalls = 30;
	let currentWidth = 0;
	const balls: Ball[] = [];

	p.setup = () => {
		if (typeof window !== "undefined") {
			currentWidth = window.innerWidth;
			p.background(backgroundColor);

			numBalls = window.innerWidth <= 600 ? 5 : 30;

			p.createCanvas(window.innerWidth, window.innerHeight);
			for (let i = 0; i < numBalls; i++) {
				balls[i] = new Ball(
					p.random(p.width),
					p.random(p.height),
					p.random(30, 70),
					i,
					balls,
					colors[Math.floor(p.random(colors.length))],
				);
			}
			p.noStroke();
		}
	};

	p.windowResized = () => {
		if (typeof window !== "undefined") {
			if (currentWidth !== window.innerWidth) {
				currentWidth = window.innerWidth;
				p.setup();
			}
		}
	};

	p.draw = () => {
		if (typeof window !== "undefined") {
			p.background(backgroundColor);
			balls.forEach((ball) => {
				ball.collide(p);
				ball.move(p);
				ball.display(p);
			});
		}
	};
};

export default sketch;
