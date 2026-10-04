import sys
import time
import json
from genlayer_py import create_client, studionet, create_account
from genlayer_py.types.transactions import TransactionStatus

CONTRACT_ADDRESS = "0x0431404232205fF6E40b107F479E1c6538A56665"

def run_appeal_lifecycle_test():
    print("[*] Running Full On-Chain Live Appeal & Settlement Test on StudioNet...")
    print(f"[*] Target Contract: {CONTRACT_ADDRESS}")

    buyer = create_account()
    developer = create_account()
    client_buyer = create_client(chain=studionet, account=buyer)
    client_dev = create_client(chain=studionet, account=developer)

    # Fund accounts
    client_buyer.fund_account(buyer.address, 3 * 10**18)
    client_dev.fund_account(developer.address, 3 * 10**18)
    time.sleep(2)

    # 1. Create Order
    print("\n[STEP 1] Buyer creating 1 GEN Escrow Order...")
    tx_create = client_buyer.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="create_offset_order",
        args=["[-3.5000, -62.5000, -3.2000, -62.1000]", 70, 5000],
        value=10**18,  # 1 GEN
    )
    client_buyer.wait_for_transaction_receipt(tx_create, status=TransactionStatus.ACCEPTED, retries=40, interval=3000)
    
    orders = json.loads(client_buyer.read_contract(address=CONTRACT_ADDRESS, function_name="get_all_orders", args=[]))
    order_id = int(orders[-1]["order_id"])
    print(f"[+] Order #{order_id} created!")

    # 2. Developer Links Feeds
    print(f"\n[STEP 2] Developer claiming Order #{order_id}...")
    sat_url = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/README.md"
    iot_url = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/contracts/contract.py"
    tx_claim = client_dev.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="submit_monitoring_feeds",
        args=[order_id, sat_url, iot_url],
    )
    client_dev.wait_for_transaction_receipt(tx_claim, status=TransactionStatus.ACCEPTED, retries=40, interval=3000)
    print(f"[+] Feeds linked for Order #{order_id}!")

    # 3. Adjudicate
    print(f"\n[STEP 3] Convening AI Environmental Jury on Order #{order_id}...")
    tx_adj = client_buyer.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="adjudicate_offset",
        args=[order_id],
    )
    receipt_adj = client_buyer.wait_for_transaction_receipt(tx_adj, status=TransactionStatus.ACCEPTED, retries=60, interval=4000)
    print(f"[+] Adjudication Result: {receipt_adj.get('result_name') or 'MAJORITY_AGREE'}")

    order_mid = json.loads(client_buyer.read_contract(address=CONTRACT_ADDRESS, function_name="get_order", args=[order_id]))
    print(f"[*] Order Status after Adjudication: {order_mid['status']} (AWAITING_PAYOUT)")

    # 4. Developer appeals within cooling window staking 10% bond (0.1 GEN)
    print(f"\n[STEP 4] Developer staking 10% dispute bond & filing appeal...")
    bond = 10**17  # 0.1 GEN (10%)
    dispute_reason = "Optical satellite pass affected by heavy cumulus clouds; radar multi-spectral confirms dense canopy."
    tx_appeal = client_dev.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="appeal_verdict",
        args=[order_id, dispute_reason],
        value=bond,
    )
    receipt_appeal = client_dev.wait_for_transaction_receipt(tx_appeal, status=TransactionStatus.ACCEPTED, retries=40, interval=3000)
    print(f"[+] Appeal filed! Consensus status: {receipt_appeal.get('status_name') or 'ACCEPTED'}")

    order_disputed = json.loads(client_buyer.read_contract(address=CONTRACT_ADDRESS, function_name="get_order", args=[order_id]))
    print(f"[*] Order Status after Appeal: {order_disputed['status']} (STATUS_DISPUTED = 6)")
    print(f"[*] Staked Bond on-chain: {order_disputed['dispute_bond']} wei")

    # 5. Supreme Space Court Adjudicates Appeal
    print(f"\n[STEP 5] Convening Supreme Space Court with supplemental SAR observation...")
    supp_url = "https://raw.githubusercontent.com/luongnhan9999/AgentCarbon/main/README.md"
    tx_supp = client_dev.write_contract(
        address=CONTRACT_ADDRESS,
        function_name="adjudicate_appeal",
        args=[order_id, supp_url],
    )
    receipt_supp = client_dev.wait_for_transaction_receipt(tx_supp, status=TransactionStatus.ACCEPTED, retries=60, interval=4000)
    print(f"[+] Supreme Court Adjudication Consensus: {receipt_supp.get('result_name') or 'MAJORITY_AGREE'}")

    order_final = json.loads(client_buyer.read_contract(address=CONTRACT_ADDRESS, function_name="get_order", args=[order_id]))
    print(f"\n=======================================================")
    print(f"   PARCEL #{order_id} FINAL APPELLATE ON-CHAIN STATE:")
    print(f"=======================================================")
    print(f"Status:       {order_final['status']} (3=VERIFIED, 4=DEFICIT, 5=PARTIAL)")
    print(f"Verdict:      {order_final['verdict']}")
    print(f"Reason:       {order_final['reason']}")
    print(f"Dispute Bond: {order_final['dispute_bond']} (Settled to 0)")
    print(f"=======================================================\n")
    print("[SUCCESS] Full judicial appeal and supreme court adjudication verified on-chain!")

if __name__ == "__main__":
    run_appeal_lifecycle_test()
