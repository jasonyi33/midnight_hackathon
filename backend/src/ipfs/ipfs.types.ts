export interface PinataOptions {
  pinataMetadata?: {
    name?: string;
    keyvalues?: Record<string, any>;
  };
  pinataOptions?: {
    cidVersion?: 0 | 1;
    wrapWithDirectory?: boolean;
  };
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
  isDuplicate?: boolean;
}

export interface GenomicDataUpload {
  userId: string;
  encryptedData: string;
  commitmentHash: string;
  timestamp: number;
}

export interface IPFSFile {
  cid: string;
  size: number;
  path: string;
}

export interface PinataConfig {
  apiKey: string;
  apiSecret: string;
  jwt?: string;
}

export interface GenomicMetadata {
  userId: string;
  uploadDate: string;
  dataType: 'genomic_data' | 'proof' | 'verification';
  encrypted: boolean;
  version: string;
}