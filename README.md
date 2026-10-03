# AgentCarbon: Autonomous Satellite & Sensor Carbon Offset Escrow

**Live Decentralized Application:** [https://agent-carbon.vercel.app](https://agent-carbon.vercel.app)  
**Target Network:** GenLayer StudioNet (Chain ID: `61999` / `0xF1EF`, RPC: `https://studio.genlayer.com/api`)  
**Deployed Contract Address:** `0xF6bE773151f7285fE87257c0cdef6d4dBAD30f79`  
**Explorer Contract Link:** [https://genlayer-explorer.vercel.app/address/0xF6bE773151f7285fE87257c0cdef6d4dBAD30f79](https://genlayer-explorer.vercel.app/address/0xF6bE773151f7285fE87257c0cdef6d4dBAD30f79)

---

## 🛰️ 1. Why AgentCarbon FAILS without GenLayer

In traditional Voluntary Carbon Markets (VCM), buyers face rampant greenwashing, "phantom carbon credits", and unmonitored land clearing after credits have already been traded. Conversely, existing EVM blockchains cannot directly inspect Earth observation data without relying on centralized, corruptible oracles.

**Without GenLayer, AgentCarbon is fundamentally impossible because:**
1. **Direct Non-Deterministic Web Ingestion:** GenLayer allows the smart contract itself to pull live multi-spectral satellite telemetry (`gl.nondet.web.render`) from Sentinel-2 / Copernicus and ground flux sensor networks.
2. **Subjective AI Consensus (`gl.vm.run_nondet`):** Multiple independent GenVM validator nodes run an AI Environmental Jury prompt against raw canopy indices, computing Normalized Difference Vegetation Index (NDVI) and biomass flux.
3. **Semantic Validator Verification:** Validators independently re-render telemetry feeds and verify semantic consensus (agreement on canopy verdict and NDVI tolerances within 15 points) rather than brittle byte-for-byte strings.
4. **Autonomous On-Chain Escrow & Appellate Court:** Funds remain locked in native GEN escrow; if canopy health is confirmed, 100% is released to the reforestation developer. If deficit or fraud is discovered, 100% is refunded to the buyer. Any dispute triggers a 24-block cooling-off window with a 10% staked dispute bond adjudicated by a Supreme Space Court.

---

## 🏛️ 2. Protocol Architecture & Lifecycle

```
[Buyer: Locks GEN Escrow + Geo-Bounds + Target NDVI]
                    │
                    ▼
[Developer: Claims Order & Submits Live Sentinel / FLUXNET URLs]
                    │
                    ▼
[GenLayer AI Environmental Jury: gl.vm.run_nondet Adjudication]
  ├── Multi-Spectral Sentinel NDVI Analysis
  ├── Ground IoT Soil Moisture & Sap Flow Cross-Check
  └── Cryptographic Telemetry SHA-256 Digest
                    │
                    ▼
[24-Block Cooling-off Challenge Window (Awaiting Payout)]
         ├── Option A: Appeal filed with 10% Staked Dispute Bond
         │         └── Supreme Space Court Supplemental Imagery Review
         └── Option B: Finalize Settlement (Automatic Release to Developer / Refund)
```

### Order Lifecycle Statuses:
- `STATUS_OFFER_OPEN (0)`: Buyer deposited GEN, awaiting project developer claim.
- `STATUS_MONITORING (1)`: Developer claimed, satellite & IoT sensor endpoints linked.
- `STATUS_AWAITING_PAYOUT (2)`: AI consensus reached; 24-block dispute cooling window open.
- `STATUS_SETTLED_VERIFIED (3)`: Verified offset; 100% escrow released to developer.
- `STATUS_SETTLED_DEFICIT (4)`: Carbon deficit/cleared land; 100% escrow refunded to buyer.
- `STATUS_SETTLED_PARTIAL (5)`: Degraded canopy; 60% developer payout, 40% buyer refund.
- `STATUS_DISPUTED (6)`: Under appellate challenge with 10% staked bond.
- `STATUS_CANCELLED (7)`: Expired and reclaimed by buyer.

---

## 🧪 3. Smart Contract Verification & Test Suite

The contract follows strict GenVM guidelines:
- Pragma `# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }` on line 1.
- Storage structures use `TreeMap[u64, CarbonOrder]` and `DynArray[u64]` without reassignments in `__init__`.
- Custom storage structs decorated with `@allow_storage @dataclass`.
- Zero-value safe native transfers via `gl.get_contract_at(recipient).emit_transfer(value=u256(int(amount)))`.
- Complete test suite in `tests/test_agentcarbon.py` covering verified lifecycles, degraded appeals with bond forfeits, and cancellation timeouts:

```bash
pytest tests/test_agentcarbon.py -v
```

---

## 🚀 4. Deployment Instructions

### Deploy Intelligent Contract to StudioNet
```bash
python scripts/deploy.py
```
This deploys `contracts/contract.py` to GenLayer StudioNet (`61999`) and outputs the transaction hash and contract address into `scripts/deployed_contract.json`.

### Run Frontend Locally
```bash
cd frontend
npm install
npm run dev
```

### Build for Production
```bash
cd frontend
npm run build
```

---

## 🌐 5. Network & RPC Configuration
- **Network Name:** GenLayer Studio Network
- **Chain ID:** `61999` (`0xF1EF`)
- **RPC URL:** `https://studio.genlayer.com/api`
- **Currency Symbol:** `GEN`
- **Explorer:** `https://genlayer-explorer.vercel.app`
