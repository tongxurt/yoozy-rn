import instance from "@/providers/api";


export const createSession = (params: { url?: string, images?: string[] }) => {
    return instance.request<any>({
        url: "/api/pro/v1/sessions",
        method: "POST",
        data: params,
    });
};


export const createQuestion = (params: { url?: string, images?: string[] }) => {
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

export const listSessions = (params: { page: number, size?: number }) => {
    return instance.request<any>({
        url: `/api/pro/v1/sessions`,
        params: params,
    });
};

export const updateSessionStatus = (params: { id: string, status: string }) => {
    return instance.request<any>({
        url: `/api/pro/v1/sessions/${params.id}`,
        method: "PATCH",
        data: {
            "action": "update",
            "field": "status",
            "value": params.status,
        },
    });
};
