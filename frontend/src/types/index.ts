export interface CrmRecord {
    created_at?: string;
    name?: string;
    email?: string;
    country_code?: string;
    mobile_without_country_code?: string;
    company?: string;
    city?: string;
    state?: string;
    country?: string;
    lead_owner?: string;
    crm_status?: 'GOOD_LEAD_FOLLOW_UP' | 'DID_NOT_CONNECT' | 'BAD_LEAD' | 'SALE_DONE';
    crm_note?: string;
    data_source?: 'leads_on_demand' | 'meridian_tower' | 'eden_park' | 'varah_swamy' | 'sarjapur_plots';
    possession_time?: string;
    description?: string;
}

export interface SkippedRecord {
    original_row: Record<string, string>;
    reason: string;
}

export interface SSEStartedEvent {
    totalRows: number;
    totalBatches: number;
}

export interface SSEBatchCompleteEvent {
    batchIndex: number;
    totalBatches: number;
    imported: CrmRecord[];
    skipped: SkippedRecord[];
}

export interface SSEDoneEvent {
    totalImported: number;
    totalSkipped: number;
    totalProcessed: number;
}

export interface SSEErrorEvent {
    message: string;
}
