/*jshint quotmark:false*/

var run = function (combine) {
    var mx = modulex;

    describe('simple config for package works ' + (combine ? 'at combo mode' : ''), function () {
        beforeEach(function () {
            modulex.config('combine', !!combine);
        });

        afterEach(function () {
            modulex.clearLoader();
        });

        it('works', function (done) {
            var mods = modulex.Env.mods;
            modulex.config({
                debug: false,
                packages: {
                    t: {
                        debug: true,
                        base: '/tests/specs/package/t'
                    }
                }
            });

            modulex.use(['t/t'], function (t) {
                expect(t).to.be.equal(1);
                expect(mods['t/t'].exports).to.be.equal(1);
                modulex.config({
                    debug: true
                });
                done();
            });
        });

        it('allows use package directly', function (done) {
            mx.config({
                packages: {
                    t: {
                        base: '/tests/specs/package/t'
                    }
                }
            });

            modulex.use(['t'], function (T) {
                expect(T).to.be.equal(2);
                done();
            });
        });
    });
};
run();
run(1);