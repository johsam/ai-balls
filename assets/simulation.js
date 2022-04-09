/* global Neuroevolution:true , BALL_STATE_RANDOMIZED*/
/* eslint no-plusplus: off */

/* eslint-disable-next-line*/
class Simulation {
    constructor(n) {
        this._resetting = false;
        this._balls = [];
        this._neuvol = new Neuroevolution({
            population: n,
            randomBehaviour: 0.2, // 0.2
            randomCutoff: 0.2, // 0.2
            elitism: 0.05, // 0.2
            mutationRate: 0.2, // 0.1
            mutationRange: 0.5, //0.5
            nbChild: 4, //1
            network: [3, [6], 1],
            immortalScore: 1000
        });

        this._gen = [];
        this._genCount = 0;

        this._neuvol._bornAs = [];
    }

    get balls() {
        return this._balls;
    }

    think(idx, inputs) {
        return this._gen[idx].compute(inputs);
    }

    score(idx, score) {
        this._neuvol.networkScore(this._gen[idx], score);
    }

    aliveCount() {
        var alives = 0;
        this._balls.forEach((ball) => {
            if (ball.alive) {
                alives++;
            }
        });
        return alives;
    }

    immortalCount() {
        var immortals = 0;
        this._balls.forEach((ball) => {
            if (ball.bornAs === 0) {
                immortals++;
            }
        });
        return immortals;
    }

    anyAlive() {
        return this._balls.some((ball) => {
            if (ball.alive) {
                return true;
            }
            return false;
        });
    }

    genCount() {
        return this._genCount;
    }

    reset(delay) {
        var self = this;
        self._resetting = true;
        self._gen = self._neuvol.nextGeneration();
        self._genCount++;

        setTimeout(function() {
            self._balls.forEach((ball, idx) => {
                if (self._neuvol._bornAs.length > 0) {
                    self._balls[idx].bornAs = self._neuvol._bornAs[idx];
                } else {
                    self._balls[idx].bornAs = BALL_STATE_RANDOMIZED;
                }

                ball.reset();
            });

            (function releaseBalls(b) {
                setTimeout(function() {
                    self._balls[self._balls.length - b].start(); // Best first
                    //self._balls[b - 1].start();   // Worst first

                    /*eslint no-param-reassign:0*/
                    if (--b) {
                        releaseBalls(b);
                    } else {
                        self._resetting = false;
                    }
                }, 100);
            }(self._balls.length));
        }, delay);
    }

    get resetting() {
        return this._resetting;
    }

    set resetting(bool) {
        this._resetting = bool;
    }
}
