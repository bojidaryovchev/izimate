import { useUserStore } from "@/stores/user";
import type { UpdateUser } from "@izimate/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "./auth";
import { usersApi } from "./client";

export function useUser() {
  const { token } = useAuth();
  const setUser = useUserStore((s) => s.setUser);

  const query = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => usersApi.getMe(),
    enabled: !!token,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUser) => usersApi.updateMe(data),
    onSuccess: (user) => {
      queryClient.setQueryData(["user", "me"], user);
      useUserStore.getState().setUser(user);
    },
  });
}
