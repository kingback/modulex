/**
 * tc for system.ondemand similar functionality
 * @author yiminghe@gmail.com
 */

describe('support system.ondemand', function () {
    beforeEach(function () {
        modulex.config('combine', false);
    });

    afterEach(function () {
        modulex.clearLoader();
    });
    // https://gist.github.com/wycats/51c96e3adcdb3a68cbc3
    it('provide similar functionality', function (done) {
        modulex.config('packages', {
            'p-c': {
                base: '/tests/specs/system-ondemand/'
            }
        });

        modulex.config('modules', {
            'p-c/b': {
                requires: ['./c'],
                url: '/tests/specs/system-ondemand/a.js'
            }
        });

        var ret = 0;

        modulex.use(['p-c/a'], function (a) {
            expect(a).to.be.equal(4);
            ret++;
            if (ret === 2) {
                done();
            }
        });

        //setTimeout(function(){

        // known issue, if combine:true second request will be ??a.js,c.js
        modulex.use(['p-c/b'], function (b) {
            expect(b).to.be.equal(3);
            ret++;
            if (ret === 2) {
                done();
            }
        });
    });
});