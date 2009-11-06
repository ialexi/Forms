// ==========================================================================
// Project:   Forms.FormAnimation
// Copyright: ©2009 TPSi
// ==========================================================================

/** @namespace
	This mixin adds animation support to forms. It propagates itself by
	mixing in some of its attributes (which may be overriden):
	- rows
	- fields
	- forms
	
	The defaults are present only for reference; they are always mixed in to
	a clone of Forms.FormRowAnimation, Forms.FormFieldAnimation, etc.
	
	FormAnimation mixes in and overrides show() and hide() methods, amongst
	other things.
	
	They all work the same way–in fact, just like how row inherits from form,
	FormRowAnimation is a mixin that sits on top of FormAnimation mixin 
	(which is why you see them in an array).
*/

Forms._DefaultAnimation = {
	visibleState: { opacity: 1, display: "block" },
	hiddenState: { opacity: 0, display: "none" },
	
	// for labels
	labelVisibleState: { opacity: 1, display: "block" },
	labelHiddenState: { opacity: 0, display: "none" },
	fieldVisibleState: { opacity: 1, display: "block" },
	fieldHiddenState: { opacity: 0, display: "none" },
	
	fieldTransitions: { opacity: .25, top: .25, left: .25, display: .25 },
	labelTransitions:  { opacity: .25, top: .25, left: .25, display: .25 },
	
	transitions: { opacity: .25, top: .25, left: .25, display: .25 },
	
	show: function()
	{
		this.resetAnimation();
		this.set("isHidden", NO);
		this.set("needsDisplay", YES);
		this.layoutDidChange();
	},
	
	display: function()
	{
		this.adjust(this.visibleState);
	},
	
	hide: function()
	{
		this.adjust(this.hiddenState);
		this.set("isHidden", YES);
		this.layoutDidChange();
	},
	
	showLabel: function()
	{
		var label = this.get("labelView");
		label.adjust(this.labelVisibleState);
		if (label.sizeMayChange) label.sizeMayChange();
	},
	
	hideLabel: function()
	{
		this.get("labelView").adjust(this.labelHiddenState);
	},
	
	showField: function()
	{
		var field = this.get("field");
		field.adjust(this.fieldVisibleState);
		if (field.sizeMayChange) field.sizeMayChange();
	},
	
	hideField: function()
	{
		this.get("field").adjust(this.fieldHiddenState);
	}
};


Forms.FormAnimation = {
};

Forms._FormFieldAnimation = {
	init: function()
	{
		// field class must be extended... BEFORE.
		this.fieldClass = this.fieldClass.extend(Animate.Animatable, this.fieldTransitions);
		this.labelView = this.labelView.extend(Animate.Animatable, this.labelTransitions);
		sc_super();
	}
};

SC.mixin(Forms.FormAnimation, {
	formMixin: [Animate.Animatable, Forms._DefaultAnimation, Forms.FormAnimation],
	rowMixin: [Animate.Animatable, Forms._DefaultAnimation, Forms.FormAnimation],
	fieldMixin: [Animate.Animatable, Forms._DefaultAnimation, Forms._FormFieldAnimation]
});