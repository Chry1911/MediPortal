// lib/swagger.ts
// Specifica OpenAPI 3.0 per MediPortal
// Visualizzabile su: http://localhost:3000/api-docs

export function getApiDocs() {
  return {
    openapi: "3.0.0",
    info: {
      title: "MediPortal API",
      version: "1.0.0",
      description:
        "API RESTful per il portale sanitario digitale MediPortal. " +
        "Gestisce prenotazioni, pagamenti, referti e dashboard finanziaria.",
      contact: { name: "MediPortal Dev Team" },
    },
    servers: [{ url: "/api", description: "Next.js API Routes" }],
    components: {
      securitySchemes: {
        BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Utente: {
          type: "object",
          properties: {
            id: { type: "string" },
            nome: { type: "string" },
            cognome: { type: "string" },
            email: { type: "string", format: "email" },
            ruolo: { type: "string", enum: ["PAZIENTE", "MEDICO", "ADMIN"] },
          },
        },
        Prestazione: {
          type: "object",
          properties: {
            id: { type: "string" },
            codice: { type: "string", example: "VIS-CARD-001" },
            nome: { type: "string", example: "Visita Cardiologica" },
            reparto: { type: "string" },
            durata: { type: "integer", description: "Durata in minuti" },
            costo: { type: "number", format: "float" },
          },
        },
        Prenotazione: {
          type: "object",
          properties: {
            id: { type: "string" },
            codice: { type: "string" },
            dataOra: { type: "string", format: "date-time" },
            stato: {
              type: "string",
              enum: ["IN_ATTESA", "CONFERMATA", "ANNULLATA", "COMPLETATA"],
            },
            prestazioneId: { type: "string" },
            pazienteId: { type: "string" },
            medicoId: { type: "string" },
          },
        },
        Pagamento: {
          type: "object",
          properties: {
            id: { type: "string" },
            importo: { type: "number" },
            stato: {
              type: "string",
              enum: ["DA_PAGARE", "PAGATO", "RIMBORSATO", "SCADUTO"],
            },
            dataScadenza: { type: "string", format: "date-time" },
            dataPagamento: { type: "string", format: "date-time", nullable: true },
          },
        },
        Referto: {
          type: "object",
          properties: {
            id: { type: "string" },
            titolo: { type: "string" },
            fileUrl: { type: "string" },
            stato: {
              type: "string",
              enum: ["IN_ELABORAZIONE", "DISPONIBILE", "ARCHIVIATO"],
            },
            dataUpload: { type: "string", format: "date-time", nullable: true },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
    paths: {
      // AUTH
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login utente",
          security: [],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 8 },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Login effettuato, token JWT restituito" },
            "401": { description: "Credenziali non valide" },
          },
        },
      },

      // PRESTAZIONI
      "/prestazioni": {
        get: {
          tags: ["Prestazioni"],
          summary: "Lista di tutte le prestazioni disponibili",
          parameters: [
            { name: "reparto", in: "query", schema: { type: "string" } },
            { name: "attiva", in: "query", schema: { type: "boolean" } },
          ],
          responses: {
            "200": {
              description: "Lista prestazioni",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Prestazione" } },
                },
              },
            },
          },
        },
      },

      // PRENOTAZIONI
      "/prenotazioni": {
        get: {
          tags: ["Prenotazioni"],
          summary: "Lista prenotazioni dell'utente autenticato",
          responses: {
            "200": {
              description: "Lista prenotazioni",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Prenotazione" } },
                },
              },
            },
          },
        },
        post: {
          tags: ["Prenotazioni"],
          summary: "Crea una nuova prenotazione",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["prestazioneId", "medicoId", "dataOra"],
                  properties: {
                    prestazioneId: { type: "string" },
                    medicoId: { type: "string" },
                    dataOra: { type: "string", format: "date-time" },
                    note: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Prenotazione creata" },
            "400": { description: "Dati non validi" },
          },
        },
      },
      "/prenotazioni/{id}": {
        get: {
          tags: ["Prenotazioni"],
          summary: "Dettaglio di una prenotazione",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Prenotazione trovata", content: { "application/json": { schema: { $ref: "#/components/schemas/Prenotazione" } } } },
            "404": { description: "Non trovata" },
          },
        },
        put: {
          tags: ["Prenotazioni"],
          summary: "Annulla una prenotazione",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "Prenotazione annullata" },
            "404": { description: "Non trovata" },
          },
        },
      },

      // PAGAMENTI
      "/pagamenti": {
        get: {
          tags: ["Pagamenti"],
          summary: "Lista pagamenti dell'utente",
          responses: {
            "200": {
              description: "Lista pagamenti",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Pagamento" } },
                },
              },
            },
          },
        },
      },
      "/pagamenti/{id}/paga": {
        post: {
          tags: ["Pagamenti"],
          summary: "Effettua il pagamento di un ticket",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["metodoPagamento"],
                  properties: {
                    metodoPagamento: { type: "string", example: "Carta di credito" },
                  },
                },
              },
            },
          },
          responses: {
            "200": { description: "Pagamento effettuato, ricevuta generata" },
            "400": { description: "Pagamento già effettuato o scaduto" },
          },
        },
      },

      // REFERTI
      "/referti": {
        get: {
          tags: ["Referti"],
          summary: "Lista referti del paziente autenticato",
          responses: {
            "200": {
              description: "Lista referti",
              content: {
                "application/json": {
                  schema: { type: "array", items: { $ref: "#/components/schemas/Referto" } },
                },
              },
            },
          },
        },
        post: {
          tags: ["Referti"],
          summary: "Carica un nuovo referto (solo MEDICO/ADMIN)",
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  required: ["prenotazioneId", "titolo", "file"],
                  properties: {
                    prenotazioneId: { type: "string" },
                    titolo: { type: "string" },
                    descrizione: { type: "string" },
                    file: { type: "string", format: "binary" },
                  },
                },
              },
            },
          },
          responses: {
            "201": { description: "Referto caricato" },
            "403": { description: "Accesso non autorizzato" },
          },
        },
      },
      "/referti/{id}/download": {
        get: {
          tags: ["Referti"],
          summary: "Download del PDF del referto",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            "200": { description: "PDF del referto", content: { "application/pdf": {} } },
            "403": { description: "Accesso non autorizzato" },
            "404": { description: "Referto non trovato" },
          },
        },
      },

      // DASHBOARD
      "/dashboard/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Statistiche finanziarie (solo ADMIN)",
          parameters: [
            { name: "da", in: "query", schema: { type: "string", format: "date" } },
            { name: "a", in: "query", schema: { type: "string", format: "date" } },
          ],
          responses: {
            "200": {
              description: "Dati per la dashboard finanziaria",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      incassiTotali: { type: "number" },
                      prenotazioniTotali: { type: "integer" },
                      tassoIncasso: { type: "number", description: "Percentuale pagamenti completati" },
                      incassiPerMese: { type: "array", items: { type: "object" } },
                      prestazioniTop: { type: "array", items: { type: "object" } },
                    },
                  },
                },
              },
            },
            "403": { description: "Solo per ADMIN" },
          },
        },
      },
    },
  };
}
