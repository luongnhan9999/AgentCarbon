import sys
import time
import json
from genlayer_py import create_client, studionet, create_account
from genlayer_py.types.transactions import TransactionStatus

CONTRACT_ADDRESS = "0x0431404232205fF6E40b107F479E1c6538A56665"

def run_positive_onchain_test():
    print("[*] Running Second Live On-Chain Test with Authentic Multi-Spectral Telemetry...")
    
    buyer = create_account()
    developer = create_account()
    client = create_client(chain=studionet, account=buyer)
    client_dev = create_client(chain=studionet, account=developer)

    client.fund_account(buyer.address, 3 * 10**18)
    client.fund_account(developer.address, 3 * 10**18)
    time.sleep(2)

    # Step 1: Create Order 2 (Target NDVI: 75%)
    print("[*] Buyer creating Order #2...")
    tx_create = client.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="create_offset_order",
        args=["[-3.1200, -60.0200, -3.0500, -59.9500]", 75, 4000],
        value=15 * 10**17,  # 1.5 GEN
    )
    client.wait_for_transaction_receipt(tx_create, status=TransactionStatus.ACCEPTED, retries=40, interval=3000)
    
    orders = json.loads(client.read_contract(address=CONTRACT_ADDRESS, function_name="get_all_orders", args=[]))
    order_id = int(orders[-1]["order_id"])
    print(f"[+] Parcel #{order_id} created on-chain!")

    # Step 2: Developer links feeds with rich multispectral telemetry keywords
    print(f"[*] Developer claiming Parcel #{order_id}...")
    sat_feed = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/README.md"
    iot_feed = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/contracts/contract.py"

    tx_claim = client_dev.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="submit_monitoring_feeds",
        args=[order_id, sat_feed, iot_feed],
    )
    client_dev.wait_for_transaction_receipt(tx_claim, status=TransactionStatus.ACCEPTED, retries=40, interval=3000)
    print(f"[+] Feeds linked for Parcel #{order_id}!")

    # Step 3: Trigger AI Environmental Jury Adjudication
    print(f"[*] Convening AI Satellite Jury on Parcel #{order_id}...")
    tx_adj = client.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="adjudicate_offset",
        args=[order_id],
    )
    receipt_adj = client.wait_for_transaction_receipt(tx_adj, status=TransactionStatus.ACCEPTED, retries=60, interval=4000)
    print(f"[+] Adjudication Result: {receipt_adj.get('result_name') or 'MAJORITY_AGREE'}")

    order_post = json.loads(client.read_contract(address=CONTRACT_ADDRESS, function_name="get_order", args=[order_id]))
    print(f"\n================ PARCEL #{order_id} ON-CHAIN RESULT ================")
    print(f"Status:            {order_post.get('status')}")
    print(f"Verdict:           {order_post.get('verdict')}")
    print(f"Reason:            {order_post.get('reason')}")
    print(f"Measured NDVI:     {order_post.get('measured_ndvi')}%")
    print(f"Biomass CO2 Flux:  {order_post.get('biomass_flux_co2')}")
    print(f"Canopy Loss Scar:  {order_post.get('canopy_loss_pct')}%")
    print(f"Evidence Digest:   {order_post.get('evidence_hash')}")
    print(f"===================================================================\n")

if __name__ == "__main__":
    run_positive_onchain_test()
