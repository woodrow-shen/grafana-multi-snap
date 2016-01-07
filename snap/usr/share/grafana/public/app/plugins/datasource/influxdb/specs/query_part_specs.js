define(["require", "exports", 'test/lib/common', '../query_part'], function (require, exports, common_1, queryPart) {
    common_1.describe('InfluxQueryPart', function () {
        common_1.describe('series with mesurement only', function () {
            common_1.it('should handle nested function parts', function () {
                var part = queryPart.create({
                    type: 'derivative',
                    params: ['10s'],
                });
                common_1.expect(part.text).to.be('derivative(10s)');
                common_1.expect(part.render('mean(value)')).to.be('derivative(mean(value), 10s)');
            });
            common_1.it('should handle suffirx parts', function () {
                var part = queryPart.create({
                    type: 'math',
                    params: ['/ 100'],
                });
                common_1.expect(part.text).to.be('math(/ 100)');
                common_1.expect(part.render('mean(value)')).to.be('mean(value) / 100');
            });
            common_1.it('should handle alias parts', function () {
                var part = queryPart.create({
                    type: 'alias',
                    params: ['test'],
                });
                common_1.expect(part.text).to.be('alias(test)');
                common_1.expect(part.render('mean(value)')).to.be('mean(value) AS "test"');
            });
        });
    });
});
//# sourceMappingURL=query_part_specs.js.map