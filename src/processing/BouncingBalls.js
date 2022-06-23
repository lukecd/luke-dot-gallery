import { useEffect, useRef } from 'react';
import p5 from 'p5';

/**
 * 
 * A modified version of the code from https://p5js.org/examples/motion-bouncy-bubbles.html
 */
function sketch(p) {
    let numBalls = 30;
    let currentWidth = 0;
    let spring = .5;
    let gravity = 0.001;
    let friction = 2;
    let balls = [];
    let backgroundColor = "#15274c";
    let colors = ['#007193', '#008c9a', '#f2c35b', '#f36c3d', "#eb3f28"];


    // p is a reference to the p5 instance this sketch is attached to
    p.setup = () => {
      currentWidth = window.screen.width;
      p.background(backgroundColor);

      if(window.screen.width <= 600) {
        numBalls = 5;
      }
      else {
        numBalls = 30;
      }
      p.createCanvas(window.screen.width, window.screen.height);
        for (let i = 0; i < numBalls; i++) {
            balls[i] = new Ball(
              p.random(p.width),
              p.random(p.height),
              p.random(30, 70),
              i,
              balls,
              colors[Math.floor(p.random(colors.length-1))]
            );
        }
        p.noStroke();
    }

    // The number of balls we show is conditional based on the screen size.
    // When resizing the screen, we need to force setup to be called to redo things....
    p.windowResized = () => {
      // ... BUT we only want to do it when the width changes
      // Otherwise this will fire when scrolling.
      if(currentWidth !== window.screen.width) {
        currentWidth = window.screen.width;
        p.setup();
      }
    }

    // draw is called 60x (generally) per sec
    p.draw = () => {
        p.background(backgroundColor);
        balls.forEach(ball => {
          ball.collide();
          ball.move();
          ball.display();
        });
    }

    class Ball {
        constructor(xin, yin, din, idin, oin, color) {
          this.x = xin;
          this.y = yin;
          this.vx = 0;
          this.vy = 0;
          this.diameter = din;
          this.id = idin;
          this.others = oin;
          this.color = color;
        }
      
        collide() {
          for (let i = this.id + 1; i < numBalls; i++) {
            let dx = this.others[i].x - this.x;
            let dy = this.others[i].y - this.y;
            let distance = p.sqrt(dx * dx + dy * dy);
            let minDist = this.others[i].diameter / 2 + this.diameter / 2;

            if (distance < minDist) {
              let angle = p.atan2(dy, dx);
              let targetX = this.x + p.cos(angle) * minDist;
              let targetY = this.y + p.sin(angle) * minDist;
              let ax = (targetX - this.others[i].x) * spring;
              let ay = (targetY - this.others[i].y) * spring;
              this.vx -= ax;
              this.vy -= ay;
              this.others[i].vx += ax;
              this.others[i].vy += ay;
            }
          }
        }
      
        move() {
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
      
        display() {
          p.fill(this.color);
          p.ellipse(this.x, this.y, this.diameter, this.diameter);
        }
      }
}

function BouncingBalls() {
    // create a reference to the container in which the p5 instance should place the canvas
    const p5ContainerRef = useRef();

    useEffect(() => {
        // On component creation, instantiate a p5 object with the sketch and container reference 
        const p5Instance = new p5(sketch, p5ContainerRef.current);

        // On component destruction, delete the p5 instance
        return () => {
            p5Instance.remove();
        }
    }, []);

    return (
        <div className="backgroundAnimation" ref={p5ContainerRef} />
    );
}

export default BouncingBalls;