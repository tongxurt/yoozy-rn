import instance from "@/providers/api";

export const listResourceSegments = async (params: any) => {
  return instance.request<any>({
    url: `/api/am/v1/resource-segments`,
    params,
  });
};

export const listItems = async (params: any) => {
  return instance.request<any>({
    url: `/api/am/v1/items`,
    params,
  });
};
