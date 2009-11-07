// ==========================================================================
// Project:   Forms.FormFieldView
// Copyright: ©2009 Alex Iskander and TPSi
// ==========================================================================
/*globals Forms */
require("views/form_label");

/** @class
	Encapsulates a field. Usually, it is specialized for a specific field.
	
	The default implementation takes the fieldClass property and creates
	an instance.
	
	h2. Special Features of FormFieldView
	FormFieldView addresses a few primary things:
	
	- <strong>Beginning/ending editing</strong>. This allows the fields to
	automatically enter and exit editing mode when the form does. FieldView
	specializations don't really have to do much special here (though they can
	if they want)—the default handling of this is to hide and show the label and
	field. The functions hideField, hideLabel, showField, and showLabel handle this,
	and can be overriden for purposes such as animation.
	
	- <strong>Automatic resizing</strong>. The FormFieldView is <em>always</em> sized
	to the size of its active child (either field or label). When autoResize is enabled,
	if the field and label support it, the FormFieldView will therefore automatically
	support it as well, shrinking and growing as necessary.
	@extends SC.View
*/
Forms.FormFieldView = SC.View.extend(SC.Editable, SC.Control,
/** @scope Forms.FormFieldView.prototype */ {
	/**
		If YES, the field is automatically hidden when empty and not editing.
		
		Note that this has <storng>nothing</strong> to do with rows auto-hiding.
		When a field auto-hides, it just sets its isHidden to true as a hint to
		parents (which are the ones that have the resonsibility of updating flowing)
		and sets isVisible (which, if you are lucky, the animate layer overrides).
		
		The parent objects handle flowing, skipping hidden items, because we don't
		actually want to change the object's size to 0x0; rather, we want the
		object to disappear and not be counted in the flowing. The distinction
		is subtle, but necessary for animation—which, of course, we love.
	*/
	autoHide: NO,
	
	/**
		Whether or not to automatically resize.
		
		This will only work if the field or label (whichever is active) auto resizes
		itself. The field and label's autoResize parameter is bound to this one; nothing
		else occurs through autoResize.
		
		Disabling should increase performance.
		
		@default YES
	*/
	autoResize: YES,
	
	/**
		Values to consider empty.
		
		Empty <strong>does</strong> have something to do with row auto-hiding. FormRowViews
		check this. If there are no non-empty fields, then if they are set to auto-hide, they will.
		
		If you need more control over what to consider empty and what not to consider empty,
		override the isEmpty computed property.
	*/
	emptyValues: [undefined, null, ""],
	
	/**
		@property
		YES if it is empty.
	*/
	isEmpty: function()
	{
		if (this.get("isEditing")) return NO;
		
		var ev = this.get("emptyValues");
		if (ev.indexOf(this.get("value")) >= 0) return YES;
		return NO;
	}.property("emptyValues", "value", "isEditing").cacheable(),
	
	/**
		YES if it is hidden.
		
		It is changed when the calculateHiddenness method is called—the most
		obvious caller of this being the isEmptyDidChange observer.
	*/
	isHidden: NO,
	
	/**
		If YES, the field steals focus when it is begins editing.
	*/
	
	/**
		The type of field to automatically create and encapsulate.
	*/
	fieldClass: SC.TextFieldView,
	
	/**
		The field that was automatically created.
	*/
	field: null,
	
	/**
		The currently active item (label or field)
	*/
	activeView: null,
	
	/**
		The label to show when not editing (during design time, just the class).
	*/
	labelView: Forms.FormLabelView.design({
		layout: { top: 0, left: 0 },
		autoResize: YES
	}),
	
	init: function()
	{
		sc_super();
	},
	
	createChildViews: function()
	{
		sc_super();
		
		// basically just pass on our own bindings
		this.field = this.createChildView(this.get("fieldClass"));
		this.field.bind("value", [this, "value"]);
		this.field.bind("autoResize", [this, "autoResize"]);
		this.appendChild(this.field);
		
		// same with label
		this.labelView = this.createChildView(this.get("labelView"));
		this.labelView.bind("value", [this, "value"]);
		this.labelView.bind("autoResize", [this, "autoResize"]);
		this.appendChild(this.labelView);
		
		// for now, just make edit. And when I test, I'll toggle this.
		this.hideField();
		this.showLabel();
		this.set("activeView", this.get("labelView"));
		
		this.set("firstKeyView", this.field);
		this.set("lastKeyView", this.field);
	},
	
	/**
		Updates the size when the size of the contained object (the field or label)
		changes.
	*/
	layoutDidChangeFor: function(child)
	{
		sc_super();
		if (child == this.get("activeView"))
		{
			this._updateActiveLayout();
		}
	},
	
	/**
		Called when the active view (field or label) changes or when
		its layout changes.
	*/
	_updateActiveLayout: function()
	{
		var active = this.get("activeView");
		if (!active) return;
		
		// we must recompute becaues we may be more modern than the last calculation.
		var frame = active.computeFrameWithParentFrame(null);
		
		this.adjust({
			width: frame.width,
			height: frame.height
		});
		this.layoutDidChange();
	}.observes("activeView"),
	
	/**
		If the parent view has an emptinessDidChangeFor methdod, this calls that.
		
		This does not calculate hiddennes (that is in another observer that observes
		both isEmpty and autoHide).
	*/
	isEmptyDidChange: function() { 
		// call parent's emptinessDidChangeFor if available.
		var parent = this.get("parentView");
		if (!parent) return;
		
		if (parent.emptinessDidChangeFor) parent.emptinessDidChangeFor(this);
		
	}.observes("isEmpty"),
	
	
	/**
		Calculates whether the view should be hidden, and does what needs to be
		done accordingly.
		
		Sets isHidden, isVisible, and alerts a layout change for the parent—because
		whether invisible or visible, layout must have changed.
	*/
	calculateHiddenness: function()
	{
		var currentHidden = this.get("isHidden");
		
		var newHidden = NO;
		if (this.get("isEmpty") && this.get("autoHide")) newHidden = YES;
		if (this.get("isEditing")) newHidden = NO;
		
		if (currentHidden !== newHidden)
		{
			this.setIfChanged("isHidden", newHidden);
			this.setIfChanged("isVisible", !newHidden);
			this.layoutDidChange();
		}
	}.observes("autoHide", "isEmpty"),
	
	/**
	Does not do precisely what you expect :).
	
	What does it do? It begins editing, but does not take first responder status,
	because this field is not supposed to take views. This is just state-related stuff.
	If the field this contains wants to take focus, fine for it!
	*/
	beginEditing: function()
	{
		if (this.get('isEditing')) return YES;
		
		this.showField();
		this.hideLabel();
		this.set("activeView", this.get("field"));
		this.set("isEditing", YES);
		this.calculateHiddenness();
		
		// if it steals focus, handle that
		if (this.stealsFocus)
		{
			this.get("field").beginEditing();
		}
	},

	discardEditing: function()
	{
		// if we are not editing, return YES, otherwise NO.
		return !this.get('isEditing');
	},

	commitEditing: function()
	{
		if (!this.get("isEditing")) return YES;
		
		this.hideField();
		this.showLabel();
		this.set("activeView", this.get("labelView"));
		this.set("isEditing", NO);
		this.calculateHiddenness();
	},
	
	/**
		Shows the field.
		
		The default version just sets isVisible to YES.
	*/
	showField: function()
	{
		this.get("field").set("isVisible", YES);
	},
	
	/**
		Hides the field.
		
		The default version just sets isVisible to NO.
	*/
	hideField: function()
	{
		this.get("field").set("isVisible", NO);
	},
	
	/**
		Shows the label.
		
		The default version just sets isVisible to YES.
	*/
	showLabel: function()
	{
		this.get("labelView").set("isVisible", YES);
	},
	
	/**
		Hides the label.
		
		The default version just sets isVisible to NO.
	*/
	hideLabel: function()
	{
		this.get("labelView").set("isVisible", NO);
	}
});

