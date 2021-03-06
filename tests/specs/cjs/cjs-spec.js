/**
 * commonjs module format tc
 * @author yiminghe@gmail.com
 */

describe('it support commonjs require', function () {
    /*jshint quotmark:false*/
    beforeEach(function () {
        window.cjsTest = [];
        modulex.config('combine', false);
    });

    afterEach(function () {
        modulex.clearLoader();
        try {
            delete window.cjsTest;
        } catch (e) {
            window.cjsTest = undefined;
        }
    });

    it('amd is not lazy', function (done) {
        var mx = modulex;
        mx.config('packages', {
            amd: {
                base: '/tests/specs/cjs/amd'
            }
        });
        mx.use(['amd/a'], function (a) {
            expect(a).to.be.equal(3);
            expect(window.cjsTest).to.deep.equal([3, 2, 4, 6]);
            done();
        });
    });

    it('support cjs module and lazy initialization', function (done) {
        var mx = modulex;
        mx.config('packages', {
            cjs: {
                base: '/tests/specs/cjs'
            }
        });
        mx.use(['cjs/a'], function (a) {
            expect(a).to.be.equal(3);
            expect(window.cjsTest).to.deep.equal([ 2, 3, 4, 6]);
            done();
        });
    });
});