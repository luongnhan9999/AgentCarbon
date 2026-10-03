import pytest
import json
import os
import sys

# Ensure contracts directory is reachable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "contracts")))


# ---------------------------------------------------------------------------
# Simulated GenLayer Environment for robust local pytest execution
# ---------------------------------------------------------------------------
class SimulatedAddress:
    def __init__(self, hex_addr: str):
        self.as_hex = hex_addr.lower()

    def __str__(self):
        return self.as_hex

    def __eq__(self, other):
        return str(self).lower() == str(other).lower()


class MockTransferContract:
    def __init__(self, address):
        self.address = str(address)
        self.transfers = []

    def emit_transfer(self, value):
        self.transfers.append({"to": self.address, "value": value})
        return True


class MockReturn:
    def __init__(self, calldata):
        self.calldata = calldata


class MockMessage:
    def __init__(self, sender_address="0x1111111111111111111111111111111111111111", value=0):
        self.sender_address = sender_address
        self.value = value

    @property
    def sender(self):
        return self.sender_address

    @sender.setter
    def sender(self, val):
        self.sender_address = val


class MockNondetWeb:
    def __init__(self):
        self.mock_responses = {}

    def render(self, url, mode="text"):
        if url in self.mock_responses:
            return self.mock_responses[url]
        return "SENTINEL-2 B4:0.04 B8:0.62 NDVI:0.87 FLUX_CO2:-14.2"


class MockNondet:
    def __init__(self):
        self.web = MockNondetWeb()
        self.llm_response = {
            "canary": "CANARY_AGENT_CARBON_SATELLITE_V1",
            "verdict": "OFFSET_VERIFIED",
            "confidence": 98,
            "measured_ndvi": 85,
            "reason": "Dense healthy canopy verified via multi-spectral band comparison."
        }

    def exec_prompt(self, prompt, response_format="json"):
        return self.llm_response


class MockVM:
    class Return:
        def __init__(self, calldata):
            self.calldata = calldata

    def run_nondet(self, leader_fn, validator_fn):
        leader_res = leader_fn()
        valid = validator_fn(self.Return(leader_res))
        assert valid, "Validator function failed on leader result"
        return leader_res


class MockGenLayerEnv:
    def __init__(self):
        self.message = MockMessage()
        self.nondet = MockNondet()
        self.vm = MockVM()
        self.contracts = {}

    def get_contract_at(self, address):
        addr_str = str(address).lower()
        if addr_str not in self.contracts:
            self.contracts[addr_str] = MockTransferContract(addr_str)
        return self.contracts[addr_str]


def setup_gl_mock():
    import types
    mock_env = MockGenLayerEnv()

    gl_module = types.ModuleType("genlayer")

    class UserError(Exception):
        pass

    class ContractStorageBase:
        def __new__(cls, *args, **kwargs):
            instance = super().__new__(cls)
            instance.orders = {}
            instance.order_ids = []
            return instance

    gl_module.UserError = UserError
    gl_module.Address = SimulatedAddress
    gl_module.bigint = lambda x: int(x)
    gl_module.u8 = lambda x: int(x)
    gl_module.u32 = lambda x: int(x)
    gl_module.u64 = lambda x: int(x)
    gl_module.u256 = lambda x: int(x)
    gl_module.TreeMap = dict
    gl_module.DynArray = list
    gl_module.allow_storage = lambda cls: cls
    gl_module.Contract = ContractStorageBase

    # Decorators
    class PublicDecorator:
        def view(self, fn): return fn
        def write(self, fn): return fn
        class WriteClass:
            def __call__(self, fn): return fn
            def payable(self, fn): return fn
        write = WriteClass()

    mock_public = PublicDecorator()
    mock_env.Contract = ContractStorageBase
    mock_env.public = mock_public
    gl_module.gl = mock_env

    sys.modules["genlayer"] = gl_module
    if "contract" in sys.modules:
        del sys.modules["contract"]

    return mock_env


# ---------------------------------------------------------------------------
# UNIT TESTS: Full Coverage for AgentCarbon Escrow, AI Adjudication & Appeals
# ---------------------------------------------------------------------------

def test_agent_carbon_full_verified_lifecycle():
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    buyer = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    developer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    # Step 1: Buyer locks escrow
    mock_env.message.sender_address = buyer
    escrow_amount = 1_000_000_000_000_000_000  # 1 GEN
    mock_env.message.value = escrow_amount

    order_id = app.create_offset_order("[-3.4653, -62.2159, -3.1234, -62.0012]", 70, 5000)
    assert order_id == 1
    assert app.total_carbon_locked == escrow_amount

    # Step 2: Developer links feeds
    mock_env.message.sender_address = developer
    sat_url = "https://sentinel-hub.org/data/amazon_sector_a.txt"
    iot_url = "https://fluxnet.org/telemetry/tower_42.json"
    app.submit_monitoring_feeds(order_id, sat_url, iot_url)

    order_data = json.loads(app.get_order(order_id))
    assert order_data["status"] == 1  # STATUS_MONITORING
    assert order_data["developer"] == str(developer).lower()

    # Step 3: Mock AI Satellite Jury -> High canopy density (NDVI 85 > 70)
    mock_env.nondet.web.mock_responses[sat_url] = "SENTINEL-2 B4:0.04 B8:0.62 NDVI:0.87 FLUX_CO2:-14.2"
    mock_env.nondet.web.mock_responses[iot_url] = '{"soil_moisture": 84, "sap_flow": 12.4, "canopy_cover": 0.88}'
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_CARBON_SATELLITE_V1",
        "verdict": "OFFSET_VERIFIED",
        "confidence": 98,
        "measured_ndvi": 85,
        "reason": "Dense healthy canopy verified via multi-spectral band comparison."
    }

    mock_env.message.sender_address = buyer
    app.adjudicate_offset(order_id)

    order_mid = json.loads(app.get_order(order_id))
    assert order_mid["status"] == 2  # AWAITING_PAYOUT
    assert order_mid["verdict"] == "OFFSET_VERIFIED"
    assert len(order_mid["evidence_hash"]) == 64
    assert order_mid["measured_ndvi"] == 85

    # Advance blocks beyond cooling-off window (24 blocks)
    app.order_counter += 25
    app.finalize_settlement(order_id)

    order_final = json.loads(app.get_order(order_id))
    assert order_final["status"] == 3  # STATUS_SETTLED_VERIFIED
    assert app.total_carbon_locked == 0
    assert app.total_offsets_settled == 1

    # Check developer received payout
    dev_transfers = mock_env.get_contract_at(developer).transfers
    assert len(dev_transfers) == 1
    assert dev_transfers[0]["value"] == escrow_amount


