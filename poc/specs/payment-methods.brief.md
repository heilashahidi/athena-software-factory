# Brief — Payment Methods management (Payments squad)

Add a "Payment Methods" management page to the merchant dashboard. Merchants can add,
edit, delete, and set a default payment method. Each method has a type (credit card,
ACH, wire), a label, and credentials stored via our Vault integration. List view with
sorting and filtering, detail/edit form. Audit log every change. Gate behind
`payment_methods:manage`.

```json
{
  "product": "payments-dashboard",
  "pattern": "crud_ui",
  "entity": "PaymentMethod",
  "fields": [
    {"name": "type", "kind": "enum", "values": ["credit_card", "ach", "wire"]},
    {"name": "label", "kind": "string"},
    {"name": "is_default", "kind": "boolean"},
    {"name": "vault_ref", "kind": "string", "sensitive": true}
  ],
  "permissions": "payment_methods:manage",
  "audit": true,
  "integrations": ["vault"],
  "ui": {"list": true, "detail": true, "form": true}
}
```
