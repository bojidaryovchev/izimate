import { createUsersApi } from "@izimate/api-client";
import { apiFetch } from "./api";

export const usersApi = createUsersApi(apiFetch);
