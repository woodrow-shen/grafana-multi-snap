///<reference path="../../../headers/common.d.ts" />
define(["require", "exports", 'lodash', './query_part'], function (require, exports, _, queryPart) {
    var InfluxQuery = (function () {
        function InfluxQuery(target) {
            this.target = target;
            target.dsType = 'influxdb';
            target.resultFormat = target.resultFormat || 'time_series';
            target.tags = target.tags || [];
            target.groupBy = target.groupBy || [
                { type: 'time', params: ['$interval'] },
                { type: 'fill', params: ['null'] },
            ];
            target.select = target.select || [[
                    { type: 'field', params: ['value'] },
                    { type: 'mean', params: [] },
                ]];
            this.updateProjection();
        }
        InfluxQuery.prototype.updateProjection = function () {
            this.selectModels = _.map(this.target.select, function (parts) {
                return _.map(parts, queryPart.create);
            });
            this.groupByParts = _.map(this.target.groupBy, queryPart.create);
        };
        InfluxQuery.prototype.updatePersistedParts = function () {
            this.target.select = _.map(this.selectModels, function (selectParts) {
                return _.map(selectParts, function (part) {
                    return { type: part.def.type, params: part.params };
                });
            });
        };
        InfluxQuery.prototype.hasGroupByTime = function () {
            return _.find(this.target.groupBy, function (g) { return g.type === 'time'; });
        };
        InfluxQuery.prototype.hasFill = function () {
            return _.find(this.target.groupBy, function (g) { return g.type === 'fill'; });
        };
        InfluxQuery.prototype.addGroupBy = function (value) {
            var stringParts = value.match(/^(\w+)\((.*)\)$/);
            var typePart = stringParts[1];
            var arg = stringParts[2];
            var partModel = queryPart.create({ type: typePart, params: [arg] });
            var partCount = this.target.groupBy.length;
            if (partCount === 0) {
                this.target.groupBy.push(partModel.part);
            }
            else if (typePart === 'time') {
                this.target.groupBy.splice(0, 0, partModel.part);
            }
            else if (typePart === 'tag') {
                if (this.target.groupBy[partCount - 1].type === 'fill') {
                    this.target.groupBy.splice(partCount - 1, 0, partModel.part);
                }
                else {
                    this.target.groupBy.push(partModel.part);
                }
            }
            else {
                this.target.groupBy.push(partModel.part);
            }
            this.updateProjection();
        };
        InfluxQuery.prototype.removeGroupByPart = function (part, index) {
            var categories = queryPart.getCategories();
            if (part.def.type === 'time') {
                // remove fill
                this.target.groupBy = _.filter(this.target.groupBy, function (g) { return g.type !== 'fill'; });
                // remove aggregations
                this.target.select = _.map(this.target.select, function (s) {
                    return _.filter(s, function (part) {
                        var partModel = queryPart.create(part);
                        if (partModel.def.category === categories.Aggregations) {
                            return false;
                        }
                        if (partModel.def.category === categories.Selectors) {
                            return false;
                        }
                        return true;
                    });
                });
            }
            this.target.groupBy.splice(index, 1);
            this.updateProjection();
        };
        InfluxQuery.prototype.removeSelect = function (index) {
            this.target.select.splice(index, 1);
            this.updateProjection();
        };
        InfluxQuery.prototype.removeSelectPart = function (selectParts, part) {
            // if we remove the field remove the whole statement
            if (part.def.type === 'field') {
                if (this.selectModels.length > 1) {
                    var modelsIndex = _.indexOf(this.selectModels, selectParts);
                    this.selectModels.splice(modelsIndex, 1);
                }
            }
            else {
                var partIndex = _.indexOf(selectParts, part);
                selectParts.splice(partIndex, 1);
            }
            this.updatePersistedParts();
        };
        InfluxQuery.prototype.addSelectPart = function (selectParts, type) {
            var partModel = queryPart.create({ type: type });
            partModel.def.addStrategy(selectParts, partModel, this);
            this.updatePersistedParts();
        };
        InfluxQuery.prototype.renderTagCondition = function (tag, index) {
            var str = "";
            var operator = tag.operator;
            var value = tag.value;
            if (index > 0) {
                str = (tag.condition || 'AND') + ' ';
            }
            if (!operator) {
                if (/^\/.*\/$/.test(tag.value)) {
                    operator = '=~';
                }
                else {
                    operator = '=';
                }
            }
            // quote value unless regex
            if (operator !== '=~' && operator !== '!~') {
                value = "'" + value + "'";
            }
            return str + '"' + tag.key + '" ' + operator + ' ' + value;
        };
        InfluxQuery.prototype.render = function () {
            var _this = this;
            var target = this.target;
            if (target.rawQuery) {
                return target.query;
            }
            if (!target.measurement) {
                throw "Metric measurement is missing";
            }
            var query = 'SELECT ';
            var i, y;
            for (i = 0; i < this.selectModels.length; i++) {
                var parts = this.selectModels[i];
                var selectText = "";
                for (y = 0; y < parts.length; y++) {
                    var part_1 = parts[y];
                    selectText = part_1.render(selectText);
                }
                if (i > 0) {
                    query += ', ';
                }
                query += selectText;
            }
            var measurement = target.measurement;
            if (!measurement.match('^/.*/') && !measurement.match(/^merge\(.*\)/)) {
                measurement = '"' + measurement + '"';
            }
            query += ' FROM ' + measurement + ' WHERE ';
            var conditions = _.map(target.tags, function (tag, index) {
                return _this.renderTagCondition(tag, index);
            });
            query += conditions.join(' ');
            query += (conditions.length > 0 ? ' AND ' : '') + '$timeFilter';
            var groupBySection = "";
            for (i = 0; i < this.groupByParts.length; i++) {
                var part = this.groupByParts[i];
                if (i > 0) {
                    // for some reason fill has no seperator
                    groupBySection += part.def.type === 'fill' ? ' ' : ', ';
                }
                groupBySection += part.render('');
            }
            if (groupBySection.length) {
                query += ' GROUP BY ' + groupBySection;
            }
            if (target.fill) {
                query += ' fill(' + target.fill + ')';
            }
            target.query = query;
            return query;
        };
        return InfluxQuery;
    })();
    return InfluxQuery;
});
//# sourceMappingURL=influx_query.js.map