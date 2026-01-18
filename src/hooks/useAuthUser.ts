import {useQuery} from '@tanstack/react-query';
import {getUser} from '@/api/api';
import useGlobal from '@/hooks/useGlobal';
import {useEffect} from "react";


export const useAuthUser = (options?: { fetchImmediately?: boolean }) => {

    const {user, setUser} = useGlobal();

    const {isLoading, refetch} = useQuery({
        queryKey: ['authUser'],
        queryFn: () => getUser(),
        staleTime: 60 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: false,
    });

    // useEffect(() => {
    //
    // }, []);

    useEffect(() => {
        if (options?.fetchImmediately) {
            fetch()
        }
    }, [])


    const fetch = () => {
        refetch().then((data) => {
            console.log(data?.data?.data);
            setUser(data?.data?.data?.data);
        });
    };

    return {
        isLoading,
        user,
        setUser,
    };
};
