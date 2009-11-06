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
	visibleState: { opacity: 1 },
	hiddenState: { opacity: 0 },
	
	// for labels
	labelVisibleState: { opacity: 1 },
	labelHiddenState: { opacity: 0 },
	fieldVisibleState: { opacity: 1 },
	fieldHiddenState: { opacity: 0 },
	
	
	
	transitions: { opacity: .25, top: .25, left: .25 },
	
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
		this.get("labelView").adjust(this.labelVisibleState);
	},
	
	hideLabel: function()
	{
		this.get("labelView").adjust(this.labelHiddenState);
	},
	
	showField: function()
	{
		this.get("field").adjust(this.fieldVisibleState);
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
		var transitions = { transitions: { opacity: .25, top: .25, left: .25 } };
		this.fieldClass = this.fieldClass.extend(Animate.Animatable, transitions);
		this.labelView = this.labelView.extend(Animate.Animatable, transitions);
		sc_super();
	}
};

SC.mixin(Forms.FormAnimation, {
	formMixin: [Animate.Animatable, Forms._DefaultAnimation, Forms.FormAnimation],
	rowMixin: [Animate.Animatable, Forms._DefaultAnimation, Forms.FormAnimation],
	fieldMixin: [Forms._FormFieldAnimation, Animate.Animatable, Forms._DefaultAnimation]
});