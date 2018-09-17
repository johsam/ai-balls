/* global pl:true, Vec2:true */
/* eslint class-methods-use-this: off*/
/* eslint prefer-destructuring: off*/
/* eslint no-plusplus: off */

const IMMORTAL = 0;
const ELITE = 1;
const RANDOMIZED = 2;
const CHILD = 3;
const DEAD = 4;

/* eslint-disable-next-line*/
class Ball {
    constructor(testbed, world, id) {
        const shape = pl.Circle(1.0);
        this._idx = id;

        this._x = -45 + Math.random() * 7;
        this._y = 35;
        this._alive = true;
        this._airborne = true;
        this._upper = true;
        this._bounced = false;
        this._bornAs = CHILD;
        this._jumps = 0;
        this._jumpAttemps = 0;
        this._testbed = testbed;
        this._body = world.createDynamicBody(Vec2(this.x, this.y));
        this._fixture = this._body.createFixture(shape, {
            restitution: 0.1,
            density: 1,
            filterGroupIndex: -1,
            userData: {
                tag: 'ball',
                self: this
            }
        });

        this._boxClosest = undefined;
        this._boxDistance = 0;

        this._color = testbed.color(1.0, 1.0, 1.0);
        this._grayColor = testbed.color(0.5, 0.5, 0.5);
        this._body.setActive(false);
    }

    get IMMORTAL() {
        return IMMORTAL;
    }

    get ELITE() {
        return ELITE;
    }

    get RANDOMIZED() {
        return RANDOMIZED;
    }
    get CHILD() {
        return CHILD;
    }
    get DEAD() {
        return DEAD;
    }

    get id() {
        return this._idx;
    }

    reset() {
        this._body.setPosition(Vec2(this._x, this._y));
        this._body.setLinearVelocity(Vec2(0.0, 0.0));
        this._body.setAngularVelocity(0.0);
        this._alive = true;
        this._airborne = true;
        this._bounced = false;
        this._jumpAttemps = 0;
        this._jumps = 0;
        this._boxClosest = undefined;
        this._boxDistance = 0;
    }

    start() {
        this._body.setActive(true);
    }

    set alive(alive) {
        this.bornAs = DEAD;
        this._alive = alive;
        this._body.setActive(alive);
        this._body.setLinearVelocity(Vec2(0.0, 0.0));
        this._body.setAngularVelocity(0.0);
    }

    get alive() {
        return this._alive;
    }

    set airborne(airborne) {
        this._airborne = airborne;
    }

    get airborne() {
        return this._airborne;
    }

    set upper(tf) {
        this._upper = tf;
    }

    get upper() {
        return this._upper;
    }

    set bounced(tf) {
        this._bounced = tf;
    }

    get bounced() {
        return this._bounced;
    }

    get jumps() {
        return this._jumps;
    }

    get bornAs() {
        return this._bornAs;
    }

    jump() {
        
        if (this._jumps > 6) {
            this.bornAs = DEAD;
            return;
        }
        
        this._jumpAttemps++;
        if (this._airborne === false) {
            this._airborne = true;
            this._jumps++;
            this._body.applyLinearImpulse(Vec2(0, 25), this._body.getWorldCenter());
        }
    }

    jumpHigher() {
        this._jumpAttemps++;
        
        
        if (this._jumps > 6) {
            this.bornAs = DEAD;

            return;
        }
        
        if (this._airborne === false) {
            
            if (this._jumps > 25) {
                this.jump()
                return;
            }
            
            this._airborne = true;
            this._jumps++;
            this._body.applyLinearImpulse(Vec2(0, 35), this._body.getWorldCenter());
        }
    }

    set bornAs(t) {
        if (this._bornAs === t) {
            return;
        }

        this._bornAs = t;
        if (this._fixture.ui) {
            this._fixture.ui.remove();
            this._fixture.ui = undefined;
            this._fixture.render = {};
        }

        if (t === IMMORTAL) {
            this._fixture.render = { fill: '#45d643', stroke: 'black' };
        }

        if (t === RANDOMIZED) {
            this._fixture.render = { fill: '#d6bb45', stroke: 'black' };
        }

        if (t === CHILD) {
            this._fixture.render = { fill: '#0077ff', stroke: 'black' };
        }

        if (t === DEAD) {
            this._fixture.render = { fill: '#d6456e', stroke: 'black' };
        }
    }

    distance() {
        return this._boxDistance;
    }

    velocity() {
        return this._body.getLinearVelocity();
    }

    calcDistance(boxes) {
        const xf = this._body.getTransform();
        const circle = this._fixture.getShape();
        const center = pl.Transform.mul(xf, circle.getCenter());
        let minDist = 1000;

        this._boxClosest = undefined;
        this._boxDistance = 0;

        boxes.forEach((box, idx) => {
            const edge = box.edge;
            let dist;

            // Only check for boxes on the last collided ground

            if (this.upper === box.upper) {
                if (this.upper) {
                    if (center.x <= edge.x) {
                        dist = Vec2.distance(center, edge);
                        if (dist < minDist) {
                            minDist = dist;
                            this._boxClosest = idx;
                            this._boxDistance = dist;
                        }
                    }
                } else if (center.x >= edge.x) {
                    dist = Vec2.distance(center, edge);
                    if (dist < minDist) {
                        minDist = dist;
                        this._boxClosest = idx;
                        this._boxDistance = dist;
                    }
                }
            }
        });
    }

    draw(boxes) {
        const xf = this._body.getTransform();
        const circle = this._fixture.getShape();
        const center = pl.Transform.mul(xf, circle.getCenter());

        if (this._airborne && this._bornAs > IMMORTAL && this._bounced && this.alive && this._boxClosest !== undefined) {
            const edge = boxes[this._boxClosest].edge;
            const radius = circle.getRadius();
            const angle = this._body.getAngle();
            const from = center.clone().add(Vec2(radius * Math.cos(angle), radius * Math.sin(angle)));
            this._testbed.drawSegment(from, edge, this._grayColor);
        }
    }
}
