# EvlveX store policies (India)

The five policy texts the store needs. **Shopify stores policies in Admin, not in the theme.** Paste each file into its field and the theme does the rest: the footer lists the policies (`show_policy` in `sections/footer-group.json`), checkout links to them, and they are published at `evlvex.in/policies/...`, styled by `assets/evlvex-luxury.css`.

| File | Shopify Admin → Settings → Policies | Live URL |
|---|---|---|
| `refund-policy.html` | Return and refund policy | `/policies/refund-policy` |
| `shipping-policy.html` | Shipping policy | `/policies/shipping-policy` |
| `privacy-policy.html` | Privacy policy | `/policies/privacy-policy` |
| `terms-of-service.html` | Terms of service | `/policies/terms-of-service` |
| `contact-information.html` | Contact information | `/policies/contact-information` |

## How to paste
1. Open a policy field in Admin and click the **`<>` (Show HTML)** button in the editor toolbar.
2. Paste the file's whole contents and save.
3. Replace every `[FILL IN: …]` placeholder (they are bold so they stand out), then save again.

For "Return and refund policy", Shopify may first ask for return rules (return window, condition, fees). Set them to: **7 days**, **free returns**, and **refund to original payment method**, so they match the text.

## Placeholders to fill in
| Placeholder | Where |
|---|---|
| `[FILL IN: legal entity name]` | all five |
| `[FILL IN: type of entity, …]` | terms |
| `[FILL IN: registered address]` | privacy, terms, contact information |
| `[FILL IN: GSTIN]` | terms, contact information |
| `[FILL IN: phone]` | privacy, terms, contact information |
| `[FILL IN: Grievance Officer name]` | privacy, terms, contact information |
| `[FILL IN: city]` (court jurisdiction) | terms |

Check with: `grep -rn "FILL IN" docs/policies` (only this README should match once you've copied the filled-in text into Admin).

## What the policies commit to
These texts must match what the site says (`templates/product.json` "Shipping & returns" tab, `templates/cart.json` promise, `sections/header-group.json` announcement). If one changes, change the others too.
- **Returns and exchanges:** 7 days from delivery, unworn, with the box, certificate tag and workshop card. Free pickup.
- **Refunds:** to the original payment method, 5–7 working days after inspection.
- **Defective, damaged or wrong pairs:** report within 48 hours with photos; replaced or refunded in full.
- **Cancellation:** free until dispatch.
- **Shipping:** free across India, **prepaid only (no COD)**, dispatch in 1–2 working days, delivery in 3–7 working days.
- **Certificate privacy:** the owner name is public on the certificate page and can be changed or removed on request.
- **Grievance Officer:** acknowledges complaints within 48 hours and resolves them within one month (Consumer Protection (E-Commerce) Rules, 2020).

## Legal basis
- Consumer Protection Act, 2019
- Consumer Protection (E-Commerce) Rules, 2020: seller details, grievance officer, returns and refunds for defective goods
- Information Technology Act, 2000
- Digital Personal Data Protection Act, 2023
- GST: tax invoice, prices inclusive of tax (MRP)

These are good-faith templates, not legal advice. Have a lawyer or CA review them before launch, especially once the business details are filled in.

## Also set in Admin
- **Settings → Store details:** store contact email `support@evlvex.in`, plus the legal business name and address.
- **Settings → Notifications:** sender email `support@evlvex.in`.
- **Settings → Payments:** make sure Cash on Delivery (manual payment method) is **off**.