Forms.FormFieldView.mixin({
	/**
		@private
		The set of specialized FormFieldViews.
	*/
	_specializations: {},
	
	/**
		Creates a field.
		
		Properties are passed on to the field itself, except for autoResize, fieldKey, and
		classNames, which are applied to the field container.
	*/
	field: function(fieldClass, properties)
	{
		// get the form field view to use
		var formFieldView = this._specializations[SC.guidFor(fieldClass)];
		if (!formFieldView) formFieldView = Forms.FormFieldView;
		
		// mix in some default settings
		var defaultSettings = {
			layout: { left: 0, width: 200, height: 22, top: 0 }
		};
		SC.mixin(defaultSettings, properties);
		
		// set field properties
		var fieldProperties = defaultSettings;
		
		// prepare settings for form field 
		var formFieldProperties = {  };
		
		var stealProperties = ["autoResize", "fieldKey", "classNames", "emptyValue", "autoHide", "stealsFocus"];
		
		for (var i = 0; i < stealProperties.length; i++)
		{
			if (!SC.none(fieldProperties[stealProperties[i]]))
			{
				formFieldProperties[stealProperties[i]] = fieldProperties[stealProperties[i]];
				delete fieldProperties[stealProperties[i]];
			}
		}
		
		formFieldProperties.fieldClass = fieldClass.design(fieldProperties);
		
		return formFieldView.design({mixinDesign: formFieldProperties });
	},
	
	/**
		Specializes <strong>and</strong> registers a FormFieldView.
		
		You can specialize without registering by just calling extend.
	*/
	specialize: function(fieldClass, special)
	{
		var result = this.extend(special);
		this.registerSpecialization(fieldClass, result);
		return result;
	},
	
	/**
		Registers an existing specialization.
	*/
	registerSpecialization: function(fieldClass, specialization)
	{
		this._specializations[SC.guidFor(fieldClass)] = specialization;
	}
});
