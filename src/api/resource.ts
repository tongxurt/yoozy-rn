import instance from "@/providers/api";

export const listResourceSegments = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/resource-segments`,
    params,
  });
};

export const listItems = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/templates`,
    params,
  });
};
