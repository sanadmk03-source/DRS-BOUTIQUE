// --- دعم سلة خاصة بكل مستخدم عبر localStorage ---
function saveCartToStorage() {
	const cartList = document.querySelector('.cart-list');
	if (!cartList) return;
	const items = [];
	cartList.querySelectorAll('.cart-item-card').forEach(card => {
		const img = card.querySelector('.cart-item-img')?.src || '';
		const size = card.querySelector('.cart-size-select')?.value || '';
		const color = card.querySelector('.cart-color-select')?.value || '';
		const oldPrice = (card.querySelector('.cart-item-old-price')?.textContent || '').replace(/[^\d.]/g, '');
		const newPrice = (card.querySelector('.cart-item-new-price')?.textContent || '').replace(/[^\d.]/g, '');
		const qty = card.querySelector('.cart-item-qty input')?.value || '1';
		items.push({img, size, color, oldPrice, newPrice, qty});
	});
	localStorage.setItem('drs_cart', JSON.stringify(items));

	// تحديث رابط المشاركة بعد كل عملية حفظ
	updateCartShareLink();
}

// دالة لتحويل السلة إلى رابط مشاركة
function getCartShareLink() {
	const items = JSON.parse(localStorage.getItem('drs_cart') || '[]');
	if (!items.length) return window.location.origin + window.location.pathname;
	// ضغط البيانات باستخدام base64
	const encoded = btoa(JSON.stringify(items));
	return window.location.origin + window.location.pathname + '?cart=' + encoded;
}

// دالة لتحديث روابط المشاركة وزر النسخ
function updateCartShareLink() {
	const shareLink = getCartShareLink();
	// تحديث زر النسخ إذا كان موجود
	const copyBtn = document.getElementById('copyCartLink');
	if (copyBtn) {
		copyBtn.dataset.link = shareLink;
	}
	// تحديث روابط المشاركة (واتساب، سناب، تويتر، فيسبوك)
	const waShare = document.getElementById('waShare');
	const snapShare = document.getElementById('snapShare');
	const twShare = document.getElementById('twShare');
	const fbShare = document.getElementById('fbShare');
	if (waShare) waShare.href = 'https://wa.me/?text=' + encodeURIComponent('سلة مشترياتي: ' + shareLink);
	if (snapShare) snapShare.href = 'https://www.snapchat.com/scan?attachmentUrl=' + encodeURIComponent(shareLink);
	if (twShare) twShare.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('سلة مشترياتي: ' + shareLink);
	if (fbShare) fbShare.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareLink);
}

// دالة لتحميل السلة من الرابط عند فتح الصفحة
function loadCartFromUrl() {
	const params = new URLSearchParams(window.location.search);
	const sharedCart = params.get('cart');
	if (sharedCart) {
		try {
			const items = JSON.parse(atob(sharedCart));
			if (Array.isArray(items)) {
				localStorage.setItem('drs_cart', JSON.stringify(items));
			}
		} catch(e) {}
	}
}

function loadCartFromStorage() {
	const cartList = document.querySelector('.cart-list');
	if (!cartList) return;
	cartList.innerHTML = '';
	const items = JSON.parse(localStorage.getItem('drs_cart') || '[]');
	items.forEach(item => {
		const card = document.createElement('div');
		card.className = 'cart-item-card';
		card.innerHTML = `
			<img src="${item.img}" alt="منتج" class="cart-item-img">
			<div class="cart-item-details">
				<div class="cart-item-meta">
					${item.size ? `<span>المقاس: 
						<select class=\"cart-size-select\">

							<option value=\"S\"${item.size==='S'?' selected':''}>S</option>
							<option value=\"M\"${item.size==='M'?' selected':''}>M</option>
							<option value=\"L\"${item.size==='L'?' selected':''}>L</option>
							<option value=\"XL\"${item.size==='XL'?' selected':''}>XL</option>
						</select>
					</span>` : ''}
					${item.color ? `<span>اللون: 
						<select class=\"cart-color-select\">

							<option value=\"وردي\"${item.color==='وردي'?' selected':''}>وردي</option>
							<option value=\"أزرق\"${item.color==='أزرق'?' selected':''}>أزرق</option>
							<option value=\"أسود\"${item.color==='أسود'?' selected':''}>أسود</option>
							<option value=\"رمادي\"${item.color==='رمادي'?' selected':''}>رمادي</option>
						</select>
					</span>` : ''}
				</div>
				<div class="cart-item-prices">
					<span class="cart-item-old-price">${item.oldPrice} د.ل</span>
					<span class="cart-item-new-price">${item.newPrice} د.ل</span>
				</div>
				<div class="cart-item-qty">الكمية: <input type="number" value="${item.qty}" min="1"></div>
				<div class="cart-item-total">الإجمالي: ${parseFloat(item.newPrice)*parseInt(item.qty)} د.ل</div>
			</div>
			<button class="cart-item-remove">&#10006;</button>
		`;
		activateCartCardFeatures(card);
		cartList.appendChild(card);
	});
	updateCartTotal();
}

