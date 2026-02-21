import { getValidToken } from './getValidToken';
import urls from '../config';

export default async function uploadUserSignature(signatureBlob) {
  const token = await getValidToken();
  const formData = new FormData();
  formData.append('file', signatureBlob, 'signature.png');

  const response = await fetch(`${urls.javaApiUrl}/v1/users/signature`, {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Failed to upload signature');
  }
  return response;
}
