export interface OnchainOSMessagePayload {
  senderAddress: string;
  recipientAddress: string;
  agentSignature: string;
  payloadData: string;
  timestamp: number;
}

export interface IOnchainOSAgentClient {
  verifyAgentMessage(message: OnchainOSMessagePayload): Promise<boolean>;
  dispatchDeliverable(recipientAddress: string, deliverableContent: string): Promise<{ transactionHash: string }>;
}