function activateCartCardFeatures(card) {
	// زر الحذف
	const removeBtn = card.querySelector('.cart-item-remove');
	if (removeBtn) {
		removeBtn.onclick = function() {
			card.remove();
			saveCartToStorage();
			updateCartTotal();
			// إعادة تحميل السلة إذا أصبحت فارغة
			if (document.querySelectorAll('.cart-item-card').length === 0) {
				loadCartFromStorage();
			}
		};
	}
	// تحديث الإجمالي عند تغيير الكمية
	const qtyInput = card.querySelector('.cart-item-qty input');
	const newPriceSpan = card.querySelector('.cart-item-new-price');
	const totalDiv = card.querySelector('.cart-item-total');
	if (qtyInput && newPriceSpan && totalDiv) {
		qtyInput.oninput = function() {
			let qty = parseInt(qtyInput.value);
			if (isNaN(qty) || qty < 1) {
				qty = 1;
				qtyInput.value = 1;
			}
			let price = parseFloat(newPriceSpan.textContent);
			if (isNaN(price)) price = 0;
			totalDiv.textContent = 'الإجمالي: ' + (qty * price) + ' د.ل';
			saveCartToStorage();
			updateCartTotal();
		};
	}
	// حفظ السلة عند تغيير المقاس أو اللون
	const sizeSelect = card.querySelector('.cart-size-select');
	if (sizeSelect) {
		sizeSelect.onchange = saveCartToStorage;
	}
	const colorSelect = card.querySelector('.cart-color-select');
	const img = card.querySelector('.cart-item-img');
	if (colorSelect && img) {
		colorSelect.onchange = function() {
			let color = colorSelect.value;
			let colorToImg = {
				'وردي': 'photo_2025-09-29_22-03-57.jpg',
				'أزرق': 'photo_2025-09-29_22-03-56.jpg',
				'أسود': 'photo_2025-09-29_22-03-54.jpg',
				'رمادي': 'photo_2025-09-29_22-03-53.jpg'
			};
			if (colorToImg[color]) {
				img.src = colorToImg[color];
			}
			saveCartToStorage();
		};
	}
}
// ربط تغيير اللون في السلة بتغيير صورة المنتج

