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
document.addEventListener('DOMContentLoaded', function() {
	// دالة لحساب وعرض الإجمالي الكلي للسلة
	function updateCartTotal() {
		// تحديث مربع الإجمالي المتطور
		let total = 0;
		let count = 0;
		document.querySelectorAll('.cart-item-card').forEach(card => {
			const qtyInput = card.querySelector('.cart-item-qty input');
			const newPriceSpan = card.querySelector('.cart-item-new-price');
			let qty = parseInt(qtyInput?.value) || 1;
			let price = parseFloat(newPriceSpan?.textContent) || 0;
			total += qty * price;
			count += qty;
		});
		const advSummary = document.getElementById('cart-summary-advanced');
		if (advSummary) {
			advSummary.querySelector('.cart-summary-count').textContent = count;
			advSummary.querySelector('.cart-summary-total').textContent = total + ' د.ل';
		}
	}

	// عند تحميل صفحة السلة
	   if (document.querySelector('.cart-list')) {
		   loadCartFromStorage();
		   // تحديث المربع الذهبي بعد تحميل السلة مباشرة
		   setTimeout(() => { updateCartTotal(); }, 50);
	   }
	document.querySelectorAll('.cart-item-card').forEach(card => {
		const colorSelect = card.querySelector('.cart-color-select');
		const img = card.querySelector('.cart-item-img');
		if (colorSelect && img) {
			colorSelect.addEventListener('change', function() {
				let color = colorSelect.value;
				// منطق الصور حسب اللون (نفس منطق صفحة المنتجات)
				let colorToImg = {
					'وردي': 'photo_2025-09-29_22-03-57.jpg',
					'أزرق': 'photo_2025-09-29_22-03-56.jpg',
					'أسود': 'photo_2025-09-29_22-03-54.jpg',
					'رمادي': 'photo_2025-09-29_22-03-53.jpg'
				};
				if (colorToImg[color]) {
					img.src = colorToImg[color];
				}
			});
		}
	});

	// منطق نافذة المنتجات
	const modal = document.getElementById('product-modal');
	const modalImg = document.getElementById('modal-img');
	const closeModal = document.querySelector('.close-modal');
	const form = document.getElementById('modal-form');
	const colorSelect = document.getElementById('color-select');
	let lastScroll = 0;
	let currentProductIndex = 0;

	const colorImagesList = [
		{
			'وردي': 'pink.jpg',
			'أزرق': 'photo_2025-09-29_22-03-56.jpg',
			'أسود': 'photo_2025-09-29_22-03-54.jpg',
			'رمادي': 'photo_2025-09-29_22-03-53.jpg'
		},
		{
			'وردي': 'photo_2025-09-29_22-03-57.jpg',
			'أزرق': 'photo_2025-09-29_22-03-56.jpg',
			'أسود': 'photo_2025-09-29_22-03-54.jpg',
			'رمادي': 'photo_2025-09-29_22-03-53.jpg'
		},
		{
			'وردي': 'photo_2025-09-29_22-03-57.jpg',
			'أزرق': 'photo_2025-09-29_22-03-56.jpg',
			'أسود': 'photo_2025-09-29_22-03-54.jpg',
			'رمادي': 'photo_2025-09-29_22-03-53.jpg'
		},
		{
			'وردي': 'photo_2025-09-29_22-03-57.jpg',
			'أزرق': 'photo_2025-09-29_22-03-56.jpg',
			'أسود': 'photo_2025-09-29_22-03-54.jpg',
			'رمادي': 'photo_2025-09-29_22-03-53.jpg'
		}
	];

	const sizeDiv = document.getElementById('size-select')?.parentElement;
	const colorDiv = document.getElementById('color-select')?.parentElement;
	let noteDiv = null;
	if (document.querySelectorAll('.product-card').length > 0) {
		document.querySelectorAll('.product-card').forEach((card, idx) => {
			card.addEventListener('click', function(e) {
				// تجاهل الضغط إذا كان على زر فعلي (لو أضفت أزرار لاحقًا)
				if (e.target.closest('button')) return;
				// جلب صورة المنتج
				const img = card.querySelector('img');
				modalImg.src = img.src;
				modal.style.display = 'flex';
				lastScroll = window.scrollY;
				document.body.style.overflow = 'hidden';
				currentProductIndex = idx;
				colorSelect.selectedIndex = 0;

				const sizeSelectEl = document.getElementById('size-select');
				const colorSelectEl = document.getElementById('color-select');

				// المنتج الرابع: إخفاء خيارات المقاس واللون، وإظهار ملاحظة
				if (idx === 3) {
					sizeDiv.style.display = 'none';
					colorDiv.style.display = 'none';
					if (sizeSelectEl) sizeSelectEl.removeAttribute('required');
					if (colorSelectEl) colorSelectEl.removeAttribute('required');
					if (!noteDiv) {
						noteDiv = document.createElement('div');
						noteDiv.className = 'product-note';
						noteDiv.style.margin = '18px 0 10px 0';
						noteDiv.style.color = '#fff';
						noteDiv.style.background = 'linear-gradient(90deg, #4e342e 0%, #ff9800 100%)';
						noteDiv.style.fontWeight = 'bold';
						noteDiv.style.padding = '10px 18px';
						noteDiv.style.borderRadius = '12px';
						noteDiv.style.boxShadow = '0 2px 12px rgba(78,52,46,0.13)';
						noteDiv.textContent = 'هذا المنتج متوفر بمقاس ستاندر ولون واحد فقط كما في الصورة';
						colorDiv.parentElement.parentElement.insertBefore(noteDiv, colorDiv.parentElement.nextSibling);
					} else {
						noteDiv.style.display = 'block';
					}
				} else {
					sizeDiv.style.display = '';
					colorDiv.style.display = '';
					if (sizeSelectEl) sizeSelectEl.setAttribute('required', 'required');
					if (colorSelectEl) colorSelectEl.setAttribute('required', 'required');
					if (noteDiv) noteDiv.style.display = 'none';
				}
			});
		});
	}

	if (colorSelect) {
		colorSelect.addEventListener('change', function() {
			const val = colorSelect.value;
			const colorImages = colorImagesList[currentProductIndex] || {};
			if (colorImages[val]) {
				modalImg.src = colorImages[val];
			}
		});
	}

	if (closeModal) {
		closeModal.addEventListener('click', function() {
			modal.style.display = 'none';
			document.body.style.overflow = '';
		});
	}

	if (modal) {
		modal.addEventListener('click', function(e) {
			if (e.target === modal) {
				modal.style.display = 'none';
				document.body.style.overflow = '';
			}
		});
	}

	if (form) {
		form.addEventListener('submit', function(e) {
			e.preventDefault();
			// المنتج الرابع: قد لا يحتوي على خيارات مقاس/لون
			let size = '';
			let color = '';
			const sizeSelectEl = document.getElementById('size-select');
			const colorSelectEl = document.getElementById('color-select');
			if (sizeSelectEl && sizeSelectEl.offsetParent !== null) {
				size = sizeSelectEl.value;
			}
			if (colorSelectEl && colorSelectEl.offsetParent !== null) {
				color = colorSelectEl.value;
			}
			// إذا كان هناك خيارات مقاس/لون يجب اختيارها، وإلا نسمح بالإضافة مباشرة
			if ((sizeSelectEl && sizeSelectEl.offsetParent !== null && !size) || (colorSelectEl && colorSelectEl.offsetParent !== null && !color)) {
				// يجب اختيار المقاس واللون إذا كانا ظاهرين
				return;
			}
			// جلب الأسعار من بطاقة المنتج المفتوحة
			const productCard = document.querySelectorAll('.product-card')[currentProductIndex];
			let oldPrice = '120';
			let newPrice = '99';
			if (productCard) {
				const oldP = productCard.querySelector('.old-price');
				const newP = productCard.querySelector('.new-price');
				if (oldP) oldPrice = oldP.textContent.replace(/[^\d.]/g, '');
				if (newP) newPrice = newP.textContent.replace(/[^\d.]/g, '');
			}
			// بناء عنصر المنتج
			const item = {
				img: modalImg.src,
				size: size,
				color: color,
				oldPrice: oldPrice,
				newPrice: newPrice,
				qty: '1'
			};
			// جلب السلة الحالية من localStorage
			let cart = [];
			try {
				cart = JSON.parse(localStorage.getItem('drs_cart') || '[]');
			} catch(e) { cart = []; }
			cart.push(item);
			localStorage.setItem('drs_cart', JSON.stringify(cart));
			modal.style.display = 'none';
			document.body.style.overflow = '';
			// تحويل المستخدم تلقائياً إلى صفحة السلة بعد الإضافة
			window.location.href = 'cart.html';
		});
	}

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
});
