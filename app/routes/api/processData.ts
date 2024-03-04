// routes/api/processData.ts

import { json, ActionFunction } from '@remix-run/node';

export const action: ActionFunction = async () => {
  // Process data here...
  const processedData = 'Data processed successfully';
  return json({ message: processedData });
};
