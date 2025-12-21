import instance from "@/providers/api";

export const getTemplate = async (params: { id: string }) => {
  return instance.request<any>({
    url: `/api/proj/v1/templates/${params.id}`,
    params,
  });
};

export const getTemplateSegment = async (params: { id: string }) => {
  return instance.request<any>({
    url: `/api/am/v1/resource-segments/${params.id}`,
    params,
  });
};

export const listResourceSegments = async (params: any) => {
  return instance.request<any>({
    url: `/api/am/v1/resource-segments`,
    params,
  });
};

export const listItems = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/public-templates`,
    params,
  });
};


export const listPublicTemplates = async (params: any) => {
  return instance.request<any>({
    url: `/api/proj/v1/public-templates`,
    params
  });
};