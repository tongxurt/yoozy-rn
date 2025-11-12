import instance from "@/providers/api";

export const listResourceSegments = async (params: any) => {
    return instance.request<any>({
        url: `/api/am/v1/resource-segments`,
        params
    });
};


