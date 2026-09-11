import type { CogniteClient } from '@cognite/sdk';

import { GEARFORCE_VIEWS } from '@/config/gearforceConfig';

type ViewKey = keyof typeof GEARFORCE_VIEWS;

export async function listViewNodes(client: CogniteClient, viewKey: ViewKey) {
  const view = GEARFORCE_VIEWS[viewKey];
  const response = await client.instances.list({
    instanceType: 'node',
    sources: [
      {
        source: {
          type: 'view',
          space: view.space,
          externalId: view.externalId,
          version: view.version,
        },
      },
    ],
    limit: 100,
  });

  return response.items;
}

export function isPermissionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const message = error.message.toLowerCase();
  return message.includes('403') || message.includes('permission') || message.includes('unauthorized');
}
