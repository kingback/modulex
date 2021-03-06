
describe('filter', function () {
    var mx = modulex;
    afterEach(function () {
        mx.clearLoader();
    });
    it('works', function () {
        mx.config({
            packages: {
                'pkg-a': {
                    filter: 'debug',
                    base: '/tests/specs/packages-groups/pkg-a'
                },
                'pkg-b': {
                    base: '/tests/specs/packages-groups/pkg-b'
                }
            }
        });
        expect(mx.getModule('pkg-a/a').getUrl()).to.be.equal(mx.getPackage('pkg-a').getBase() + 'a-debug.js');
        expect(mx.getModule('pkg-b/b').getUrl()).to.be.equal(mx.getPackage('pkg-b').getBase() + 'b.js');
    });
});