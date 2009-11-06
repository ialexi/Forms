// ==========================================================================
// Project:   Forms.FormTextFieldView
// Copyright: ©2009 Alex Iskander and TPSi.
// ==========================================================================
/*globals Forms */

/** @class

  (Document Your View Here)

  @extends SC.View
*/
Forms.FormTextFieldView = Forms.FormFieldView.extend(
/** @scope Forms.FormTextFieldView.prototype */ {
	init: function()
	{
		var self = this;
		this.fieldClass = this.fieldClass.extend({
			keyDown: function(e)
			{
				self.keyDown(e, this.$input()[0]);
				return sc_super();
			},
			
			beginEditing: function()
			{
				sc_super();
				
				// a small improvement
				var layer = this.$input()[0];
				if (layer) layer.select();
			}
		});
		sc_super();
	},
	
	sizeMayChange: function()
	{
		if (this.get("autoResize") && this.get("isVisible")) this.measure();
	}.observes("isVisible", "autoResize"),
	
	/**
		When the layer updates, this checks the actual width and height, and
		if necessary, changes the layout's width and height.
	
		The automatic change means that a rendering can cause another rendering—the
		updating of the layer causes didUpdateLayer to be called, which calls
		layoutDidChange (if layout did indeed change), which causes another layer
		update.
	*/
	didUpdateLayer: function()
	{
		sc_super();
		if (this.get("autoResize")) this.measure(null);
	},
	
	keyDown: function(e, input)
	{
		sc_super();
		var str = e.getCharString();
		if (str) this.measure(input.value + str);
	},
	
	measure: function(value)
	{
		// get layer (obviously...)
		var layer = this.$("input")[0];
		if (!layer) return;
		
		if (typeof value != "string") value = this.get("value");
		var field_metrics = SC.metricsForString(value, layer);
		
		var our_metrics = {
			width: field_metrics.width + layer.parentNode.offsetLeft + 3,
			height: field_metrics.height + layer.parentNode.offsetTop + 3
		};
		
		var layout = this.get("layout");
		if (!layout) layout = {};
		if (layout.width != our_metrics.width || layout.height != our_metrics.height)
		{
			this.field.adjust({
				width: our_metrics.width,
				height: our_metrics.height
			}).updateLayout();
			
			layer.style.width = (3 + field_metrics.width) + "px";
			layer.style.height = (3 + field_metrics.height) + "px";
		}
	}.observes("value")
});

Forms.FormTextFieldView.registerSpecialization(SC.TextFieldView, Forms.FormTextFieldView);