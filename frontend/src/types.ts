export interface CarbonOrder {
  order_id: number;
  buyer: string;
  developer: string;
  dispute_initiator: string;
  escrow_amount: string;
  dispute_bond: string;
  target_geo_bounds: string;
  target_ndvi_threshold: number;
  satellite_feed_url: string;
  iot_sensor_url: string;
  evidence_hash: string;
  status: number;
  verdict: string;
  reason: string;
  confidence: number;
  measured_ndvi: number;
  created_at_block: string;
  expires_at_block: string;
  audit_completed_block: string;
}

export interface StatsData {
  total_orders: number;
  total_carbon_locked: string;
  total_offsets_settled: number;
  owner: string;
}
