/* global planck:true */

/* eslint-disable-next-line*/
class Box {
    constructor(testbed, parent, xpos, score) {
        this.testbed = testbed;
        this.parent = parent;
        this.color = testbed.color(0.0, 0.0, 1.0);
        this.left = planck.Vec2.zero();
        this.height = 1.5 + Math.random() * 1.0;

        this.roof = parent.createFixture(planck.Edge(planck.Vec2(xpos - 4, this.height + 3), planck.Vec2(xpos + 4, this.height + 3)), {
            isSensor: true,
            userData: {
                tag: 'box',
                top: true,
                score: score + 50,
                self: this
            }
        });


        this.top = parent.createFixture(planck.Edge(planck.Vec2(xpos - 2, this.height), planck.Vec2(xpos + 2, this.height)), {
            isSensor: true,
            userData: {
                tag: 'box',
                top: true,
                score: score + 50,
                self: this
            }
        });

        if (parent.getUserData().upper === true) {
            this.upper = true;
            this.side = parent.createFixture(planck.Edge(planck.Vec2(xpos - 2, 0), planck.Vec2(xpos - 2, this.height)), {
                isSensor: true,
                userData: {
                    tag: 'box',
                    top: true,
                    score: score,
                    self: this
                }
            });
        } else {
            this.upper = false;

            this.side = parent.createFixture(planck.Edge(planck.Vec2(xpos + 2, 0), planck.Vec2(xpos + 2, this.height)), {
                isSensor: true,
                userData: {
                    tag: 'box',
                    top: true,
                    score: score,
                    self: this
                }
            });
        }
    }

    /*eslint class-methods-use-this:0*/
    draw() {
        //this.testbed.drawCircle(this.edge, 0.3, this.color);
    }

    calcEdges() {
        var xf = this.parent.getTransform();
        var side = this.side.getShape();
        var v0 = side.m_vertex1;
        var v1 = side.m_vertex2;
        var center = planck.Vec2.mid(v0, v1);
        this.edge = planck.Transform.mul(xf, center);
    }
}