document.addEventListener("DOMContentLoaded", () => {
	// تحميل السلة من الرابط إذا وجد cart= في الرابط
	loadCartFromUrl();
// --- تفعيل القائمة للجوال ---
const navToggle = document.querySelector(".nav-toggle");
const navUl = document.querySelector("nav ul");
function handleResize() {
	if (window.innerWidth <= 700) {
		navToggle.style.display = "block";
		navUl.style.display = "none";
	} else {
		navToggle.style.display = "none";
		navUl.style.display = "flex";
	}
}
navToggle.addEventListener("click", () => {
	navUl.style.display = navUl.style.display === "block" ? "none" : "block";
	navUl.style.flexDirection = "column";
});
window.addEventListener("resize", handleResize);
handleResize();

// --- إدارة السلة عبر localStorage ---
const cartList = document.querySelector(".cart-list");

function saveCartToStorage() {
	const items = [];
	cartList.querySelectorAll(".cart-item-card").forEach(card => {
		items.push({
			img: card.querySelector("img").src,
			size: card.querySelector(".cart-size-select")?.value || "",
			color: card.querySelector(".cart-color-select")?.value || "",
			oldPrice: card.querySelector(".cart-item-old-price")?.textContent || "",
			newPrice: card.querySelector(".cart-item-new-price")?.textContent || "",
			qty: card.querySelector(".cart-item-qty input")?.value || "1"
		});
	});
	localStorage.setItem("drs_cart", JSON.stringify(items));
}

function loadCartFromStorage() {
	cartList.innerHTML = "";
	const items = JSON.parse(localStorage.getItem("drs_cart") || "[]");
	if (items.length === 0) {
		cartList.innerHTML = '<div style="text-align:center;color:#b26a00;font-size:1.1em;margin:30px 0;">سلتك فارغة! ابدأ التسوق الآن.</div>';
	}
	items.forEach(item => addCartItem(item));
	updateCartTotal();
}

function addCartItem(item) {
	const card = document.createElement("div");
	card.className = "cart-item-card";
	card.innerHTML = `       <img src="${item.img}" alt="منتج" class="cart-item-img">       <div class="cart-item-details">         <div class="cart-item-meta">           <span>المقاس:             <select class="cart-size-select">               <option value="S"${item.size==="S"?" selected":""}>S</option>               <option value="M"${item.size==="M"?" selected":""}>M</option>               <option value="L"${item.size==="L"?" selected":""}>L</option>               <option value="XL"${item.size==="XL"?" selected":""}>XL</option>             </select>           </span>           <span>اللون:             <select class="cart-color-select">               <option value="وردي"${item.color==="وردي"?" selected":""}>وردي</option>               <option value="أزرق"${item.color==="أزرق"?" selected":""}>أزرق</option>               <option value="أسود"${item.color==="أسود"?" selected":""}>أسود</option>               <option value="رمادي"${item.color==="رمادي"?" selected":""}>رمادي</option>             </select>           </span>         </div>         <div class="cart-item-prices">           <span class="cart-item-old-price">${item.oldPrice}</span>           <span class="cart-item-new-price">${item.newPrice}</span>         </div>         <div class="cart-item-qty">الكمية: <input type="number" value="${item.qty}" min="1"></div>         <div class="cart-item-total">الإجمالي: ${
		parseInt(item.qty) * parseFloat(item.newPrice)
	} د.ل</div>       </div>       <button class="cart-item-remove">&#10006;</button>
	`;
	activateCartCardFeatures(card);
	cartList.appendChild(card);
}

function activateCartCardFeatures(card) {
	// زر الحذف
	card.querySelector(".cart-item-remove").onclick = () => {
		card.remove();
		saveCartToStorage();
		updateCartTotal();
	};

	// تحديث الإجمالي عند تغيير الكمية
	const qtyInput = card.querySelector(".cart-item-qty input");
	qtyInput.oninput = () => {
		let qty = Math.max(1, parseInt(qtyInput.value) || 1);
		qtyInput.value = qty;
		const price = parseFloat(card.querySelector(".cart-item-new-price").textContent) || 0;
		card.querySelector(".cart-item-total").textContent = `الإجمالي: ${qty * price} د.ل`;
		saveCartToStorage();
		updateCartTotal();
	};

	// تغيير اللون يبدل الصورة
	const colorSelect = card.querySelector(".cart-color-select");
	const img = card.querySelector("img");
	colorSelect.onchange = () => {
		const map = {
			"وردي": "photo_2025-09-29_22-03-57.jpg",
			"أزرق": "photo_2025-09-29_22-03-56.jpg",
			"أسود": "photo_2025-09-29_22-03-54.jpg",
			"رمادي": "photo_2025-09-29_22-03-53.jpg"
		};
		if (map[colorSelect.value]) img.src = map[colorSelect.value];
		saveCartToStorage();
	};

	// المقاس
	const sizeSelect = card.querySelector(".cart-size-select");
	sizeSelect.onchange = saveCartToStorage;
}

function updateCartTotal() {
	let total = 0, count = 0;
	document.querySelectorAll(".cart-item-card").forEach(card => {
		const qty = parseInt(card.querySelector(".cart-item-qty input").value) || 1;
		const price = parseFloat(card.querySelector(".cart-item-new-price").textContent) || 0;
		total += qty * price;
		count += qty;
	});
	document.querySelector(".cart-summary-count").textContent = count;
	document.querySelector(".cart-summary-total").textContent = total + " د.ل";
}

// تحميل السلة عند فتح الصفحة
loadCartFromStorage();

// --- منطق المشاركة ---
const shareBtn = document.getElementById("shareCartBtn");
const shareMenu = document.getElementById("shareMenu");
const copyBtn = document.getElementById("copyCartLink");

shareBtn && (shareBtn.onclick = e => {
	e.preventDefault();
	shareMenu.style.display = shareMenu.style.display === "block" ? "none" : "block";
});
document.addEventListener("click", e => {
	if (shareBtn && shareMenu && !shareBtn.contains(e.target) && !shareMenu.contains(e.target)) {
		shareMenu.style.display = "none";
	}
});
if (copyBtn) {
	copyBtn.onclick = () => {
		const link = copyBtn.dataset.link || getCartShareLink();
		navigator.clipboard.writeText(link);
		copyBtn.textContent = "تم النسخ!";
		setTimeout(() => (copyBtn.textContent = "نسخ رابط السلة"), 1500);
	};
}
// تحديث روابط المشاركة عند تحميل الصفحة
updateCartShareLink();
});
	document.addEventListener('DOMContentLoaded', () => {
  // === العناصر ===
  const modal = document.getElementById('product-modal');
  const modalImg = document.getElementById('modal-img');
  const closeModal = document.querySelector('.close-modal');
  const modalForm = document.getElementById('modal-form');
  const sizeSelect = document.getElementById('size-select');
  const colorSelect = document.getElementById('color-select');

  // === فتح المودال عند الضغط على أي كرت ===
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.querySelector('img').src;
      modalImg.src = imgSrc;
      modal.style.display = 'block';
      // حفظ بيانات المنتج الحالية في الفورم
      modalForm.dataset.productName = card.querySelector('img').alt;
      modalForm.dataset.oldPrice = card.querySelector('.old-price').textContent;
      modalForm.dataset.newPrice = card.querySelector('.new-price').textContent;
    });
  });

  // === إغلاق المودال ===
  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', e => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // === إضافة المنتج للسلة (متوافق مع drs_cart ويدعم الكمية) ===
  modalForm.addEventListener('submit', e => {
    e.preventDefault();
    const size = sizeSelect.value;
    const color = colorSelect.value;
    if (!size || !color) {
      alert('يرجى اختيار المقاس واللون');
      return;
    }
    const product = {
      img: modalImg.src,
      size: size,
      color: color,
      oldPrice: modalForm.dataset.oldPrice,
      newPrice: modalForm.dataset.newPrice,
      qty: 1
    };
    // جلب السلة من localStorage أو إنشاء جديدة
    let cart = [];
    try {
      cart = JSON.parse(localStorage.getItem('drs_cart') || '[]');
    } catch(e) { cart = []; }
    // إذا المنتج نفسه موجود (نفس الصورة/المقاس/اللون) زد الكمية فقط
    const existing = cart.find(
      p => p.img === product.img && p.size === product.size && p.color === product.color
    );
    if (existing) {
      existing.qty = (parseInt(existing.qty) || 1) + 1;
    } else {
      cart.push(product);
    }
    localStorage.setItem('drs_cart', JSON.stringify(cart));
    alert('تم إضافة المنتج إلى السلة!');
    modal.style.display = 'none';
    modalForm.reset();
  });
});

