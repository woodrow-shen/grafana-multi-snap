///<amd-dependency path="app/plugins/datasource/influxdb/query_builder" name="InfluxQueryBuilder"/>
define(["require", "exports", "app/plugins/datasource/influxdb/query_builder", 'test/lib/common'], function (require, exports, InfluxQueryBuilder, common_1) {
    common_1.describe('InfluxQueryBuilder', function () {
        common_1.describe('when building explore queries', function () {
            common_1.it('should only have measurement condition in tag keys query given query with measurement', function () {
                var builder = new InfluxQueryBuilder({ measurement: 'cpu', tags: [] });
                var query = builder.buildExploreQuery('TAG_KEYS');
                common_1.expect(query).to.be('SHOW TAG KEYS FROM "cpu"');
            });
            common_1.it('should handle regex measurement in tag keys query', function () {
                var builder = new InfluxQueryBuilder({
                    measurement: '/.*/', tags: []
                });
                var query = builder.buildExploreQuery('TAG_KEYS');
                common_1.expect(query).to.be('SHOW TAG KEYS FROM /.*/');
            });
            common_1.it('should have no conditions in tags keys query given query with no measurement or tag', function () {
                var builder = new InfluxQueryBuilder({ measurement: '', tags: [] });
                var query = builder.buildExploreQuery('TAG_KEYS');
                common_1.expect(query).to.be('SHOW TAG KEYS');
            });
            common_1.it('should have where condition in tag keys query with tags', function () {
                var builder = new InfluxQueryBuilder({ measurement: '', tags: [{ key: 'host', value: 'se1' }] });
                var query = builder.buildExploreQuery('TAG_KEYS');
                common_1.expect(query).to.be("SHOW TAG KEYS WHERE \"host\" = 'se1'");
            });
            common_1.it('should have no conditions in measurement query for query with no tags', function () {
                var builder = new InfluxQueryBuilder({ measurement: '', tags: [] });
                var query = builder.buildExploreQuery('MEASUREMENTS');
                common_1.expect(query).to.be('SHOW MEASUREMENTS');
            });
            common_1.it('should have where condition in measurement query for query with tags', function () {
                var builder = new InfluxQueryBuilder({ measurement: '', tags: [{ key: 'app', value: 'email' }] });
                var query = builder.buildExploreQuery('MEASUREMENTS');
                common_1.expect(query).to.be("SHOW MEASUREMENTS WHERE \"app\" = 'email'");
            });
            common_1.it('should have where tag name IN filter in tag values query for query with one tag', function () {
                var builder = new InfluxQueryBuilder({ measurement: '', tags: [{ key: 'app', value: 'asdsadsad' }] });
                var query = builder.buildExploreQuery('TAG_VALUES', 'app');
                common_1.expect(query).to.be('SHOW TAG VALUES WITH KEY = "app"');
            });
            common_1.it('should have measurement tag condition and tag name IN filter in tag values query', function () {
                var builder = new InfluxQueryBuilder({ measurement: 'cpu', tags: [{ key: 'app', value: 'email' }, { key: 'host', value: 'server1' }] });
                var query = builder.buildExploreQuery('TAG_VALUES', 'app');
                common_1.expect(query).to.be('SHOW TAG VALUES FROM "cpu" WITH KEY = "app" WHERE "host" = \'server1\'');
            });
            common_1.it('should switch to regex operator in tag condition', function () {
                var builder = new InfluxQueryBuilder({
                    measurement: 'cpu',
                    tags: [{ key: 'host', value: '/server.*/' }]
                });
                var query = builder.buildExploreQuery('TAG_VALUES', 'app');
                common_1.expect(query).to.be('SHOW TAG VALUES FROM "cpu" WITH KEY = "app" WHERE "host" =~ /server.*/');
            });
            common_1.it('should build show field query', function () {
                var builder = new InfluxQueryBuilder({ measurement: 'cpu', tags: [{ key: 'app', value: 'email' }] });
                var query = builder.buildExploreQuery('FIELDS');
                common_1.expect(query).to.be('SHOW FIELD KEYS FROM "cpu"');
            });
        });
    });
});
//# sourceMappingURL=query_builder_specs.js.map