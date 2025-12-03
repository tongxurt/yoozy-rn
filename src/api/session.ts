import instance from "@/providers/api";

export const createSession = (params: { url?: string; images?: string[] }) => {
  return instance.request<any>({
    url: "/api/pro/v1/sessions",
    method: "POST",
    data: params,
  });
};

export const createQuestion = (params: { url?: string; images?: string[] }) => {
  return instance.request<any>({
    url: "/api/pro/v1/questions",
    method: "POST",
    data: params,
  });
};

export const fetchQuestions = (params: { sessionId: string }) => {
  return instance.request<any>({
    url: `/api/pro/v1/sessions/${params.sessionId}/questions`,
    params: params,
  });
};

export const fetchSession = (params: { id: string }) => {
  return instance.request<any>({
    url: `/api/pro/v1/sessions/${params.id}`,
    params: params,
  });
};

export const listSessions = (params: { page: number; size?: number }) => {
  return instance.request<any>({
    url: `/api/pro/v1/sessions`,
    params: params,
  });
};

export const updateProduction = (params: {
  id: string;
  url: string;
  index: string;
}) => {
  return instance.request<any>({
    url: `/api/pro/v1/tasks/${params.id}`,
    params: params,
    method: "PATCH",
    data: {
      action: "updateProduction",
      params: { production: params.url, index: params.index },
    },
  });
};

export const compositeProduction = (params: { id: string }) => {
  return instance.request<any>({
    url: `/api/pro/v1/tasks/${params.id}`,
    method: "PATCH",
    data: { action: "composite" },
  });
};

export const updateSessionStatus = (params: { id: string; status: string }) => {
  return instance.request<any>({
    url: `/api/pro/v1/sessions/${params.id}`,
    method: "PATCH",
    data: {
      action: "update",
      field: "status",
      value: params.status,
    },
  });
};
