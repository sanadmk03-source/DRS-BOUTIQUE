// ==========================
// 🛒 إدارة سلة التسوق + حماية ترميز السلة + دعم قاعدة البيانات
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  const cartList = document.querySelector(".cart-list");
  const clearCartBtn = document.getElementById("clear-cart-btn");
  const copyCartBtn = document.getElementById("copyCartLink");
  const waShare = document.getElementById("waShare");
  const snapShare = document.getElementById("snapShare");
  const twShare = document.getElementById("twShare");
  const fbShare = document.getElementById("fbShare");

  // --- تحميل السلة عند فتح الصفحة مع دعم cartid و cart مشفر ---
  (function loadCartFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const cartid = params.get("cartid");
    const sharedCart = params.get("cart");

    if (cartid) {
      // جلب السلة من قاعدة البيانات
      fetch(`get_cart.php?cartid=${encodeURIComponent(cartid)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            localStorage.setItem("drs_cart", JSON.stringify(data));
            loadCartFromStorage();
          } else {
            alert("تعذر تحميل السلة من قاعدة البيانات!");
          }
        })
        .catch(err => {
          console.error("خطأ عند جلب السلة من السيرفر:", err);
          alert("تعذر تحميل السلة من قاعدة البيانات!");
        });
    } else if (sharedCart) {
      // جلب السلة من الرابط المشفر
      try {
        const items = decodeCart(sharedCart);
        if (Array.isArray(items)) {
          localStorage.setItem("drs_cart", JSON.stringify(items));
          loadCartFromStorage();
        } else {
          alert("السلة المستلمة غير صالحة!");
        }
      } catch(e) {
        alert("حدث خطأ في ترميز السلة!\n" + e);
      }
    } else {
      loadCartFromStorage();
    }
  })();

  // --- حفظ السلة في localStorage + تحديث رابط المشاركة ---
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

  // --- تحميل السلة من localStorage وعرضها ---
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
        let qty = sanitizeQty(qtyInput.value);
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

  // --- تحديث الإجمالي ---
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

  // --- إنشاء رابط المشاركة (مشفر فقط) ---
  function getCartShareLink() {
    // إذا كان هناك cartid في الرابط (قاعدة بيانات)
    const params = new URLSearchParams(window.location.search);
    const cartid = params.get('cartid');
    if (cartid) {
      return window.location.origin + window.location.pathname + '?cartid=' + cartid;
    }
    // إذا لا يوجد cartid، استخدم localStorage (رابط مشفر)
    const items = JSON.parse(localStorage.getItem('drs_cart') || '[]');
    if (!items.length) return window.location.origin + window.location.pathname;
    return window.location.origin + window.location.pathname + '?cart=' + encodeCart(items);
  }

  function updateCartShareLink() {
    const link = getCartShareLink();
    if (copyCartBtn) copyCartBtn.dataset.link = link;
    if (waShare) waShare.href = "https://wa.me/?text="+encodeURIComponent("سلة مشترياتي: "+link);
    if (snapShare) snapShare.href = "https://www.snapchat.com/scan?attachmentUrl="+encodeURIComponent(link);
    if (twShare) twShare.href = "https://twitter.com/intent/tweet?text="+encodeURIComponent("سلة مشترياتي: "+link);
    if (fbShare) fbShare.href = "https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent(link);
  }

  // زر نسخ رابط السلة (آمن)
  if (copyCartBtn) {
    copyCartBtn.onclick = () => {
      let items;
      try {
        items = JSON.parse(localStorage.getItem("drs_cart") || "[]");
        if (!Array.isArray(items)) items = [];
      } catch(e) {
        items = [];
      }
      if (!items.length) {
        alert("السلة فارغة!");
        return;
      }
      let encoded = '';
      try {
        encoded = encodeCart(items);
      } catch(e) {
        alert("حدث خطأ في ترميز السلة!\n" + e);
        return;
      }
      const cartUrl = window.location.origin + window.location.pathname;
      const link = cartUrl + "?cart=" + encoded;
      navigator.clipboard.writeText(link).then(() => alert("تم نسخ الرابط بنجاح ✅"));
    };
  }

  if (clearCartBtn) {
    clearCartBtn.onclick = () => {
      localStorage.removeItem("drs_cart");
      loadCartFromStorage();
    };
  }

  // --- مشاركة السلة عبر قاعدة بيانات (رابط id) ---
  const shareDbBtn = document.getElementById("shareCartDbBtn");
  const copyDbBtn = document.getElementById("copyCartDbLink");
  const dbShareLinkInput = document.getElementById("cartDbShareLink");

  if (shareDbBtn && copyDbBtn && dbShareLinkInput) {
    shareDbBtn.onclick = async function() {
      const cart = JSON.parse(localStorage.getItem('drs_cart') || '[]');
      if (!cart.length) {
        alert('السلة فارغة!');
        return;
      }
      shareDbBtn.disabled = true;
      shareDbBtn.textContent = '...جاري إنشاء الرابط';
      try {
        const res = await fetch('save_cart.php', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({cart})
        });
        const data = await res.json();
        if (data.success && data.id) {
          const link = window.location.origin + window.location.pathname + '?cartid=' + data.id;
          dbShareLinkInput.value = link;
          dbShareLinkInput.style.display = 'block';
          copyDbBtn.style.display = 'inline-block';
        } else {
          alert('حدث خطأ أثناء إنشاء الرابط');
        }
      } catch(e) {
        alert('تعذر الاتصال بالخادم');
      }
      shareDbBtn.disabled = false;
      shareDbBtn.textContent = 'مشاركة السلة (رابط قاعدة بيانات)';
    };
    copyDbBtn.onclick = function() {
      if (dbShareLinkInput.value) {
        navigator.clipboard.writeText(dbShareLinkInput.value);
        copyDbBtn.textContent = 'تم النسخ!';
        setTimeout(() => (copyDbBtn.textContent = 'نسخ الرابط'), 1500);
      }
    };
  }

  // تحميل السلة من قاعدة البيانات إذا كان cartid في الرابط
  (function loadCartFromDb() {
    const params = new URLSearchParams(window.location.search);
    const cartid = params.get('cartid');
    if (cartid) {
      fetch('get_cart.php?id=' + encodeURIComponent(cartid))
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.cart)) {
            localStorage.setItem('drs_cart', JSON.stringify(data.cart));
            loadCartFromStorage();
          }
        });
    }
  })();

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
      navUl.style.flexDirection = "column";
    });
    window.addEventListener("resize", handleResize);
    handleResize();
  }

});

// === تفعيل نافذة المنتج المنبثقة في صفحة الكتالوج (متوافق مع جميع المتصفحات والسيرفرات) ===
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById('product-modal');
  const modalImg = document.getElementById('modal-img');
  const closeModal = document.querySelector('.close-modal');
  const modalForm = document.getElementById('modal-form');
  const sizeSelect = document.getElementById('size-select');
  const colorSelect = document.getElementById('color-select');

  // فتح المودال عند الضغط على أي كرت منتج
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // تجاهل الضغط على زر "أضف إلى السلة" داخل البطاقة
      if (e.target.closest('button')) return;
      var img = card.querySelector('img');
      modalImg.src = img.getAttribute('src');
      modalImg.alt = img.getAttribute('alt');
      modal.style.display = 'block';
      // حفظ بيانات المنتج في الفورم
      modalForm.dataset.oldPrice = card.querySelector('.old-price').textContent;
      modalForm.dataset.newPrice = card.querySelector('.new-price').textContent;
      modalForm.dataset.productName = img.getAttribute('alt');
    });
  });

  // إغلاق المودال
  closeModal.addEventListener('click', function() {
    modal.style.display = 'none';
  });
  window.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });

  // إضافة المنتج للسلة
  modalForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var size = sizeSelect.value;
    var color = colorSelect.value;
    var qtyInput = document.getElementById('qty-input');
    var qty = parseInt(qtyInput && qtyInput.value ? qtyInput.value : 1);
    if (!size || !color) {
      alert('يرجى اختيار المقاس واللون');
      return;
    }
    var product = {
      img: modalImg.src,
      size: size,
      color: color,
      oldPrice: modalForm.dataset.oldPrice,
      newPrice: modalForm.dataset.newPrice,
      qty: qty
    };
    var cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('drs_cart') || '[]');
    } catch(e) { cart = []; }
    // إذا المنتج نفسه موجود (نفس الصورة/المقاس/اللون) زد الكمية فقط
    var existing = cart.find(function(p) {
      return p.img === product.img && p.size === product.size && p.color === product.color;
    });
    if (existing) {
      existing.qty = (parseInt(existing.qty) || 1) + qty; // جمع الكمية المختارة مع الكمية السابقة
    } else {
      cart.push(product);
    }
    localStorage.setItem('drs_cart', JSON.stringify(cart));
    alert('تم إضافة المنتج إلى السلة!');
    modal.style.display = 'none';
    modalForm.reset();
  });
});

// 🔒 ترميز السلة (يدعم العربي)
function encodeCart(items) {
  if (!items || typeof items !== 'object') items = [];
  // فلترة العناصر لتجنب undefined أو دوال
  const safeItems = Array.isArray(items)
    ? items.map(item => {
        if (!item || typeof item !== 'object') return {};
        const {img, size, color, oldPrice, newPrice, qty} = item;
        return {img, size, color, oldPrice, newPrice, qty};
      })
    : [];
  return btoa(unescape(encodeURIComponent(JSON.stringify(safeItems))));
}
// 🔓 فك ترميز السلة
function decodeCart(encoded) {
  return JSON.parse(decodeURIComponent(escape(atob(encoded))));
}

// تحقق من الكمية المدخلة في كل مكان
function sanitizeQty(val) {
  let qty = parseInt(val);
  if (isNaN(qty) || qty < 1) qty = 1;
  return qty;
}