// تفعيل تحديث الإجمالي عند تغيير الكمية للبطاقات الموجودة عند تحميل الصفحة
   document.querySelectorAll('.cart-item-qty input').forEach(input => {
	   const card = input.closest('.cart-item-card');
	   const newPriceSpan = card.querySelector('.cart-item-new-price');
	   const totalDiv = card.querySelector('.cart-item-total');
	   input.addEventListener('input', function() {
		   let qty = parseInt(input.value) || 1;
		   let price = parseFloat(newPriceSpan.textContent);
		   if (isNaN(price)) price = 0;
		   totalDiv.textContent = 'الإجمالي: ' + (qty * price) + ' د.ل';
		   // تحديث المربع الذهبي عند تغيير الكمية
		   updateCartTotal();
	   });
   });

// تفعيل زر الحذف للبطاقات الموجودة عند تحميل الصفحة
document.querySelectorAll('.cart-item-remove').forEach(btn => {
	btn.addEventListener('click', function() {
		const card = btn.closest('.cart-item-card');
		if (card) card.remove();
	});
});

const clearCartBtn = document.getElementById('clear-cart-btn');
if (clearCartBtn) {
	clearCartBtn.addEventListener('click', function() {
		localStorage.removeItem('drs_cart');
		loadCartFromStorage();
	});
}
