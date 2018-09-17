/* global planck:true, Simulation:true, Ball:true, Box:true */
/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["testbed"] }]*/
/* eslint prefer-destructuring: off*/
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

const MAXSPEED = 50;
const MAXDISTANCE = 40;
const BALLS = 100;

var pl = planck;
var Vec2 = planck.Vec2;

planck.testbed('ai-balls', function(testbed) {
    testbed.y = 0;
    //testbed.width = 64;
    //testbed.height = 64;
    //testbed.ratio =16;

    var world = new pl.World(Vec2(0, -10));
    var simulation = new Simulation(BALLS);
    var boxes = [];

    //world.setGravity(Vec2(0.0, -12.0));

    var upperGround = world.createBody({ userData: { upper: true } });
    upperGround.createFixture(pl.Edge(Vec2(-50.0, 0.0), Vec2(40.0, 0.0)), {
        userData: { tag: 'ground', upper: true }
    });

    var lowerGround = world.createBody({ userData: { upper: false } });

    lowerGround.createFixture(pl.Edge(Vec2(-50.0, 0.0), Vec2(50.0, 0.0)), {
        userData: { tag: 'ground', upper: false }
    });

    var stopper = world.createBody();
    stopper.createFixture(pl.Edge(Vec2(50.0, -10.0), Vec2(50.0, 20.0)), {
        userData: { tag: 'stopper', upper: false }
    });

    var finnish = world.createBody();
    finnish.createFixture(pl.Edge(Vec2(-50.0, -15.0), Vec2(-50.0, -25.0)), {
        density: 0.0,
        userData: { tag: 'box', finnish: true, score: 1000 }
    });

    boxes.push(new Box(testbed, upperGround, -30, 100));
    boxes.push(new Box(testbed, upperGround, -10, 200));
    //boxes.push(new Box(testbed, upperGround, 5, 220));
    boxes.push(new Box(testbed, upperGround, 30, 300));

    boxes.push(new Box(testbed, lowerGround, 30, 400));
    boxes.push(new Box(testbed, lowerGround, 0, 500));
    boxes.push(new Box(testbed, lowerGround, -30, 600));

    var up = upperGround.getPosition();
    up.y += 10;
    upperGround.setTransform(up, -0.3);

    var lp = lowerGround.getPosition();
    lp.y -= 15;
    lowerGround.setTransform(lp, 0.2);

    // Calculate box edges

    boxes.forEach((box) => {
        box.calcEdges();
    });

    for (var i = 0; i < BALLS; i++) {
        simulation.balls.push(new Ball(testbed, world, i));
    }

    simulation.reset(0);

    //var maxDistance = 0;

    //
    //  Callbacks...
    //

    world.on('begin-contact', function(contact) {
        var ballFixture = contact.getFixtureA();
        var otherFixture = contact.getFixtureB();

        var firstTag = ballFixture.getUserData() ? ballFixture.getUserData().tag : undefined;
        var secondTag = otherFixture.getUserData() ? otherFixture.getUserData().tag : undefined;

        if (secondTag === 'ball') {
            // Swap them, We want ball first...

            otherFixture = contact.getFixtureA();
            ballFixture = contact.getFixtureB();

            firstTag = ballFixture.getUserData() ? ballFixture.getUserData().tag : undefined;
            secondTag = otherFixture.getUserData() ? otherFixture.getUserData().tag : undefined;
        }

        if (firstTag === 'ball') {
            const self = ballFixture.getUserData().self;

            if (secondTag === 'box') {
                const bdist = self.distance();
                const winner = otherFixture.getUserData().finnish;
                let score = otherFixture.getUserData().score;

                score += 25 - (bdist / MAXDISTANCE) * 25;
                score -= self.jumps * 2;

                simulation.score(self.id, score);

                setTimeout(function() {
                    self.alive = false;
                    if (winner === true) {
                        self.bornAs = self.IMMORTAL;
                    }
                }, 0);
            }

            if (secondTag === 'ground') {
                self.bounced = true;
                self.airborne = false;
                self.upper = otherFixture.getUserData().upper;
            }
        }
    });

    world.on('end-contact', function(contact) {
        var fa = contact.getFixtureA();
        var fb = contact.getFixtureB();

        var at = fa.getUserData() ? fa.getUserData().tag : undefined;
        var bt = fb.getUserData() ? fb.getUserData().tag : undefined;

        if (at === 'ball' && bt === 'ground') {
            fa.getUserData().self.airborne = true;
        }

        if (at === 'ground' && bt === 'ball') {
            fb.getUserData().self.airborne = true;
        }
    });

    testbed.step = function(dt, t) {
        
        this.drawText(Vec2(0, 20), 'Immortals ' + simulation.immortalCount());
        this.drawText(Vec2(0, 0), 'Alive ' + simulation.aliveCount());
        this.drawText(Vec2(0, -20), 'Gen ' + simulation.genCount());
        //this.drawText(Vec2(10, 8), 'Test');

        if (simulation.anyAlive()) {
            boxes.forEach((box) => {
                box.draw();
            });

            simulation.balls.forEach((ball) => {
                if (ball.alive) {
                    ball.calcDistance(boxes);

                    var vel = ball.velocity();
                    if (Math.abs(vel.x) > MAXSPEED) {
                        vel.normalize();
                        vel.x *= MAXSPEED;
                        vel.y *= MAXSPEED;
                    }
                    /*

                    if (ball.distance() > maxDistance) {
                        maxDistance = ball.distance;
                        console.log('Vel',maxVelocity,'Dist',maxDistance)
                    }
                    */

                    var inputs = [ball.airborne ? 1 : 0, vel.length(), ball.distance()];

                    if (ball.distance() > 0) {

                        var jump = simulation.think(ball.id, inputs);
                        if (jump[0] >= 0.7) {
                            ball.jump();
                        } else if (jump[0] >= 0.5) {
                            ball.jump();
                        }
                    }
                }
                ball.draw(boxes);
            });
        } else if (simulation.resetting === false) {
            simulation.reset(1000);
        }
    };

    testbed.keydown = function(code, char) {
        switch (char) {
        case ' ':
            break;

        case 'R':
            break;
        default:
            break;
        }
    };

    return world;
});
