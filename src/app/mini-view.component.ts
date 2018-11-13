import { Component, ElementRef } from "@angular/core";

declare var $: any;

@Component({
  selector: "mini-view",
  templateUrl: "./mini-view.component.html",
  styleUrls: ["./mini-view.component.css"]
})
export class MiniViewComponent {
  miniViewObject: any = null;
  config: any = null;
  intialized = false;
  constructor(private elm: ElementRef) {}
  setViewZoom(event, delta, deltaX, deltaY) {
    var el = event.delegateTarget,
      mousePosX = event.clientX - el.offsetLeft,
      mousePosY = event.clientY - el.offsetTop,
      origZoom = this.miniViewObject.viewZoom,
      zoom,
      elCurrLeft = parseInt($(el).css("left")),
      elCurrTop = parseInt($(el).css("top"));

    if (delta > 0 && origZoom < 1.5) zoom = origZoom + 0.05;
    else if (delta < 0 && origZoom > 0.5) zoom = origZoom - 0.05;
    else return false;

    var p = ["webkit", "moz", "ms", "o"],
      s = "scale(" + zoom + ")",
      oString = "left top";

    for (var i = 0; i < p.length; i++) {
      el.style[p[i] + "Transform"] = s;
      el.style[p[i] + "TransformOrigin"] = oString;
    }

    el.style["transform"] = s;
    el.style["transformOrigin"] = oString;

    var leftDiff = mousePosX * (1 - zoom / origZoom),
      TopDiff = mousePosY * (1 - zoom / origZoom);
    $(el).css("left", elCurrLeft + leftDiff);
    $(el).css("top", elCurrTop + TopDiff);

    this.miniViewObject.refresh({
      viewZoom: zoom
    });

    return false;
  }
  init(config) {
    if (this.intialized) {
      return false;
    }
    this.intialized = true;
    this.miniViewObject.getParams(config);
    var selector = config.selector;
    var parentDiv = $(selector).parent();
    parentDiv.after(
      '<div id="minimap">' +
        '<div id="selectWin">' +
        '<div class="selectionWin"></div>' +
        "</div>" +
        '<div id="miniview"></div>' +
        "</div>"
    );
    $(".selectionWin").draggable({
      containment: "parent",
      drag: () => {
        var selectionLeft = parseInt($(".selectionWin").css("left")),
          selectionTop = parseInt($(".selectionWin").css("top"));
        $(this.miniViewObject.selector).css({
          left:
            -selectionLeft /
            (this.miniViewObject.zoom / this.miniViewObject.viewZoom),
          top:
            -selectionTop /
            (this.miniViewObject.zoom / this.miniViewObject.viewZoom)
        });
      }
    });

    $(selector).mousewheel((event, delta, deltaX, deltaY) => {
      this.setViewZoom(event, delta, deltaX, deltaY);
      return false;
    });
    this.miniViewObject.refresh();
    return this.miniViewObject;
  }

  ngOnInit() {
    if (!this.intialized) {
      this.miniViewObject = {
        selector: null,
        zoom: 0.1,
        viewZoom: 1,
        refresh: config => {
          this.miniViewObject.getParams(config);
          var selector = this.miniViewObject.selector,
            p = ["webkit", "moz", "ms", "o"],
            oString = "left top";

          if (config && config.viewZoom)
            this.miniViewObject.viewZoom = config.viewZoom;

          var el = $(selector)
              .clone()
              .removeAttr("style"),
            s = "scale(" + this.miniViewObject.zoom + ")",
            parentDiv = $(selector).parent();

          for (var i = 0; i < p.length; i++) {
            el[0].style[p[i] + "Transform"] = s;
            el[0].style[p[i] + "TransformOrigin"] = oString;
          }

          el[0].style["transform"] = s;
          el[0].style["transformOrigin"] = oString;

          $("#miniview " + selector + "Mini").remove();
          $("#miniview").append(
            el
              .attr("id", $(selector).attr("id") + "Mini")
              .removeAttr("data-bind")
          );

          $("#minimap, #selectWin, #miniview").css({
            width: $(selector).width() * this.miniViewObject.zoom,
            height: $(selector).height() * this.miniViewObject.zoom
          });

          $(".selectionWin").css({
            width:
              (parentDiv.width() * this.miniViewObject.zoom) /
              this.miniViewObject.viewZoom,
            height:
              (parentDiv.height() * this.miniViewObject.zoom) /
              this.miniViewObject.viewZoom
          });

          var selLeft = parseInt($(selector).css("left")),
            selTop = parseInt($(selector).css("top"));
          $(".selectionWin").css({
            left:
              (-selLeft * this.miniViewObject.zoom) /
              this.miniViewObject.viewZoom,
            top:
              (-selTop * this.miniViewObject.zoom) /
              this.miniViewObject.viewZoom
          });
        },
        getParams: config => {
          if (!config) return false;
          if (config.selector) this.miniViewObject.selector = config.selector;
          if (config.zoom) this.miniViewObject.zoom = config.zoom;
          if (config.viewZoom) this.miniViewObject.viewZoom = config.viewZoom;
        }
      };

      this.init({ selector: "#view" });
    }
  }
}
