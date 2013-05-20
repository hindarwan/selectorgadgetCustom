// Copyright (c) 2008, 2009 Andrew Cantino
// Copyright (c) 2008, 2009 Kyle Maxwell

function SelectorGadget() {
    this.border_width = 5;
    this.border_padding = 2;
    this.b_top = null;
    this.b_left = null;
    this.b_right = null;
    this.b_bottom = null;
    this.selected = [];
    this.sg_div = null;
    this.unbound = false;
    this.restricted_elements = jQuery.map(['html', 'body', 'head', 'base'], function(selector) {
        return jQuery(selector).get(0)
    });
}
SelectorGadget.prototype = new Object();

SelectorGadget.prototype.makeBorders = function(orig_elem, makeRed) {
    this.removeBorders();
    this.setupBorders();

    var path_to_show = jQuery(orig_elem).attr('jfxid');

    var elem = jQuery(orig_elem);
    var p = elem.offset();

    var top = p.top;
    var left = p.left;
    var width = elem.outerWidth()
    var height = elem.outerHeight()

    this.b_top.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2)).
            css('top', this.px(top - this.border_width - this.border_padding)).
            css('left', this.px(left - this.border_padding - this.border_width));
    this.b_bottom.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2 - 5)).
            css('top', this.px(top + height + this.border_padding)).
            css('left', this.px(left - this.border_padding - this.border_width)).text(path_to_show);
//    this.b_bottom.css('width', this.px(width + this.border_padding * 2 + this.border_width * 2 - 5)).
//            css('top', this.px(top + height + this.border_padding)).
//            css('left', this.px(left - this.border_padding - this.border_width));
    this.b_left.css('height', this.px(height + this.border_padding * 2)).
            css('top', this.px(top - this.border_padding)).
            css('left', this.px(left - this.border_padding - this.border_width));
    this.b_right.css('height', this.px(height + this.border_padding * 2)).
            css('top', this.px(top - this.border_padding)).
            css('left', this.px(left + width + this.border_padding));

    this.b_right.get(0).target_elem = this.b_left.get(0).target_elem = this.b_top.get(0).target_elem = this.b_bottom.get(0).target_elem = orig_elem;

    if (makeRed || elem.hasClass("sg_selected")) {
        this.b_top.addClass('sg_border_red');
        this.b_bottom.addClass('sg_border_red');
        this.b_left.addClass('sg_border_red');
        this.b_right.addClass('sg_border_red');
    } else {
        if (this.b_top.hasClass('sg_border_red')) {
            this.b_top.removeClass('sg_border_red');
            this.b_bottom.removeClass('sg_border_red');
            this.b_left.removeClass('sg_border_red');
            this.b_right.removeClass('sg_border_red');
        }
    }

    this.showBorders();
};

SelectorGadget.prototype.px = function(p) {
    return p + 'px';
};

SelectorGadget.prototype.showBorders = function() {
    this.b_top.show();
    this.b_bottom.show();
    this.b_left.show();
    this.b_right.show();
};

SelectorGadget.prototype.removeBorders = function() {
    if (this.b_top) {
        this.b_top.hide();
        this.b_bottom.hide();
        this.b_left.hide();
        this.b_right.hide();
    }
}

SelectorGadget.prototype.setupBorders = function() {
    if (!this.b_top) {
        var width = this.border_width + 'px';
        this.b_top = jQuery('<div>').addClass('sg_border').css('height', width).hide().bind("mousedown.sg", {'self': this}, this.sgMousedown);
        this.b_bottom = jQuery('<div>').addClass('sg_border').addClass('sg_bottom_border').css('height', this.px(this.border_width + 6)).hide().bind("mousedown.sg", {'self': this}, this.sgMousedown);
        this.b_left = jQuery('<div>').addClass('sg_border').css('width', width).hide().bind("mousedown.sg", {'self': this}, this.sgMousedown);
        this.b_right = jQuery('<div>').addClass('sg_border').css('width', width).hide().bind("mousedown.sg", {'self': this}, this.sgMousedown);

        this.addBorderToDom();
    }
};

SelectorGadget.prototype.addBorderToDom = function() {
    document.body.appendChild(this.b_top.get(0));
    document.body.appendChild(this.b_bottom.get(0));
    document.body.appendChild(this.b_left.get(0));
    document.body.appendChild(this.b_right.get(0));
};

SelectorGadget.prototype.removeBorderFromDom = function() {
    if (this.b_top) {
        this.b_top.remove();
        this.b_bottom.remove();
        this.b_left.remove();
        this.b_right.remove();
    }
};

SelectorGadget.prototype.sgMouseover = function(e) {
    var gadget = e.data.self;
    if (gadget.unbound)
        return true;
    if (this == document.body || this == document.body.parentNode)
        return false;
    if (!jQuery('.sg_selected', this).get(0)) {
        gadget.makeBorders(this);
    }
    return false;
};

SelectorGadget.prototype.sgMouseout = function(e) {
    if (e.data.self.unbound)
        return true;
    if (this == document.body || this == document.body.parentNode)
        return false;
    e.data.self.removeBorders();
    return false;
};

