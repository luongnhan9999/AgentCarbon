import json
from genlayer_py import create_client, studionet, create_account

CONTRACT_ADDRESS = "0x0431404232205fF6E40b107F479E1c6538A56665"

def check_orders():
    dummy = create_account()
    client = create_client(chain=studionet, account=dummy)
    orders_raw = client.read_contract(address=CONTRACT_ADDRESS, function_name="get_all_orders", args=[])
    orders = json.loads(orders_raw) if isinstance(orders_raw, str) else orders_raw
    print(f"Total parcels found on contract: {len(orders)}")
    for o in orders:
        print(f"Parcel #{o['order_id']}: Status={o['status']}, Buyer={o['buyer'][:10]}..., Dev={o['developer'][:10]}..., Escrow={o['escrow_amount']}")
    
    if orders:
        latest = orders[-1]
        print("\n--- LATEST PARCEL DETAILS ---")
        print(json.dumps(latest, indent=2))

if __name__ == "__main__":
    check_orders()
