export function buildGreiasPostmanCollection(baseUrl = "http://localhost:3000") {
  const makeUrl = (rawPath: string) => {
    const cleanPath = rawPath.replace(/^\//, "").split("?")[0];
    return {
      raw: `${baseUrl}/${cleanPath}`,
      host: [baseUrl],
      path: cleanPath.split("/"),
    };
  };

  return {
    info: {
      name: "GREIAS Fintech QA — Local REST API",
      description:
        "Educational environment. All operations are fictional. Real REST endpoints from Gréias Fintech QA.",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    item: [
      {
        name: "Health Check",
        request: {
          method: "GET",
          url: makeUrl("/api/health"),
        },
      },
      {
        name: "Get Active Account Snapshot",
        request: {
          method: "GET",
          url: makeUrl("/api/account"),
        },
      },
      {
        name: "Open Digital Account",
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Idempotency-Key", value: "pm-open-{{$timestamp}}" },
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify(
              {
                fullName: "Helena Vance",
                email: "helena@fictional.test",
                documentId: "452.918.730-11",
                initialDepositInput: "2500.00",
                acceptedTerms: true,
              },
              null,
              2
            ),
          },
          url: makeUrl("/api/accounts"),
        },
      },
      {
        name: "Pix Transfer",
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Idempotency-Key", value: "pm-pix-{{$timestamp}}" },
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify(
              {
                keyType: "EMAIL",
                pixKey: "kinetic@sandbox.greias.test",
                recipientName: "Kinetic Sandbox Merchant",
                amountInput: "150.00",
                memo: "Postman API test",
              },
              null,
              2
            ),
          },
          url: makeUrl("/api/transfers/pix"),
        },
      },
      {
        name: "Wire Transfer ($2.50 Fee)",
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Idempotency-Key", value: "pm-wire-{{$timestamp}}" },
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify(
              {
                bankCode: "260",
                branchCode: "0042",
                accountNumber: "90421-3",
                beneficiaryName: "Orchid Treasury Ltd.",
                beneficiaryDocumentId: "987.654.321-10",
                amountInput: "300.00",
                memo: "Wire Postman test",
              },
              null,
              2
            ),
          },
          url: makeUrl("/api/transfers/wire"),
        },
      },
      {
        name: "Reveal Card Credentials",
        request: {
          method: "POST",
          url: makeUrl("/api/card/credentials"),
        },
      },
      {
        name: "Freeze / Unfreeze Card",
        request: {
          method: "PATCH",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({ status: "FROZEN" }, null, 2),
          },
          url: makeUrl("/api/card/status"),
        },
      },
      {
        name: "Update Card Invoice Limit",
        request: {
          method: "PATCH",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({ invoiceLimitInput: "5000.00" }, null, 2),
          },
          url: makeUrl("/api/card/limit"),
        },
      },
      {
        name: "Simulate Card Purchase",
        request: {
          method: "POST",
          header: [
            { key: "Content-Type", value: "application/json" },
            { key: "Idempotency-Key", value: "pm-card-{{$timestamp}}" },
          ],
          body: {
            mode: "raw",
            raw: JSON.stringify(
              {
                merchantName: "Obsidian Coffee Lab",
                amountInput: "18.50",
              },
              null,
              2
            ),
          },
          url: makeUrl("/api/card/purchase"),
        },
      },
      {
        name: "Pay Current Card Invoice",
        request: {
          method: "POST",
          header: [{ key: "Idempotency-Key", value: "pm-pay-{{$timestamp}}" }],
          url: makeUrl("/api/card/pay-invoice"),
        },
      },
      {
        name: "Get Live Statement",
        request: {
          method: "GET",
          url: {
            raw: `${baseUrl}/api/statement?type=ALL&status=ALL`,
            host: [baseUrl],
            path: ["api", "statement"],
            query: [
              { key: "type", value: "ALL" },
              { key: "status", value: "ALL" },
            ],
          },
        },
      },
      {
        name: "Configure Chaos Monkey",
        request: {
          method: "PUT",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify(
              {
                enabled: false,
                latencyMs: 0,
                forceServerError: false,
                forceGatewayTimeout: false,
                forceRateLimit: false,
                bypassClientValidation: false,
                staleBalanceDesync: false,
                disableIdempotency: false,
              },
              null,
              2
            ),
          },
          url: makeUrl("/api/chaos"),
        },
      },
      {
        name: "Deterministic QA Reset",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          body: {
            mode: "raw",
            raw: JSON.stringify({ resetChaos: false }, null, 2),
          },
          url: makeUrl("/api/reset"),
        },
      },
    ],
  };
}