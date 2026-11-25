/**
 * Admin Panel & Bulk Excel Import/Export Component (admin.js)
 * Clean, robust, modular administrative dashboard for Eagle Shopping World.
 */

import { api } from '../api.js';
import { store } from '../store.js';

export async function renderAdminPanel(container) {
  const session = await api.getSession();
  if (!session || session.role !== 'admin') {
    container.innerHTML = `
      <div class="auth-view-wrap">
        <div class="auth-card">
          <h2>Admin Login</h2>
          <p style="color:var(--color-text-muted);font-size:13px;margin-bottom:16px">Enter your administrator credentials to access management controls.</p>
          <form id="admin-login-form">
            <label class="form-label">Email Address</label>
            <input type="email" id="adm-email" class="form-input" required value="admin@shopverse.com">
            <label class="form-label">Password</label>
            <input type="password" id="adm-pass" class="form-input" required value="Admin@123">
            <div id="adm-err" class="auth-err-msg"></div>
            <button class="btn btn-primary w-full" style="margin-top:16px">Log In as Admin</button>
          </form>
          <div style="font-size:12px;color:var(--color-text-muted);margin-top:14px;background:#fafafa;padding:8px 12px;border-radius:4px">
            <b>Demo Credentials:</b><br>
            Email: admin@shopverse.com<br>
            Password: Admin@123
          </div>
        </div>
      </div>
    `;

    document.getElementById('admin-login-form').onsubmit = async (e) => {
      e.preventDefault();
      const errEl = document.getElementById('adm-err');
      errEl.textContent = '';
      try {
        const email = document.getElementById('adm-email').value;
        const pass = document.getElementById('adm-pass').value;
        const s = await api.login(email, pass);
        if (s.role !== 'admin') {
          errEl.textContent = 'Account does not have administrator privileges.';
          return;
        }
        store.state.user = s;
        store.toast('Logged in as Admin');
        renderAdminPanel(container);
      } catch (err) {
        errEl.textContent = err.message;
      }
    };
    return;
  }

  // Load Admin Data
  const productsRes = await api.getProducts({ limit: 500 });
  const allProducts = productsRes.items;
  const allOrders = await api.getOrders();
  const totalRev = allOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';');

  let activeTab = 'products';
  let editingProduct = null;
  let uploadedImageDataUrl = null;
  let activePasteListener = null;

  function renderView() {
    if (activePasteListener) {
      window.removeEventListener('paste', activePasteListener);
      activePasteListener = null;
    }

    const isEdit = Boolean(editingProduct);

    container.innerHTML = `
      <div class="container admin-view-wrap">
        <div class="flex justify-between items-center" style="margin-bottom:20px">
          <div>
            <h1 style="font-size:28px;font-weight:900;color:var(--color-primary-dark)">Admin Dashboard</h1>
            <p style="color:var(--color-text-muted);font-size:14px">Welcome back, ${session.name || 'Eagle Shopping World Administrator'}</p>
          </div>
          <button class="btn btn-outline btn-sm" id="btn-admin-logout">Log Out</button>
        </div>

        <!-- Metric KPI Cards -->
        <div class="admin-stats-grid">
          <div class="admin-stat-card">
            <div class="admin-stat-val">${allProducts.length}</div>
            <div class="admin-stat-lbl">Active Products</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-val">${allOrders.length}</div>
            <div class="admin-stat-lbl">Total Orders</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-val">₹${totalRev.toLocaleString('en-IN')}</div>
            <div class="admin-stat-lbl">Gross Revenue</div>
          </div>
          <div class="admin-stat-card">
            <div class="admin-stat-val">100+</div>
            <div class="admin-stat-lbl">Enterprise Clients</div>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="admin-tabs-nav">
          <button class="admin-tab-btn ${activeTab === 'products' ? 'active' : ''}" data-tab="products">
            Products Inventory (${allProducts.length})
          </button>
          <button class="admin-tab-btn ${activeTab === 'add' && !isEdit ? 'active' : ''}" data-tab="add">
            + Add New Product
          </button>
          ${isEdit ? `
            <button class="admin-tab-btn ${activeTab === 'add' ? 'active' : ''}" data-tab="edit" style="color:var(--color-primary);font-weight:800;border:1px solid var(--color-primary);background:${activeTab === 'add' ? 'var(--color-primary)' : 'var(--color-primary-light)'};color:${activeTab === 'add' ? '#fff' : 'var(--color-primary)'}">
              ✏️ Edit Product (#${editingProduct.id})
            </button>
          ` : ''}
          <button class="admin-tab-btn ${activeTab === 'import' ? 'active' : ''}" data-tab="import">Excel Bulk Import / Export</button>
          <button class="admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">Customer Orders (${allOrders.length})</button>
        </div>

        <!-- Tab Contents -->
        <div id="admin-tab-content"></div>
      </div>
    `;

    const tabContent = document.getElementById('admin-tab-content');

    if (activeTab === 'products') {
      tabContent.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${allProducts.slice(0, 150).map(p => `
                <tr data-id="${p.id}">
                  <td><b>#${p.id}</b></td>
                  <td><img src="${p.image}" alt="" style="width:40px;height:40px;border-radius:4px;object-fit:cover;border:1px solid #eee;background:#f9f9f9"></td>
                  <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis"><b>${esc(p.name)}</b></td>
                  <td>${esc(p.category)}</td>
                  <td>${esc(p.brand)}</td>
                  <td><b>₹${p.price}</b></td>
                  <td><span style="color:var(--color-text-muted);text-decoration:line-through">₹${p.mrp}</span></td>
                  <td>
                    <input type="number" class="stock-input" data-id="${p.id}" value="${p.stock || 50}" style="width:70px;border:1px solid #d4d5d9;border-radius:4px;padding:4px 8px;font-weight:700">
                  </td>
                  <td style="white-space:nowrap">
                    <button class="btn btn-outline btn-sm btn-edit-prod" data-id="${p.id}" style="color:var(--color-primary);border-color:var(--color-primary);font-weight:700;margin-right:6px;padding:4px 10px;cursor:pointer">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-outline btn-sm btn-del-prod" data-id="${p.id}" style="color:#c0392b;border-color:#e8b4b4;font-weight:700;padding:4px 10px;cursor:pointer">
                      Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      tabContent.querySelectorAll('.stock-input').forEach(inp => {
        inp.onchange = async () => {
          const id = inp.dataset.id;
          await api.updateProduct(id, { stock: parseInt(inp.value, 10) });
          store.toast('Stock updated!');
        };
      });

      tabContent.querySelectorAll('.btn-edit-prod').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          const prod = allProducts.find(p => String(p.id) === String(id));
          if (prod) {
            editingProduct = { ...prod };
            uploadedImageDataUrl = prod.image || null;
            activeTab = 'add';
            renderView();
            window.scrollTo({ top: 120, behavior: 'smooth' });
            store.toast(`Loaded "${prod.name}" (#${prod.id}) into editor ✏️`);
          } else {
            store.toast('Product not found.');
          }
        };
      });

      tabContent.querySelectorAll('.btn-del-prod').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          if (confirm(`Delete product #${id}?`)) {
            await api.deleteProduct(id);
            store.toast('Product deleted.');
            renderAdminPanel(container);
          }
        };
      });
    } else if (activeTab === 'add') {
      const catList = [
        'Kurti, Saree & Lehenga',
        'Women Western',
        'Lingerie',
        'Men',
        'Kids & Toys',
        'Home & Kitchen',
        'Beauty & Health',
        'Jewellery & Accessories',
        'Bags & Footwear',
        'Electronics'
      ];

      tabContent.innerHTML = `
        <div class="checkout-box" style="max-width:760px">
          <div class="flex justify-between items-center" style="margin-bottom:12px;border-bottom:1px solid #f0f0f4;padding-bottom:12px">
            <div>
              <h3 style="font-size:22px;font-weight:900;color:var(--color-primary-dark)">
                ${isEdit ? `✏️ Update Product (#${editingProduct.id})` : '+ Create New Product'}
              </h3>
              <p style="color:var(--color-text-muted);font-size:13px;margin:3px 0 0">
                ${isEdit ? `Editing details for <b>${esc(editingProduct.name)}</b>. Take a screenshot &amp; paste with Ctrl+V, or edit the fields below.` : 'Add a new item to your store catalog with images and stock details.'}
              </p>
            </div>
            ${isEdit ? `
              <div class="flex gap-2 items-center">
                <span style="font-size:12px;font-weight:700;color:var(--color-primary);background:var(--color-primary-light);padding:5px 12px;border-radius:99px;border:1px solid rgba(159,32,137,0.2)">
                  ✏️ Edit Mode
                </span>
                <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-edit-top" style="font-size:12px">
                  Cancel Edit
                </button>
              </div>
            ` : ''}
          </div>

          <form id="form-product-editor">
            <!-- Image Drag and Drop & Direct Screenshot Zone -->
            <label class="form-label" style="display:flex;justify-content:space-between;align-items:center">
              <span>Product Image (Drag &amp; Drop, File Upload, or Direct Screenshot Paste)</span>
              <span style="font-size:11px;font-weight:700;color:var(--color-primary)">📸 Win+Shift+S / Ctrl+V Supported</span>
            </label>

            <div class="drop-zone" id="product-drop-zone" tabindex="0" title="Click to browse, or paste image with Ctrl+V">
              <input type="file" id="product-image-file-input" accept="image/*" style="display:none">
              <div class="drop-zone-icon">📸</div>
              <div class="drop-zone-text">
                Drag &amp; drop product image here, <span style="color:var(--color-primary);text-decoration:underline">browse files</span>, or <b>paste screenshot (Ctrl+V)</b>
              </div>
              <div class="drop-zone-hint" style="margin-bottom:10px">
                Supports PNG, JPG, JPEG, WEBP, SVG &bull; Take a screenshot and press <b>Ctrl + V</b> anywhere
              </div>
              <div class="flex justify-center gap-2" style="margin-top:6px">
                <button type="button" class="btn btn-sm btn-primary" id="btn-paste-clipboard" style="font-size:12px;padding:6px 14px">
                  📋 Paste Screenshot (Ctrl+V)
                </button>
                <button type="button" class="btn btn-sm btn-outline" id="btn-browse-trigger" style="font-size:12px;padding:6px 14px">
                  📁 Browse Files
                </button>
              </div>
            </div>

            <!-- Image Preview Box -->
            <div id="image-preview-container" class="image-preview-box" style="${uploadedImageDataUrl ? 'display:flex' : 'display:none'}">
              <img id="image-preview-img" class="image-preview-thumb" src="${uploadedImageDataUrl || ''}" alt="Product Image Preview">
              <div style="flex:1">
                <div id="image-status-badge" style="font-size:13px;font-weight:800;color:var(--color-primary);margin-bottom:2px">
                  ${isEdit ? '📷 Current Product Photo' : '✅ Product Photo Selected'}
                </div>
                <div style="font-size:12px;color:var(--color-text-muted)" id="image-file-info">
                  ${isEdit ? 'Photo loaded. Press Ctrl+V anytime to paste a new screenshot to replace.' : 'Ready to save with product'}
                </div>
              </div>
              <div class="flex gap-2">
                <button type="button" id="btn-paste-replace" class="btn btn-outline btn-sm" style="font-size:11px" title="Paste new screenshot">
                  📋 Paste New Screenshot
                </button>
                <button type="button" id="btn-remove-image" class="btn btn-outline btn-sm" style="color:#c0392b;border-color:#c0392b;font-size:11px">
                  Remove
                </button>
              </div>
            </div>

            <!-- Optional Image URL -->
            <div style="margin-bottom:14px">
              <label class="form-label" style="font-size:11px;margin-top:2px">Or Paste Image URL (Optional)</label>
              <input class="form-input" id="product-image-url-input" placeholder="https://example.com/image.jpg" value="${isEdit && editingProduct.image && !editingProduct.image.startsWith('data:') && !editingProduct.image.startsWith('assets/placeholders/') ? esc(editingProduct.image) : ''}">
            </div>

            <div class="flex gap-4">
              <div style="flex:1">
                <label class="form-label">Product Name *</label>
                <input class="form-input" name="name" required placeholder="e.g. Designer Embroidered Silk Saree" value="${isEdit ? esc(editingProduct.name) : ''}">
              </div>
              <div style="flex:1">
                <label class="form-label">Brand *</label>
                <input class="form-input" name="brand" required placeholder="e.g. Libas" value="${isEdit ? esc(editingProduct.brand) : ''}">
              </div>
            </div>

            <div class="flex gap-4">
              <div style="flex:1">
                <label class="form-label">Category *</label>
                <select class="form-select" name="category" required>
                  ${catList.map(c => `
                    <option value="${c}" ${isEdit && editingProduct.category === c ? 'selected' : ''}>${c}</option>
                  `).join('')}
                </select>
              </div>
              <div style="flex:1">
                <label class="form-label">Subcategory</label>
                <input class="form-input" name="subcategory" placeholder="e.g. Sarees" value="${isEdit ? esc(editingProduct.subcategory || '') : ''}">
              </div>
            </div>

            <div class="flex gap-4">
              <div style="flex:1">
                <label class="form-label">Selling Price (₹) *</label>
                <input class="form-input" name="price" type="number" required min="1" placeholder="299" value="${isEdit ? editingProduct.price : ''}">
              </div>
              <div style="flex:1">
                <label class="form-label">MRP (₹) *</label>
                <input class="form-input" name="mrp" type="number" required min="1" placeholder="899" value="${isEdit ? editingProduct.mrp : ''}">
              </div>
              <div style="flex:1">
                <label class="form-label">Initial Stock *</label>
                <input class="form-input" name="stock" type="number" required min="1" value="${isEdit ? (editingProduct.stock ?? 50) : 50}">
              </div>
            </div>

            <label class="form-label">Description</label>
            <textarea class="form-textarea" name="description" rows="3" placeholder="Product specifications, fabric, features...">${isEdit ? esc(editingProduct.description || '') : ''}</textarea>

            <div class="flex gap-3 items-center" style="margin-top:24px">
              <button class="btn btn-primary" style="padding:12px 28px;font-size:15px;font-weight:800">
                ${isEdit ? `💾 Update Product (#${editingProduct.id})` : '➕ Save Product'}
              </button>
              ${isEdit ? `
                <button type="button" class="btn btn-outline" id="btn-cancel-edit" style="padding:12px 20px">
                  Cancel Edit
                </button>
              ` : ''}
            </div>
          </form>
        </div>
      `;

      // Handle Drag and Drop, Direct Screenshot Paste, & File Upload
      const dropZone = document.getElementById('product-drop-zone');
      const fileInput = document.getElementById('product-image-file-input');
      const previewContainer = document.getElementById('image-preview-container');
      const previewImg = document.getElementById('image-preview-img');
      const statusBadge = document.getElementById('image-status-badge');
      const fileInfo = document.getElementById('image-file-info');
      const removeBtn = document.getElementById('btn-remove-image');
      const urlInput = document.getElementById('product-image-url-input');
      const browseTrigger = document.getElementById('btn-browse-trigger');
      const pasteBtn = document.getElementById('btn-paste-clipboard');
      const pasteReplaceBtn = document.getElementById('btn-paste-replace');

      function handleImageBlob(fileOrBlob, label = 'New Image Selected') {
        if (!fileOrBlob || !fileOrBlob.type.startsWith('image/')) {
          store.toast('Please provide a valid image (PNG, JPG, WEBP, etc.)');
          return;
        }
        if (fileOrBlob.size > 8 * 1024 * 1024) {
          store.toast('Image size should be under 8MB');
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          uploadedImageDataUrl = ev.target.result;
          previewImg.src = uploadedImageDataUrl;
          previewContainer.style.display = 'flex';
          statusBadge.textContent = '📸 ' + label;
          const sizeKb = Math.round(fileOrBlob.size / 1024);
          fileInfo.textContent = `${fileOrBlob.name || 'Screenshot Image'} (${sizeKb > 0 ? sizeKb + ' KB' : 'clipboard data'}) - Ready to ${isEdit ? 'update' : 'save'}!`;
          store.toast(isEdit ? 'Screenshot updated! Click "Update Product" to save. 📸' : 'Screenshot image captured & ready! 📸');
        };
        reader.readAsDataURL(fileOrBlob);
      }

      // Clipboard Paste Event Handler (Ctrl+V)
      const pasteListener = (e) => {
        if (activeTab !== 'add') return;
        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData || !clipboardData.items) return;

        for (let i = 0; i < clipboardData.items.length; i++) {
          const item = clipboardData.items[i];
          if (item.type.indexOf('image') !== -1) {
            const blob = item.getAsFile();
            if (blob) {
              e.preventDefault();
              handleImageBlob(blob, 'Screenshot Pasted from Clipboard');
              return;
            }
          }
        }
      };

      activePasteListener = pasteListener;
      window.addEventListener('paste', activePasteListener);

      // Dedicated Paste from Clipboard button
      async function triggerClipboardRead() {
        if (navigator.clipboard && navigator.clipboard.read) {
          try {
            const items = await navigator.clipboard.read();
            for (const item of items) {
              const imgType = item.types.find(t => t.startsWith('image/'));
              if (imgType) {
                const blob = await item.getType(imgType);
                handleImageBlob(blob, 'Screenshot Pasted from Clipboard');
                return;
              }
            }
            store.toast('No screenshot found in clipboard. Take a screenshot (Win+Shift+S) first!');
          } catch (err) {
            store.toast('Clipboard permission blocked. Press Ctrl+V to paste screenshot directly!');
          }
        } else {
          store.toast('Press Ctrl+V on your keyboard to paste your screenshot directly!');
        }
      }

      if (pasteBtn) pasteBtn.onclick = (e) => { e.stopPropagation(); triggerClipboardRead(); };
      if (pasteReplaceBtn) pasteReplaceBtn.onclick = (e) => { e.stopPropagation(); triggerClipboardRead(); };

      if (browseTrigger) {
        browseTrigger.onclick = (e) => {
          e.stopPropagation();
          fileInput.click();
        };
      }

      dropZone.onclick = () => fileInput.click();
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          handleImageBlob(e.target.files[0], 'Uploaded Image File');
        }
      };

      dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      };

      dropZone.ondragleave = () => {
        dropZone.classList.remove('dragover');
      };

      dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleImageBlob(e.dataTransfer.files[0], 'Dropped Image File');
        }
      };

      urlInput.oninput = () => {
        const url = urlInput.value.trim();
        if (url) {
          uploadedImageDataUrl = url;
          previewImg.src = url;
          previewContainer.style.display = 'flex';
          statusBadge.textContent = '🌐 Custom URL Image';
          fileInfo.textContent = url;
        }
      };

      removeBtn.onclick = () => {
        uploadedImageDataUrl = null;
        previewContainer.style.display = 'none';
        previewImg.src = '';
        fileInput.value = '';
        urlInput.value = '';
        store.toast('Image removed');
      };

      const cancelHandlers = [document.getElementById('btn-cancel-edit'), document.getElementById('btn-cancel-edit-top')];
      cancelHandlers.forEach(btn => {
        if (btn) {
          btn.onclick = () => {
            if (activePasteListener) {
              window.removeEventListener('paste', activePasteListener);
              activePasteListener = null;
            }
            editingProduct = null;
            uploadedImageDataUrl = null;
            activeTab = 'products';
            renderView();
          };
        }
      });

      // Form Submission (Add or Update)
      document.getElementById('form-product-editor').onsubmit = async (e) => {
        e.preventDefault();
        const f = new FormData(e.target);

        if (isEdit) {
          const updates = {
            name: f.get('name').trim(),
            brand: f.get('brand').trim(),
            category: f.get('category').trim(),
            subcategory: (f.get('subcategory') || 'General').trim(),
            price: parseInt(f.get('price'), 10),
            mrp: parseInt(f.get('mrp'), 10),
            stock: parseInt(f.get('stock'), 10),
            description: (f.get('description') || '').trim()
          };

          if (uploadedImageDataUrl) {
            updates.image = uploadedImageDataUrl;
            updates.images = [uploadedImageDataUrl];
          }

          await api.updateProduct(editingProduct.id, updates);
          store.toast(`Product #${editingProduct.id} "${updates.name}" updated successfully! 🎉`);
          if (activePasteListener) {
            window.removeEventListener('paste', activePasteListener);
            activePasteListener = null;
          }
          editingProduct = null;
          uploadedImageDataUrl = null;
          activeTab = 'products';
          renderAdminPanel(container);
        } else {
          const newP = {
            name: f.get('name').trim(),
            brand: f.get('brand').trim(),
            category: f.get('category').trim(),
            subcategory: (f.get('subcategory') || 'General').trim(),
            price: parseInt(f.get('price'), 10),
            mrp: parseInt(f.get('mrp'), 10),
            stock: parseInt(f.get('stock'), 10),
            description: (f.get('description') || '').trim(),
            mall: true
          };

          if (uploadedImageDataUrl) {
            newP.image = uploadedImageDataUrl;
            newP.images = [uploadedImageDataUrl];
          }

          await api.addProduct(newP);
          store.toast('New product added successfully! 🎉');
          if (activePasteListener) {
            window.removeEventListener('paste', activePasteListener);
            activePasteListener = null;
          }
          uploadedImageDataUrl = null;
          activeTab = 'products';
          renderAdminPanel(container);
        }
      };
    } else if (activeTab === 'import') {
      tabContent.innerHTML = `
        <div class="checkout-box" style="max-width:720px">
          <h3>Excel &amp; CSV Bulk Operations</h3>
          <p style="color:var(--color-text-muted);font-size:13px;margin:6px 0 16px">
            Easily import multiple products via SheetJS. Expected columns: <b>name, brand, category, subcategory, price, mrp, stock, description</b>.
          </p>

          <div style="padding:20px;border:2px dashed var(--color-card-border);border-radius:8px;text-align:center;background:#fafafa">
            <input type="file" id="bulk-excel-input" accept=".xlsx,.xls,.csv" style="display:none">
            <button class="btn btn-primary" onclick="document.getElementById('bulk-excel-input').click()">
              📁 Select Excel / CSV File
            </button>
            <div id="file-name-display" style="font-size:12px;margin-top:8px;color:var(--color-text-muted)">No file selected</div>
          </div>

          <div class="flex gap-3" style="margin-top:16px">
            <button class="btn btn-outline" id="btn-run-import">🚀 Start Bulk Import</button>
            <button class="btn btn-outline" id="btn-dl-template">📥 Download Excel Template</button>
            <button class="btn btn-outline" id="btn-export-prods">📤 Export All Products (.xlsx)</button>
            <button class="btn btn-outline" id="btn-export-orders">📤 Export Orders (.xlsx)</button>
          </div>

          <pre id="import-report-box" style="margin-top:16px;background:#f5f5f7;padding:12px;border-radius:6px;font-size:12px;display:none;white-space:pre-wrap"></pre>
        </div>
      `;

      const fileInp = document.getElementById('bulk-excel-input');
      const fileDisplay = document.getElementById('file-name-display');
      let selectedFile = null;

      fileInp.onchange = (e) => {
        selectedFile = e.target.files[0];
        if (selectedFile) {
          fileDisplay.textContent = `Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;
        }
      };

      document.getElementById('btn-run-import').onclick = () => {
        if (!selectedFile) {
          store.toast('Please choose an Excel or CSV file first.');
          return;
        }
        if (typeof XLSX === 'undefined') {
          store.toast('SheetJS library is still loading, please wait.');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const data = new Uint8Array(ev.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            const validRows = [];
            const errors = [];

            rows.forEach((r, idx) => {
              const clean = {};
              Object.keys(r).forEach(k => clean[k.trim().toLowerCase()] = r[k]);

              if (!clean.name || !clean.category || !clean.price) {
                errors.push(`Row ${idx + 2}: Missing required fields (name, category, price)`);
              } else {
                validRows.push({
                  name: String(clean.name).trim(),
                  brand: String(clean.brand || 'Eagle Shopping World Brand').trim(),
                  category: String(clean.category).trim(),
                  subcategory: String(clean.subcategory || 'General').trim(),
                  price: parseFloat(clean.price) || 199,
                  mrp: parseFloat(clean.mrp) || parseFloat(clean.price) * 1.5,
                  stock: parseInt(clean.stock, 10) || 50,
                  description: clean.description || ''
                });
              }
            });

            const res = await api.bulkImport(validRows);
            const rep = document.getElementById('import-report-box');
            rep.style.display = 'block';
            rep.textContent = `Import Complete!\nAdded: ${res.added}\nUpdated: ${res.updated}\nSkipped: ${errors.length}\n${errors.join('\n')}`;
            store.toast(`Bulk Import: ${res.added} added, ${res.updated} updated`);
          } catch (err) {
            alert('Error parsing file: ' + err.message);
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      };

      document.getElementById('btn-dl-template').onclick = () => {
        if (typeof XLSX === 'undefined') return store.toast('SheetJS not ready');
        const sample = [
          { name: "Sample Cotton Kurti", brand: "Libas", category: "Kurti, Saree & Lehenga", subcategory: "Kurtis & Suits", price: 299, mrp: 799, stock: 50, description: "Soft daily comfort kurti" },
          { name: "Sample TWS Earbuds", brand: "boAt", category: "Electronics", subcategory: "Audio & Sound", price: 499, mrp: 1499, stock: 30, description: "Wireless earbuds with deep bass" }
        ];
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(sample);
        XLSX.utils.book_append_sheet(wb, ws, "Products_Template");
        XLSX.writeFile(wb, "Eagle_Shopping_World_Product_Import_Template.xlsx");
      };

      document.getElementById('btn-export-prods').onclick = () => {
        if (typeof XLSX === 'undefined') return store.toast('SheetJS not ready');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(allProducts);
        XLSX.utils.book_append_sheet(wb, ws, "Products");
        XLSX.writeFile(wb, "Eagle_Shopping_World_Products_Catalog.xlsx");
      };

      document.getElementById('btn-export-orders').onclick = () => {
        if (typeof XLSX === 'undefined') return store.toast('SheetJS not ready');
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(allOrders);
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, "Eagle_Shopping_World_Orders.xlsx");
      };
    } else if (activeTab === 'orders') {
      tabContent.innerHTML = `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${!allOrders.length ? `<tr><td colspan="7" style="text-align:center;padding:24px">No orders placed yet.</td></tr>` : allOrders.map(o => `
                <tr>
                  <td><b>${o.id}</b></td>
                  <td>${o.customerName || 'Customer'}<br><small style="color:var(--color-text-muted)">${o.phone || ''}</small></td>
                  <td>${(o.items || []).map(i => `${i.product?.name || 'Item'} × ${i.qty}`).join(', ')}</td>
                  <td><b>₹${o.total}</b></td>
                  <td>${o.paymentMethod || 'COD'}</td>
                  <td>${new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select class="status-select" data-id="${o.id}" style="border:1px solid #d4d5d9;border-radius:4px;padding:4px 8px;font-weight:700">
                      ${['Placed', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(st => `
                        <option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>
                      `).join('')}
                    </select>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;

      tabContent.querySelectorAll('.status-select').forEach(sel => {
        sel.onchange = async () => {
          const id = sel.dataset.id;
          await api.updateOrderStatus(id, sel.value);
          store.toast('Order status updated!');
        };
      });
    }

    // Tab buttons
    container.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.onclick = () => {
        const nextTab = btn.dataset.tab;
        if (nextTab === 'add') {
          editingProduct = null;
          uploadedImageDataUrl = null;
          activeTab = 'add';
        } else if (nextTab === 'edit') {
          activeTab = 'add';
        } else {
          activeTab = nextTab;
        }
        renderView();
      };
    });

    document.getElementById('btn-admin-logout').onclick = async () => {
      if (activePasteListener) {
        window.removeEventListener('paste', activePasteListener);
        activePasteListener = null;
      }
      await api.logout();
      store.state.user = null;
      store.toast('Logged out');
      renderAdminPanel(container);
    };
  }

  renderView();
}
