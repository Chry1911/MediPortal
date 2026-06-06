# 🏥 MediPortal — Portale Sanitario Digitale

> Progetto universitario — CdS Informatica per le Aziende Digitali (L-31)  
> Traccia PW 16: Sviluppo di un'applicazione full-stack API-based per un'organizzazione del settore sanitario

---

## 📋 Indice

- [Descrizione del Progetto](#-descrizione-del-progetto)
- [Funzionalità](#-funzionalità)
- [Architettura](#-architettura)
- [Stack Tecnologico](#-stack-tecnologico)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Schema del Database (ER)](#-schema-del-database-er)
- [API RESTful](#-api-restful)
- [Ruoli e Permessi](#-ruoli-e-permessi)
- [Installazione e Avvio](#-installazione-e-avvio)
- [Documentazione API (Swagger)](#-documentazione-api-swagger)
- [Screenshot](#-screenshot)
- [Autore](#-autore)

---

## 📌 Descrizione del Progetto

**MediPortal** è un portale sanitario digitale che simula il fascicolo sanitario elettronico di un ospedale.  
Permette a pazienti, medici e amministratori di gestire l'intero ciclo di una prestazione ospedaliera:
dalla prenotazione, al pagamento del ticket, fino alla consegna del referto digitale.

Il progetto è sviluppato come applicazione **full-stack con architettura API-based**, utilizzando **Next.js 16** sia per il frontend che per il backend (tramite API Routes), con **Prisma ORM** come layer di accesso al database **MySQL**.

---

## ✨ Funzionalità

### 👤 Paziente
| Funzionalità | Descrizione |
|---|---|
| 🗓️ Prenotazione prestazioni | Scegli prestazione, medico e data/ora disponibile |
| ✏️ Gestione prenotazioni | Visualizza, modifica o annulla appuntamenti |
| 💳 Pagamento ticket | Paga il ticket online, scarica la ricevuta PDF |
| 📄 Referti | Visualizza e scarica i tuoi referti medici |

### 🩺 Medico
| Funzionalità | Descrizione |
|---|---|
| 📅 Agenda appuntamenti | Visualizza le prenotazioni del giorno/settimana |
| 📤 Caricamento referti | Carica referti PDF associati alle prenotazioni completate |

### 🛠️ Amministratore
| Funzionalità | Descrizione |
|---|---|
| 📊 Dashboard finanziaria | Incassi, tasso di riscossione, prestazioni più richieste |
| 📈 Grafici per reparto | Analisi delle prestazioni per reparto ospedaliero |
| 👥 Gestione utenti | Visualizza e gestisce tutti gli utenti del sistema |

---

## 🏗️ Architettura

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│              Next.js App Router — React 19                  │
│         Tailwind CSS + Recharts + Lucide Icons             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / fetch
┌────────────────────────▼────────────────────────────────────┐
│               Next.js API Routes (/app/api/*)               │
│          RESTful endpoints — autenticazione JWT             │
│                    NextAuth v5 (Auth.js)                    │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma Client
┌────────────────────────▼────────────────────────────────────┐
│                    Prisma ORM v6                             │
│              Schema type-safe + Migrations                   │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL
┌────────────────────────▼────────────────────────────────────┐
│                      MySQL 8.x                              │
│    Database: mediaportal — 5 tabelle principali             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnologico

| Layer | Tecnologia | Versione | Motivo della scelta |
|---|---|---|---|
| **Framework** | Next.js | 16.2.7 | Full-stack React, API Routes, App Router |
| **Linguaggio** | TypeScript | 5.x | Type safety end-to-end |
| **ORM** | Prisma | 6.x | Schema dichiarativo, genera ERD, migrazioni |
| **Database** | MySQL | 8.x | RDBMS relazionale, ottimo per dati sanitari |
| **Autenticazione** | NextAuth v5 | 5.x | JWT, gestione ruoli, sessioni sicure |
| **Stile** | Tailwind CSS | 3.x | Utility-first, rapido, responsivo |
| **Grafici** | Recharts | 2.x | Libreria React per dashboard |
| **Icone** | Lucide React | latest | Icone SVG consistenti |
| **Validazione** | Zod | 3.x | Schema validation type-safe |
| **Swagger** | swagger-ui-react + next-swagger-doc | latest | Documentazione API interattiva |

---

## 📁 Struttura del Progetto

```
mediaportal/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout root con metadata
│   ├── page.tsx                  # Homepage — redirect login/dashboard
│   ├── globals.css               # Stili globali Tailwind
│   │
│   ├── auth/                     # Pagine autenticazione (pubbliche)
│   │   ├── login/page.tsx        # Form di login
│   │   └── register/page.tsx     # Form di registrazione paziente
│   │
│   ├── prenotazioni/             # 🗓️ Modulo prenotazioni
│   │   └── page.tsx
│   │
│   ├── pagamenti/                # 💳 Modulo pagamenti
│   │   └── page.tsx
│   │
│   ├── referti/                  # 📄 Modulo referti
│   │   └── page.tsx
│   │
│   ├── dashboard/                # 📊 Dashboard finanziaria (solo ADMIN)
│   │   └── page.tsx
│   │
│   ├── api-docs/                 # Swagger UI — /api-docs
│   │   └── page.tsx
│   │
│   └── api/                      # 🔌 API RESTful (Next.js Route Handlers)
│       ├── auth/route.ts         # POST /api/auth/login
│       ├── prestazioni/route.ts  # GET  /api/prestazioni
│       ├── prenotazioni/         # GET, POST /api/prenotazioni
│       │   └── [id]/             # GET, PUT  /api/prenotazioni/:id
│       ├── pagamenti/            # GET /api/pagamenti
│       │   └── [id]/paga/        # POST /api/pagamenti/:id/paga
│       ├── referti/              # GET, POST /api/referti
│       │   └── [id]/download/    # GET /api/referti/:id/download
│       └── dashboard/route.ts    # GET /api/dashboard/stats
│
├── components/                   # Componenti React riutilizzabili
│   ├── ui/                       # Componenti base (Button, Input, Card, Badge)
│   ├── layout/                   # Navbar, Sidebar, Footer
│   ├── forms/                    # Form prenotazione, pagamento, upload referto
│   └── charts/                   # Grafici dashboard (Recharts)
│
├── lib/                          # Utility e configurazioni
│   ├── prisma.ts                 # Singleton Prisma Client
│   ├── auth.ts                   # Configurazione NextAuth v5
│   └── swagger.ts                # Specifica OpenAPI 3.0
│
├── prisma/
│   ├── schema.prisma             # Schema del database (fonte di verità)
│   └── seed.ts                   # Dati di esempio per sviluppo
│
├── types/
│   └── index.ts                  # Tipi TypeScript condivisi (DTO)
│
├── hooks/                        # Custom React hooks
│
├── docs/
│   └── ERD.svg                   # Diagramma ER generato da Prisma
│
├── public/
│   └── uploads/referti/          # PDF referti (solo sviluppo locale)
│
├── .env.example                  # Template variabili d'ambiente
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ Schema del Database (ER)

Il diagramma ER completo si trova in [`docs/ERD.svg`](./docs/ERD.svg) (generato automaticamente da Prisma).

### Entità principali

```
UTENTE
  id, nome, cognome, email, passwordHash, codiceFiscale
  dataNascita, telefono, ruolo (PAZIENTE|MEDICO|ADMIN)
     │
     │ 1:N (come paziente)
     ▼
PRENOTAZIONE
  id, codice (univoco), dataOra, stato, note
  pazienteId → UTENTE
  medicoId   → UTENTE
  prestazioneId → PRESTAZIONE
     │              │
     │ 1:1          │ N:1
     ▼              ▼
PAGAMENTO       PRESTAZIONE
  importo         codice, nome, reparto
  stato           durata, costo, attiva
  dataScadenza
  dataPagamento

     │ 1:1 (PRENOTAZIONE → REFERTO)
     ▼
REFERTO
  titolo, descrizione, fileUrl
  stato, dataUpload
  medicoId → UTENTE
```

### Relazioni
| Da | A | Cardinalità |
|---|---|---|
| Utente (paziente) | Prenotazione | 1:N |
| Utente (medico) | Prenotazione | 1:N |
| Utente (medico) | Referto | 1:N |
| Prestazione | Prenotazione | 1:N |
| Prenotazione | Pagamento | 1:1 |
| Prenotazione | Referto | 1:1 |

---

## 🔌 API RESTful

La documentazione interattiva completa è disponibile su **`/api-docs`** (Swagger UI).

### Panoramica endpoint

| Metodo | Endpoint | Ruolo | Descrizione |
|---|---|---|---|
| `POST` | `/api/auth/login` | Pubblico | Login utente |
| `GET` | `/api/prestazioni` | Autenticato | Lista prestazioni disponibili |
| `GET` | `/api/prenotazioni` | Paziente | Le mie prenotazioni |
| `POST` | `/api/prenotazioni` | Paziente | Nuova prenotazione |
| `GET` | `/api/prenotazioni/:id` | Paziente | Dettaglio prenotazione |
| `PUT` | `/api/prenotazioni/:id` | Paziente | Annulla prenotazione |
| `GET` | `/api/pagamenti` | Paziente | I miei pagamenti |
| `POST` | `/api/pagamenti/:id/paga` | Paziente | Paga ticket |
| `GET` | `/api/referti` | Paziente/Medico | Lista referti |
| `POST` | `/api/referti` | Medico/Admin | Carica referto PDF |
| `GET` | `/api/referti/:id/download` | Paziente | Scarica PDF referto |
| `GET` | `/api/dashboard/stats` | Admin | Statistiche finanziarie |

### Autenticazione
Tutte le route (eccetto `/api/auth/login`) richiedono autenticazione tramite **sessione NextAuth** (cookie sicuro con JWT).

---

## 👥 Ruoli e Permessi

```
PAZIENTE
  ✅ Prenota prestazioni
  ✅ Annulla prenotazioni (solo IN_ATTESA)
  ✅ Paga ticket
  ✅ Scarica referti propri

MEDICO
  ✅ Vede proprie prenotazioni
  ✅ Carica referti PDF
  ✅ Aggiorna stato prenotazione (COMPLETATA)

ADMIN
  ✅ Tutto ciò che può fare MEDICO
  ✅ Dashboard finanziaria
  ✅ Gestione utenti
  ✅ Vede tutte le prenotazioni
```

---

## 🚀 Installazione e Avvio

### Prerequisiti
- **Node.js** >= 20.x
- **MySQL** 8.x in esecuzione in locale
- **npm** o **yarn**

### 1. Clona il repository
```bash
git clone https://github.com/tuo-username/mediaportal.git
cd mediaportal
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
```bash
cp .env.example .env
# Modifica .env con le tue credenziali MySQL e il secret NextAuth
```

```env
DATABASE_URL="mysql://root:password@localhost:3306/mediaportal"
NEXTAUTH_SECRET="un-valore-segreto-lungo-e-casuale"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Crea il database e applica le migrazioni
```bash
npx prisma migrate dev --name init
```

### 5. Genera il client Prisma e il diagramma ER
```bash
npm run db:generate
```

### 6. (Opzionale) Carica i dati di esempio
```bash
npm run db:seed
```

### 7. Avvia il server di sviluppo
```bash
npm run dev
```

L'applicazione sarà disponibile su **http://localhost:3000**  
La documentazione API Swagger sarà su **http://localhost:3000/api-docs**  
Prisma Studio (GUI database) su: `npm run db:studio` → **http://localhost:5555**

---

## 📚 Documentazione API (Swagger)

Avvia l'applicazione e naviga su:

```
http://localhost:3000/api-docs
```

La specifica OpenAPI 3.0 è definita in [`lib/swagger.ts`](./lib/swagger.ts) e visualizzata tramite **Swagger UI React**.

---

## 📸 Screenshot

> _Sezione da completare con screenshot dell'applicazione funzionante_

| Schermata | Descrizione |
|---|---|
| `docs/screenshots/login.png` | Pagina di login |
| `docs/screenshots/prenotazioni.png` | Lista e nuova prenotazione |
| `docs/screenshots/pagamenti.png` | Pagamento ticket e ricevuta |
| `docs/screenshots/referti.png` | Lista e download referti |
| `docs/screenshots/dashboard.png` | Dashboard finanziaria admin |
| `docs/screenshots/swagger.png` | Swagger UI con tutti gli endpoint |

---

## 👨‍💻 Autore

**[Nome Cognome]**  
CdS Informatica per le Aziende Digitali (L-31)  
Anno Accademico 2025/2026

---

## 📄 Licenza

Progetto accademico — uso esclusivamente didattico.
