// ==========================================================================
// Project:   Forms.FormLabelView
// Copyright: ©2009 My Company, Inc.
// ==========================================================================
/*globals Forms */

/** @class
	A subclass of LabelView that adds automatic resizing to the label.
  	@extends SC.LabelView
*/
Forms.FormLabelView = SC.LabelView.extend(
/** @scope Forms.FormLabelView.prototype */ {
	// someone creating their own... they can bind on their own too.
	classNames: ["forms-label"],
	measuredWidth: 0,
	measuredHeight: 0,
	
	autoResize: YES,
	autoResizeDidChange: function()
	{
		if (this.get("autoResize") === YES)
		{
			// can't hurt...
			this.measure();
		}
	},
	
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
		if (this.get("autoResize")) this.measure();
	},
	
	measure: function()
	{
		// get layer (obviously...)
		var layer = this.get("layer");
		if (!layer) return;
		var metrics = SC.metricsForString(this.get("value"), layer);
		
		var layout = this.get("layout");
		if (!layout) layout = {};
		if (layout.width != metrics.width || layout.height != metrics.height)
		{
			this.adjust({
				width: metrics.width,
				height: metrics.height
			}).updateLayout();
		}
		
		return;
		
		// store old settings
		var ows = layer.style.whiteSpace,
			opos = layer.style.position, 
			ow = layer.style.width,
			oh = layer.style.height,
			ol = layer.style.left,
			or = layer.style.right,
			ot = layer.style.top,
			ob = layer.style.bottom;
		
		// set new settings
		layer.style.whiteSpace = "pre";
		layer.style.position = "absolute";
		layer.style.width = "";
		layer.style.height = "";
		layer.style.top = "";
		layer.style.bottom = "";
		layer.style.left = "";
		layer.style.right = "";
		
		// set our measurements. If width changed, we will need a re-render.
		var layout = this.get("layout");
		if (!layout) layout = {};
		if (layout.width != layer.clientWidth || layout.height != layer.clientHeight)
		{
			this.adjust({
				width: layer.clientWidth,
				height: layer.clientHeight
			});
			
			this.layoutDidChange();
		}
		
		// reset old styles
		layer.style.whiteSpace = ows;
		layer.style.position = opos;
		layer.style.width = ow;
		layer.style.height = oh;
		layer.style.right = or;
		layer.style.left = ol;
		layer.style.top = ot;
		layer.style.bottom = ob;
	}
});
