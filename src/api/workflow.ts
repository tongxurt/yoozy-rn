import instance from "@/providers/api";

export const replaceWorkflow = async (data: any) => {
    return instance.request<any>({
        url: "/api/proj/v1/workflows",
        method: "PUT",
        data,
    });
};
