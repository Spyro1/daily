# Daily Budget Manager Architecture Diagram

```mermaid
flowchart LR
    %% Clients and external systems
    U[User]
    G[Google OAuth 2.0]

    %% Frontend app
    subgraph FE[Frontend - React + TanStack + IndexedDB]
        UI[UI Pages and Components]
        RQ[TanStack Query Cache]
        API[API Client Layer]
        IDB[(IndexedDB - Dexie Local Store)]
        OQ[(Offline Mutation Queue)]
        SYNCF[Sync Push Helper]

        UI --> RQ
        UI --> IDB
        UI --> OQ
        RQ --> API
        OQ --> API
        IDB --> SYNCF
        SYNCF --> API
    end

    %% Backend app
    subgraph BE[Backend - FastAPI]
        MW[Request Logging and Auth Middleware]

        subgraph ROUTERS[API Routers]
            AUTHR[Auth and Google OAuth Router]
            ACCR[Accounts Router]
            CATR[Categories Router]
            TRR[Transactions Router]
            DASHR[Dashboard Router]
            SYNCR[Sync Router]
            ICONR[Icons Router]
            USERR[Users Router]
        end

        subgraph SERVICES[Domain Services]
            AUTHS[Auth Service]
            ACCS[Accounts Service]
            CATS[Categories Service]
            TRS[Transactions Service]
            DASHS[Dashboard Service]
            SYNCS[Sync Service]
            USERS[Users Service]
        end

        ORM[SQLAlchemy Async Session]
    end

    PG[(PostgreSQL)]

    %% User interactions
    U --> UI

    %% OAuth and authentication
    UI -->|OIDC login| G
    G -->|callback code| AUTHR
    AUTHR --> AUTHS
    AUTHS -->|set JWT cookie| UI

    %% Frontend to backend API
    API --> MW
    MW --> AUTHR
    MW --> ACCR
    MW --> CATR
    MW --> TRR
    MW --> DASHR
    MW --> SYNCR
    MW --> ICONR
    MW --> USERR

    %% Router to service
    AUTHR --> AUTHS
    ACCR --> ACCS
    CATR --> CATS
    TRR --> TRS
    DASHR --> DASHS
    SYNCR --> SYNCS
    USERR --> USERS

    %% Services to persistence
    AUTHS --> ORM
    ACCS --> ORM
    CATS --> ORM
    TRS --> ORM
    DASHS --> ORM
    SYNCS --> ORM
    USERS --> ORM
    ORM --> PG

    %% Offline-first sync
    IDB -->|one-time or manual push| SYNCF
    SYNCF -->|POST /api/v1/sync/push| SYNCR
```

## Notes

- Offline-first behavior is implemented through local IndexedDB storage and an offline mutation queue in the frontend.
- Cloud persistence is handled by the FastAPI backend with PostgreSQL.
- Google OAuth is used for sign-in, after which local data can be pushed through the sync endpoint.
- Current sync push is append-only/idempotent for existing IDs in backend documentation.