SelectorGadget.prototype.sgMousedown = function(e) {
    var gadget = e.data.self;
    if (gadget.unbound)
        return true;
    var elem = this;
    var w_elem = jQuery(elem);

    if (w_elem.hasClass('sg_border')) {
        elem = elem.target_elem || elem;
        w_elem = jQuery(elem);
    }

    if (elem == document.body || elem == document.body.parentNode)
        return;

    if (w_elem.hasClass('sg_selected')) {
        w_elem.removeClass('sg_selected');
        gadget.selected.splice(jQuery.inArray(elem, gadget.selected), 1);
    } else {
        w_elem.addClass('sg_selected');
        gadget.selected.push(elem);
    }

    gadget.removeBorders();

    gadget.blockClicksOn(elem);

    w_elem.trigger("mouseover.sg", {'self': gadget}); // Refresh the borders by triggering a new mouseover event.


    var arrayA = [];
    jQuery('.sg_selected').each(function() {
        var b = jQuery(this).attr('jfxid');
        arrayA.push(b);
    });
    alert(arrayA);
    return false;
};

SelectorGadget.prototype.setupEventHandlers = function() {

    jQuery("*:not(.sg_ignore)").bind("mouseover.sg", {'self': this}, this.sgMouseover);
    jQuery("*:not(.sg_ignore)").bind("mouseout.sg", {'self': this}, this.sgMouseout);
    jQuery("*:not(.sg_ignore)").bind("mousedown.sg", {'self': this}, this.sgMousedown);
    jQuery("html").bind("keydown.sg", {'self': this}, this.listenForActionKeys);
    jQuery("html").bind("keyup.sg", {'self': this}, this.clearActionKeys);

};

// Why doesn't this work?
SelectorGadget.prototype.removeEventHandlers = function() {
    // For some reason the jQuery unbind isn't working for me.

    jQuery("*").unbind("mouseover.sg");//, this.sgMouseover);
    jQuery("*").unbind("mouseout.sg");//, this.sgMouseout);
    jQuery("*").unbind("click.sg");//, this.sgMousedown);
    jQuery("html").unbind("keydown.sg");//, this.listenForActionKeys);
    jQuery("html").unbind("keyup.sg");//, this.clearActionKeys);
};

SelectorGadget.prototype.clearActionKeys = function(e) {
    var gadget = e.data.self;
    if (gadget.unbound)
        return true;
    gadget.removeBorders();
};

// Block clicks for a moment by covering this element with a div.  Eww?
SelectorGadget.prototype.blockClicksOn = function(elem) {
    var elem = jQuery(elem);
    var p = elem.offset();
    var block = jQuery('<div>').css('position', 'absolute').css('z-index', '9999999').css('width', this.px(elem.outerWidth())).
            css('height', this.px(elem.outerHeight())).css('top', this.px(p.top)).css('left', this.px(p.left)).
            css('background-color', '');
    document.body.appendChild(block.get(0));
    setTimeout(function() {
        block.remove();
    }, 400);
    return false;
};

SelectorGadget.prototype.setMode = function(mode) {
    if (mode == 'browse') {
        this.removeEventHandlers();
    } else if (mode == 'interactive') {
        this.setupEventHandlers();
    }
    this.clearSelected();
};

SelectorGadget.prototype.clearSelected = function(e) {
    var self = (e && e.data && e.data.self) || this;
    self.selected = [];
    jQuery('.sg_selected').removeClass('sg_selected');
    self.removeBorders();
};

SelectorGadget.prototype.clearEverything = function(e) {
    var self = (e && e.data && e.data.self) || this;
    self.clearSelected();
    alert('jauza:002');
};

SelectorGadget.prototype.makeInterface = function() {
    this.sg_div = jQuery('<div>').attr('id', '_sg_div').addClass('sg_top').addClass('sg_ignore');
    this.clear_button = jQuery('<input type="button" value="Clear"/>').bind("click", {'self': this}, this.clearEverything).addClass('sg_ignore');
    this.sg_div.append(this.clear_button);

    jQuery('body').append(this.sg_div);
    jQuery('html').removeAttr('xmlns');

//Generate jfxid
    var x = 0;
    var level = jQuery('table');
    while ((level = level.children()).length) {
        level.each(function(_, el) {
            jQuery(el).attr('jfxid', x++);
//            if (jQuery(el).attr('jfxid')) {
//            } else {
//                jQuery(el).attr('jfxid', x++);
//            }
        })
    }
    
    //List
    var levelList = jQuery('ul, ol');
    while ((levelList = levelList.children()).length) {
        levelList.each(function(_, el) {
            if (jQuery(el).attr('jfxid')) {
            } else {
                jQuery(el).attr('jfxid', x++);
            }
        })
    }


    jQuery('body *:not(.sg_ignore)').each(function() {
        if (jQuery(this).attr('jfxid')) {
        } else {
            jQuery(this).attr('jfxid', x++);
        }
    });

};

SelectorGadget.prototype.removeInterface = function(e) {
    this.sg_div.remove();
    this.sg_div = null;
    this.removeBorderFromDom();
};

SelectorGadget.prototype.unbind = function(e) {
    var self = (e && e.data && e.data.self) || this;
    self.unbound = true;
    self.removeInterface();
    self.clearSelected();
};

SelectorGadget.prototype.rebind = function() {
    this.unbound = false;
    this.makeInterface();
    this.clearEverything();
    this.setupBorders();
    this.addBorderToDom();
};

// And go!
if (typeof(selector_gadget) == 'undefined' || selector_gadget == null) {
    (function() {
        selector_gadget = new SelectorGadget();
        selector_gadget.makeInterface();
        selector_gadget.clearEverything();
        selector_gadget.setMode('interactive');
//        alert('jauza:001');
    })();
} else if (selector_gadget.unbound) {
    selector_gadget.rebind();
} else {
    selector_gadget.unbind();
}

jQuery('.selector_gadget_loading').remove();