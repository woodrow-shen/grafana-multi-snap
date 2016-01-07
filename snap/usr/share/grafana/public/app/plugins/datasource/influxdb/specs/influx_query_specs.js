define(["require", "exports", 'test/lib/common', '../influx_query'], function (require, exports, common_1, InfluxQuery) {
    common_1.describe('InfluxQuery', function () {
        common_1.describe('render series with mesurement only', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") FROM "cpu" WHERE $timeFilter GROUP BY time($interval) fill(null)');
            });
        });
        common_1.describe('render series with math and alias', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [
                        [
                            { type: 'field', params: ['value'] },
                            { type: 'mean', params: [] },
                            { type: 'math', params: ['/100'] },
                            { type: 'alias', params: ['text'] },
                        ]
                    ]
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") /100 AS "text" FROM "cpu" WHERE $timeFilter GROUP BY time($interval) fill(null)');
            });
        });
        common_1.describe('series with single tag only', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    groupBy: [{ type: 'time', params: ['auto'] }],
                    tags: [{ key: 'hostname', value: 'server1' }]
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") FROM "cpu" WHERE "hostname" = \'server1\' AND $timeFilter'
                    + ' GROUP BY time($interval)');
            });
            common_1.it('should switch regex operator with tag value is regex', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    groupBy: [{ type: 'time', params: ['auto'] }],
                    tags: [{ key: 'app', value: '/e.*/' }]
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") FROM "cpu" WHERE "app" =~ /e.*/ AND $timeFilter GROUP BY time($interval)');
            });
        });
        common_1.describe('series with multiple tags only', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    groupBy: [{ type: 'time', params: ['auto'] }],
                    tags: [{ key: 'hostname', value: 'server1' }, { key: 'app', value: 'email', condition: "AND" }]
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") FROM "cpu" WHERE "hostname" = \'server1\' AND "app" = \'email\' AND ' +
                    '$timeFilter GROUP BY time($interval)');
            });
        });
        common_1.describe('series with tags OR condition', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    groupBy: [{ type: 'time', params: ['auto'] }],
                    tags: [{ key: 'hostname', value: 'server1' }, { key: 'hostname', value: 'server2', condition: "OR" }]
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") FROM "cpu" WHERE "hostname" = \'server1\' OR "hostname" = \'server2\' AND ' +
                    '$timeFilter GROUP BY time($interval)');
            });
        });
        common_1.describe('series with groupByTag', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    tags: [],
                    groupBy: [{ type: 'time', interval: 'auto' }, { type: 'tag', params: ['host'] }],
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT mean("value") FROM "cpu" WHERE $timeFilter ' +
                    'GROUP BY time($interval), "host"');
            });
        });
        common_1.describe('render series without group by', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }]],
                    groupBy: [],
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT "value" FROM "cpu" WHERE $timeFilter');
            });
        });
        common_1.describe('render series without group by and fill', function () {
            common_1.it('should generate correct query', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }]],
                    groupBy: [{ type: 'time' }, { type: 'fill', params: ['0'] }],
                });
                var queryText = query.render();
                common_1.expect(queryText).to.be('SELECT "value" FROM "cpu" WHERE $timeFilter GROUP BY time($interval) fill(0)');
            });
        });
        common_1.describe('when adding group by part', function () {
            common_1.it('should add tag before fill', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    groupBy: [{ type: 'time' }, { type: 'fill' }]
                });
                query.addGroupBy('tag(host)');
                common_1.expect(query.target.groupBy.length).to.be(3);
                common_1.expect(query.target.groupBy[1].type).to.be('tag');
                common_1.expect(query.target.groupBy[1].params[0]).to.be('host');
                common_1.expect(query.target.groupBy[2].type).to.be('fill');
            });
            common_1.it('should add tag last if no fill', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    groupBy: []
                });
                query.addGroupBy('tag(host)');
                common_1.expect(query.target.groupBy.length).to.be(1);
                common_1.expect(query.target.groupBy[0].type).to.be('tag');
            });
        });
        common_1.describe('when adding select part', function () {
            common_1.it('should add mean after after field', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }]]
                });
                query.addSelectPart(query.selectModels[0], 'mean');
                common_1.expect(query.target.select[0].length).to.be(2);
                common_1.expect(query.target.select[0][1].type).to.be('mean');
            });
            common_1.it('should replace sum by mean', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }]]
                });
                query.addSelectPart(query.selectModels[0], 'sum');
                common_1.expect(query.target.select[0].length).to.be(2);
                common_1.expect(query.target.select[0][1].type).to.be('sum');
            });
            common_1.it('should add math before alias', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }, { type: 'alias' }]]
                });
                query.addSelectPart(query.selectModels[0], 'math');
                common_1.expect(query.target.select[0].length).to.be(4);
                common_1.expect(query.target.select[0][2].type).to.be('math');
            });
            common_1.it('should add math last', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }]]
                });
                query.addSelectPart(query.selectModels[0], 'math');
                common_1.expect(query.target.select[0].length).to.be(3);
                common_1.expect(query.target.select[0][2].type).to.be('math');
            });
            common_1.it('should replace math', function () {
                var query = new InfluxQuery({
                    measurement: 'cpu',
                    select: [[{ type: 'field', params: ['value'] }, { type: 'mean' }, { type: 'math' }]]
                });
                query.addSelectPart(query.selectModels[0], 'math');
                common_1.expect(query.target.select[0].length).to.be(3);
                common_1.expect(query.target.select[0][2].type).to.be('math');
            });
        });
    });
});
//# sourceMappingURL=influx_query_specs.js.map