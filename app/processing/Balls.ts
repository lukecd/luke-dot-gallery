// Ball.ts

import p5 from "p5";

const spring = 0.5;
const gravity = 0.001;
const friction = 2;

const backgroundColor = "#15274c";
const colors = ["#007193", "#008c9a", "#f2c35b", "#f36c3d", "#eb3f28"];

class Ball {
	x: number;
	y: number;
	vx: number;
	vy: number;
	diameter: number;
	id: number;
	others: Ball[];
	color: string;

	constructor(x: number, y: number, diameter: number, id: number, others: Ball[], color: string) {
		this.x = x;
		this.y = y;
		this.vx = 0;
		this.vy = 0;
		this.diameter = diameter;
		this.id = id;
		this.others = others;
		this.color = color;
	}

	collide(p: p5) {
		for (let i = this.id + 1; i < this.others.length; i++) {
			const dx = this.others[i].x - this.x;
			const dy = this.others[i].y - this.y;
			const distance = p.sqrt(dx * dx + dy * dy);
			const minDist = this.others[i].diameter / 2 + this.diameter / 2;

			if (distance < minDist) {
				const angle = p.atan2(dy, dx);
				const targetX = this.x + p.cos(angle) * minDist;
				const targetY = this.y + p.sin(angle) * minDist;
				const ax = (targetX - this.others[i].x) * spring;
				const ay = (targetY - this.others[i].y) * spring;
				this.vx -= ax;
				this.vy -= ay;
				this.others[i].vx += ax;
				this.others[i].vy += ay;
			}
		}
	}

	move(p: p5) {
		this.vy += gravity;
		this.x += this.vx;
		this.y += this.vy;
		if (this.x + this.diameter / 2 > p.width) {
			this.x = p.width - this.diameter / 2;
			this.vx *= friction;
		} else if (this.x - this.diameter / 2 < 0) {
			this.x = this.diameter / 2;
			this.vx *= friction;
		}
		if (this.y + this.diameter / 2 > p.height) {
			this.y = p.height - this.diameter / 2;
			this.vy *= friction;
		} else if (this.y - this.diameter / 2 < 0) {
			this.y = this.diameter / 2;
			this.vy *= friction;
		}
	}

	display(p: p5) {
		p.fill(this.color);
		p.ellipse(this.x, this.y, this.diameter, this.diameter);
	}
}

export { Ball, spring, gravity, friction, backgroundColor, colors };
