-- CANONICAL EXEMPLAR — migration shape for payments-dashboard.
-- migrate:up
CREATE TABLE invoices (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES merchants(id),
  label       text NOT NULL,
  amount_cents integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- migrate:down
DROP TABLE IF EXISTS invoices;
