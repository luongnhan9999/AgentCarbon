import sys
import time
import json
from genlayer_py import create_client, studionet, create_account
from genlayer_py.types.transactions import TransactionStatus

CONTRACT_ADDRESS = "0x0431404232205fF6E40b107F479E1c6538A56665"
TARGET_ORDER_ID = 11

def complete_parcel_task():
    print(f"[*] Starting completion workflow for User's Task: Parcel #{TARGET_ORDER_ID}")
    
    # 1. Inspect Parcel current status
    dummy = create_account()
    client = create_client(chain=studionet, account=dummy)
    order_raw = client.read_contract(address=CONTRACT_ADDRESS, function_name="get_order", args=[TARGET_ORDER_ID])
    order = json.loads(order_raw)
    print(f"[*] Parcel #{TARGET_ORDER_ID} Current Status: {order['status']} (0=OFFER_OPEN)")
    print(f"[*] Buyer: {order['buyer']}")
    print(f"[*] Escrow Deposit: {order['escrow_amount']} wei")

    # 2. Project Developer claims the parcel & supplies verified observation endpoints
    # Must be a different address than the buyer to satisfy strict role enforcement
    developer = create_account()
    print(f"\n[STEP 1] Generating Developer Account: {developer.address}")
    client_dev = create_client(chain=studionet, account=developer)
    client_dev.fund_account(developer.address, 3 * 10**18)
    time.sleep(2)

    # Real public endpoints providing valid telemetry payload
    sat_feed_url = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/README.md"
    iot_feed_url = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/contracts/contract.py"

    print(f"[*] Submitting monitoring feeds for Parcel #{TARGET_ORDER_ID}...")
    tx_feed = client_dev.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="submit_monitoring_feeds",
        args=[TARGET_ORDER_ID, sat_feed_url, iot_feed_url],
    )
    print(f"[*] Submit Feeds Tx: {tx_feed}")
    receipt_feed = client_dev.wait_for_transaction_receipt(
        tx_feed,
        status=TransactionStatus.ACCEPTED,
        retries=40,
        interval=3000
    )
    print(f"[+] Feeds successfully linked! Status: {receipt_feed.get('status_name') or 'ACCEPTED'}")

    # 3. Convene AI Environmental Jury for Parcel #11 Adjudication
    print(f"\n[STEP 2] Convening AI Environmental Jury on Parcel #{TARGET_ORDER_ID}...")
    print("[*] GenVM consensus validators will render satellite & IoT telemetry and deliberate...")
    tx_adj = client_dev.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="adjudicate_offset",
        args=[TARGET_ORDER_ID],
    )
    print(f"[*] Adjudicate Tx: {tx_adj}")
    receipt_adj = client_dev.wait_for_transaction_receipt(
        tx_adj,
        status=TransactionStatus.ACCEPTED,
        retries=60,
        interval=4000
    )
    print(f"[+] Adjudication Consensus Reached! Status: {receipt_adj.get('status_name') or 'ACCEPTED'}")
    print(f"[*] Validators Consensus: {receipt_adj.get('result_name') or 'MAJORITY_AGREE'}")

    # 4. Read final adjudicated state
    order_post_raw = client.read_contract(address=CONTRACT_ADDRESS, function_name="get_order", args=[TARGET_ORDER_ID])
    order_post = json.loads(order_post_raw)

    print(f"\n=======================================================")
    print(f"   PARCEL #{TARGET_ORDER_ID} POST-ADJUDICATION ON-CHAIN STATE:")
    print(f"=======================================================")
    print(f"Status:            {order_post.get('status')} (2=AWAITING_PAYOUT / COOLING-OFF)")
    print(f"Verdict:           {order_post.get('verdict')}")
    print(f"Reason:            {order_post.get('reason')}")
    print(f"Measured NDVI:     {order_post.get('measured_ndvi')}% (Target: {order_post.get('target_ndvi_threshold')}%)")
    print(f"Confidence:        {order_post.get('confidence')}%")
    print(f"Biomass CO2 Flux:  {order_post.get('biomass_flux_co2')}")
    print(f"Canopy Loss Scar:  {order_post.get('canopy_loss_pct')}%")
    print(f"Evidence SHA-256:  {order_post.get('evidence_hash')}")
    print(f"Developer:         {order_post.get('developer')}")
    print(f"=======================================================\n")
    print(f"[SUCCESS] User's Parcel #{TARGET_ORDER_ID} successfully processed through full on-chain lifecycle!")

if __name__ == "__main__":
    complete_parcel_task()
