import instance from "@/providers/api";

export const commodities = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/commodities`,
    params,
  });
};

export const createCommodities = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/commodities`,
    method: "POST",
    data: params,
  });
};
