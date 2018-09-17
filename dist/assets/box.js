/* global pl:true, Vec2:true , pl:true*/

/* eslint-disable-next-line*/
class Box {
    constructor(testbed, parent, xpos, score) {
        this.testbed = testbed;
        this.parent = parent;
        this.color = testbed.color(0.0, 0.0, 1.0);
        this.left = Vec2.zero();

        this.top = parent.createFixture(pl.Edge(Vec2(xpos - 2, 2), Vec2(xpos + 2, 2)), {
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
            this.side = parent.createFixture(pl.Edge(Vec2(xpos - 2, 0), Vec2(xpos - 2, 2)), {
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

            this.side = parent.createFixture(pl.Edge(Vec2(xpos + 2, 0), Vec2(xpos + 2, 2)), {
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

    draw() {
        //this.testbed.drawCircle(this.edge, 0.3, this.color);
    }

    calcEdges() {
        var xf = this.parent.getTransform();
        var side = this.side.getShape();
        var v0 = side.m_vertex1;
        var v1 = side.m_vertex2;
        var center = Vec2.mid(v0, v1);
        this.edge = pl.Transform.mul(xf, center);
    }
}