def test_agent_carbon_appeal_degraded_forfeits_bond():
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    buyer = SimulatedAddress("0xAAAA111122223333444455556666777788889999")
    developer = SimulatedAddress("0xBBBB111122223333444455556666777788889999")

    # Step 1: Buyer locks escrow
    mock_env.message.sender_address = buyer
    escrow_amount = 1_000_000_000_000_000_000
    mock_env.message.value = escrow_amount

    order_id = app.create_offset_order("[-3.4653, -62.2159, -3.1234, -62.0012]", 80, 5000)

    # Step 2: Developer claims
    mock_env.message.sender_address = developer
    sat_url = "https://sentinel-hub.org/data/sector_b.txt"
    iot_url = "https://fluxnet.org/telemetry/tower_12.json"
    app.submit_monitoring_feeds(order_id, sat_url, iot_url)

    # Initial adjudication detects deficit (45 < 65)
    mock_env.nondet.web.mock_responses[sat_url] = "NDVI:0.45"
    mock_env.nondet.web.mock_responses[iot_url] = "{}"
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_CARBON_SATELLITE_V1",
        "verdict": "OFFSET_DEFICIT",
        "confidence": 95,
        "measured_ndvi": 45,
        "reason": "Severe forest clearing detected."
    }

    mock_env.message.sender_address = buyer
    app.adjudicate_offset(order_id)

    order_mid = json.loads(app.get_order(order_id))
    assert order_mid["status"] == 2  # AWAITING_PAYOUT
    assert order_mid["verdict"] == "OFFSET_DEFICIT"

    # Step 3: Developer appeals within cooling-off with 10% bond
    mock_env.message.sender_address = developer
    bond = 100_000_000_000_000_000  # 0.1 GEN
    mock_env.message.value = bond

    app.appeal_verdict(order_id, "Cloud shadow distortion corrected with SAR radar imagery.")

    order_disputed = json.loads(app.get_order(order_id))
    assert order_disputed["status"] == 6  # STATUS_DISPUTED

    # Step 4: Appellate Court finds partial growth (APPEAL_UPHELD_PARTIAL)
    supp_url = "https://supplemental-lidar.org/proof.txt"
    mock_env.nondet.web.mock_responses[supp_url] = "LIDAR confirms partial cover 68%"
    mock_env.nondet.llm_response = {
        "canary": "CANARY_AGENT_CARBON_SATELLITE_V1",
        "verdict": "APPEAL_UPHELD_PARTIAL",
        "reason": "Partial sapling growth verified, but fails baseline 80 threshold."
    }

    app.adjudicate_appeal(order_id, supp_url)

    order_final = json.loads(app.get_order(order_id))
    assert order_final["status"] == 5  # STATUS_SETTLED_PARTIAL
    assert order_final["verdict"] == "OFFSET_PARTIAL"

    # Developer gets 60% of escrow: 0.6 GEN
    dev_transfers = mock_env.get_contract_at(developer).transfers
    assert any(t["value"] == 600_000_000_000_000_000 for t in dev_transfers)

    # Buyer gets 40% of escrow (0.4 GEN) + developer's forfeited dispute bond (0.1 GEN)
    buyer_transfers = mock_env.get_contract_at(buyer).transfers
    assert any(t["value"] == 400_000_000_000_000_000 for t in buyer_transfers)
    assert any(t["value"] == bond for t in buyer_transfers)


def test_agent_carbon_cancel_and_reclaim():
    mock_env = setup_gl_mock()
    import contract
    contract.gl = mock_env

    app = contract.Contract()
    buyer = SimulatedAddress("0xAAAA111122223333444455556666777788889999")

    mock_env.message.sender_address = buyer
    escrow = 500_000_000_000_000_000
    mock_env.message.value = escrow

    # Duration = 10 blocks
    order_id = app.create_offset_order("[-3.0, -62.0, -3.1, -62.1]", 75, 10)

    # Buyer tries to cancel prematurely -> UserError
    with pytest.raises(Exception):
        app.cancel_or_reclaim(order_id)

    # Expire order
    app.order_counter += 20
    app.cancel_or_reclaim(order_id)

    order_cancelled = json.loads(app.get_order(order_id))
    assert order_cancelled["status"] == 7  # STATUS_CANCELLED

    buyer_transfers = mock_env.get_contract_at(buyer).transfers
    assert len(buyer_transfers) == 1
    assert buyer_transfers[0]["value"] == escrow
