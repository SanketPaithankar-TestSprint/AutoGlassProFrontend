import { getValidToken } from './getValidToken';
import urls from '../config';

export default async function getUserSignature() {
  const token = await getValidToken();
  const response = await fetch(`${urls.javaApiUrl}/v1/users/signature`, {
    method: 'GET',
    headers: {
      'accept': '*/*',
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch signature');
  }
  return response;
}
