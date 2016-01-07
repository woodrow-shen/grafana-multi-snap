define(["require", "exports"], function (require, exports) {
    var PanelMeta = (function () {
        function PanelMeta(options) {
            this.description = options.description;
            this.fullscreen = options.fullscreen;
            this.editIcon = options.editIcon;
            this.panelName = options.panelName;
            this.menu = [];
            this.editorTabs = [];
            this.extendedMenu = [];
            if (options.fullscreen) {
                this.addMenuItem('View', 'icon-eye-open', 'toggleFullscreen(false); dismiss();');
            }
            this.addMenuItem('Edit', 'icon-cog', 'editPanel(); dismiss();', 'Editor');
            this.addMenuItem('Duplicate', 'icon-copy', 'duplicatePanel()', 'Editor');
            this.addMenuItem('Share', 'icon-share', 'sharePanel(); dismiss();');
            this.addEditorTab('General', 'app/partials/panelgeneral.html');
            if (options.metricsEditor) {
                this.addEditorTab('Metrics', 'app/partials/metrics.html');
            }
            this.addExtendedMenuItem('Panel JSON', '', 'editPanelJson(); dismiss();');
        }
        PanelMeta.prototype.addMenuItem = function (text, icon, click, role) {
            this.menu.push({ text: text, icon: icon, click: click, role: role });
        };
        PanelMeta.prototype.addExtendedMenuItem = function (text, icon, click, role) {
            this.extendedMenu.push({ text: text, icon: icon, click: click, role: role });
        };
        PanelMeta.prototype.addEditorTab = function (title, src) {
            this.editorTabs.push({ title: title, src: src });
        };
        return PanelMeta;
    })();
    return PanelMeta;
});
//# sourceMappingURL=panel_meta.js.map