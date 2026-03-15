import { createPaymentsApi, createSearchApi, createUploadsApi, createUsersApi } from "@izimate/api-client";
import { apiFetch } from "./api";

export const usersApi = createUsersApi(apiFetch);
export const uploadsApi = createUploadsApi(apiFetch);
export const searchApi = createSearchApi(apiFetch);
export const paymentsApi = createPaymentsApi(apiFetch);
