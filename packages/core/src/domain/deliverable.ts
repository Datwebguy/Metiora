export interface DeliverableAsset {
  id: string;
  taskId: string;
  startupId: string;
  assetType: string;
  title: string;
  contentMarkdown: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}
