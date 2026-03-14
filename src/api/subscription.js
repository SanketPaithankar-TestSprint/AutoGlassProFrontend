import axios from 'axios';
import urls from '../config';

// Base URL for user subscription endpoints
const BASE_URL = `${urls.javaApiUrl}/v1/user/subscription`;

export const getSubscriptionDetails = async (token) => {
  const res = await axios.get(`${BASE_URL}/details`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const addSubscription = async (token, payload) => {
  const res = await axios.post(`${BASE_URL}/add`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateSubscription = async (token, payload) => {
  const res = await axios.post(`${BASE_URL}/update`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const activateSubscription = async (token) => {
  const res = await axios.post(`${BASE_URL}/activate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deactivateSubscription = async (token) => {
  const res = await axios.post(`${BASE_URL}/deactivate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteSubscription = async (token) => {
  const res = await axios.delete(`${BASE_URL}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
