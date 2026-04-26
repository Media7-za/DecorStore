(() => {
  let o = !0,
    t = 0;
  window.addEventListener("load", function () {
    "undefined" != typeof uafrica_shipping_description_data &&
    uafrica_shipping_description_data.shippingDescriptions
      ? (function i() {
          if (!o || t >= 10) return;
          const e = document.querySelectorAll(".wc-block-components-radio-control__option-layout"),
            n = document.querySelectorAll(".wc-block-components-radio-control__description-group");
          if (
            (0 !== n.length &&
              n.forEach((o) => {
                o && ((o.style.fontSize = "1.2rem"), (o.style.fontWeight = "bold"));
              }),
            0 === e.length)
          )
            return (t++, void requestAnimationFrame(i));
          e.forEach((o, t) => {
            const i = o
              .closest(".wc-block-components-radio-control__option")
              .querySelector('input[type="radio"]').value;
            if (uafrica_shipping_description_data.shippingDescriptions[i]) {
              let t = o.querySelector(".custom-shipping-description");
              t && t.remove();
              const e = document.createElement("div");
              (e.classList.add("custom-shipping-description"),
                (e.style.cssText =
                  "font-size: 0.8rem; padding-top: 5px; padding-bottom:10px; font-weight: normal; display: table-row;"),
                (e.innerHTML = uafrica_shipping_description_data.shippingDescriptions[i]));
              const n = o.querySelector(".wc-block-components-radio-control__label-group");
              n && n.after(e);
            }
          });
        })()
      : (o = !1);
  });
})();
