// ==========================
// 🛒 إدارة سلة التسوق
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  const cartList = document.querySelector(".cart-list");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const copyCartBtn = document.getElementById("copyCartLink");
  const waShare = document.getElementById("waShare");
  const snapShare = document.getElementById("snapShare");
  const twShare = document.getElementById("twShare");
  const fbShare = document.getElementById("fbShare");

  // --- تحميل السلة من الرابط المشفر عند فتح الصفحة ---
  (function loadCartFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const sharedCart = params.get("cart");
    if (sharedCart) {
      try {
        const items = JSON.parse(atob(sharedCart));
        if (Array.isArray(items)) {
          localStorage.setItem("drs_cart", JSON.stringify(items));
        }
      } catch(e) {}
    }
  })();

  // --- حفظ السلة في localStorage ---
  function saveCartToStorage() {
    if (!cartList) return;
    const items = [];
    cartList.querySelectorAll(".cart-item-card").forEach(card => {
      const img = card.querySelector(".cart-item-img")?.src || '';
      const size = card.querySelector(".cart-size-select")?.value || '';
      const color = card.querySelector(".cart-color-select")?.value || '';
      const oldPrice = card.querySelector(".cart-item-old-price")?.textContent.replace(/[^\d.]/g,'') || '';
      const newPrice = card.querySelector(".cart-item-new-price")?.textContent.replace(/[^\d.]/g,'') || '';
      const qty = card.querySelector(".cart-item-qty input")?.value || '1';
      items.push({img, size, color, oldPrice, newPrice, qty});
    });
    localStorage.setItem("drs_cart", JSON.stringify(items));
    updateCartTotal();
    updateCartShareLink();
  }

  // --- تحميل السلة وعرضها ---
  function loadCartFromStorage() {
    if (!cartList) return;
    cartList.innerHTML = '';
    const items = JSON.parse(localStorage.getItem("drs_cart") || "[]");
    if (items.length === 0) {
      cartList.innerHTML = '<div style="text-align:center;color:#b26a00;font-size:1.1em;margin:30px 0;">سلتك فارغة! ابدأ التسوق الآن.</div>';
    }
    items.forEach(item => addCartItem(item));
    updateCartTotal();
  }

  // --- إضافة عنصر للسلة ---
  function addCartItem(item) {
    const card = document.createElement("div");
    card.className = "cart-item-card";
    card.innerHTML = `
      <img src="${item.img}" alt="منتج" class="cart-item-img">
      <div class="cart-item-details">
        <div class="cart-item-meta">
          ${item.size ? `<span>المقاس: 
            <select class="cart-size-select">
              <option value="S"${item.size==="S"?" selected":""}>S</option>
              <option value="M"${item.size==="M"?" selected":""}>M</option>
              <option value="L"${item.size==="L"?" selected":""}>L</option>
              <option value="XL"${item.size==="XL"?" selected":""}>XL</option>
            </select>
          </span>` : ''}
          ${item.color ? `<span>اللون: 
            <select class="cart-color-select">
              <option value="وردي"${item.color==="وردي"?" selected":""}>وردي</option>
              <option value="أزرق"${item.color==="أزرق"?" selected":""}>أزرق</option>
              <option value="أسود"${item.color==="أسود"?" selected":""}>أسود</option>
              <option value="رمادي"${item.color==="رمادي"?" selected":""}>رمادي</option>
            </select>
          </span>` : ''}
        </div>
        <div class="cart-item-prices">
          <span class="cart-item-old-price">${item.oldPrice}</span>
          <span class="cart-item-new-price">${item.newPrice}</span>
        </div>
        <div class="cart-item-qty">الكمية: <input type="number" value="${item.qty}" min="1"></div>
        <div class="cart-item-total">الإجمالي: ${parseInt(item.qty)*parseFloat(item.newPrice)} د.ل</div>
      </div>
      <button class="cart-item-remove">&#10006;</button>
    `;
    activateCartCardFeatures(card);
    cartList.appendChild(card);
  }

  // --- تفعيل وظائف بطاقة المنتج ---
  function activateCartCardFeatures(card) {
    const removeBtn = card.querySelector(".cart-item-remove");
    if (removeBtn) removeBtn.onclick = () => { card.remove(); saveCartToStorage(); };

    const qtyInput = card.querySelector(".cart-item-qty input");
    const newPriceSpan = card.querySelector(".cart-item-new-price");
    const totalDiv = card.querySelector(".cart-item-total");
    if (qtyInput && newPriceSpan && totalDiv) {
      qtyInput.oninput = () => {
        let qty = Math.max(1, parseInt(qtyInput.value)||1);
        qtyInput.value = qty;
        const price = parseFloat(newPriceSpan.textContent) || 0;
        totalDiv.textContent = `الإجمالي: ${qty*price} د.ل`;
        saveCartToStorage();
      };
    }

    const sizeSelect = card.querySelector(".cart-size-select");
    if (sizeSelect) sizeSelect.onchange = saveCartToStorage;

    const colorSelect = card.querySelector(".cart-color-select");
    const img = card.querySelector("img");
    if (colorSelect && img) {
      colorSelect.onchange = () => {
        const map = {
          "وردي":"photo_2025-09-29_22-03-57.jpg",
          "أزرق":"photo_2025-09-29_22-03-56.jpg",
          "أسود":"photo_2025-09-29_22-03-54.jpg",
          "رمادي":"photo_2025-09-29_22-03-53.jpg"
        };
        if (map[colorSelect.value]) img.src = map[colorSelect.value];
        saveCartToStorage();
      };
    }
  }

  // --- تحديث الإجمالي الكلي ---
  function updateCartTotal() {
    let total = 0, count = 0;
    document.querySelectorAll(".cart-item-card").forEach(card => {
      const qty = parseInt(card.querySelector(".cart-item-qty input").value)||1;
      const price = parseFloat(card.querySelector(".cart-item-new-price").textContent)||0;
      total += qty*price;
      count += qty;
    });
    document.querySelector(".cart-summary-count").textContent = count;
    document.querySelector(".cart-summary-total").textContent = total+" د.ل";
  }

  // --- إنشاء رابط المشاركة ---
  function getCartShareLink() {
    const items = JSON.parse(localStorage.getItem("drs_cart")||"[]");
    if (!items.length) return window.location.origin + window.location.pathname;
    const encoded = btoa(JSON.stringify(items));
    return window.location.origin + window.location.pathname + "?cart=" + encoded;
  }

  function updateCartShareLink() {
    const link = getCartShareLink();
    if (copyCartBtn) copyCartBtn.dataset.link = link;
    if (waShare) waShare.href = "https://wa.me/?text="+encodeURIComponent("سلة مشترياتي: "+link);
    if (snapShare) snapShare.href = "https://www.snapchat.com/scan?attachmentUrl="+encodeURIComponent(link);
    if (twShare) twShare.href = "https://twitter.com/intent/tweet?text="+encodeURIComponent("سلة مشترياتي: "+link);
    if (fbShare) fbShare.href = "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(link);
  }

  if (copyCartBtn) {
    copyCartBtn.onclick = () => {
      const link = copyCartBtn.dataset.link || getCartShareLink();
      navigator.clipboard.writeText(link).then(() => alert("تم نسخ الرابط بنجاح ✅"));
    };
  }

  if (clearCartBtn) {
    clearCartBtn.onclick = () => {
      localStorage.removeItem("drs_cart");
      loadCartFromStorage();
    };
  }

  // --- تحميل السلة عند فتح الصفحة ---
  loadCartFromStorage();

  // --- دعم القائمة للجوال ---
  const navToggle = document.querySelector(".nav-toggle");
  const navUl = document.querySelector("nav ul");
  function handleResize() {
    if(window.innerWidth<=700){ navToggle.style.display="block"; navUl.style.display="none"; }
    else { navToggle.style.display="none"; navUl.style.display="flex"; }
  }
  if(navToggle){
    navToggle.addEventListener("click", ()=>{ 
      navUl.style.display = navUl.style.display==="block"?"none":"block"; 
      navUl.style.flexDirection="column";
    });
    window.addEventListener("resize", handleResize);
    handleResize();
  }

});
